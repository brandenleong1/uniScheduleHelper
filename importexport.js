function importList() {
	let a = prompt('Enter in the import string');
	if (a != null) {
		try {
			a = Base64.decode(a);
			let arr = JSON.parse(a);
			Cookies.setCookie('classList', a, 1000 * 60 * 60 * 24 * 365 * 5);
			loadCookie();
		} catch (e) {
			Popup.toastPopup('Invalid read');
		}
	}
}

function exportList() {
	prompt('Copy and save this string to import', Base64.encode(Cookies.getCookie('classList')));
}