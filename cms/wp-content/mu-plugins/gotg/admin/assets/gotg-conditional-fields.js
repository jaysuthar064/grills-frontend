/**
 * Grill on the Green — conditional field display (event box, §4.4).
 *
 * Shows or hides wrappers by toggling the `hidden` attribute, which removes them
 * from the accessibility tree as well as the layout. Hidden fields are NOT
 * disabled and are still submitted, so a value entered then hidden is not lost.
 * Without this script every field is visible — conditional display is a
 * convenience, never a validation boundary. Plain ES2017, no build step.
 */
(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		var typeSelect = document.querySelector('[name="gotg_event_type"]');
		var ticketed = document.querySelector('[name="gotg_is_ticketed"]');

		function apply() {
			if (typeSelect) {
				var groups = document.querySelectorAll('[data-gotg-show-if="event-type"]');
				Array.prototype.forEach.call(groups, function (group) {
					group.hidden =
						group.getAttribute('data-gotg-show-value') !== typeSelect.value;
				});
			}

			if (ticketed) {
				var ticketGroups = document.querySelectorAll(
					'[data-gotg-show-if="ticketed"]'
				);
				Array.prototype.forEach.call(ticketGroups, function (group) {
					group.hidden = !ticketed.checked;
				});
			}
		}

		if (typeSelect) {
			typeSelect.addEventListener('change', apply);
		}
		if (ticketed) {
			ticketed.addEventListener('change', apply);
		}

		apply();
	});
})();
