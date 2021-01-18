document.addEventListener('DOMContentLoaded', onLoad);

var crypt = new Crypt();

function encryptMessage(publicKey, plainText) {
  return crypt.encrypt(publicKey, plainText);
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
    });

    return endpointResponse;
}  

function importStorage(storageDataset) {
    var data = JSON.parse(storageDataset);
    Object.keys(data).forEach(function (k) {
        localStorage.setItem(k, data[k]);
    });
}

async function prepareExport(tan, publicKey) {
  let encryptKeys = encryptMessage(publicKey, JSON.stringify(localStorage));
  let addKeys = await submitData('addKeysToTransfer', tan, 'POST', encryptKeys)
    .then(
      function(response) {
        console.log(response);
        window.location.replace("https://corona-log.de");
      }
    )
}

async function prepareImport() {
    var tan = window.location.href.split('#')[1];
    try {
      var responseAfterUpload = await submitData('retrievePublicKey', tan, 'GET', null);
    } catch(e) {
      alert(e);
    }
    console.log(responseAfterUpload);
    console.log(JSON.parse(responseAfterUpload[0].publicKey));
    prepareExport(tan, JSON.parse(responseAfterUpload[0].publicKey));
}

function onLoad() {
    prepareImport();
}