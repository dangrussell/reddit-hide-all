// ==UserScript==
// @name Reddit Hide All
// @namespace https://github.com/dangrussell/reddit-hide-all
// @description Adds a button next to the logo to Hide All
// @include https://*.reddit.com/*
// @version 7.1.2
// @author Douglas Beck <reddit@douglasbeck.com> (https://douglasbeck.com/)
// @copyright 2010, Douglas Beck (https://douglasbeck.com/)
// @grant GM_addStyle
// @homepageURL https://github.com/dangrussell/reddit-hide-all
// @updateURL https://raw.githubusercontent.com/dangrussell/reddit-hide-all/master/reddit-hide-all.js
// @downloadURL https://raw.githubusercontent.com/dangrussell/reddit-hide-all/master/reddit-hide-all.js
// @contributor Dan Russell (https://github.com/dangrussell/)
// ==/UserScript==

/* eslint-env jquery */

/**
* @typedef {object} RedditHideParameters
* @property {string} id Id
* @property {string} executed 'hidden'
* @property {string} uh Mod Hash
* @property {string} renderstyle 'html'
*/

(() => {
	// grab tabmenu at top of page
	const tabmenu = document.querySelector('#header-bottom-left > ul');

	if (tabmenu === null) {
		return;
	}

	let modhash = '';

	/**
	 * @param {string} url The first number.
	 * @return {Promise<any>}
	 */
	async function getData(url) {
		const response = await fetch(url);
		return response.json();
	}
	getData('/api/me.json').then(
		(data) => {
			modhash = data.data.modhash;
		},
	);

	const id = 'reddit-hide-all';

	// create link with hide functionality
	const link = document.createElement('a');
	link.setAttribute('href', '#');
	link.setAttribute('id', id);
	link.innerHTML = 'hide all';

	link.addEventListener('click', (event) => {
		const rha = document.getElementById(id);

		// ajax loading loadingIndicator
		const loadingIndicator = {
			lock: 0,
			remove: () => {
				--loadingIndicator.lock;
				if (loadingIndicator.lock === 0) {
					rha.style.backgroundImage = 'none';
					rha.style.backgroundRepeat = 'repeat';
					rha.style.backgroundPosition = 'top left';
				}
			},
			add: () => {
				// created ajax loading indicator with http://www.ajaxload.info/ transparent background and #FF4500 (orangered)
				// created data uri with https://dopiaza.org/tools/datauri/index.php
				rha.style.backgroundImage = 'url("data:image/gif;base64,R0lGODlhEAALAPQAAP////9FAP7j2v7c0P7v6v5JBv9FAP5mLv6jgv6KYP7Muv5dIv56Sv6piv6NZP7Pvv5gJv5HBP59Tv7s5v7i2P729P5tOP7l3P718v7Jtv65oP7Yyv7y7gAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCwAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7AAAAAAAAAAAA")';
				rha.style.backgroundRepeat = 'no-repeat';
				rha.style.backgroundPosition = 'center';
			},
		};

		// requests are now rate-limited in the default js, so I had to write my own function to process the requests.
		// I actually like it better because it hides the link *after* the request is sent/completed, not before.
		// I DON'T like how many ajax request this makes so I've submitted a feature request:
		// http://code.reddit.com/ticket/576
		$.fn.extend({
			/**
			 * @param {RedditHideParameters} parameters Parameters
			 * @param {HTMLAnchorElement} link HTML Anchor Element
			 * @return {number}
			 */
			redditHide: (parameters, link) => {
				const op = '/api/hide';
				parameters.uh = modhash;
				$.post(op, parameters, () => {
					// eslint-disable-next-line no-undef
					hide_thing($(link).parents('form'));
					loadingIndicator.remove();
				}, null);
				return ++loadingIndicator.lock;
			},
		});

		// grab & hide all
		const links = document.getElementsByTagName('a');
		let count = 0;

		for (let i = 0; i < links.length; i++) {
			if (links[i].innerHTML === 'hide' && $(links[i]).thing().css('display') === 'block') {
				// add loadingIndicator background image
				loadingIndicator.add();

				// looking at: https://github.com/reddit-archive/reddit/blob/master/r2/r2/public/static/js/jquery.reddit.js?rev=77e51a304d1b4034614d75c5bf4c07b216400a42#L141
				const form = $(links[i]).parents('form');
				const id = $(links[i]).thing_id();

				// eslint-disable-next-line no-undef
				const parameters = get_form_fields(form, { id: id });

				$().redditHide(parameters, links[i]);

				++count;
			}
		}

		if (count === 0) {
			alert('None found.');
		}

		// stop default click action
		event.stopPropagation();
		event.preventDefault();
	}, true);

	// create new tabmenu item with link
	const item = document.createElement('li');
	item.appendChild(link);

	// insert at top of the tabmenu
	// const topItem = tabmenu.getElementsByTagName('li')[0];
	const topItem = document.querySelector('#header-bottom-left > ul > li:first-of-type');
	tabmenu.insertBefore(item, topItem);
})();

/*
Another updated version: https://openuserjs.org/scripts/LdizL/Reddit_Hide_All/source
*/
