'use strict';

/**
 * File js-enabled.js
 *
 * If Javascript is enabled, replace the <body> class "no-js".
 */
document.body.className = document.body.className.replace('no-js', 'js');
'use strict';

/**
 * File modal.js
 *
 * Deal with multiple modals and their media.
 */
window.wdsModal = {};

(function (window, $, app) {

	var $modalToggle;
	var $focusableChildren;

	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			'body': $('body')
		};
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return $('.modal-trigger').length;
	};

	// Combine all events.
	app.bindEvents = function () {
		// Trigger a modal to open.
		app.$c.body.on('click touchstart', '.modal-trigger', app.openModal);

		// Trigger the close button to close the modal.
		app.$c.body.on('click touchstart', '.close', app.closeModal);

		// Allow the user to close the modal by hitting the esc key.
		app.$c.body.on('keydown', app.escKeyClose);

		// Allow the user to close the modal by clicking outside of the modal.
		app.$c.body.on('click touchstart', 'div.modal-open', app.closeModalByClick);

		// Listen to tabs, trap keyboard if we need to
		app.$c.body.on('keydown', app.trapKeyboardMaybe);
	};

	// Open the modal.
	app.openModal = function () {
		// Store the modal toggle element
		$modalToggle = $(this);

		// Figure out which modal we're opening and store the object.
		var $modal = $($(this).data('target'));

		// Display the modal.
		$modal.addClass('modal-open');

		// Add body class.
		app.$c.body.addClass('modal-open');

		// Find the focusable children of the modal.
		// This list may be incomplete, really wish jQuery had the :focusable pseudo like jQuery UI does.
		// For more about :input see: https://api.jquery.com/input-selector/
		$focusableChildren = $modal.find('a, :input, [tabindex]');

		// Ideally, there is always one (the close button), but you never know.
		if ($focusableChildren.length > 0) {
			// Shift focus to the first focusable element.
			$focusableChildren[0].focus();
		}
	};

	// Close the modal.
	app.closeModal = function () {
		// Figure the opened modal we're closing and store the object.
		var $modal = $($('div.modal-open .close').data('target'));

		// Find the iframe in the $modal object.
		var $iframe = $modal.find('iframe');

		// Only do this if there are any iframes.
		if ($iframe.length) {
			// Get the iframe src URL.
			var url = $iframe.attr('src');

			// Removing/Readding the URL will effectively break the YouTube API.
			// So let's not do that when the iframe URL contains the enablejsapi parameter.
			if (!url.includes('enablejsapi=1')) {
				// Remove the source URL, then add it back, so the video can be played again later.
				$iframe.attr('src', '').attr('src', url);
			} else {
				// Use the YouTube API to stop the video.
				player.stopVideo();
			}
		}

		// Finally, hide the modal.
		$modal.removeClass('modal-open');

		// Remove the body class.
		app.$c.body.removeClass('modal-open');

		// Revert focus back to toggle element
		$modalToggle.focus();
	};

	// Close if "esc" key is pressed.
	app.escKeyClose = function (event) {
		if (27 === event.keyCode) {
			app.closeModal();
		}
	};

	// Close if the user clicks outside of the modal
	app.closeModalByClick = function (event) {
		// If the parent container is NOT the modal dialog container, close the modal
		if (!$(event.target).parents('div').hasClass('modal-dialog')) {
			app.closeModal();
		}
	};

	// Trap the keyboard into a modal when one is active.
	app.trapKeyboardMaybe = function (event) {

		// We only need to do stuff when the modal is open and tab is pressed.
		if (9 === event.which && $('.modal-open').length > 0) {
			var $focused = $(':focus');
			var focusIndex = $focusableChildren.index($focused);

			if (0 === focusIndex && event.shiftKey) {
				// If this is the first focusable element, and shift is held when pressing tab, go back to last focusable element.
				$focusableChildren[$focusableChildren.length - 1].focus();
				event.preventDefault();
			} else if (!event.shiftKey && focusIndex === $focusableChildren.length - 1) {
				// If this is the last focusable element, and shift is not held, go back to the first focusable element.
				$focusableChildren[0].focus();
				event.preventDefault();
			}
		}
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsModal);

