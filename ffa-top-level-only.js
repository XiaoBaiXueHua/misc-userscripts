// ==UserScript==
// @name         FFA Top Level Only
// @namespace    https://sincerelyandyourstruly.neocities.org
// @version      1.0
// @description  defaults ffa comment pages to being top-level only
// @author       小白雪花
// @match        https://fail-fandomanon.dreamwidth.org/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dreamwidth.org
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/ffa-top-level-only.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/ffa-top-level-only.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

// sorry for exposing myself as someone whom'st browses ffa u___u

// later, make it so that on the index page the comment urls all automatically lead to the top-level versions but for now i am lazy
(function () {
	// version that redirects from current location
	/*const url = new URL(window.location);
	console.log(url);
	const query = url.search;
	console.log(query);
	if (url.pathname) { // first make sure we're not just at the index page
	  if (query.search("view=top-only") < 0 && query.search("thread") < 0) { // now if we're not already in top-level view (or viewing a specific thread), do the thing
	  window.location = `https://fail-fandomanon.dreamwidth.org${url.pathname}?view=top-only#comments`;
	}
	}*/
	// version that turns all the comment links into top-level only
	const commentLinks = document.querySelectorAll(".entry-readlink a");
	for (const a of commentLinks) {
		const oldLink = new URL(a.href)
		//console.log(oldLink);
		const newLink = `${oldLink.origin}${oldLink.pathname}?view=top-only#comments`;
		a.href = newLink;
	}
})();