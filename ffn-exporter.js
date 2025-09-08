// ==UserScript==
// @name		ffn exporter
// @namespace	https://sincerelyandyourstruly.neocities.org
// @version		1.0
// @description	y'know, like, nya~ >:3c
// @author		export all the ffn fics at once and their reviews
// @match		https://www.fanfiction.net/story/story_tab_list.php
// @icon		https://www.google.com/s2/favicons?sz=64&domain=fanfiction.net
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/ffn-exporter.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/ffn-exporter.js
// @grant		none
// ==/UserScript==


// backup link example: https://www.fanfiction.net/story/story_backup.php?storyid=12853790

const interval = 1000; // ms btwn requests
// var inclStats = true;
const fics = document.querySelectorAll(`div.z-list`);

var j = 0; // counter for the delays

class UI {
	constructor() {
		this.init(); // initialize obvs
	}
	// function for making a user interface
	init() {
		const statsButton = dom.pp(["Include Stats: ", dom.pp("", "input", null, { type: "checkbox", id: "inclStats", checked: true })], "label", null, { for: "inclStats", id: "inclStats-label" });
		const rangeButton = dom.pp(["Download Range: ", dom.pp("", "input", null, { type: "checkbox", id: "rangeButton" })], "label", null, { for: "rangeButton", id: "rangeButton-label" });
		// if (all) --> include overall stats as well?
		// and then probably also a button that gives the option to also save the chapter publishing dates
		const pDateButton = dom.pp(["Save Chapter Publishing Dates: ", dom.pp("", "input", null, { type: "checkbox", id: "inclChDates" })], "label", null, { for: "inclChDates" });

		const selectStart = dom.pp("", "select", null, { id: "startFic" });
		selectStart.value = 0;
		const selectEnd = dom.pp("", "select", null, { id: "endFic" });
		const selectSolo = dom.pp("", "select", null, { id: "soloFic" });
		for (var i = 0; i < fics.length; i++) {
			fic.total.push(new fic(fics[i])); // initialize the array of fics
			const f = fic.total[i];
			selectStart.appendChild(dom.pp(f.title, "option", null, { value: i }));
			selectEnd.appendChild(dom.pp(f.title, "option", null, { value: i }));
			selectSolo.appendChild(dom.pp(f.title, "option", null, { value: i }));
			// selectEnd.value = i; // make the end value the last fic
			console.log(f);
		}
		selectEnd.value = fic.total.length - 1;
		const summary = dom.pp(`Batch Exporter Options`, "summary");
		const details = dom.pp([summary, statsButton, pDateButton, rangeButton, dom.pp([dom.pp("Start: ", "b"), selectStart], "div"), dom.pp([dom.pp("End: ", "b"), selectEnd], "div"), dom.pp([dom.pp("Title: ", "b"), selectSolo], "div")], "details", null, { open: true }); // puts the selections into their own divs; is also open by default

		const expyButton = dom.pp("Export Backups", "button", null, { id: "expy" });
		expyButton.addEventListener("click", UI.execute);

		// and then also probably a csv
		const csv = dom.pp("Export Legacy Story Stats as CSV", "button", null, { id: "legacyExport" });
		csv.addEventListener("click", async () => {
			// const a = new Array();
			getPage("/stats/story.php", "").then((txt) => {
				const table = txt.querySelectorAll(`#gui_table1 tr`);
				var b = "";
				for (const tr of table) {
					const tds = tr.querySelectorAll(`td, th`);
					for (const td of tds) {
						b += `${td.innerText.trim().replaceAll(/,/g, "")},`; // uhhh we'll figure out how to sanitize out commas later
					}
					b += `\n`; // newline
				}
				console.log(b);
				// return a;
				fic.download(b, `Legacy Story Stats ${(new Date()).toJSON()}.csv`, "text/csv")
			})
		});
		// const debugsie = dom.pp("ugh debugging :/", "button");
		debugsie.addEventListener(`click`, () => {
			console.log(`stats: ${UI.stats}, chDates: ${UI.chDates}, range: ${UI.range}, rangeVals: ${UI.rangeVals}, soloVal: ${UI.soloVal}`);
		})

		document.querySelector(`td[valign="top"]:has(#story-list) hr`).insertAdjacentElement("beforebegin", dom.pp([details, expyButton, csv], "div")); // appends the options to the thing
	}
	static get stats() {
		// bool
		return document.querySelector(`#inclStats`).checked;
	}
	static get chDates() {
		return document.querySelector(`#inclChDates`).checked;
	}
	static get range() {
		// bool
		return document.querySelector(`#rangeButton`).checked;
	}
	static get rangeVals() {
		// parse as integers and sort low -> high
		// console.log(`startFic.value: ${document.querySelector(`#startFic`).value}; endFic.value: `);
		const start = parseInt(document.querySelector(`#startFic`).value), end = parseInt(document.querySelector(`#endFic`).value);
		return [((start < end) ? start : end), ((start < end) ? end : start)];
	}
	static get soloVal() {
		// returns an integer
		return parseInt(document.querySelector(`#soloFic`).value);
	}

