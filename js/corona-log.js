document.addEventListener('DOMContentLoaded', onLoad);

let log = document.getElementById('pills-log');
let profile = document.getElementById('pills-profile');
let about = document.getElementById('pills-about');
let nicknameGreeting = null;

log.addEventListener('onClick', getLogTab());
profile.addEventListener('onClick', getProfileTab());
about.addEventListener('onClick', getAboutTab());

var cryptEntropy = generateRandomString(32);
var crypt = new Crypt({ entropy: cryptEntropy });

var JsonFormatter = {
    stringify: function(cipherParams) {
      // create json object with ciphertext
      var jsonObj = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };

      // optionally add iv or salt
      if (cipherParams.iv) {
        jsonObj.iv = cipherParams.iv.toString();
      }

      if (cipherParams.salt) {
        jsonObj.s = cipherParams.salt.toString();
      }

      // stringify json object
      return JSON.stringify(jsonObj);
    },
    parse: function(jsonStr) {
      // parse json string
      var jsonObj = JSON.parse(jsonStr);

      // extract ciphertext from json object, and create cipher params object
      var cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
      });

      // optionally extract iv or salt

      if (jsonObj.iv) {
        cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
      }

      if (jsonObj.s) {
        cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
      }

      return cipherParams;
    }
  };

// Thanks to Mihai Alexandru-Ionut
// https://stackoverflow.com/questions/43917622/how-to-create-random-string-in-javascript
function generateRandomString(length) {
    var characterSet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789";
    var result = "";
    for(var i = 0; i < length; i++) {
        result += characterSet[Math.floor(Math.random() * characterSet.length)];
    }
    return result;
}

function getGreeting() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();

    if (hours < 4) {
        return "Good night";
    } else if (hours >= 4 && hours < 10) {
        return "Good morning";
    } else if (hours >= 10 && hours < 16) {
        return "Hello";
    } else if (hours >= 16 && hours < 18) {
        return "Good afternoon";
    } else if (hours >= 18) {
        return "Good evening";
    }
}

function getNumberPersonsString(number) {
    switch(number) {
        case '1': return 'few';
        case '2': return 'many';
        case '3': return 'a lot of';
        default: return 'few';
    }
}

function escapeHtml(unsafeString) {
    return unsafeString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
}

function submitData(request, payload, method, jsonData) {
    var endpoint = 'https://corona-log.de/api.php?request=' + request + '&payload=' + payload;
    var unencryptedEntry = null;
    var storageDataset = null;

    fetch(endpoint, {
        method: method,
        body : jsonData
    })
    .then((resp) => resp.json())
    .then(function(response) {
        if (request === 'getEntries') {
            response.forEach(function(e) {
                unencryptedEntry = decryptMessage(e.entry);
                showEntry(unencryptedEntry);
            });
        } else if (request === 'getToken') {
            if(response.code !== 'nok') {
                storageDataset = decryptKeys(response[0].encryptedKey, localStorage.getItem('password'));
                localStorage.clear();
                importStorage(storageDataset);
                document.getElementById('importSuccess').innerHTML = 'Import successful';
            }
        }
        return response;
    });
}

function showEntry(jsonData) {
    console.log(jsonData);
    var data = JSON.parse(jsonData);

    let entryTemplate = document.getElementById('entry');
    let entryDate = entryTemplate.content.getElementById('entryDate');
    entryDate.innerHTML = data.date;
    
    let entryTime = entryTemplate.content.getElementById('entryTime');
    entryTime.innerHTML = data.time;

    let entryText = entryTemplate.content.getElementById('entryText');
    
    let maskText = null;
    if (data.mask === true) {
        maskText = 'You were <em>wearing a mask</em>.';
    } else {
        maskText = 'You were <em>not wearing a mask</em>.';
    }

    let distanceText = null;
    if (data.distance === true) {
        distanceText = 'You were <em>keeping distance</em>.';
    } else {
        distanceText = 'You were <em>not keeping distance</em>.';
    }

    entryText.innerHTML = 'You were visiting <em>' + data.venue + '</em>. ' 
        + maskText + ' ' + distanceText + ' You were sitting or standing <em>' + data.location 
        + '</em>. There were ' + data.numberPersons + ' persons with you for some ' + data.amountTime + ' minutes.';
        
    let entryNotes = entryTemplate.content.getElementById('entryNotes');
    entryNotes.innerHTML = 'You kept these notes: ' + data.notes;  

    let logEntries = document.getElementById('logEntries');
    let clone = document.importNode(entryTemplate.content, true);
    logEntries.appendChild(clone);
}

