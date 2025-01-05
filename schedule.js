let animSchedules = false;

async function generateSchedules() {
	if (checkValidTimes()) {
		let a = document.querySelectorAll('#class-list .class-row');

		let indices = Array(a.length).fill(0);
		let bases = Array.from(a).map(r => r.times.length);

		let p = 1;
		for (let base of bases) p *= base;

		let good = [];
		for (let i = 0; i < p; i++) {
			let s = Array(indices.length);
			for (let j = 0; j < indices.length; j++) {
				s[j] = a[j].times[indices[j]];
			}
			if (!hasScheduleConflict(s)) good.push(s);

			incrementIndices(indices, bases);
		}

		if (!good.length) {
			Popup.toastPopup('All class schedules overlap!');
		} else {
			// console.log(good);

			let l1 = document.querySelector('#l-col-1');
			let r1 = document.querySelector('#r-col-1');
			let l2 = document.querySelector('#l-col-2');
			let r2 = document.querySelector('#r-col-2');

			l1.style.pointerEvents = 'none';
			r1.style.pointerEvents = 'none';
			l2.style.pointerEvents = 'none';
			r2.style.pointerEvents = 'none';

			await async function() {
				let r2 = document.querySelector('#right-col2-body');
				
				let bs = document.createElement('div');
				bs.id = 'big-schedule';

				let tab = document.createElement('table');
				tab.id = 'schedule-grid';
				tab.innerHTML = ('<tr>' + ('<td></td>').repeat(8) + '</tr>').repeat(25);
				tab.style.width = '100%';
				tab.style.aspectRatio = 'calc((7 + 1) * 5) / calc((24 + 1) * 2)';
				tab.style.borderCollapse = 'collapse';
				tab.style.position = 'absolute';

				r2.append(bs, tab);

				let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
				for (let i = 0; i < 7; i++) {
					let d = document.createElement('div');
					d.classList.add('header');
					d.innerText = days[i];
					d.style.gridColumnStart = 2 + i;
					d.style.gridColumnEnd = 3 + i;
					d.style.gridRowStart = 1;
					d.style.gridRowEnd = 60;
					d.style.placeSelf = 'center';
					bs.append(d);
				}

				for (let i = 0; i < 24; i++) {
					let d = document.createElement('div');
					d.classList.add('header');
					d.innerText = i.toString().padStart(2, '0') + '00';
					d.style.gridColumnStart = 1;
					d.style.gridColumnEnd = 2;
					d.style.gridRowStart = 60 * i + 31;
					d.style.gridRowEnd = 60 * (i + 1) + 31;
					bs.append(d);
				}

				let l = document.querySelector('#schedule-list');

				for (let i = 0; i < good.length; i++) {
					let row = document.createElement('div');
					row.classList.add('content-container-horizontal', 'schedule-row');
					row.listID = i;
					row.times = good[i];

					let ms = document.createElement('div');
					ms.classList.add('mini-schedule');

					for (let j = 0; j < good[i].length; j++) {
						let s = good[i][j][0], e = good[i][j][1];
						let sh = parseInt(s.substr(0, 2), 10), sm = parseInt(s.substr(2, 4), 10);
						let eh = parseInt(e.substr(0, 2), 10), em = parseInt(e.substr(2, 4), 10);

						for (let k = 0; k < 7; k++) {
							if (good[i][j][2][k]) {
								let time = document.createElement('div');
								time.classList.add('time');
								time.style.backgroundColor = a[j].color;
								time.style.gridColumnStart = 1 + k;
								time.style.gridColumnEnd = 2 + k;
								time.style.gridRowStart = 1 + sh * 60 + sm;
								time.style.gridRowEnd = 1 + eh * 60 + em;
								ms.append(time);
							}
						}
					}

					let btn = document.createElement('div');
					btn.classList.add('button-positive-2');
					btn.style.display = 'flex';
					btn.style.height = 'max-content';
					btn.style.marginTop = '10%';
	
					let img = document.createElement('div');
					img.classList.add('show-icon');

					ms.onclick = function() {
						selectSchedule(row);
					};
					btn.onclick = function() {
						img.classList.toggle('show-icon');
						img.classList.toggle('hide-icon');
						updateSelectedName();

						if (img.classList.contains('hide-icon')) {
							ms.style.filter = 'blur(5px) grayscale(0.8)';
							if (row.classList.contains('selected')) {
								row.classList.remove('selected');
								drawSelectedBig();
							}
						} else {
							ms.style.filter = null;
						}
					};
					btn.append(img);

					row.append(ms, btn);
					l.append(row);
					updateSelectedName();
				}

			}();

			await Animate.remove(l2);
			await Animate.remove(r2);

			l2.style.display = null;
			r2.style.display = null;

			let l = document.querySelector('#schedule-list');
			l.style.height = (document.querySelector('#big-schedule').getBoundingClientRect().height - 10) + 'px';
			window.addEventListener('resize', function() {
				l.style.height = (document.querySelector('#big-schedule').getBoundingClientRect().height- 10) + 'px';
			});

			await Animate.animateGroup([
				[l1, Animate.fadeOut, {shiftTo: DOWN}],
				[r1, Animate.fadeOut, {shiftTo: DOWN}],
				[l2, Animate.fadeIn, {shiftFrom: UP}],
				[r2, Animate.fadeIn, {shiftFrom: UP}]
			]);

			l2.style.pointerEvents = null;
			r2.style.pointerEvents = null;

			l1.style.display = 'none';
			r1.style.display = 'none';
			l1.style.position = 'absolute';
			r1.style.position = 'absolute';
			l2.style.position = 'static';
			r2.style.position = 'static';

			window.addEventListener('keydown', function(e) {
				if (e.key == 'ArrowLeft') {
					e.preventDefault();
					incrementSelect(-1);
				} else if (e.key == 'ArrowRight') {
					e.preventDefault();
					incrementSelect(1);
				}
			});
		}
	}
}

