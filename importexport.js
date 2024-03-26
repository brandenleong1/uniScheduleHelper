function importList() {
	document.querySelector('#import-textarea').value = '';
	Popup.popup(document.querySelector('#popup-import'));
}

function readImportString() {
	let a = document.querySelector('#import-textarea').value;
	if (a != null) {
		try {
			a = Base64.decode(a);
			let arr = JSON.parse(a);
			Cookies.setCookie('classList', a, 1000 * 60 * 60 * 24 * 365 * 5);
			loadCookie();
			document.querySelector('#popup-import').parentNode.click();
		} catch (e) {
			Popup.toastPopup('Invalid read');
		}
	}
}

function exportList() {
	if (!Cookies.getCookie('classList')) {
		Popup.toastPopup('Nothing to export!');
	} else {
		document.querySelector('#export-textarea').value = Base64.encode(Cookies.getCookie('classList'));
		document.querySelector('#export-textarea').select();
		Popup.popup(document.querySelector('#popup-export'));
	}
}

function copyExportString() {
	document.querySelector('#export-textarea').select();
	document.execCommand('copy');
	Popup.toastPopup('Copied to clipboard');
}