function processData() {
    var location = null;
    var inputLocation = document.getElementsByName('inputLocation');
    if (inputLocation[0].checked) {
        location = 'inside';
    } else {
        location = 'outside';
    }
    
    var payload = JSON.stringify({
        date: escapeHtml(document.getElementById('inputDate').value),
        time: escapeHtml(document.getElementById('inputTime').value),
        venue: escapeHtml(document.getElementById('inputVenue').value),
        mask: document.getElementsByName('inputMask')[0].checked,
        distance: document.getElementsByName('inputDistance')[0].checked,
        location: location,
        notes: escapeHtml(document.getElementById('inputNotes').value),
        numberPersons: getNumberPersonsString(document.getElementById('inputNumberPersons').value),
        amountTime:escapeHtml(document.getElementById('inputAmountTime').value)
    });

    encryptedPayload = encryptMessage(payload);
    submitData('addEntry', findUserId(), 'POST', encryptedPayload);
    showEntry(payload);
}

function getLogTab() {
    var greeting = document.getElementById('greeting');
    greeting.innerHTML = getGreeting();
    nicknameGreeting = document.getElementById('nicknameGreeting');
    nicknameGreeting.innerHTML = getNickname();

    submitData('getEntries', findUserId(), 'GET', null);

    var inputNumberPersonsSlider= document.getElementById('inputNumberPersons');
    var inputNumberPersonsDescription = document.getElementById('inputNumberPersonsDescription');
    inputNumberPersonsDescription.innerHTML = getNumberPersonsString(inputNumberPersonsSlider.value);

    var inputAmountTimeSlider = document.getElementById('inputAmountTime');
    var inputAmountTimeDescription = document.getElementById('inputAmountTimeDescription');
    inputAmountTimeDescription.innerHTML = inputAmountTimeSlider.value;

    inputNumberPersonsSlider.oninput = function() { inputNumberPersonsDescription.innerHTML = getNumberPersonsString(this.value); }
    inputAmountTimeSlider.oninput = function() { inputAmountTimeDescription.innerHTML = this.value; }

    var newEntryForm = document.getElementById('newEntryForm');
    newEntryForm.addEventListener('submit', function(e) { 
        processData();
        // document.getElementById('newEntryClose').click;
        $('#newEntry').modal('hide')
        e.preventDefault();
    }, false);
}

function getProfileTab() {
    var nickname = localStorage.getItem('nickname');
    nicknameInput = document.getElementById('nicknameInput');

  if (nickname !== null) {
    nicknameInput.value = nickname;
  } else {
    nicknameInput.value = '';
  }
  
  var nicknameForm = document.getElementById('nicknameForm');
  nicknameForm.addEventListener('submit', function(e) { 
      setNickname(nicknameInput.value); 
      e.preventDefault();
    }, false);
}

function getAboutTab() {
     document.getElementById('rsaKeysCheck').innerHTML = findPrivateKey();
     document.getElementById('userIdCheck').innerHTML = findUserId();
     document.getElementById('nicknameCheck').innerHTML = getNickname();
}

