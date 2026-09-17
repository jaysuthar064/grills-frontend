/**
 * Grill on the Green — repeater field behaviour.
 *
 * Progressive enhancement for any `[data-gotg-repeater]` container: add, remove
 * (down to zero), and reorder rows, with focus management and polite live-region
 * announcements. Plain ES2017, no framework, no build step
 * (03-CONTENT-MODEL.md §2.6).
 *
 * A new row is created by cloning the container's <template> and replacing the
 * `__INDEX__` placeholder in its name/id/for attributes — never by string
 * concatenation of markup. Indices are not renumbered on remove or move; PHP
 * collapses gaps with array_values() on save.
 */
(function () {
	'use strict';

	function initRepeater(container) {
		var rowsHost = container.querySelector('[data-gotg-repeater-rows]');
		var template = container.querySelector('[data-gotg-repeater-template]');
		var addButton = container.querySelector('[data-gotg-repeater-add]');
		var status = container.querySelector('[data-gotg-repeater-status]');
		var emptyMessage = container.querySelector('.gotg-repeater-empty');

		if (!rowsHost || !template || !addButton) {
			return;
		}

		// Ever-incrementing so a removed index is never reused within the form.
		var nextIndex = rowsHost.querySelectorAll('[data-gotg-repeater-row]').length;

		function announce(message) {
			if (status) {
				status.textContent = message;
			}
		}

		function rows() {
			return Array.prototype.slice.call(
				rowsHost.querySelectorAll('[data-gotg-repeater-row]')
			);
		}

		function refresh() {
			var current = rows();

			current.forEach(function (row, position) {
				var up = row.querySelector('[data-gotg-repeater-up]');
				var down = row.querySelector('[data-gotg-repeater-down]');

				if (up) {
					up.disabled = position === 0;
				}
				if (down) {
					down.disabled = position === current.length - 1;
				}
			});

			if (emptyMessage) {
				emptyMessage.hidden = current.length > 0;
			}
		}

		function buildRow(index) {
			var source = template.content.firstElementChild;
			var clone = source.cloneNode(true);
			var token = String(index);
			var targets = clone.querySelectorAll('[name], [id], [for]');

			['name', 'id', 'for'].forEach(function (attr) {
				if (clone.hasAttribute(attr)) {
					clone.setAttribute(
						attr,
						clone.getAttribute(attr).replace(/__INDEX__/g, token)
					);
				}
			});

			Array.prototype.forEach.call(targets, function (el) {
				['name', 'id', 'for'].forEach(function (attr) {
					if (el.hasAttribute(attr)) {
						el.setAttribute(
							attr,
							el.getAttribute(attr).replace(/__INDEX__/g, token)
						);
					}
				});
			});

			return clone;
		}

		function addRow() {
			var row = buildRow(nextIndex);
			nextIndex += 1;
			rowsHost.appendChild(row);
			refresh();

			var firstInput = row.querySelector('input, select, textarea');
			if (firstInput) {
				firstInput.focus();
			}

			announce('Row ' + rows().length + ' added');
		}

		function removeRow(row) {
			var position = rows().indexOf(row) + 1;
			row.parentNode.removeChild(row);
			refresh();
			addButton.focus();
			announce('Row ' + position + ' removed');
		}

		function moveRow(row, direction, button) {
			var current = rows();
			var index = current.indexOf(row);
			var swapWith = direction === 'up' ? index - 1 : index + 1;

			if (swapWith < 0 || swapWith >= current.length) {
				return;
			}

			if (direction === 'up') {
				rowsHost.insertBefore(row, current[swapWith]);
			} else {
				rowsHost.insertBefore(current[swapWith], row);
			}

			refresh();

			// Focus stays on the button that was pressed, unless it is now
			// disabled (row reached an end), in which case move to the sibling.
			if (button && !button.disabled) {
				button.focus();
			} else {
				var fallback = row.querySelector(
					'[data-gotg-repeater-' + (direction === 'up' ? 'down' : 'up') + ']'
				);
				if (fallback) {
					fallback.focus();
				}
			}

			announce('Row ' + (index + 1) + ' moved ' + direction);
		}

		addButton.addEventListener('click', function () {
			addRow();
		});

		container.addEventListener('click', function (event) {
			var target = event.target;

			if (!(target instanceof Element)) {
				return;
			}

			var row = target.closest('[data-gotg-repeater-row]');
			if (!row) {
				return;
			}

			if (target.closest('[data-gotg-repeater-remove]')) {
				removeRow(row);
			} else if (target.closest('[data-gotg-repeater-up]')) {
				moveRow(row, 'up', target.closest('[data-gotg-repeater-up]'));
			} else if (target.closest('[data-gotg-repeater-down]')) {
				moveRow(row, 'down', target.closest('[data-gotg-repeater-down]'));
			}
		});

		refresh();
	}

	document.addEventListener('DOMContentLoaded', function () {
		var containers = document.querySelectorAll('[data-gotg-repeater]');
		Array.prototype.forEach.call(containers, initRepeater);
	});
})();
