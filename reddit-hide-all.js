// ==UserScript==
// @name Reddit Hide All
// @namespace https://github.com/dangrussell/reddit-hide-all
// @description Adds a button next to the logo to Hide All
// @include https://*.reddit.com/*
// @version 6.0.0
// @author Douglas Beck <reddit@douglasbeck.com> (https://douglasbeck.com/)
// @copyright 2010, Douglas Beck (https://douglasbeck.com/)
// @grant GM_addStyle
// @homepageURL https://github.com/dangrussell/reddit-hide-all
// @updateURL https://raw.githubusercontent.com/dangrussell/reddit-hide-all/master/reddit-hide-all.js
// @downloadURL https://raw.githubusercontent.com/dangrussell/reddit-hide-all/master/reddit-hide-all.js
// @contributor Dan Russell (https://github.com/dangrussell/)
// ==/UserScript==

const codeString = '(' + function() {
	// helper funciton
	function xpath(p, context) {
		if (!context) {
			context = document;
		}
		// let i;
		const arr = [];
		const xpr = document.evaluate(p, context, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		for (const i = 0; item = xpr.snapshotItem(i); i++) {
			arr.push(item);
		}
		return arr;
	}

	// grab list at top of page
	const list = xpath('//div[@id="header-bottom-left"]/ul')[0];
	if (typeof list == 'undefined' || !list) {
		return;
	}

	// create link with hide functionality
	const link = document.createElement('a');
	link.setAttribute('href', '#');
	link.setAttribute('id', 'reddit-hide-all');
	link.innerHTML = 'hide all';
	link.addEventListener('click', function(event) {
		// ajax loading spinner
		const spinner = {
			lock: 0,
			remove: function() {
				--spinner.lock;
				if (spinner.lock == 0) {
					$('#reddit-hide-all').css('background', '#EFF7FF');
				}
			},
			add: function() {
				// created ajax spinner with http://www.ajaxload.info/ #EFF7FF and #FF4500 (orangered)
				// created data uri with http://www.sveinbjorn.org/dataurlmaker
				$('#reddit-hide-all').css('background', 'url("data:image/gif;base64,R0lGODlhEAAQAPIAAO/3//9FAPLMwv'+
				'pzQv9FAPiJYvafgvWqkiH+GkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAAKAAAAIf8LTkVUU0NBUEUyLjADAQAAACw'+
				'AAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQACgABACwA'+
				'AAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkEAAoAAgAsA'+
				'AAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkEAAoAAw'+
				'AsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkEAAoABAA'+
				'sAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQACgAFACwA'+
				'AAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQACgAGACwAA'+
				'AAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAAKAAcALAAAAA'+
				'AQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==") '+
				'#EFF7FF no-repeat center');
			},
		};

		// requests are now rate-limited in the default js, so I had to write my own function to process the requests.
		// I actually like it better because it hides the link *after* the request is sent/completed, not before.
		// I DON'T like how many ajax request this makes so I've submitted a feature request:
		// http://code.reddit.com/ticket/576
		$.fn.extend({
			redditHide: function(op, parameters, link) {
				$.post(op, parameters, function() {
					hide_thing($(link).parents('form'));
					spinner.remove();
				}, null);
				return ++spinner.lock;
			},
		});

		// grab & hide all
		const links = document.getElementsByTagName('a');
		const count = 0;

		for (const i=0; i<links.length; i++) {
			if (links[i].innerHTML === 'hide' && $(links[i]).thing().css('display') === 'block') {
				// add spinner background image
				spinner.add();

				// using just the onclick no longer works :(
				// change_state(links[i], 'hide', hide_thing);

				// looking at: http://code.reddit.com/browser/r2/r2/public/static/js/jquery.reddit.js?rev=77e51a304d1b4034614d75c5bf4c07b216400a42#L141
				const form = $(links[i]).parents('form');
				const id = $(links[i]).thing_id();
				const op = '/api/hide';
				const parameters = get_form_fields(form, {id: id});
				if (reddit.logged) {
					parameters.uh = reddit.modhash;
				}

				$().redditHide(op, parameters, links[i]);

				++count;
			}
		}

		if (count===0) {
			alert('None Found.');
		}

		// stop default click action
		event.stopPropagation();
		event.preventDefault();
	}, true);

	// create new list item with link
	const item = document.createElement('li');
	item.appendChild(link);

	// insert at top of the list
	const topItem = list.getElementsByTagName('li')[0];
	list.insertBefore(item, topItem);
} + ')()';

// workaround for Google Chrome
// I realize this is NOT the nice way to do such things but from what I
// read there's no other way to access Reddit's native JS code
// (maybe one day 'hiding' will be added to the API)
const script = document.createElement('script');
script.type = 'text/javascript';
script.appendChild( document.createTextNode( codeString ) );
document.body.appendChild(script);

/*
Another updated version: https://openuserjs.org/scripts/LdizL/Reddit_Hide_All/source
*/
