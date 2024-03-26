let editing = null;

function clearAllClasses(conf = true) {
	let l = document.querySelector('#class-list');

	let a = l.querySelectorAll('.class-row');
	if (!a.length) return;
	if (!conf || confirm('Clear all classes?')) {
		for (let i = a.length - 1; i >= 0; i--) {
			a[i].querySelector('.button-positive-2').click();
		}
	}
	editClassTimes(null);
	editing = null;
}

function addClass() {
	let l = document.querySelector('#class-list');
	if (!l.querySelectorAll('.content-container-horizontal').length) l.innerText = '';

	let r = document.createElement('div');
	r.classList.add('content-container-horizontal', 'class-row');
	
	r.times = [];
	r.color = Colors.randHSL();
	
	let d = document.createElement('div');
	d.classList.add('content-text');
	d.contentEditable = true;
	d.setAttribute('placeholder', 'Unnamed Class');
	d.style.position = 'relative';
	d.style.padding = 0;
	d.style.flex = 1;
	d.style.textShadow = '0 0.3em 0.8em ' + r.color + ', 0 -0.3em 0.8em ' + r.color + ', 0.3em 0 0.8em ' + r.color + ', -0.3em 0 0.8em ' + r.color;
	d.onblur = function() {
		if (editing == r) editClassTimes(r);
		saveCookie();
	}
	d.onkeypress = function(e) {
		if (e.key == 'Enter') e.preventDefault();
	};

	let b1 = document.createElement('div');
	b1.classList.add('button-positive-2');
	b1.style.display = 'flex';
	b1.innerHTML = '<svg width="10" height="10" style="fill: var(--color_btn);"><path d="M 0 4 H 10 V 6 H 0 V 4"></path></svg>';
	b1.onclick = function() {
		if (editing == r) editClassTimes(null);
		r.remove();
		if (l.children.length == 0) l.innerText = 'No classes added';
		editing = null;
		saveCookie();
	};

	let b2 = document.createElement('div');
	b2.classList.add('button-positive-2');
	b2.innerText = '⟹';
	b2.style.lineHeight = '10px';
	b2.onclick = function() {
		editing = r;
		editClassTimes(r);
	};
	
	r.append(d, b1, b2);
	l.append(r);
	saveCookie();
}

function editClassTimes(r) {
	let h = document.querySelector('#right-col-header');
	let s = document.querySelector('#right-col-instr');
	let l = document.querySelector('#right-col-list');
	let b = document.querySelector('#right-col-bottom');

	h.innerText = '';
	s.innerText = '';
	l.innerHTML = '';
	b.innerHTML = '';

	if (!r) return;
	
	h.innerText = r.querySelector('.content-text').innerText || 'Unnamed Class';
	h.style.color = r.color;
	s.innerText = 'Enter start and end times in military time (24-hour format).';

	writeTimeList(r);
	
	let a = document.createElement('div');
	a.classList.add('button-positive-2');
	a.innerText = 'Add Time';
	a.style.alignSelf = 'flex-end';
	a.onclick = function() {
		r.times.push(['', '', Array(7).fill(false)]);
		writeTimeList(r);
	};
	
	let c = document.createElement('div');
	c.classList.add('content-container-horizontal');
	let c1 = document.createElement('content-text');
	c1.innerText = 'Change Class Color: ';
	let c2 = document.createElement('input');
	c2.type = 'color';
	c2.value = Colors.rgb2Hex(h.style.color);
	c2.oninput = function() {
		r.color = c2.value;
		h.style.color = r.color;
		r.querySelector('.content-text').style.textShadow = '0 0.3em 0.8em ' + r.color + ', 0 -0.3em 0.8em ' + r.color + ', 0.3em 0 0.8em ' + r.color + ', -0.3em 0 0.8em ' + r.color;
		saveCookie();
	}
	c.append(c1, c2);
	
	b.append(c, a);
}