function incrementSelect(n) {
	let n2 = document.querySelectorAll('.show-icon').length;
	if (!n2) return;

	let sel = document.querySelector('.schedule-row.selected');
	let a = Array.from(document.querySelectorAll('.schedule-row'));

	let id = !sel ? (n > 0 ? -1 : 0) : a.indexOf(sel);
	let c = 0;
	while (c < Math.abs(n)) {
		id += (n / Math.abs(n)) + a.length;
		id %= a.length;
		if (a[id].querySelector('.show-icon')) c++;
	}
	selectSchedule(a[id]);
}

function selectSchedule(row) {
	if (row.querySelector('.show-icon')) {
		if (!row.classList.contains('selected')) {
			for (let e of document.querySelectorAll('.schedule-row')) {
				e.classList.remove('selected');
			}
		}
		row.classList.toggle('selected');
		if (row.classList.contains('selected')) row.scrollIntoView({behavior: "auto", block: "nearest"});
		drawSelectedBig();
	}
}

function updateSelectedName() {
	let sel = document.querySelector('.schedule-row.selected');
	let n2 = document.querySelectorAll('.show-icon').length;
	if (sel) {
		let n1 = document.querySelectorAll('.schedule-row').length;
		document.querySelector('#right-col2-header').innerText = (sel.listID + 1) + ' / ' + n1 + ' (' + n2 + ' unhidden)';
	} else {
		document.querySelector('#right-col2-header').innerText = '(' + n2 + ' unhidden)';
	}
}

async function drawSelectedBig() {
	updateSelectedName();
	clearBig();
	let a = document.querySelectorAll('#class-list .class-row');
	let sel = document.querySelector('.schedule-row.selected');

	if (sel) {
		let b = document.querySelector('#big-schedule');

		let animArr = [];

		for (let i = 0; i < sel.times.length; i++) {
			let s = sel.times[i][0], e = sel.times[i][1];
			let sh = parseInt(s.substr(0, 2), 10), sm = parseInt(s.substr(2, 4), 10);
			let eh = parseInt(e.substr(0, 2), 10), em = parseInt(e.substr(2, 4), 10);

			for (let j = 0; j < 7; j++) {
				if (sel.times[i][2][j]) {
					let time = document.createElement('div');
					time.classList.add('time');
					time.innerText = a[i].querySelector('.content-text').innerText || 'Unnamed Class';
					time.title = s + ' - ' + e;
					time.style.backgroundColor = a[i].color;
					time.style.cursor = 'help';
					time.style.color = Colors.whiteOrBlackText(time.style.backgroundColor);
					time.style.gridColumnStart = 2 + j;
					time.style.gridColumnEnd = 3 + j;
					time.style.gridRowStart = 61 + sh * 60 + sm;
					time.style.gridRowEnd = 61 + eh * 60 + em;
					if (animSchedules) {
						Animate.remove(time);
						animArr.push([time, Animate.fadeIn, {scaleFrom: 0.2, runTimeOffset: 100}]);
					}
					b.append(time);
				}
			}
		}

		if (animSchedules) {
			animArr = Utils.shuffleArray(animArr);
			await Animate.animateGroup(animArr);
		}
	}
}

