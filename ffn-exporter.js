// ==UserScript==
// @name		ffn exporter
// @namespace	https://sincerelyandyourstruly.neocities.org
// @version		1.0
// @description	export all the ffn fics at once and their reviews
// @author		白雪花
// @match		https://www.fanfiction.net/story/story_tab_list.php
// @icon		https://www.google.com/s2/favicons?sz=64&domain=fanfiction.net
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/ffn-exporter.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/ffn-exporter.js
// @grant		none
// ==/UserScript==


// backup link example: https://www.fanfiction.net/story/story_backup.php?storyid=12853790

class fic {
	constructor(el) {
		// default constructor
		this.link = el.querySelector(`a`);
		this.id = parseInt(this.link.id.match(/\d+/)[0]);
		this.href = `https://www.fanfiction.net/s/${this.id}/`;
		this.title = this.link.innerText.trim();
		this.numReviews = function () {
			let num = 0;
			try {
				num = parseInt(el.querySelector(`span.l-reviews`).innerText);
			} catch (e) {
				console.info(`${this.title} has no reviews.`);
			}
			return num;
		}();
		this.pgs = Math.ceil(this.numReviews / 16);
	}
	static total = new Array(); // static counter
	reviews = new Array();
	contents = "";

	getReviews() {
		const id = this.id, revs = this.reviews;
		for (var i = 0; i < this.pgs; i++) {
			const nya = i; // need a const so that it doesn't mutate while we're waiting for the next one in the loop to execute ehe
			setTimeout(() => {
				getPage(`/r/`, id, `/0/${nya + 1}/`).then((txt) => {
					// again we do stuff to the text
					const tds = txt.querySelectorAll(`#gui_table1 tbody td`);
					for (const td of tds) {
						const r = new review(td);
						revs.push(r);
					}
				});
			}, nya * 1000);
		}
	}
	save() {
		// feed it the fragment to be downloaded
		const cel = this.contents;
		let c = "";
		try {
			c = cel.getHTML();
		} catch (e) {
			//
			try {
				c = cel.toString(); // try just turning the element into a string?

			} catch (e2) {
				console.error(`yeah you just can't seem to do shit with these contents. sorry man`);
			}
		}
		fic.download(c, this.title, "text/html");
	}

	static download(fragment, name, typ) {
		const blob = new Blob([fragment], { type: typ });
		const DL = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = DL;
		a.download = name;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(DL);
	}
}

class review {
	constructor(el) { // feed it a td element from the reviews page
		// console.log(`el.childNodes: `, el.childNodes);
		this.username = (el.childNodes.length < 7) ? el.childNodes[2].textContent.trim() : el.childNodes[3].innerText.trim(); // guest reviews don't even get a span, so we have to do it by child nodes, which can include text fragments
		this.text = el.querySelector(`div`).innerText.split(/(\n|<br\/?>)+/); // each paragraph one item
		const sp = el.querySelector(`small`);
		// this.date = sp.querySelector(`span`).innerText; // date the review was left
		this.date = (new Date(parseInt(`${sp.querySelector(`span`).getAttribute(`data-xutime`)}000`))).toJSON();
		// console.log(`review sp childNodes: `, sp.childNodes);
		this.chap = sp.innerText.match(/chapter\s\d+/i)[0];
	}
}
// const fee = new Array(); // 
const fics = document.querySelectorAll(`div.z-list`);
console.log(fics);
var j = 0;
// for (var i = 0; i < fics.length; i++) {
for (var i = 26; i < 27; i++) {

	const f = new fic(fics[i]);
	// fics.total.push(f);
	fic.total[i] = f; // it's done this way bc during testing i didn't want to just start from 0 bc the first few fics on my list didn't rlly have multiple pages of reviews

	let prevPgs = 1; // have to delay things Correctly by offsetting j by how many reviews the Previous fic had, not how many This fic had
	try {
		var prev = fic.total[i - 1];
		prevPgs = Math.ceil(prev.numReviews / 16);
	} catch (e) {
		console.warn(`first fic working with yay`);
	}
	// console.log(`prev fic had ${prevPgs} pages of reviews.`);
	j += prevPgs; // now also factor in the time making requests for each page of reviews
	const juke = j * 1000;
	setTimeout(() => {
		// console.log(f);
		// console.log(`"${f.title}" should have ${revPgs} pages of reviews.`);
		getFic(f);
		f.getReviews();
		setTimeout(() => {
			const str = JSON.stringify(f);
			// console.log(`stringified ${f.title} (${f.reviews.length} reviews): `, JSON.stringify(f));
			fic.download(str, f.title, "application/json");
		}, juke + 5000);
	}, juke);
	j++; // increment this donotforget

}

async function getPage(prefix, id, suffix = "") {
	// prefix is the url up to the id, suffix is anything after
	console.log(`now fetching ${prefix}${id}${suffix}`);
	const req = await fetch(new Request(`${prefix}${id}${suffix}`));
	if (req.ok) {
		// return req.text();
		const txt = await req.text();
		const tmpDiv = document.createElement(`div`);
		tmpDiv.innerHTML = txt;
		return tmpDiv;
	} else {
		throw new Error(`page fetch failed:`, req);
	}
}

function getFic(ficObj) {
	console.log(`ficObj: `, ficObj);
	getPage(`/story/story_backup.php?storyid=`, ficObj.id).then((txt) => {
		// and now we do stuff to the text
		// console.log(txt);
		ficObj.contents = txt;
		ficObj.save();
	})
}

function getReviews(ficObj, pgNum) {
	// console.log(`getting reviews???`);
	getPage(`/r/`, ficObj.id, `/0/${pgNum}/`).then((txt) => {
		// again we do stuff to the text
		console.log(passedStr);
		console.log(txt);
		const tds = txt.querySelectorAll(`#gui_table1 tbody td`);
		for (const td of tds) {
			const r = new review(td);
			ficObj.reviews.push(r);
			// console.log(r);
		}
		// const tmpDiv = document.create
	});
}

// TODO: stats exporter too
// thing for getting the script element on the stats page w/the relevant xml data for daily stats: document.querySelector(`#chart1div + script`).innerText.match(/chart1\.setDataXML\(.*\)/)[0]; 
// and then the xml data for the stats by country n whatever is the same thing except that the id is #chart2div. easy peasy heh