// Load the yt iframe api js file from youtube.
// NOTE THE IFRAME URL MUST HAVE 'enablejsapi=1' appended to it.
// example: src="http://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1"
// It also _must_ have an ID attribute.
var tag = document.createElement('script');
tag.id = 'iframe-yt';
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This var and function have to be available globally due to yt js iframe api.
var player;
function onYouTubeIframeAPIReady() {
	var modal = jQuery('div.modal');
	var iframeid = modal.find('iframe').attr('id');

	player = new YT.Player(iframeid, {
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) {}

function onPlayerStateChange(event) {
	// Set focus to the first focusable element inside of the modal the player is in.
	jQuery(event.target.a).parents('.modal').find('a, :input, [tabindex]').first().focus();
}
'use strict';

/**
 * File search.js
 *
 * Deal with the search form.
 */
window.wdsSearch = {};

(function (window, $, app) {
	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			'body': $('body')
		};
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return $('.search-field').length;
	};

	// Combine all events.
	app.bindEvents = function () {
		// Remove placeholder text from search field on focus.
		app.$c.body.on('focus', '.search-field', app.removePlaceholderText);

		// Add placeholder text back to search field on blur.
		app.$c.body.on('blur', '.search-field', app.addPlaceholderText);
	};

	// Remove placeholder text from search field.
	app.removePlaceholderText = function () {
		var $search_field = $(this);

		$search_field.data('placeholder', $search_field.attr('placeholder')).attr('placeholder', '');
	};

	// Replace placeholder text from search field.
	app.addPlaceholderText = function () {
		var $search_field = $(this);

		$search_field.attr('placeholder', $search_field.data('placeholder')).data('placeholder', '');
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsSearch);
'use strict';

/**
 * File skip-link-focus-fix.js.
 *
 * Helps with accessibility for keyboard only users.
 *
 * Learn more: https://git.io/vWdr2
 */
(function () {
	var isWebkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1,
	    isOpera = navigator.userAgent.toLowerCase().indexOf('opera') > -1,
	    isIe = navigator.userAgent.toLowerCase().indexOf('msie') > -1;

	if ((isWebkit || isOpera || isIe) && document.getElementById && window.addEventListener) {
		window.addEventListener('hashchange', function () {
			var id = location.hash.substring(1),
			    element;

			if (!/^[A-z0-9_-]+$/.test(id)) {
				return;
			}

			element = document.getElementById(id);

			if (element) {
				if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
					element.tabIndex = -1;
				}

				element.focus();
			}
		}, false);
	}
})();
'use strict';

/**
 * File window-ready.js
 *
 * Add a "ready" class to <body> when window is ready.
 */
window.wdsWindowReady = {};
(function (window, $, app) {
	// Constructor.
	app.init = function () {
		app.cache();
		app.bindEvents();
	};

	// Cache document elements.
	app.cache = function () {
		app.$c = {
			'window': $(window),
			'body': $(document.body)
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.load(app.addBodyClass);
	};

	// Add a class to <body>.
	app.addBodyClass = function () {
		app.$c.body.addClass('ready');
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsWindowReady);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzLWVuYWJsZWQuanMiLCJtb2RhbC5qcyIsInNlYXJjaC5qcyIsInNraXAtbGluay1mb2N1cy1maXguanMiLCJ3aW5kb3ctcmVhZHkuanMiXSwibmFtZXMiOlsiZG9jdW1lbnQiLCJib2R5IiwiY2xhc3NOYW1lIiwicmVwbGFjZSIsIndpbmRvdyIsIndkc01vZGFsIiwiJCIsImFwcCIsIiRtb2RhbFRvZ2dsZSIsIiRmb2N1c2FibGVDaGlsZHJlbiIsImluaXQiLCJjYWNoZSIsIm1lZXRzUmVxdWlyZW1lbnRzIiwiYmluZEV2ZW50cyIsIiRjIiwibGVuZ3RoIiwib24iLCJvcGVuTW9kYWwiLCJjbG9zZU1vZGFsIiwiZXNjS2V5Q2xvc2UiLCJjbG9zZU1vZGFsQnlDbGljayIsInRyYXBLZXlib2FyZE1heWJlIiwiJG1vZGFsIiwiZGF0YSIsImFkZENsYXNzIiwiZmluZCIsImZvY3VzIiwiJGlmcmFtZSIsInVybCIsImF0dHIiLCJpbmNsdWRlcyIsInBsYXllciIsInN0b3BWaWRlbyIsInJlbW92ZUNsYXNzIiwiZXZlbnQiLCJrZXlDb2RlIiwidGFyZ2V0IiwicGFyZW50cyIsImhhc0NsYXNzIiwid2hpY2giLCIkZm9jdXNlZCIsImZvY3VzSW5kZXgiLCJpbmRleCIsInNoaWZ0S2V5IiwicHJldmVudERlZmF1bHQiLCJqUXVlcnkiLCJ0YWciLCJjcmVhdGVFbGVtZW50IiwiaWQiLCJzcmMiLCJmaXJzdFNjcmlwdFRhZyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsIm9uWW91VHViZUlmcmFtZUFQSVJlYWR5IiwibW9kYWwiLCJpZnJhbWVpZCIsIllUIiwiUGxheWVyIiwiZXZlbnRzIiwib25QbGF5ZXJSZWFkeSIsIm9uUGxheWVyU3RhdGVDaGFuZ2UiLCJhIiwiZmlyc3QiLCJ3ZHNTZWFyY2giLCJyZW1vdmVQbGFjZWhvbGRlclRleHQiLCJhZGRQbGFjZWhvbGRlclRleHQiLCIkc2VhcmNoX2ZpZWxkIiwiaXNXZWJraXQiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJ0b0xvd2VyQ2FzZSIsImluZGV4T2YiLCJpc09wZXJhIiwiaXNJZSIsImdldEVsZW1lbnRCeUlkIiwiYWRkRXZlbnRMaXN0ZW5lciIsImxvY2F0aW9uIiwiaGFzaCIsInN1YnN0cmluZyIsImVsZW1lbnQiLCJ0ZXN0IiwidGFnTmFtZSIsInRhYkluZGV4Iiwid2RzV2luZG93UmVhZHkiLCJsb2FkIiwiYWRkQm9keUNsYXNzIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7OztBQUtBQSxTQUFTQyxJQUFULENBQWNDLFNBQWQsR0FBMEJGLFNBQVNDLElBQVQsQ0FBY0MsU0FBZCxDQUF3QkMsT0FBeEIsQ0FBaUMsT0FBakMsRUFBMEMsSUFBMUMsQ0FBMUI7OztBQ0xBOzs7OztBQUtBQyxPQUFPQyxRQUFQLEdBQWtCLEVBQWxCOztBQUVBLENBQUUsVUFBV0QsTUFBWCxFQUFtQkUsQ0FBbkIsRUFBc0JDLEdBQXRCLEVBQTRCOztBQUU3QixLQUFJQyxZQUFKO0FBQ0EsS0FBSUMsa0JBQUo7O0FBRUE7QUFDQUYsS0FBSUcsSUFBSixHQUFXLFlBQVk7QUFDdEJILE1BQUlJLEtBQUo7O0FBRUEsTUFBS0osSUFBSUssaUJBQUosRUFBTCxFQUErQjtBQUM5QkwsT0FBSU0sVUFBSjtBQUNBO0FBQ0QsRUFORDs7QUFRQTtBQUNBTixLQUFJSSxLQUFKLEdBQVksWUFBWTtBQUN2QkosTUFBSU8sRUFBSixHQUFTO0FBQ1IsV0FBUVIsRUFBRyxNQUFIO0FBREEsR0FBVDtBQUdBLEVBSkQ7O0FBTUE7QUFDQUMsS0FBSUssaUJBQUosR0FBd0IsWUFBWTtBQUNuQyxTQUFPTixFQUFHLGdCQUFILEVBQXNCUyxNQUE3QjtBQUNBLEVBRkQ7O0FBSUE7QUFDQVIsS0FBSU0sVUFBSixHQUFpQixZQUFZO0FBQzVCO0FBQ0FOLE1BQUlPLEVBQUosQ0FBT2IsSUFBUCxDQUFZZSxFQUFaLENBQWdCLGtCQUFoQixFQUFvQyxnQkFBcEMsRUFBc0RULElBQUlVLFNBQTFEOztBQUVBO0FBQ0FW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aWxlIjoicHJvamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRmlsZSBqcy1lbmFibGVkLmpzXG4gKlxuICogSWYgSmF2YXNjcmlwdCBpcyBlbmFibGVkLCByZXBsYWNlIHRoZSA8Ym9keT4gY2xhc3MgXCJuby1qc1wiLlxuICovXG5kb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lLnJlcGxhY2UoICduby1qcycsICdqcycgKTtcbiIsIi8qKlxuICogRmlsZSBtb2RhbC5qc1xuICpcbiAqIERlYWwgd2l0aCBtdWx0aXBsZSBtb2RhbHMgYW5kIHRoZWlyIG1lZGlhLlxuICovXG53aW5kb3cud2RzTW9kYWwgPSB7fTtcblxuKCBmdW5jdGlvbiAoIHdpbmRvdywgJCwgYXBwICkge1xuXG5cdHZhciAkbW9kYWxUb2dnbGU7XG5cdHZhciAkZm9jdXNhYmxlQ2hpbGRyZW47XG5cblx0Ly8gQ29uc3RydWN0b3IuXG5cdGFwcC5pbml0ID0gZnVuY3Rpb24gKCkge1xuXHRcdGFwcC5jYWNoZSgpO1xuXG5cdFx0aWYgKCBhcHAubWVldHNSZXF1aXJlbWVudHMoKSApIHtcblx0XHRcdGFwcC5iaW5kRXZlbnRzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIENhY2hlIGFsbCB0aGUgdGhpbmdzLlxuXHRhcHAuY2FjaGUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0YXBwLiRjID0ge1xuXHRcdFx0J2JvZHknOiAkKCAnYm9keScgKVxuXHRcdH07XG5cdH07XG5cblx0Ly8gRG8gd2UgbWVldCB0aGUgcmVxdWlyZW1lbnRzP1xuXHRhcHAubWVldHNSZXF1aXJlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuICQoICcubW9kYWwtdHJpZ2dlcicgKS5sZW5ndGg7XG5cdH07XG5cblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBUcmlnZ2VyIGEgbW9kYWwgdG8gb3Blbi5cblx0XHRhcHAuJGMuYm9keS5vbiggJ2NsaWNrIHRvdWNoc3RhcnQnLCAnLm1vZGFsLXRyaWdnZXInLCBhcHAub3Blbk1vZGFsICk7XG5cblx0XHQvLyBUcmlnZ2VyIHRoZSBjbG9zZSBidXR0b24gdG8gY2xvc2UgdGhlIG1vZGFsLlxuXHRcdGFwcC4kYy5ib2R5Lm9uKCAnY2xpY2sgdG91Y2hzdGFydCcsICcuY2xvc2UnLCBhcHAuY2xvc2VNb2RhbCApO1xuXG5cdFx0Ly8gQWxsb3cgdGhlIHVzZXIgdG8gY2xvc2UgdGhlIG1vZGFsIGJ5IGhpdHRpbmcgdGhlIGVzYyBrZXkuXG5cdFx0YXBwLiRjLmJvZHkub24oICdrZXlkb3duJywgYXBwLmVzY0tleUNsb3NlICk7XG5cblx0XHQvLyBBbGxvdyB0aGUgdXNlciB0byBjbG9zZSB0aGUgbW9kYWwgYnkgY2xpY2tpbmcgb3V0c2lkZSBvZiB0aGUgbW9kYWwuXG5cdFx0YXBwLiRjLmJvZHkub24oICdjbGljayB0b3VjaHN0YXJ0JywgJ2Rpdi5tb2RhbC1vcGVuJywgYXBwLmNsb3NlTW9kYWxCeUNsaWNrICk7XG5cblx0XHQvLyBMaXN0ZW4gdG8gdGFicywgdHJhcCBrZXlib2FyZCBpZiB3ZSBuZWVkIHRvXG5cdFx0YXBwLiRjLmJvZHkub24oICdrZXlkb3duJywgYXBwLnRyYXBLZXlib2FyZE1heWJlICk7XG5cblx0fTtcblxuXHQvLyBPcGVuIHRoZSBtb2RhbC5cblx0YXBwLm9wZW5Nb2RhbCA9IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBTdG9yZSB0aGUgbW9kYWwgdG9nZ2xlIGVsZW1lbnRcblx0XHQkbW9kYWxUb2dnbGUgPSAkKCB0aGlzICk7XG5cblx0XHQvLyBGaWd1cmUgb3V0IHdoaWNoIG1vZGFsIHdlJ3JlIG9wZW5pbmcgYW5kIHN0b3JlIHRoZSBvYmplY3QuXG5cdFx0dmFyICRtb2RhbCA9ICQoICQoIHRoaXMgKS5kYXRhKCAndGFyZ2V0JyApICk7XG5cblx0XHQvLyBEaXNwbGF5IHRoZSBtb2RhbC5cblx0XHQkbW9kYWwuYWRkQ2xhc3MoICdtb2RhbC1vcGVuJyApO1xuXG5cdFx0Ly8gQWRkIGJvZHkgY2xhc3MuXG5cdFx0YXBwLiRjLmJvZHkuYWRkQ2xhc3MoICdtb2RhbC1vcGVuJyApO1xuXG5cdFx0Ly8gRmluZCB0aGUgZm9jdXNhYmxlIGNoaWxkcmVuIG9mIHRoZSBtb2RhbC5cblx0XHQvLyBUaGlzIGxpc3QgbWF5IGJlIGluY29tcGxldGUsIHJlYWxseSB3aXNoIGpRdWVyeSBoYWQgdGhlIDpmb2N1c2FibGUgcHNldWRvIGxpa2UgalF1ZXJ5IFVJIGRvZXMuXG5cdFx0Ly8gRm9yIG1vcmUgYWJvdXQgOmlucHV0IHNlZTogaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9pbnB1dC1zZWxlY3Rvci9cblx0XHQkZm9jdXNhYmxlQ2hpbGRyZW4gPSAkbW9kYWwuZmluZCgnYSwgOmlucHV0LCBbdGFiaW5kZXhdJyk7XG5cblx0XHQvLyBJZGVhbGx5LCB0aGVyZSBpcyBhbHdheXMgb25lICh0aGUgY2xvc2UgYnV0dG9uKSwgYnV0IHlvdSBuZXZlciBrbm93LlxuXHRcdGlmICggJGZvY3VzYWJsZUNoaWxkcmVuLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHQvLyBTaGlmdCBmb2N1cyB0byB0aGUgZmlyc3QgZm9jdXNhYmxlIGVsZW1lbnQuXG5cdFx0XHQkZm9jdXNhYmxlQ2hpbGRyZW5bMF0uZm9jdXMoKTtcblx0XHR9XG5cblx0fTtcblxuXHQvLyBDbG9zZSB0aGUgbW9kYWwuXG5cdGFwcC5jbG9zZU1vZGFsID0gZnVuY3Rpb24gKCkge1xuXHRcdC8vIEZpZ3VyZSB0aGUgb3BlbmVkIG1vZGFsIHdlJ3JlIGNsb3NpbmcgYW5kIHN0b3JlIHRoZSBvYmplY3QuXG5cdFx0dmFyICRtb2RhbCA9ICQoICQoICdkaXYubW9kYWwtb3BlbiAuY2xvc2UnICkuZGF0YSggJ3RhcmdldCcgKSApO1xuXG5cdFx0Ly8gRmluZCB0aGUgaWZyYW1lIGluIHRoZSAkbW9kYWwgb2JqZWN0LlxuXHRcdHZhciAkaWZyYW1lID0gJG1vZGFsLmZpbmQoICdpZnJhbWUnICk7XG5cblx0XHQvLyBPbmx5IGRvIHRoaXMgaWYgdGhlcmUgYXJlIGFueSBpZnJhbWVzLlxuXHRcdGlmICggJGlmcmFtZS5sZW5ndGggKSB7XG5cdFx0XHQvLyBHZXQgdGhlIGlmcmFtZSBzcmMgVVJMLlxuXHRcdFx0dmFyIHVybCA9ICRpZnJhbWUuYXR0ciggJ3NyYycgKTtcblxuXHRcdFx0Ly8gUmVtb3ZpbmcvUmVhZGRpbmcgdGhlIFVSTCB3aWxsIGVmZmVjdGl2ZWx5IGJyZWFrIHRoZSBZb3VUdWJlIEFQSS5cblx0XHRcdC8vIFNvIGxldCdzIG5vdCBkbyB0aGF0IHdoZW4gdGhlIGlmcmFtZSBVUkwgY29udGFpbnMgdGhlIGVuYWJsZWpzYXBpIHBhcmFtZXRlci5cblx0XHRcdGlmICggISB1cmwuaW5jbHVkZXMoICdlbmFibGVqc2FwaT0xJyApICkge1xuXHRcdFx0XHQvLyBSZW1vdmUgdGhlIHNvdXJjZSBVUkwsIHRoZW4gYWRkIGl0IGJhY2ssIHNvIHRoZSB2aWRlbyBjYW4gYmUgcGxheWVkIGFnYWluIGxhdGVyLlxuXHRcdFx0XHQkaWZyYW1lLmF0dHIoICdzcmMnLCAnJyApLmF0dHIoICdzcmMnLCB1cmwgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIFVzZSB0aGUgWW91VHViZSBBUEkgdG8gc3RvcCB0aGUgdmlkZW8uXG5cdFx0XHRcdHBsYXllci5zdG9wVmlkZW8oKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBGaW5hbGx5LCBoaWRlIHRoZSBtb2RhbC5cblx0XHQkbW9kYWwucmVtb3ZlQ2xhc3MoICdtb2RhbC1vcGVuJyApO1xuXG5cdFx0Ly8gUmVtb3ZlIHRoZSBib2R5IGNsYXNzLlxuXHRcdGFwcC4kYy5ib2R5LnJlbW92ZUNsYXNzKCAnbW9kYWwtb3BlbicgKTtcblxuXHRcdC8vIFJldmVydCBmb2N1cyBiYWNrIHRvIHRvZ2dsZSBlbGVtZW50XG5cdFx0JG1vZGFsVG9nZ2xlLmZvY3VzKCk7XG5cblx0fTtcblxuXHQvLyBDbG9zZSBpZiBcImVzY1wiIGtleSBpcyBwcmVzc2VkLlxuXHRhcHAuZXNjS2V5Q2xvc2UgPSBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdGlmICggMjcgPT09IGV2ZW50LmtleUNvZGUgKSB7XG5cdFx0XHRhcHAuY2xvc2VNb2RhbCgpO1xuXHRcdH1cblx0fTtcblxuXHQvLyBDbG9zZSBpZiB0aGUgdXNlciBjbGlja3Mgb3V0c2lkZSBvZiB0aGUgbW9kYWxcblx0YXBwLmNsb3NlTW9kYWxCeUNsaWNrID0gZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHQvLyBJZiB0aGUgcGFyZW50IGNvbnRhaW5lciBpcyBOT1QgdGhlIG1vZGFsIGRpYWxvZyBjb250YWluZXIsIGNsb3NlIHRoZSBtb2RhbFxuXHRcdGlmICggISQoIGV2ZW50LnRhcmdldCApLnBhcmVudHMoICdkaXYnICkuaGFzQ2xhc3MoICdtb2RhbC1kaWFsb2cnICkgKSB7XG5cdFx0XHRhcHAuY2xvc2VNb2RhbCgpO1xuXHRcdH1cblx0fTtcblxuXHQvLyBUcmFwIHRoZSBrZXlib2FyZCBpbnRvIGEgbW9kYWwgd2hlbiBvbmUgaXMgYWN0aXZlLlxuXHRhcHAudHJhcEtleWJvYXJkTWF5YmUgPSBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXG5cdFx0Ly8gV2Ugb25seSBuZWVkIHRvIGRvIHN0dWZmIHdoZW4gdGhlIG1vZGFsIGlzIG9wZW4gYW5kIHRhYiBpcyBwcmVzc2VkLlxuXHRcdGlmICggOSA9PT0gZXZlbnQud2hpY2ggJiYgJCggJy5tb2RhbC1vcGVuJyApLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHR2YXIgJGZvY3VzZWQgPSAkKCAnOmZvY3VzJyApO1xuXHRcdFx0dmFyIGZvY3VzSW5kZXggPSAkZm9jdXNhYmxlQ2hpbGRyZW4uaW5kZXgoICRmb2N1c2VkICk7XG5cblx0XHRcdGlmICggMCA9PT0gZm9jdXNJbmRleCAmJiBldmVudC5zaGlmdEtleSApIHtcblx0XHRcdFx0Ly8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgZm9jdXNhYmxlIGVsZW1lbnQsIGFuZCBzaGlmdCBpcyBoZWxkIHdoZW4gcHJlc3NpbmcgdGFiLCBnbyBiYWNrIHRvIGxhc3QgZm9jdXNhYmxlIGVsZW1lbnQuXG5cdFx0XHRcdCRmb2N1c2FibGVDaGlsZHJlblsgJGZvY3VzYWJsZUNoaWxkcmVuLmxlbmd0aCAtIDEgXS5mb2N1cygpO1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fSBlbHNlIGlmICggISBldmVudC5zaGlmdEtleSAmJiBmb2N1c0luZGV4ID09PSAkZm9jdXNhYmxlQ2hpbGRyZW4ubGVuZ3RoIC0gMSApIHtcblx0XHRcdFx0Ly8gSWYgdGhpcyBpcyB0aGUgbGFzdCBmb2N1c2FibGUgZWxlbWVudCwgYW5kIHNoaWZ0IGlzIG5vdCBoZWxkLCBnbyBiYWNrIHRvIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudC5cblx0XHRcdFx0JGZvY3VzYWJsZUNoaWxkcmVuWzBdLmZvY3VzKCk7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gRW5nYWdlIVxuXHQkKCBhcHAuaW5pdCApO1xufSApKCB3aW5kb3csIGpRdWVyeSwgd2luZG93Lndkc01vZGFsICk7XG5cbi8vIExvYWQgdGhlIHl0IGlmcmFtZSBhcGkganMgZmlsZSBmcm9tIHlvdXR1YmUuXG4vLyBOT1RFIFRIRSBJRlJBTUUgVVJMIE1VU1QgSEFWRSAnZW5hYmxlanNhcGk9MScgYXBwZW5kZWQgdG8gaXQuXG4vLyBleGFtcGxlOiBzcmM9XCJodHRwOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL003bGMxVVZmLVZFP2VuYWJsZWpzYXBpPTFcIlxuLy8gSXQgYWxzbyBfbXVzdF8gaGF2ZSBhbiBJRCBhdHRyaWJ1dGUuXG52YXIgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG50YWcuaWQgPSAnaWZyYW1lLXl0JztcbnRhZy5zcmMgPSAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vaWZyYW1lX2FwaSc7XG52YXIgZmlyc3RTY3JpcHRUYWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG5maXJzdFNjcmlwdFRhZy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0YWcsIGZpcnN0U2NyaXB0VGFnKTtcblxuLy8gVGhpcyB2YXIgYW5kIGZ1bmN0aW9uIGhhdmUgdG8gYmUgYXZhaWxhYmxlIGdsb2JhbGx5IGR1ZSB0byB5dCBqcyBpZnJhbWUgYXBpLlxudmFyIHBsYXllcjtcbmZ1bmN0aW9uIG9uWW91VHViZUlmcmFtZUFQSVJlYWR5KCkge1xuXHR2YXIgbW9kYWwgPSBqUXVlcnkoJ2Rpdi5tb2RhbCcpO1xuXHR2YXIgaWZyYW1laWQgPSBtb2RhbC5maW5kKCdpZnJhbWUnKS5hdHRyKCdpZCcpO1xuXG5cdHBsYXllciA9IG5ldyBZVC5QbGF5ZXIoIGlmcmFtZWlkICwge1xuXHRcdGV2ZW50czoge1xuXHRcdFx0J29uUmVhZHknOiBvblBsYXllclJlYWR5LFxuXHRcdFx0J29uU3RhdGVDaGFuZ2UnOiBvblBsYXllclN0YXRlQ2hhbmdlXG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gb25QbGF5ZXJSZWFkeShldmVudCkge1xuXG59XG5cbmZ1bmN0aW9uIG9uUGxheWVyU3RhdGVDaGFuZ2UoIGV2ZW50ICkge1xuXHQvLyBTZXQgZm9jdXMgdG8gdGhlIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50IGluc2lkZSBvZiB0aGUgbW9kYWwgdGhlIHBsYXllciBpcyBpbi5cblx0alF1ZXJ5KCBldmVudC50YXJnZXQuYSApLnBhcmVudHMoICcubW9kYWwnICkuZmluZCgnYSwgOmlucHV0LCBbdGFiaW5kZXhdJykuZmlyc3QoKS5mb2N1cygpO1xufVxuIiwiLyoqXG4gKiBGaWxlIHNlYXJjaC5qc1xuICpcbiAqIERlYWwgd2l0aCB0aGUgc2VhcmNoIGZvcm0uXG4gKi9cbndpbmRvdy53ZHNTZWFyY2ggPSB7fTtcblxuKCBmdW5jdGlvbiAoIHdpbmRvdywgJCwgYXBwICkge1xuXHQvLyBDb25zdHJ1Y3Rvci5cblx0YXBwLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0YXBwLmNhY2hlKCk7XG5cblx0XHRpZiAoIGFwcC5tZWV0c1JlcXVpcmVtZW50cygpICkge1xuXHRcdFx0YXBwLmJpbmRFdmVudHMoKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQ2FjaGUgYWxsIHRoZSB0aGluZ3MuXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAuJGMgPSB7XG5cdFx0XHQnYm9keSc6ICQoICdib2R5JyApXG5cdFx0fTtcblx0fTtcblxuXHQvLyBEbyB3ZSBtZWV0IHRoZSByZXF1aXJlbWVudHM/XG5cdGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gJCggJy5zZWFyY2gtZmllbGQnICkubGVuZ3RoO1xuXHR9O1xuXG5cdC8vIENvbWJpbmUgYWxsIGV2ZW50cy5cblx0YXBwLmJpbmRFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gUmVtb3ZlIHBsYWNlaG9sZGVyIHRleHQgZnJvbSBzZWFyY2ggZmllbGQgb24gZm9jdXMuXG5cdFx0YXBwLiRjLmJvZHkub24oICdmb2N1cycsICcuc2VhcmNoLWZpZWxkJywgYXBwLnJlbW92ZVBsYWNlaG9sZGVyVGV4dCApO1xuXG5cdFx0Ly8gQWRkIHBsYWNlaG9sZGVyIHRleHQgYmFjayB0byBzZWFyY2ggZmllbGQgb24gYmx1ci5cblx0XHRhcHAuJGMuYm9keS5vbiggJ2JsdXInLCAnLnNlYXJjaC1maWVsZCcsIGFwcC5hZGRQbGFjZWhvbGRlclRleHQgKTtcblx0fTtcblxuXHQvLyBSZW1vdmUgcGxhY2Vob2xkZXIgdGV4dCBmcm9tIHNlYXJjaCBmaWVsZC5cblx0YXBwLnJlbW92ZVBsYWNlaG9sZGVyVGV4dCA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgJHNlYXJjaF9maWVsZCA9ICQoIHRoaXMgKTtcblxuXHRcdCRzZWFyY2hfZmllbGQuZGF0YSggJ3BsYWNlaG9sZGVyJywgJHNlYXJjaF9maWVsZC5hdHRyKCAncGxhY2Vob2xkZXInICkgKS5hdHRyKCAncGxhY2Vob2xkZXInLCAnJyApO1xuXHR9O1xuXG5cdC8vIFJlcGxhY2UgcGxhY2Vob2xkZXIgdGV4dCBmcm9tIHNlYXJjaCBmaWVsZC5cblx0YXBwLmFkZFBsYWNlaG9sZGVyVGV4dCA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgJHNlYXJjaF9maWVsZCA9ICQoIHRoaXMgKTtcblxuXHRcdCRzZWFyY2hfZmllbGQuYXR0ciggJ3BsYWNlaG9sZGVyJywgJHNlYXJjaF9maWVsZC5kYXRhKCAncGxhY2Vob2xkZXInICkgKS5kYXRhKCAncGxhY2Vob2xkZXInLCAnJyApO1xuXHR9O1xuXG5cdC8vIEVuZ2FnZSFcblx0JCggYXBwLmluaXQgKTtcbn0gKSggd2luZG93LCBqUXVlcnksIHdpbmRvdy53ZHNTZWFyY2ggKTtcbiIsIi8qKlxuICogRmlsZSBza2lwLWxpbmstZm9jdXMtZml4LmpzLlxuICpcbiAqIEhlbHBzIHdpdGggYWNjZXNzaWJpbGl0eSBmb3Iga2V5Ym9hcmQgb25seSB1c2Vycy5cbiAqXG4gKiBMZWFybiBtb3JlOiBodHRwczovL2dpdC5pby92V2RyMlxuICovXG4oIGZ1bmN0aW9uICgpIHtcblx0dmFyIGlzV2Via2l0ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoICd3ZWJraXQnICkgPiAtMSxcblx0XHRpc09wZXJhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoICdvcGVyYScgKSA+IC0xLFxuXHRcdGlzSWUgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggJ21zaWUnICkgPiAtMTtcblxuXHRpZiAoICggaXNXZWJraXQgfHwgaXNPcGVyYSB8fCBpc0llICkgJiYgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgKSB7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdoYXNoY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIGlkID0gbG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoIDEgKSxcblx0XHRcdFx0ZWxlbWVudDtcblxuXHRcdFx0aWYgKCAhKCAvXltBLXowLTlfLV0rJC8gKS50ZXN0KCBpZCApICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggaWQgKTtcblxuXHRcdFx0aWYgKCBlbGVtZW50ICkge1xuXHRcdFx0XHRpZiAoICEoIC9eKD86YXxzZWxlY3R8aW5wdXR8YnV0dG9ufHRleHRhcmVhKSQvaSApLnRlc3QoIGVsZW1lbnQudGFnTmFtZSApICkge1xuXHRcdFx0XHRcdGVsZW1lbnQudGFiSW5kZXggPSAtMTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGVsZW1lbnQuZm9jdXMoKTtcblx0XHRcdH1cblx0XHR9LCBmYWxzZSApO1xuXHR9XG59ICkoKTtcbiIsIi8qKlxuICogRmlsZSB3aW5kb3ctcmVhZHkuanNcbiAqXG4gKiBBZGQgYSBcInJlYWR5XCIgY2xhc3MgdG8gPGJvZHk+IHdoZW4gd2luZG93IGlzIHJlYWR5LlxuICovXG53aW5kb3cud2RzV2luZG93UmVhZHkgPSB7fTtcbiggZnVuY3Rpb24gKCB3aW5kb3csICQsIGFwcCApIHtcblx0Ly8gQ29uc3RydWN0b3IuXG5cdGFwcC5pbml0ID0gZnVuY3Rpb24gKCkge1xuXHRcdGFwcC5jYWNoZSgpO1xuXHRcdGFwcC5iaW5kRXZlbnRzKCk7XG5cdH07XG5cblx0Ly8gQ2FjaGUgZG9jdW1lbnQgZWxlbWVudHMuXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAuJGMgPSB7XG5cdFx0XHQnd2luZG93JzogJCggd2luZG93ICksXG5cdFx0XHQnYm9keSc6ICQoIGRvY3VtZW50LmJvZHkgKVxuXHRcdH07XG5cdH07XG5cblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAuJGMud2luZG93LmxvYWQoIGFwcC5hZGRCb2R5Q2xhc3MgKTtcblx0fTtcblxuXHQvLyBBZGQgYSBjbGFzcyB0byA8Ym9keT4uXG5cdGFwcC5hZGRCb2R5Q2xhc3MgPSBmdW5jdGlvbiAoKSB7XG5cdFx0YXBwLiRjLmJvZHkuYWRkQ2xhc3MoICdyZWFkeScgKTtcblx0fTtcblxuXHQvLyBFbmdhZ2UhXG5cdCQoIGFwcC5pbml0ICk7XG59ICkoIHdpbmRvdywgalF1ZXJ5LCB3aW5kb3cud2RzV2luZG93UmVhZHkgKTtcbiJdfQ==
