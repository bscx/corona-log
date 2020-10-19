var tabUrl = "";

// Get tab URL 
chrome.tabs.getSelected(null,function(tab) {
    tabUrl = tab.url;
	document.getElementById("text").value = tabUrl;
	makeCode();
});

// QR code image size
var qrcode = new QRCode(document.getElementById("qrcode"), {
	width : 400,
	height : 400
});

function makeCode () {		
	var elText = document.getElementById("text");
	
	/* if (!elText.value) {
		alert("Input a text");
		elText.focus();
		return;
	} */
	
	
	qrcode.makeCode(elText.value);
}

makeCode();


// Event listener
$("#text").
	on("blur", function () {
		makeCode();
	}).
	on("keyup", function (e) {
		makeCode();
	
		/*if (e.keyCode == 13) {
			makeCode();
		}*/
	});