function generateKeyPair() {
    var rsaEntropy = generateRandomString(32);
    var rsa = new RSA({ entropy: rsaEntropy });

    document.getElementById('statusCheck').innerHTML = `<p>Hold on a second! We're preparing your account.</p>
    <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
    </div>`;

    rsa.generateKeyPairAsync().then(keyPair => {
        var publicKey = keyPair.publicKey;
        localStorage.setItem("publicKey", publicKey);
        var privateKey = keyPair.privateKey;
        localStorage.setItem("privateKey", privateKey);
        document.getElementById('statusCheck').innerHTML = '';
        getAboutTab();
    }, 2048);
}

function generateUserId() {
    var userId = generateRandomString(16);
    submitData('registerUser', userId, 'GET', null);
    localStorage.setItem('userId', userId);
}

function findPrivateKey() {
    privateKey = localStorage.getItem('privateKey');
    publicKey = localStorage.getItem('publicKey');

    if (privateKey !== null && publicKey !== null) {
        return '✅';
    } else {
        generateKeyPair();
    }
}

function findUserId() {
    userId = localStorage.getItem('userId');

    if (userId !== null) {
        return userId;
    } else {
        generateUserId();
    }
}

function encryptMessage(plainText) {
    return crypt.encrypt(localStorage.getItem('publicKey'), plainText);
}

function decryptMessage(cipherText) {
    return crypt.decrypt(localStorage.getItem('privateKey'), cipherText).message;
}

function encryptKeys(keys, password) {
    let cipherText = CryptoJS.AES.encrypt(keys, password, {
        format: JsonFormatter
      });
    return cipherText.toString();
}

function decryptKeys(cipherText, password) {
    let plainText = CryptoJS.AES.decrypt(cipherText, password, {
        format: JsonFormatter
      });
    return plainText.toString(CryptoJS.enc.Utf8);
}

function importStorage(storageDataset) {
    var data = JSON.parse(storageDataset);
    Object.keys(data).forEach(function (k) {
        localStorage.setItem(k, data[k]);
    });
}

async function prepareExport() {
    var token = generateRandomString(4);
    var password = generateRandomString(8);

    document.getElementById('tanDataUrl').innerHTML = '<pre>https://corona-log.de/onboarding.html#' + token + '-' + password + '</pre>';
    new QRCode(document.getElementById('qrCode'), 'https://corona-log.de/onboarding.html#' + token + '-' + password);

    var localKeyPairAndUserId = JSON.stringify(localStorage);
    //console.log(localKeyPairAndUserId);
    // var cipherText = encryptKeys(localKeyPairAndUserId, password);
    // var cipherTextUtf8 = cipherText.toString(CryptoJS.enc.Utf8);
    // console.log(cipherTextUtf8);
    let cipherText = new Promise(function(resolve) {
        resolve(encryptKeys(localKeyPairAndUserId, password));
    });
    cipherText.then(function(e) {
        submitData('addToken', token, 'POST', e);
    });
    //var cipherTextUtf8 = cipherText.toString(CryptoJS.enc.Utf8);
    //submitData('addToken', token, 'POST', cipherTextUtf8);
}

function prepareImport() {
    var action = window.location.href.split('#')[1];
    var tan = action.split('-')[0];
    localStorage.setItem('password', action.split('-')[1]);

    submitData('getToken', tan, 'GET', null);
}

function setNickname(nickname) {
    if (nickname !== '') {
        localStorage.setItem('nickname', nickname);
    } else {
        localStorage.removeItem('nickname');
    }
    getAboutTab();
    getLogTab();
}

function getNickname() {
    var nickname = localStorage.getItem('nickname');
    
    if (nickname !== null) {
        return nickname;
    } else {
        return '&nbsp;';
    }
}

function performReset() {
    localStorage.clear();
}

function onLoad() {
    findUserId();
    findPrivateKey();
    // var encryptedMessage = encryptMessage('hello world');
    // console.log('encrypted message: ' + encryptedMessage);
    // var decryptedMessage = decryptMessage(encryptedMessage);
    // console.log('decrypted message: ' + decryptedMessage);
}