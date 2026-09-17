/**
 * Grill on the Green — media field (§2.7).
 *
 * Wires each `[data-gotg-media]` control to the WordPress media modal: choose
 * stores the attachment ID and shows a preview; remove clears both. The hidden
 * input carries the ID, so without this script the stored value still submits.
 * Depends on wp.media (wp_enqueue_media). Plain ES2017, no build step.
 */
(function () {
	'use strict';

	function initField(field) {
		var input = field.querySelector('[data-gotg-media-input]');
		var preview = field.querySelector('[data-gotg-media-preview]');
		var choose = field.querySelector('[data-gotg-media-choose]');
		var remove = field.querySelector('[data-gotg-media-remove]');
		var frame;

		if (!input || !choose || !preview || typeof wp === 'undefined' || !wp.media) {
			return;
		}

		choose.addEventListener('click', function (event) {
			event.preventDefault();

			if (frame) {
				frame.open();
				return;
			}

			frame = wp.media({
				title: choose.getAttribute('data-gotg-media-title') || 'Select image',
				library: { type: 'image' },
				button: { text: 'Use image' },
				multiple: false,
			});

			frame.on('select', function () {
				var attachment = frame.state().get('selection').first().toJSON();
				var size =
					attachment.sizes && attachment.sizes.thumbnail
						? attachment.sizes.thumbnail.url
						: attachment.url;

				input.value = attachment.id;

				preview.textContent = '';
				var img = document.createElement('img');
				img.src = size;
				img.alt = attachment.alt || '';
				preview.appendChild(img);

				if (remove) {
					remove.hidden = false;
				}
			});

			frame.open();
		});

		if (remove) {
			remove.addEventListener('click', function (event) {
				event.preventDefault();
				input.value = '';
				preview.textContent = '';
				remove.hidden = true;
				choose.focus();
			});
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		var fields = document.querySelectorAll('[data-gotg-media]');
		Array.prototype.forEach.call(fields, initField);
	});
})();