function writeTimeList(r) {
	let l = document.querySelector('#right-col-list');
	l.innerHTML = '';

	for (let i = 0; i < r.times.length; i++) {
		let bounding = document.createElement('div');
		bounding.classList.add('content-container-vertical', 'class-time');
		
		let tRow = document.createElement('div');
		tRow.classList.add('content-container-horizontal', 'time-row');
		
		let start = document.createElement('div');
		start.classList.add('content-text', 'start-time');
		start.contentEditable = true;
		start.innerText = r.times[i][0];
		start.setAttribute('placeholder', 'start');
		start.style.position = 'relative';
		start.style.padding = 0;
		start.style.flex = 1;
		start.onblur = function() {saveTimeList(r);};
		start.onkeypress = function(e) {
			if (isNaN(String.fromCharCode(e.which)) || e.key == ' ' || start.innerText.length == 4) e.preventDefault();
		};
		
		let end = document.createElement('div');
		end.classList.add('content-text', 'end-time');
		end.contentEditable = true;
		end.innerText = r.times[i][1];
		end.setAttribute('placeholder', 'end');
		end.style.position = 'relative';
		end.style.padding = 0;
		end.style.flex = 1;
		end.onblur = function() {saveTimeList(r);};
		end.onkeypress = function(e) {
			if (isNaN(String.fromCharCode(e.which)) || e.key == ' ' || end.innerText.length == 4) e.preventDefault();
		};

		let btn = document.createElement('div');
		btn.classList.add('button-positive-2');
		btn.style.display = 'flex';
		btn.innerHTML = '<svg width="10" height="10" style="fill: var(--color_btn);"><path d="M 0 4 H 10 V 6 H 0 V 4"></path></svg>';
		btn.onclick = function() {
			bounding.remove();
			saveTimeList(r);
		};

		tRow.append(start, end, btn);

		let dRow = document.createElement('div');
		dRow.classList.add('content-container-horizontal', 'day-row');
		dRow.style.justifyContent = 'flex-start';
		
		let dates = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
		for (let d in dates) {
			let b = document.createElement('div');
			b.classList.add('button-positive-2', 'day-btn');
			b.innerText = dates[d];
			if (r.times[i][2][d]) b.classList.add('active');
			b.onclick = function() {
				this.classList.toggle('active');
				saveTimeList(r);
			}
			dRow.append(b);
		}

		bounding.append(tRow, dRow);
		l.append(bounding);
	}
	saveCookie();
}

function saveTimeList(r) {
	let l = document.querySelector('#right-col-list');

	let a = [];
	for (let row of l.children) {
		let t = ['', '', []];
		t[0] = row.querySelector('.start-time').innerText;
		t[1] = row.querySelector('.end-time').innerText;
		for (let e of row.querySelectorAll('.day-btn')) {
			t[2].push(e.classList.contains('active'));
		}
		a.push(t);
	}

	r.times = a;
	saveCookie();
}

function saveCookie() {
	let a = document.querySelectorAll('.class-row');

	let arr = Array.from(a).map(e => [e.querySelector('.content-text').innerText, e.times, e.color]);
	Cookies.setCookie('classList', JSON.stringify(arr), 1000 * 60 * 60 * 24 * 365 * 5);
}

function loadCookie() {
	let arr = JSON.parse(Cookies.getCookie('classList'));
	if (arr == null) return;

	clearAllClasses(false);

	for (let row of arr) {
		let l = document.querySelector('#class-list');
		let a = document.querySelectorAll('.class-row');
		if (!a.length) l.innerText = '';
	
		let r = document.createElement('div');
		r.classList.add('content-container-horizontal', 'class-row');
		
		r.times = row[1];
		r.color = row[2]
		
		let d = document.createElement('div');
		d.classList.add('content-text');
		d.contentEditable = true;
		d.setAttribute('placeholder', 'Unnamed Class');
		d.style.position = 'relative';
		d.style.padding = 0;
		d.style.flex = 1;
		d.style.textShadow = '0 0.3em 0.8em ' + r.color + ', 0 -0.3em 0.8em ' + r.color + ', 0.3em 0 0.8em ' + r.color + ', -0.3em 0 0.8em ' + r.color;
		d.onblur = function() {
			if (editing == r) editClassTimes(r);
			saveCookie();
		}
		d.onkeypress = function(e) {
			if (e.key == 'Enter') e.preventDefault();
		};
		d.innerText = row[0];
	
		let b1 = document.createElement('div');
		b1.classList.add('button-positive-2');
		b1.style.display = 'flex';
		b1.innerHTML = '<svg width="10" height="10" style="fill: var(--color_btn);"><path d="M 0 4 H 10 V 6 H 0 V 4"></path></svg>';
		b1.onclick = function() {
			if (editing == r) editClassTimes(null);
			r.remove();
			if (l.children.length == 0) l.innerText = 'No classes added';
			editing = null;
			saveCookie();
		};
	
		let b2 = document.createElement('div');
		b2.classList.add('button-positive-2');
		b2.innerText = '⟹';
		b2.style.lineHeight = '10px';
		b2.onclick = function() {
			editing = r;
			editClassTimes(r);
		};
		
		r.append(d, b1, b2);
		l.append(r);
	}
}
