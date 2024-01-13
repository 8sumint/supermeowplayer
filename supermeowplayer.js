// JavaScript Document
// nu super meow player

// v 2.0.3
// what do u think???

// update: find-replaced "var" to "let" :3
// update: maybe fixed the bug
// update: ran auto-formatter

const lbl_rw = "◄◄";
const lbl_ff = "►►";
const lbl_play = "►";
const lbl_pause = "▌▌";

var anim_cache = {};

function taiga_okiro() {
	// hey good morning the document loaded we can do shit
	let players = document.getElementsByTagName("meowplayer");
	for (let i = 0; i < players.length; i++) {
		let p = players[i];
		p.id = 'mp-auto-' + i; // give each a unique id based on order

		let audio = p.getElementsByTagName('audio')[0];
		if (!audio) {
			p.textContent = "you didn't include a source, dummy >///< (id=" + p.id + ")";
			continue;
		}

		let title = p.getAttribute('title');
		p.removeAttribute('title');

		let volume = p.getAttribute('vol');
		//p.removeAttribute('vol');
		// actually we need it later
		if (!volume) {
			volume = 1;
			p.setAttribute('vol', 1);
		}

		let animsrc = p.getAttribute("animsrc");
		if (animsrc) {
			cache_anim(animsrc);
		}

		// uh there's another property "canpause"
		// this is a bit silly
		if (p.hasAttribute('canpause')) {
			p.setAttribute('canpause', 1);
		}

		// ok so let's add everything
		let titlebar = document.createElement('p');
		titlebar.style.lineHeight = '1';
		titlebar.style.marginBottom = '2px';
		titlebar.innerHTML = title;
		let titlebar_animation = document.createElement('span');
		titlebar.appendChild(titlebar_animation);
		p.appendChild(titlebar);

		audio.volume = volume;
		audio.controls = false; // just making sure

		let controls = document.createElement('div');
		controls.className = 'controls';

		let c_buttons = document.createElement('div');
		c_buttons.className = "buttons";
		let c_play = document.createElement('a');
		c_play.textContent = 'PLAY' + lbl_play;
		c_play.onclick = p_play.bind(null, i);
		c_play.className = 'c_play';
		c_buttons.appendChild(c_play);
		controls.appendChild(c_buttons);

		let c_progress = document.createElement('span');
		c_progress.className = 'progress';
		c_progress.innerHTML = "*----------";
		c_progress.style.paddingLeft = '4px';
		controls.appendChild(c_progress);

		let c_time = document.createElement('span');
		c_time.className = "time";
		c_time.innerHTML = "<span class='elap'>00:00</span><span class='total'>/00:00</span>";
		//c_time.style.float = 'right';
		c_time.style.paddingLeft = '2px';
		c_time.onclick = p_debug.bind(null, i);
		controls.appendChild(c_time);
		p.appendChild(controls);
		// should be it

		// just one more thing
		let uhhh_audio = document.getElementById('mp-auto-' + i)
			.getElementsByTagName('audio')
			.item(0);
		uhhh_audio.onloadedmetadata = p_update.bind(null, i);
		uhhh_audio.onerror = p_update.bind(null, i);
		uhhh_audio.onended = p_stop.bind(null, i);
		// oh and this now
		document.getElementById('mp-auto-' + i)
			.getElementsByClassName('progress')
			.item(0)
			.addEventListener('click', p_seek);
		setTimeout(300, p_update.bind(null, i));
	}
	// apply the volume (if we stored it)
	on_global_volume_update();

}
document.addEventListener('DOMContentLoaded', taiga_okiro);

let x = setInterval(() => {
	if (document.readyState == "complete") {
		force_pupdate();
		setTimeout(() => { force_pupdate(); }, 500);
		clearInterval(x);
	}
}, 300);

function p_play(i, was_paused) {
	let p = document.getElementById('mp-auto-' + i);
	if (!p) {
		return;
	}
	if (was_paused == 2) {
		setup_buttons(i, 'unpaused');
	} else {
		setup_buttons(i, 'playing');
	}
	let audio = p.getElementsByTagName('audio')[0];
	audio.play();
	if (audio.currentTime != 0) {
		audio.currentTime -= 0.01; // fade fix
		let timera = setInterval(function () {
			let r = p_fadein(audio);
			if (r == 1) clearInterval(timera);
		}, 10);
	} else {
		on_global_volume_update();
	}

	let timer = setInterval(function () {
		p_update(i);
		if (audio.paused) clearInterval(timer);
	}, 50);
	p_update(i);
}

