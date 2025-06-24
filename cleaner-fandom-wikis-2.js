// ==UserScript==
// @name         cleaner fandom wikis part 2
// @namespace    https://sincerelyandyourstruly.neocities.org
// @version      1.1
// @description  remove tracking stuff from fandom wikis & also styling that happens at the End stage
// @author       白雪花
// @match http://fandom.com/*
// @match https://fandom.com/*
// @match http://*.fandom.com/*
// @match https://*.fandom.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/cleaner-fandom-wikis-2.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/cleaner-fandom-wikis-2.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

// goes with the stylesheet i made in stylus: https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/cleaner-fandom-wikis-1.css, which was in turn based off a different cleaner fandom wikis script
// var moved = false;
const interval = setInterval(() => {
	// if (!moved) {
	let move = document.querySelector(`.search-container:has(input)`);
	try {
		// var move = document.querySelector(`.search-app__input.search-app__input--focused`);
		// const move = document.querySelector(`.search-container`);
		console.log(`move: `, move);
		document.querySelector("ul.wds-tabs").appendChild(move); // moves the search bar group elsewhere
		// moved = true;
		document.querySelector(`#global-top-navigation`).setAttribute(`style`, `display: none!important;`); // hide it this way or else i think it can't find the search bar to move it around
	} catch (e) {
		if (!move) {
			console.warn(e);
		} else {
			console.error(e);
		}

	}
	// }
}, 1000);
const trackers = document.querySelectorAll("[data-tracking]");
for (const attr of trackers) {
	attr.removeAttribute("data-tracking");
}
function hides(str) {
	const el = document.querySelectorAll(str);
	for (var i of el) {
		i.remove();
	};
};
const hidey = ["script", `iframe:not([src*="youtube"])`, "#mixed-content-footer", "[href$='.js']",
	".wds-global-footer",
	"#WikiaBarWrapper",
	".wds-global-navigation__content-bar-left",
	".global-navigation", "#global-explore-navigation", ".fandom-community-header__image",
	".fandom-sticky-header",
	".gpt-ad",
	".ad-slot-placeholder", ".top-leaderboard", ".is-loading",
	".page__right-rail",
	".search-modal::before",
	`form[class^="SearchInput-module_form__"] .wds-icon`,
	".notifications-placeholder",
	".top-ads-container",
	".instant-suggestion",
	".unified-search__result.marketplace", "#global-register-link", ".global-registration-buttons", "[async]", "[sandbox]"];

for (const e of hidey) {
	hides(e);
}


setTimeout(() => {
	clearInterval(interval);
	// if (!moved) {
	// console.log(`unable to move the search bar in time.`);
	// }
}, 10000); // and if it can't do it in ten seconds, then just cancel it
// const move = document.querySelector(".fandom-community-header__top-container div.wiki-tools.wds-button-group");
// setTimeout(() => {
// 	const move = document.querySelector(`.search-app__input.search-app__input--focused`);
// 	console.log(move);
// 	document.querySelector("ul.wds-tabs").appendChild(move); // moves the search bar group elsewhere
// }, 1500); // wait 1.5s