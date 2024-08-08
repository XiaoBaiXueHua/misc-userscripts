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
const move = document.querySelector(".fandom-community-header__top-container div.wiki-tools.wds-button-group");
console.log(move);
document.querySelector("ul.wds-tabs").appendChild(move); // moves the search bar group elsewhere