	static execute() {
		j = 0; // reset this
		console.log(fics);
		if (UI.range) {
			// so if we're going for a range
			const r = UI.rangeVals;
			// console.log(r);
			for (var i = r[0]; i <= r[1]; i++) {
				savey(i);
			}
		} else {
			// otherwise, just do the single one
			savey(UI.soloVal);
		}
	}
}

class dom { // yeah sorry i can't make a ui without my homebrew react.js or whatever anymore.

	static pee(stray, parent, childParams) { // 'stray' as in 'string-or-array' though it takes elements too
		switch (typeof (stray)) {
			case "string": {
				parent.innerHTML += stray; // because we sometimes work with arrays of mixed strings and elements, must use +=
				break;
			};
			case "object": {
				try {
					parent.appendChild(stray); // try just appending it first
				} catch (e) {
					try { // otherwise, it's probably an array
						for (var it of stray) {
							try {
								if (typeof (it) == "string") {
									// parent.nodeName
									if (childParams) {
										it = dom.pChildren(it, (childParams.type ? childParams.type : parent.nodeName), childParams.klass, childParams.attr, childParams.childParams); // these should, hypothetically, turn the item into an element so that pee can append them correctly
									}
								}
								dom.pee(it, parent, childParams);
							} catch (e) {
								console.error("haha too much recursion i bet. man\n", e);
							}
						}
					} catch (e2) {
						console.error(`error 1:\n`, e, `error 2: \n`, e2);
					}
				}
				break;
			}
		}
	}

	//turns a string into an element
	static pp(str, type = "p", klass = "", attr = {}) {
		return dom.pChildren(str, type, klass, attr, false);
	}

	static pChildren(str, type = "span", klass = "", attr = {}, childParams = {}) { // the same as pp but this time we can have children of a different type. and also gives us spans by default
		const el = document.createElement(type);
		dom.pee(str, el, childParams);
		if (klass) { el.className = klass; }
		if (attr) {
			for (const [key, value] of Object.entries(attr)) {
				el.setAttribute(key, value);
			}
		}
		return el; //returns an html element
	}

	static parry(stray, type = "p", klass = "", attr = {}) { // turns arrays of strings into arrays of the same element
		const arr = new Array();
		for (const s of stray) {
			try {
				const el = document.createElement(type);
				el.innerHTML = s;
				if (klass) el.className = klass;
				if (attr) {
					for (const [key, value] of Object.entries(attr)) {
						el.setAttribute(key, value);
					}
				}
				arr.push(el);
			} catch (e) {
				console.error("hey man parry's only for turning arrays of strings into arrays of the same element. you can't do... whatever it is you're doing.");
			}
		}
		return arr;
	}
	//appends arrays of ELEMENTS to a parent
	static appendix(array, par) {
		for (const el of array) {
			try {
				par.appendChild(el);
			} catch (e) {
				if (typeof (el) == "object") {
					dom.appendix(el, par);
				} else if (typeof (el) == "string") {
					par.innerHTML += el;
				} else {
					console.error("yeah. something happened with the appendix. idk look at the error:\n", e);
				}
			}
		}
	}
}

// to-do: figure out how to get the chapter release dates w/o doing more page fetches than currently necessary
// current thought process: maybe use a setInterval() function which goes through arrays (indexed by static variables) of info or smth. have it check whether we're done running or w/e so that can use an if/else clause to control whether a page request gets sent bc i still can't figure out how to cut off a setTimeout() or setInterval() from w/in the timeout... maybe have an array of timeout functions, and then when all the chapter dates are found, we cut off the remaining ones in the array?
class stats {
	constructor(month, year, id, found) {
		this.month = month;
		this.year = year;
		this.data = new Array(); // 
		getPage(`/stats/story_eyes_story.php?storyid=`, id, `&month=${month}&year=${year}`).then((page) => {
			// console.log(page.querySelector(`#chart1div + script`).innerText.match(/<.*>/)[0].replaceAll(/\\/g, ""));
			if (UI.stats) {
				const xmlStr = page.querySelector(`#chart1div + script`).innerText.match(/<.*>/)[0].replaceAll(/\\/g, ""); // get the xml string with the relevant data

				const xml = (new DOMParser()).parseFromString(xmlStr, "text/xml");

				const categories = xml.firstElementChild.children[0].childNodes, views = xml.firstElementChild.children[1].childNodes, visitors = xml.firstElementChild.children[2].childNodes;


				for (var i = 0; i < categories.length; i++) {
					// this.data.push([categories[i].getAttribute(`label`), views[i].getAttribute(`value`), visitors[i].getAttribute(`value`)]);
					this.data.push({ category: categories[i].getAttribute(`label`), views: views[i].getAttribute(`value`), visitors: visitors[i].getAttribute(`value`) });


					// console.log(`category: `, categories[i].getAttribute(`label`), `\tviews: `, views[i].getAttribute(`value`), `\tvisitors: `, visitors[i].getAttribute(`value`));
				}
			}

			if (UI.chDates) {
				// get the table rows based on like. a something.
				console.log(`number of release dates found: ${found}`);
				const remnants = page.querySelectorAll(`#gui_table2 tr:nth-child(n + ${1 + found})`);
				for (const r of remnants) {
					const tds = r.querySelectorAll(`td`);
					const v = parseInt(tds[4].innerText); // visitors
					console.log(`${tds[1].innerText.trim()} had ${v} visitors`);
					if (v > 0) {
						// this.publishedInPeriod++;
						this.releaseDates.push("hi");
					} else {
						break; // probably shouldn't be having 0 unless it's not yet published
					}
				}
			}
		})
	}

