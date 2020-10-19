document.addEventListener('DOMContentLoaded', onLoad);

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

function submitData(request, payload, method, jsonData) {
    var endpoint = 'https://corona-log.de/api.php?request=' + request + '&payload=' + payload;
    var unencryptedEntry = null;
    var storageDataset = null;

    console.log(endpoint);
    console.log(method);
    console.log(jsonData);

    fetch(endpoint, {
        method: method,
        body : jsonData
    })
    .then((resp) => resp.json())
    .then(function(response) {
        console.log(response);
        if (request === 'getToken') {
            if(response.code !== 'nok') {
                console.log(response[0].encryptedKey);
                storageDataset = decryptKeys(response[0].encryptedKey, localStorage.getItem('password'));
                console.log(storageDataset.toString(CryptoJS.enc.Utf8));
                localStorage.clear();
                importStorage(storageDataset);
                document.getElementById('errorMessage').innerHTML = '<h3>It worked!</h3><a href="https://corona-log.de" class="btn btn-primary" role="button">Back to Corona Log</a>';
            } else {
                document.getElementById('errorMessage').innerHTML = 'Import failed.';
            }
        }
        return response;
    });
}

function decryptKeys(cipherText, password) {
    console.log("decrypting with hash " + password);
    let plainText = CryptoJS.AES.decrypt(cipherText, password, {
        format: JsonFormatter
      });
    console.log('decrypted keys: ' + plainText.toString(CryptoJS.enc.Utf8));
    return plainText.toString(CryptoJS.enc.Utf8);
}

function importStorage(storageDataset) {
    console.log("import");
    var data = JSON.parse(storageDataset);
    Object.keys(data).forEach(function (k) {
        localStorage.setItem(k, data[k]);
    });
}

function prepareImport() {
    var action = window.location.href.split('#')[1];
    var tan = action.split('-')[0];
    localStorage.setItem('password', action.split('-')[1]);

    submitData('getToken', tan, 'GET', null);
}

function onLoad() {
    prepareImport();
}