document.addEventListener('DOMContentLoaded', onLoad);

let log = document.getElementById('pills-log');
let profile = document.getElementById('pills-profile');
let about = document.getElementById('pills-about');
let nicknameGreeting = null;

log.addEventListener('onClick', getLogTab());
profile.addEventListener('onClick', getProfileTab());
about.addEventListener('onClick', getAboutTab());

var cryptEntropy = generateRandomString(1024);
var crypt = new Crypt({ entropy: cryptEntropy });

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

async function submitData(request, payload, method, jsonData) {
    var endpoint = 'https://corona-log.de/api.php?request=' + request + '&payload=' + payload;
    console.log(endpoint);
    const endpointResponse = await fetch(endpoint, {
        method: method,
        body : jsonData
    })
    .then((resp) => resp.json())
    .then(function(response) {
        return response;
    })
    .catch((error)=>{
        return (error);
    });

    return endpointResponse;
}

function showEntry(jsonData) {
    if (jsonData === null) {
        return null;
    }
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
    logEntries.prepend(clone);
}

async function processData() {
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
        venue: escapeHtml(document.getElementById('inputVenue').value.trim()),
        mask: document.getElementsByName('inputMask')[0].checked,
        distance: document.getElementsByName('inputDistance')[0].checked,
        location: location,
        notes: escapeHtml(document.getElementById('inputNotes').value.trim()),
        numberPersons: getNumberPersonsString(document.getElementById('inputNumberPersons').value),
        amountTime:escapeHtml(document.getElementById('inputAmountTime').value)
    });

    encryptedPayload = encryptMessage(payload);
    await submitData('addEntry', findUserId(), 'POST', encryptedPayload);
    showEntry(payload);
    
}

async function getLogTab() {
    let userid = findUserId();
    console.log(userId);
    if (userId === null) {
        getLogTab();
    }

    var greeting = document.getElementById('greeting');
    greeting.innerHTML = getGreeting();
    nicknameGreeting = document.getElementById('nicknameGreeting');
    nicknameGreeting.innerHTML = getNickname();

    try {
        var response = await submitData('getEntries', userId, 'GET', null);
    } catch(e) {
        alert(e);
    }

    if (response.code != 'nok') {
        response.forEach(function(e) {
            console.log(e);
            unencryptedEntry = decryptMessage(e.entry);
            showEntry(unencryptedEntry);
        });
    }

    var inputNumberPersonsSlider= document.getElementById('inputNumberPersons');
    var inputNumberPersonsDescription = document.getElementById('inputNumberPersonsDescription');
    inputNumberPersonsDescription.innerHTML = getNumberPersonsString(inputNumberPersonsSlider.value);

    var inputAmountTimeSlider = document.getElementById('inputAmountTime');
    var inputAmountTimeDescription = document.getElementById('inputAmountTimeDescription');
    inputAmountTimeDescription.innerHTML = inputAmountTimeSlider.value;

    inputNumberPersonsSlider.oninput = function() { inputNumberPersonsDescription.innerHTML = getNumberPersonsString(this.value); }
    inputAmountTimeSlider.oninput = function() { inputAmountTimeDescription.innerHTML = this.value; }

    $('#newEntryFormSubmit').unbind("click").click(function(e){
        e.preventDefault();
        processData();
        // document.getElementById('newEntryClose').click;
        $('#newEntry').modal('hide');
    });
    $('#newEntry').removeData();
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
    var rsaEntropy = generateRandomString(1024);
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
    }, 4096);
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
    try {
        return crypt.decrypt(localStorage.getItem('privateKey'), cipherText).message;
    } catch(e) {
        alert(e);
        return null;
    }
}

function importStorage(storageDataset) {
    var data = JSON.parse(storageDataset);
    Object.keys(data).forEach(function (k) {
        localStorage.setItem(k, data[k]);
    });
}

async function importLocalStorage(token) {
    var encryptedLocalStorage = null;
    
    try {
        encryptedLocalStorage = await submitData('retrieveEncryptedLocalStorage', token, 'GET', null);
    } catch(e) {
        alert(e);
    }

    console.log(encryptedLocalStorage);

    if(encryptedLocalStorage.code !== 'nok') {
        let elsJson = encryptedLocalStorage[0].encryptedStorage;
        console.log(elsJson);
        let storageDataset = decryptMessage(elsJson);
        console.log("dec: " + storageDataset);
        localStorage.clear();
        importStorage(storageDataset);
        location.reload();
    } else {
        setTimeout(function() {
            importLocalStorage(token);
        }, 5000);
    }
}

async function linkToExistingAccount() {
    var localPublicKey = JSON.stringify(localStorage.getItem('publicKey'));
    try {
        var responseAfterUpload = await submitData('linkToExistingAccount', null, 'POST', localPublicKey);
    } catch(e) {
        alert(e);
    }

    console.log(responseAfterUpload);
    var token = responseAfterUpload.message;
    
    document.getElementById('tanDataUrl').innerHTML = '<pre><small>https://corona-log.de/onboarding.html#' + token + '</small></pre>';
    new QRCode(document.getElementById('qrCode'), 'https://corona-log.de/onboarding.html#' + token);

    importLocalStorage(token);
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