	releaseDates = new Array(); // only make this if the setting is on
	// publishedInPeriod = 0;
	get publishedInPeriod() {
		return this.releaseDates.length;
	}
	get statBlock() {
		return { month: this.month, year: this.year, data: this.data };
	}

}

class fic {
	constructor(el) {
		// default constructor
		// console.log(el);
		const link = el.querySelector(`a`);
		this.id = parseInt(link.id.match(/\d+/)[0]);
		this.href = `https://www.fanfiction.net/s/${this.id}/`;
		this.title = link.innerText.trim();
		console.log(`title: ${this.title}`);
		this.summary = el.querySelector(`.l-summary`).innerText.trim();
		// console.log(el.querySelector(`.l-padtop2`).children);
		// console.log(this.summary);
		this.pairChars = function () {
			let str = "";
			try {
				// console.log(el.querySelector(`.z-padtop2`).childNodes);
				const chs = el.querySelector(`.z-padtop2`).childNodes.length; // odd numbers will be complete bc they have that " - complete" tacked on at the end
				const nodeNum = chs - ((chs % 2) + 1);

				str = el.querySelector(`.z-padtop2`).childNodes[nodeNum].wholeText;
				str = str.replaceAll(/\s-\s/g, "");
			} catch (e) {
				console.error(`${link.innerText.trim()} has no characters or whatever.`);
			}
			// console.log(`str: "${str}"`);
			return str;
		}();
		this.chapters = parseInt(el.querySelector(`.l-chapters`).innerText);
		this.numReviews = function () { // need this to help determine what index the pairings/characters are in the text node fragments
			let num = 0;
			try {
				num = parseInt(el.querySelector(`span.l-reviews`).innerText);
			} catch (e) {
				console.info(`${link.innerText.trim()} has no reviews.`);
			}
			return num;
		}();
		this.published = this.dateString(el.querySelector(`span.l-pdate`).innerText.trim());
		this.updated = this.dateString(el.querySelector(`span.l-udate`).innerText.trim()); // helps give an idea of when to stop checking for things
		this.chReleaseDates.push(`${this.published.month}/${this.published.day}/${this.published.year}`); // hard-coded to be mm/dd/yyyy 
		this.pgs = Math.ceil(this.numReviews / 16);
	}
	static total = new Array(); // static counter
	stats = new Array(); // will hold a bunch of stat objects
	reviews = new Array();
	chReleaseDates = new Array(); // holds them as strings
	releaseDatesFound = 1; // start with 1 bc publishing date ofc
	contents = "";

	dateString(str) {
		const d = str.match(/(\d+)\/(\d+)\/(\d+)/); // token 0, m 1, d 2, y 3
		const month = parseInt(d[1]), year = parseInt(d[3]);
		const monthsSince = function () {
			const dt = new Date();
			const monthDiff = (dt.getMonth() + 1) - month;
			const years = dt.getFullYear() - year;
			// console.log(`full current year: ${dt.getFullYear()}; this fic was published ${years} years ago, which was ${years * 12 + monthDiff} months ago`);
			return years * 12 + monthDiff;
		}();
		return { month: month, day: parseInt(d[2]), year: year, monthsSince: monthsSince };
	}

	getReviews() {
		const id = this.id, revs = this.reviews;
		if (this.pgs > 0) { // make sure it only runs if there are actual 
			for (var i = 0; i < this.pgs; i++) {
				const nya = i;
				setTimeout(() => {
					console.log(`fetching "${this.title}" reviews page: ${i}`);
					getPage(`/r/`, id, `/0/${nya + 1}/`).then((txt) => {
						// again we do stuff to the text
						// console.log(txt);
						const tds = txt.querySelectorAll(`#gui_table1 tbody td`);
						for (const td of tds) {
							const r = new review(td);
							revs.push(r);
							// console.log(r);
						}
						// const tmpDiv = document.create
					});
				}, nya * 1000);
			}
		}

	}

