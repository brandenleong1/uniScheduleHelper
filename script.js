async function changeTheme() {
	let btn = document.querySelector('#theme-btn');
	btn.onclick = null;
	btn.themeId = (btn.themeId + 1) % Themes.themes.length;

	let labels = btn.themeLabel1Shown ? [document.querySelector('#theme-label-1'), document.querySelector('#theme-label-2')] : [document.querySelector('#theme-label-2'), document.querySelector('#theme-label-1')];
	labels[1].innerText = Themes.themes[btn.themeId][0];
	await Animate.animateGroup([
		[labels[0], Animate.fadeOut, {shiftTo: UP}],
		[labels[1], Animate.fadeIn, {shiftFrom: DOWN}]
	]);
	document.querySelector('#theme-css').setAttribute('href', Themes.themes[btn.themeId][1]);
	Cookies.setCookie('themeID', btn.themeId, 5 * 365 * 24 * 60 * 60 * 1000);

	btn.themeLabel1Shown = !btn.themeLabel1Shown;
	await Animate.wait(1500);
	btn.onclick = changeTheme;
}