async function toggleAnimSchedules() {
	animSchedules = !animSchedules;
	Cookies.setCookie('animSchedules', animSchedules, 5 * 365 * 24 * 60 * 60 * 1000);

	let btn = document.querySelector('#anim-btn');
	btn.onclick = null;

	let labels = animSchedules ? [document.querySelector('#anim-label-1'), document.querySelector('#anim-label-2')] : [document.querySelector('#anim-label-2'), document.querySelector('#anim-label-1')];
	let txt = animSchedules ? ['Off', 'On'] : ['On', 'Off'];
	labels[1].innerText = txt[1];
	await Animate.animateGroup([
		[labels[0], Animate.fadeOut, {shiftTo: UP}],
		[labels[1], Animate.fadeIn, {shiftFrom: DOWN}]
	]);

	await Animate.wait(1500);
	btn.onclick = toggleAnimSchedules;
}

function clearBig() {
	let a = document.querySelectorAll('#big-schedule .time');
	for (let i = a.length - 1; i >= 0; i--) a[i].remove();
}

function checkValidTimes() {
	let a = document.querySelectorAll('#class-list .class-row');

	for (let i = 0; i < a.length; i++) {
		let r = a[i];

		if (r.times.length == 0) {
			Popup.toastPopup('Class "' + (r.querySelector('.content-text').innerText || 'Unnamed Class') + '" has no times!')
			return false;
		}
		for (let tr of r.times) {
			if (!isValidMilitaryTime(tr[0])) {
				Popup.toastPopup('Invalid time for class "' + (r.querySelector('.content-text').innerText || 'Unnamed Class') + '" (' + (tr[0] || 'blank time') + ')');
				return false;
			}
			if (!isValidMilitaryTime(tr[1])) {
				Popup.toastPopup('Invalid time for class "' + (r.querySelector('.content-text').innerText || 'Unnamed Class') + '" (' + (tr[1] || 'blank time') + ')');
				return false;
			}

			if (parseInt(tr[0], 10) > parseInt(tr[1], 10)) {
				Popup.toastPopup('Start time is after end time for class "' + (r.querySelector('.content-text').innerText || 'Unnamed Class') + '" (' + tr[0] + ' > ' + tr[1] + ')');
				return false;
			} else if (parseInt(tr[0], 10) == parseInt(tr[1], 10)) {
				Popup.toastPopup('Start time is the same as end time for class "' + (r.querySelector('.content-text').innerText || 'Unnamed Class') + '" (' + tr[0] + ' = ' + tr[1] + ')');
				return false;
			}

			if (tr[2].filter(e => e == true).length == 0) {
				Popup.toastPopup('No dates selected for class "' + (r.querySelector('.content-text').innerText || 'Unnamed Class') + '" (' + tr[0] + '-' + tr[1] + ')');
				return false;
			}
		}
	}

	return true;
}

function isValidMilitaryTime(s) {
	if (s.length == 4) {
		let h = parseInt(s.substr(0, 2), 10);
		let m = parseInt(s.substr(2, 4), 10);
		if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return true;
	}
	return false;
}

function hasScheduleConflict(s) {
	let a = [];
	for (let i = 0; i < 7; i++) a.push([]);

	for (let i = 0; i < s.length; i++) {
		let x = s[i];
		for (let j = 0; j < 7; j++) {
			if (x[2][j]) {
				a[j].push([x[0], x[1], i]);
			}
		}
	}
	// console.log(a);

	for (let i = 0; i < 7; i++) {
		for (let j1 = 0; j1 < a[i].length; j1++) for (let j2 = j1 + 1; j2 < a[i].length; j2++) {
			if (parseInt(a[i][j1][0], 10) <= parseInt(a[i][j2][1], 10) && parseInt(a[i][j1][1], 10) >= parseInt(a[i][j2][0], 10)) {
				// console.log(a[i][j1], a[i][j2], 'overlap');
				return true;
			}
		}
	}
	return false;
}

function incrementIndices(currArr, baseArr, n = 1) {
	currArr[currArr.length - 1] += n;
	for (let i = currArr.length - 1; i > 0; i--) {
		if (currArr[i] >= baseArr[i]) {
			currArr[i - 1] += Math.floor(currArr[i] / baseArr[i]);
			currArr[i] %= baseArr[i];
		}
	}

	if (currArr[0] >= baseArr[0]) {
		let t = Math.floor(currArr[0] / baseArr[0]);
		currArr[0] %= baseArr[0];
		return t;
	}

	return 0;
}