function p_update(i) {
	// called on each 'tick' (set up just above, in play function.. 50 rn)
	let p = document.getElementById('mp-auto-' + i);
	if (!p) {
		return;
	}
	// draw titlebar anim if there is one
	let animsrc = p.getAttribute('animsrc');
	if (animsrc) {
		p_draw_anim(i, animsrc);
	}
	let audio = p.getElementsByTagName('audio')[0];
	// draw controls
	let controls = p.getElementsByClassName('controls')[0];
	let c_play = controls.getElementsByTagName('a')[0];
	if (!audio.duration) {
		// aka not loaded
		c_play.style.color = "#888";
		c_play.onclick = null;
		c_play.style.cursor = 'not-allowed';
		controls.getElementsByClassName('progress')[0]
			.removeEventListener('click', p_seek);
	}
	let progress = draw_progress(audio.currentTime, audio.duration);
	controls.getElementsByClassName('progress')[0].textContent = progress[0];
	controls.getElementsByClassName('elap')[0].innerHTML = progress[1];
	controls.getElementsByClassName('total')[0].innerHTML = progress[2];

}

function force_pupdate() {
	let players = document.getElementsByTagName("meowplayer");
	for (let i = 0; i < players.length; i++) {
		p_update(i);
	}
}

function p_pause(i) {
	let p = document.getElementById('mp-auto-' + i);
	if (!p) {
		return;
	}
	setup_buttons(i, 'paused');
	let audio = p.getElementsByTagName('audio')[0];
	let timer = setInterval(function () {
		let r = p_fadeout(audio);
		if (r == 1) clearInterval(timer);
	}, 10);
}

function p_stop(i) {
	let p = document.getElementById('mp-auto-' + i);
	if (!p) {
		return;
	}
	let audio = p.getElementsByTagName('audio')[0];
	audio.pause();
	p_update(i);
	let timer = setInterval(function () {
		let r = p_rewind(i);
		if (r == 1) clearInterval(timer);
	}, 69);
	setup_buttons(i, 'ready');
}

function p_rewind(i) {
	let p = document.getElementById('mp-auto-' + i);
	let audio = p.getElementsByTagName('audio')[0];

	if (!audio.paused) {
		// shit shit shit abort we're playing again
		return 1;
	}

	if (audio.currentTime < 0.01) {
		audio.currentTime = 0;
		p_update(i);
		return 1; // done rewinding
	} else {
		if (audio.duration < 30) {
			audio.currentTime -= (audio.duration / 10) // speed
		} else {
			audio.currentTime -= (audio.duration / 20) // speed
		}

	}
	p_update(i);
}
function p_fadeout(audio) {
	let vw = document.getElementById('mp-volume');
	let global_vol = 100;
	if (vw) {
		global_vol = vw.value;
	}
	let real_vol = audio.parentElement.getAttribute('vol') * global_vol / 100;

	if (audio.volume <= 0.04) {
		audio.volume = 0;
		audio.pause();
		return 1; // done fading out :)
	} else {
		try {
			audio.volume -= real_vol / 18;
		}
		catch {
			audio.volume = 0;
		}
	}
}

function p_fadein(audio) {
	let vw = document.getElementById('mp-volume');
	let global_vol = 100;
	if (vw) {
		global_vol = vw.value;
	}
	let real_vol = audio.parentElement.getAttribute('vol') * global_vol / 100;
	if (audio.volume >= real_vol || audio.volume + 0.05 >= 1) {
		audio.volume = real_vol;
		return 1; // done fading in :)
	} else {
		try {
			audio.volume += real_vol / 18;
		}
		catch {
			audio.volume = 1;
		}
	}
}

function p_seek(event) {
	let rect = event.target.getBoundingClientRect();
	let x = event.clientX - rect.left; //x position within the element.
	x -= 5; // left bias so you can actually restart
	x = Math.max(0, x);
	let w = event.target.offsetWidth;
	w -= 8; // same shit but for the other side
	let pos = Math.round(x / w * 100);
	console.log('try magically seek to ' + pos + '%');
	// ok what are we even inside..
	let id = event.target.parentElement.parentElement.id.split('-')[2];
	let audio = event.target.parentElement.parentElement.getElementsByTagName('audio')[0];
	audio.currentTime = audio.duration * pos / 100;
	p_update(id);
}

function p_debug(i) {
	let p = document.getElementById('mp-auto-' + i);
	let audio = p.getElementsByTagName('audio')[0];
	if (audio) {
		console.log('p' + i + ' at ' + audio.currentTime);
	}
}

function draw_progress(elapsed, total) {
	let playhead = '*';
	if (!total) {
		// not loaded properly..
		total = 0;
		playhead = '?';
	}
	let ex = Math.round(elapsed / total * 10);
	if (!ex) {
		ex = 0;
	}
	let pbar = '-'.repeat(ex) + playhead + '-'.repeat(10 - ex);

	// slightly less fake this time
	elapsed = Math.round(elapsed);
	total = Math.ceil(total);
	let elapsed_m = Math.floor(elapsed / 60);
	let elapsed_s = elapsed % 60;
	let total_m = Math.floor(total / 60);
	let total_s = total % 60;
	let elap = str_pad_left(elapsed_m, '0', 2) + ':' + str_pad_left(elapsed_s, '0', 2);
	let totaltime = '/' + str_pad_left(total_m, '0', 2) + ':' + str_pad_left(total_s, '0', 2)
	return [pbar, elap, totaltime]
}



