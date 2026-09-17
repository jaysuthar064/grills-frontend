/**
 * Grill on the Green — Page Blocks Media & Gallery Picker.
 *
 * Connects the WordPress Media Modal (wp.media) to:
 * 1. Single Image pickers (Hero background, Split Feature images).
 * 2. Video pickers (Hero portrait MP4 video).
 * 3. Gallery multi-image pickers (reorder, add multiple, remove individual).
 */
(function ($) {
	'use strict';

	$(document).ready(function () {
		if (typeof wp === 'undefined' || !wp.media) {
			return;
		}

		// ── 1. Single Image Picker ─────────────────────────────────────────
		$(document).on('click', '.gotg-choose-image-btn, .gotg-choose-media-btn', function (e) {
			e.preventDefault();
			var $btn = $(this);
			var $picker = $btn.closest('.gotg-media-picker');
			var $input = $picker.find('.gotg-media-id-input');
			var $preview = $picker.find('.gotg-media-preview-box');
			var $remove = $picker.find('.gotg-remove-image-btn, .gotg-remove-media-btn');

			var frame = wp.media({
				title: 'Select Image',
				library: { type: 'image' },
				button: { text: 'Use Image' },
				multiple: false
			});

			frame.on('select', function () {
				var attachment = frame.state().get('selection').first().toJSON();
				$input.val(attachment.id);

				var url = (attachment.sizes && attachment.sizes.medium) ? attachment.sizes.medium.url : attachment.url;
				$preview.html('<img src="' + url + '" style="max-height:120px; width:auto;" alt="" />');
				$remove.show();

				// If this block has a media display radio (e.g. Text Block), set to photo
				$picker.closest('.gotg-block-card').find('.gotg-media-display-radio[value="photo"]').prop('checked', true);
			});

			frame.open();
		});

		// ── 2. Video Picker ────────────────────────────────────────────────
		$(document).on('click', '.gotg-choose-video-btn', function (e) {
			e.preventDefault();
			var $btn = $(this);
			var $picker = $btn.closest('.gotg-media-picker');
			var $input = $picker.find('.gotg-media-id-input');
			var $preview = $picker.find('.gotg-media-preview-box');
			var $remove = $picker.find('.gotg-remove-image-btn, .gotg-remove-media-btn');

			var frame = wp.media({
				title: 'Select Video (MP4)',
				library: { type: 'video' },
				button: { text: 'Use Video' },
				multiple: false
			});

			frame.on('select', function () {
				var attachment = frame.state().get('selection').first().toJSON();
				$input.val(attachment.id);

				var filename = attachment.filename || attachment.title || 'Video';
				$preview.html(
					'<div style="color:#2271b1; font-weight:600;">🎬 ' + filename + '</div>' +
					'<div style="color:#666; font-size:11px; margin-top:4px;">ID: ' + attachment.id + ' (Active Video)</div>'
				);
				$remove.show();

				// If this block has a media display radio (e.g. Text Block), set to video
				$picker.closest('.gotg-block-card').find('.gotg-media-display-radio[value="video"]').prop('checked', true);
			});

			frame.open();
		});

		// ── Remove Media (Image or Video) ──────────────────────────────────
		$(document).on('click', '.gotg-remove-image-btn, .gotg-remove-media-btn', function (e) {
			e.preventDefault();
			var $btn = $(this);
			var $picker = $btn.closest('.gotg-media-picker');
			var $card = $btn.closest('.gotg-block-card');
			var $input = $picker.find('.gotg-media-id-input');
			var $preview = $picker.find('.gotg-media-preview-box');

			$input.val('0');
			$preview.html('<span style="color:#999; font-size:12px;">No media chosen</span>');
			$btn.hide();

			// Auto update showcase toggle if present
			var isVideoPicker = $picker.data('picker') === 'video';
			if (isVideoPicker) {
				var hasImage = parseInt($card.find('[data-picker="image"] .gotg-media-id-input').val(), 10) > 0;
				$card.find('.gotg-media-display-radio[value="' + (hasImage ? 'photo' : 'none') + '"]').prop('checked', true);
			} else {
				var hasVideo = parseInt($card.find('[data-picker="video"] .gotg-media-id-input').val(), 10) > 0;
				$card.find('.gotg-media-display-radio[value="' + (hasVideo ? 'video' : 'none') + '"]').prop('checked', true);
			}
		});

		// ── 3. Multi-Image Gallery Picker ──────────────────────────────────
		$(document).on('click', '.gotg-add-gallery-images-btn', function (e) {
			e.preventDefault();
			var $btn = $(this);
			var $gallery = $btn.closest('.gotg-gallery-picker');
			var $input = $gallery.find('.gotg-gallery-ids-input');
			var $thumbContainer = $gallery.find('.gotg-gallery-thumbnails');

			var frame = wp.media({
				title: 'Add Images to Gallery',
				library: { type: 'image' },
				button: { text: 'Add to Gallery' },
				multiple: true
			});

			frame.on('select', function () {
				var selection = frame.state().get('selection');
				var currentIds = $input.val() ? $input.val().split(',').filter(Boolean) : [];

				selection.each(function (attachment) {
					var item = attachment.toJSON();
					var idStr = String(item.id);

					if (currentIds.indexOf(idStr) === -1) {
						currentIds.push(idStr);
						var url = (item.sizes && item.sizes.thumbnail) ? item.sizes.thumbnail.url : item.url;
						var html =
							'<div class="gotg-gallery-thumb-item" data-id="' + item.id + '" style="position:relative; width:80px; height:80px; border-radius:4px; overflow:hidden; border:1px solid #ccc; background:#fff;">' +
							'<img src="' + url + '" style="width:100%; height:100%; object-fit:cover;" />' +
							'<button type="button" class="gotg-remove-thumb-btn" style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.65); color:#fff; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer; font-size:12px; line-height:1; display:flex; align-items:center; justify-content:center;">×</button>' +
							'</div>';
						$thumbContainer.append(html);
					}
				});

				$input.val(currentIds.join(','));
			});

			frame.open();
		});

		// Remove individual thumbnail from gallery
		$(document).on('click', '.gotg-remove-thumb-btn', function (e) {
			e.preventDefault();
			var $thumb = $(this).closest('.gotg-gallery-thumb-item');
			var $gallery = $thumb.closest('.gotg-gallery-picker');
			var $input = $gallery.find('.gotg-gallery-ids-input');
			var idToRemove = String($thumb.data('id'));

			var currentIds = $input.val() ? $input.val().split(',').filter(Boolean) : [];
			currentIds = currentIds.filter(function (id) {
				return id !== idToRemove;
			});

			$input.val(currentIds.join(','));
			$thumb.remove();
		});

		// Clear all images from gallery
		$(document).on('click', '.gotg-clear-gallery-btn', function (e) {
			e.preventDefault();
			var $gallery = $(this).closest('.gotg-gallery-picker');
			$gallery.find('.gotg-gallery-ids-input').val('');
			$gallery.find('.gotg-gallery-thumbnails').empty();
		});
	});
})(jQuery);