	getStats() { // this will also be used to figure out the publishing date of chapters, so later there will be if/else statements in here
		const pub = this.published;
		var m = pub.month - 1, y = pub.year;
		for (var i = 0; i <= pub.monthsSince; i++) {
			// uhh and now we have to. figure out
			// console.log(`i: ${i}\tmonth: ${m % 12 + 1}\tyear:${y}`);
			const pm = m % 12 + 1, py = y, int = (i * interval * 2) + (this.pgs * interval); // also account for the stats fetching
			// function twee() {
			setTimeout(() => {
				console.log(`fetching "${this.title}" stats/dates for ${pm}/${py}`);
				const s = new stats(pm, py, this.id, this.releaseDatesFound);
				// if (UI.stats) {
				this.stats.push(s.statBlock);
				// }

			}, int);
			// increment the month and year
			m++;
			if (m % 12 == 0) {
				y++;
			}
		}
	}

	getChDates() {
		// yeah let's just. make this its own function tbh.
		var k= 0; // wherein k is the number of chapters available if also doing by-chapter fetches as well
		// by-chapter fetches should probably be performed After everything else
		// but anyway, chapter dates alone should be relatively easy since you only have to search btwn the designated time periods of "published" and "updated"
		if (UI.chDates && this.chapters > 1) {
			console.log(`chReleaseDates: ${this.chReleaseDates.length}; releaseDatesFound: ${this.releaseDatesFound}; chapters: ${this.chapters}`);
			if ((this.releaseDatesFound == this.chapters) && !UI.stats) {
				// only do this if we've got all the chapters n don't want the stats
				console.log(`hi we have found the exit point`);
				clearTimeout(this);
			} else {
				setTimeout(() => {
					console.log(s.publishedInPeriod);
					this.releaseDatesFound += s.publishedInPeriod;
				}, 500); // give it a half second to process it
			}

			// then we do some stuffs. might involve yet more page fetches
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

// separate function for Just Saving outside a loop so that individual fics can be picked n saved
function savey(index) {
	// const c = await csv;
	// console.log(csv);

	// get rid of this, since the ui will automatically populate the static array
	// const f = new fic(fics[index]);
	const f = fic.total[index];
	// console.log(f);
	// fics.total.push(f);

	// fic.total[index] = f; // it's done this way bc during testing i didn't want to just start from 0 bc the first few fics on my list didn't rlly have multiple pages of reviews

	let prevPgs = 0; // have to delay things Correctly by offsetting j by how many reviews the Previous fic had, not how many This fic had
	try {
		var prev = fic.total[index - 1];
		prevPgs = prev.pgs;
	} catch (e) {
		console.info(`first fic to be worked with yay`);
	}

	const juke = j * interval; // first we set the timeout for the function as a whole
	const p = prevPgs, statsAddition = ((f.published.monthsSince + 1) * 2); // will have to figure out how to account for Only looking for ch publishing dates 
	j += prevPgs; // then we add all the stuff to j to calculate the timeout
	if (UI.stats) {
		j += statsAddition;
	}
	const joint = (j + 5) * interval; // then we need smth to know when our download should happen

	console.log(`${f.title} should take about ${joint / 1000}s to send all requests.`);
	// and now we need to also take into consideration all the time it takes to fetch all the stats


	setTimeout(() => {
		// console.log(`"${f.title}" should have ${revPgs} pages of reviews.`);
		getFic(f);
		f.getReviews();
		if (UI.stats) {
			f.getStats(); // save if the option is selected
		}
		if (UI.chDates) {
			f.getChDates();
		}
		setTimeout(() => {
			const str = JSON.stringify(f);
			// console.log(`stringified ${f.title} (${f.reviews.length} reviews): `, JSON.stringify(f));
			fic.download(str, f.title, "application/json");
			console.log(f);
		}, (5 + p + ((UI.stats || UI.chDates) ? statsAddition : 0)) * interval); // download the json w/reviews n stats 5s later
	}, juke);

	j++; // increment this donotforget
}

function main() { // this would save all of them at once
	console.log(fics);
	for (var i = 0; i < fics.length; i++) {
		// for (var i = 20; i < 26; i++) {
		savey(i);
	}

	console.log(`there should ultimately be ${j / 60} minutes of waiting for everything to finish.`)
	return 0; // just a joke lol
}

async function getPage(prefix, id, suffix = "") {
	// prefix is the url up to the id, suffix is anything after
	// console.log(`now fetching ${prefix}${id}${suffix}`);
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
	// console.log(`ficObj: `, ficObj);
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

// UI();
new UI;

