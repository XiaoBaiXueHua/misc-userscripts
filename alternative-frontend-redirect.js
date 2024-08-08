// ==UserScript==
// @name		Redirect to Alternative Frontends
// @namespace	https://sincerelyandyourstruly.neocities.org
// @version		1.1
// @history		1.1 - added redirects for instagram n tiktok
// @history		1.0 - reddit, imgur, and twt redirects
// @description	Automatically redirect various socmed links to alternative front ends that DON'T make you log into them. Because fuck them, that's why. Including: Reddig to RedLib, Imgur to Rimgo, Twitter to Nitter
// @author		小白雪花
// @match		https://www.reddit.com/**
// @match		https://imgur.com/**
// @match		https://twitter.com/**
// @match		https://x.com/**
// @match		https://www.instagram.com/**
// @match		https://www.tiktok.com/**
// @icon		https://www.google.com/s2/favicons?sz=64&domain=catsarch.com
// @downloadURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/alternative-frontend-redirect.js
// @updateURL	https://raw.githubusercontent.com/XiaoBaiXueHua/misc-userscripts/main/alternative-frontend-redirect.js
// @grant		none
// ==/UserScript==

// collection of alt frontends here: https://github.com/mendel5/alternative-front-ends && https://github.com/digitalblossom/alternative-frontends
(function () {
	var url = window.location;
	const host = url.hostname;
	var newURL = url.toString();//.replace(/www\.reddit/i, "redlib.catsarch");
	// console.log("newURL: ", newURL);
	if (host.search("reddit") >= 0) { // reddit --> redlib
		newURL = newURL.replace(/www\.reddit/i, "redlib.catsarch"); //default replacer
		const reDir = new RegExp(`media\\?url=https(:\/\/|%3A%2F%2F)i\.redd\.it(\/|%2F)`, "i"); //optional check for redir
		//console.log(reDir, newURL);
		if (newURL.match(reDir)) {
			if (newURL.match(/\.(png|jpe?g|webp|gif)/)) {
				newURL = newURL.replace(reDir, "img/");
				//console.log(reDir, newURL);
			} //and then if i encouter more media types later, can add them in here
		}
	} else if (host.search("imgur") >= 0) { // imgur
		newURL = newURL.replace(/w*\.?imgur/i, "rimgo.catsarch");
	} else if (newURL.search(/twitter|x.com/) >= 0) { // twt --> nitter on poast
		newURL = newURL.replace(/(twitter|\bx\b).com/i, "nitter.poast.org");
	} else if (host.search("instagram" >= 0)) { // instagram --> pixwox, now piokok
		// 
		const pathname = url.pathname;
		if (pathname.search(/\/(reel|p)\//) >= 0) {
			// if it's a reel or a regular post, then just do /post/[reel url or whatever]
			newURL = `https://www.piokok.com/post/${pathname.replace(/\reel\//, "")}`; // this will automatically redirect from the keysmash auto-generated url to the piokok
		} else if (url.pathname.toString().search("login") >= 0) {
			// if we're at a login wall
			const s = url.search.toString(); // gets the search thing as a string
			var com = s.substring(s.search(".com") + 7); // cuts off the redir bit to just the start of the username
			com = com.substring(0, com.search("%")); // now cuts off the rest of the junk to just the username
			newURL = `https://www.piokok.com/profile/${com}`;
		} 
		// else {
		// 	newURL = newURL.replace(/instagram.com/i, "piokok.com/profile"); // no clear way to get pixwox url from instagram url when looking at anything other than just a profile so currently else is empty
		// }
	} else if (host.search("tiktok") >= 0) {// tiktok --> proxitok
		newURL = `https://proxitok.pabloferreiro.es${url.pathname}`;
	}

	window.location = new URL(newURL);
})();