/*  player button state:
 *  - ready / stopped / rewinding
 *  - playing
 *  - paused
 *  - unpaused (play from pause state)
 */
function setup_buttons(i, state) {
	let p = document.getElementById('mp-auto-' + i);
	if (!p) {
		return;
	}

	console.log(state);

	let can_pause = p.getAttribute("canpause");

	// clear buttons
	let c_buttons = p.getElementsByClassName("buttons")[0];
	let c_play;
	let elap;
	switch (state) {
		case 'ready':
			emptyElement(c_buttons);
			c_play = document.createElement('a');
			c_play.textContent = 'PLAY' + lbl_play;
			c_play.onclick = p_play.bind(null, i);
			c_play.className = 'c_play';
			c_buttons.appendChild(c_play);
			elap = p.getElementsByClassName('elap')[0];
			elap.classList = 'elap';
			break;

		case 'playing':
			if (can_pause) {
				emptyElement(c_buttons);
				let c_rewind = document.createElement('a');
				c_rewind.textContent = lbl_rw;
				c_rewind.onclick = p_stop.bind(null, i);
				c_rewind.className = 'c_rew';
				c_buttons.appendChild(c_rewind);
				let c_pause = document.createElement('a');
				c_pause.textContent = lbl_pause;
				c_pause.onclick = p_pause.bind(null, i);
				c_pause.className = 'c_pause';
				c_buttons.appendChild(c_pause);
			} else {
				c_play = c_buttons.children[0];
				c_play.textContent = 'REW' + lbl_rw;
				c_play.onclick = p_stop.bind(null, i);
			}
			elap = p.getElementsByClassName('elap')[0];
			elap.classList = 'elap';
			break;

		case 'paused':
			c_play = c_buttons.children[1];
			c_play.textContent = lbl_play;
			c_play.onclick = p_play.bind(null, i, 2);
			c_play.className = 'c_hplay';
			c_buttons.replaceChild(c_play, c_buttons.children[1]);
			elap = p.getElementsByClassName('elap')[0];
			elap.classList = 'elap pausedelap';
			break;
		case 'unpaused':
			c_play = c_buttons.children[1];
			c_play.textContent = lbl_pause;
			c_play.onclick = p_pause.bind(null, i);
			c_play.className = 'c_pause';
			c_buttons.replaceChild(c_play, c_buttons.children[1]);
			elap = p.getElementsByClassName('elap')[0];
			elap.classList = 'elap';
			break;
	}

}


function on_global_volume_update() {
	let vw = document.getElementById('mp-volume');
	let global_vol = 100;
	if (vw) {
		global_vol = vw.value;
		vw.removeAttribute('disabled');
	}
	let players = document.getElementsByTagName("meowplayer");
	for (let i = 0; i < players.length; i++) {
		let p = players[i];
		let max_vol = p.getAttribute('vol');
		//console.log('its max_vol: ' + max_vol + ' * global vol: ' + global_vol/100);
		p.getElementsByTagName('audio')[0].volume = max_vol * global_vol / 100;
	}
}

function p_draw_anim(i, animsrc) {
	let p = document.getElementById('mp-auto-' + i);
	let audio = p.getElementsByTagName('audio')[0];
	let anim_area = p.getElementsByTagName('p')[0].getElementsByTagName('span')[0];

	if (audio.paused) {
		anim_area.innerHTML = "";
	} else {
		let content = anim(animsrc, audio.currentTime);
		if (content) {
			anim_area.innerHTML = content;
		} else {
			anim_area.innerHTML = "";
		}
	}
}

function anim(src, t) {
	let data = anim_cache[src];
	if (!data) {
		return null;
	}
	for (let i = data.length - 1; i >= 0; i--) {
		// still kinda backwards but it does it itself so ..
		if (t > data[i].after) {
			return data[i].text;
		}
	}
}

function cache_anim(animsrc) {
	fetch(animsrc)
		.then(response => response.text())
		.then(text => {
			let parsed = parse_anim(text);
			if (parsed) {
				anim_cache[animsrc] = parsed;
			}
		});
}

function parse_anim(data) {
	if (!data.startsWith('offset')) {
		return null; 	// this is like the signature.. don't try to parse a 404 page
		// maybe figure out if it's a 404 or whatever while fetching it..
	}
	let lines = data.split('\n');

	let offset = 0;

	let timing = [];

	for (let i = 0; i < lines.length; i++) {
		let parts = lines[i].trimStart().split(' ');
		if (parts.length == 2 && parts[0] == 'offset') {
			offset = parseFloat(parts[1]);
		} else if (parts.length >= 2) {
			let after = parseFloat(parts[0]);
			if (after > 0) {
				after += offset; // apply offset to value if not the initial state
			}
			let text = parts.slice(1).join(' ');
			timing.push({ after, text });
		}
	}
	return timing;
}



function emptyElement(e) {
	e.innerHTML = "";
}

function str_pad_left(string, pad, length) {
	return (new Array(length + 1).join(pad) + string).slice(-length);
}
