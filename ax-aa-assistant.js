// changes all the stupid instagram and twt links to smth i can actually See n access

function ough() {
	console.log(document.querySelectorAll(`.group .event .title a`));
	for (const a of document.querySelectorAll(`.group .event .title a`)) {
		let r = new URL(a.href);
		if (r.host == "www.anime-expo.org") {
			//  console.log(`aiya they forgot the https://; ${r.pathname}`);
			// and then we have to snip just that shit out
			r = `https://${r.pathname.replace(/\/ax-2025-aa-list\//g, "")}`;
		}
		try {
			let href = new URL(r); // do this again for the thing
			const h = href.hostname.match(/(instagram|x\.com|twitter)/);
			if (h) {
				// bc there might not be a match
				if (h[0] == "instagram") {
					// if it's instagram, replace r with pixwox.com/profile${pathname}
					let user = href.pathname; // clean that profilecard shit off
					if (user.match(/profilecard.*/)) {
						user = user.replace(/\/profilecard.*/, "");
					}
					try {
						r = `https://www.pixnoy.com/profile${user}`;
					} catch (e) {
						// um. figure smth else out here.
						console.warn(`umm. need to figure out smth else for `, r);
					}
				} else if (h[0] == "x.com" || h[0] == "twitter") {
					// replace with nitter
					try {
						r = r.href.replaceAll(/(x|twitter)\.com/g, "nitter.net");
					} catch (e) {
						r = r.replaceAll(/(x|twitter)\.com/g, "nitter.net");
					}
				}
			}
			if (typeof (r) == "string") {
				a.href = r; // set this; otherwise, just leave it untouched
			}
		} catch (e) {
			console.warn(`okay well. we have a weirdo on our hands: `, r);
		}
	}
}

ough();