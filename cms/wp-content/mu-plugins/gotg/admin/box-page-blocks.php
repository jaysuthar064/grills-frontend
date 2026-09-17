<?php
/**
 * Headless Page Blocks & Media Content Editor (Meta Box).
 *
 * Provides WordPress visual editing controls for each block in `_gotg_page_blocks`
 * (Hero, Split Feature, Gallery, Text, CTA Band, etc.), including native WP Media
 * Library integration for images and videos.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers the Page Blocks meta box on the 'page' post type.
 *
 * @return void
 */
function gotg_register_page_blocks_meta_box() {
	add_meta_box(
		'gotg_page_blocks_box',
		__( 'Headless Page Content, Sections & Media', 'gotg' ),
		'gotg_render_page_blocks_box',
		'page',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes_page', 'gotg_register_page_blocks_meta_box' );

/**
 * Renders the Page Blocks meta box.
 *
 * @param WP_Post $post Current page.
 * @return void
 */
function gotg_render_page_blocks_box( $post ) {
	wp_nonce_field( 'gotg_save_page_blocks_box', 'gotg_page_blocks_nonce' );

	$blocks = get_post_meta( $post->ID, '_gotg_page_blocks', true );
	if ( ! is_array( $blocks ) ) {
		$blocks = array();
	}

	?>
	<div class="gotg-page-blocks-wrapper" style="font-size:14px;">
		<div style="background:#f0f6fc; border-left:4px solid #2271b1; padding:12px 16px; margin-bottom:20px; border-radius:4px;">
			<p style="margin:0 0 6px; font-weight:600; color:#1d2327;">
				🚀 Headless Page Content & Media Editor
			</p>
			<p style="margin:0; color:#50575e; font-size:13px;">
				Edit the sections, titles, descriptive texts, images, and videos displayed on this page in the Next.js frontend.
				Click <strong>Update</strong> on the top right to save and publish your changes live.
			</p>
		</div>

		<?php if ( empty( $blocks ) ) : ?>
			<p style="color:#646970; font-style:italic;">
				<?php esc_html_e( 'No blocks configured for this page yet. You can add sections below.', 'gotg' ); ?>
			</p>
		<?php else : ?>
			<div class="gotg-blocks-list" style="display:flex; flex-direction:column; gap:20px;">
				<?php foreach ( $blocks as $idx => $block ) : ?>
					<?php gotg_render_single_block_editor( $idx, $block ); ?>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</div>
	<?php
}

/**
 * Renders an editor card for a single block.
 *
 * @param int   $idx   Block index.
 * @param array $block Block data.
 * @return void
 */
function gotg_render_single_block_editor( $idx, array $block ) {
	$type  = $block['type'] ?? 'unknown';
	$title = ucfirst( str_replace( '_', ' ', $type ) );

	$type_labels = array(
		'hero'            => '⭐ Hero Section (Video & Poster Banner)',
		'split_feature'   => '🍱 Split Feature (Food / Catering Showcase)',
		'gallery'         => '📸 Photo Gallery (Pit & Food Showcase)',
		'text'            => '📝 Text Section (Story / Details)',
		'cta_band'        => '📣 CTA Banner (Call-to-Action Bar)',
		'featured_items'  => '🍔 Featured Menu Items',
		'events_preview'  => '📅 Events Preview',
		'instagram_feed'  => '📸 Instagram / Social Feed',
	);

	$label = $type_labels[ $type ] ?? "Section: {$title}";
	$prefix = "gotg_blocks[{$idx}]";

	?>
	<div class="gotg-block-card" style="border:1px solid #c3c4c7; border-radius:6px; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,0.05); overflow:hidden;">
		<input type="hidden" name="<?php echo esc_attr( "{$prefix}[type]" ); ?>" value="<?php echo esc_attr( $type ); ?>" />
		
		<div style="background:#f6f7f7; border-bottom:1px solid #dcdcde; padding:10px 16px; display:flex; justify-content:space-between; align-items:center;">
			<strong style="font-size:14px; color:#1d2327;"><?php echo esc_html( $label ); ?></strong>
			<span style="font-size:12px; background:#e0e0e0; color:#50575e; padding:2px 8px; border-radius:12px; font-weight:600;">Block #<?php echo esc_html( (string) ($idx + 1) ); ?></span>
		</div>

		<div style="padding:16px;">
			<?php
			switch ( $type ) {
				case 'hero':
					gotg_render_hero_block_fields( $prefix, $block );
					break;
				case 'split_feature':
					gotg_render_split_feature_fields( $prefix, $block );
					break;
				case 'gallery':
					gotg_render_gallery_fields( $prefix, $block );
					break;
				case 'text':
					gotg_render_text_block_fields( $prefix, $block );
					break;
				case 'cta_band':
					gotg_render_cta_band_fields( $prefix, $block );
					break;
				default:
					gotg_render_generic_block_fields( $prefix, $block );
					break;
			}
			?>
		</div>
	</div>
	<?php
}

/**
 * Renders Hero block fields.
 */
function gotg_render_hero_block_fields( $prefix, array $b ) {
	$heading    = $b['heading'] ?? '';
	$subheading = $b['subheading'] ?? '';
	$eyebrow    = $b['eyebrow'] ?? '';
	$image_id   = absint( $b['image_id'] ?? 0 );
	$video_id   = absint( $b['video_id'] ?? 0 );
	$overlay    = isset( $b['overlay'] ) ? (int) $b['overlay'] : 45;
	$p_label    = $b['primary_cta_label'] ?? '';
	$p_url      = $b['primary_cta_url'] ?? '';
	$s_label    = $b['secondary_cta_label'] ?? '';
	$s_url      = $b['secondary_cta_url'] ?? '';
	?>
	<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
		<div style="grid-column:1 / -1;">
			<label style="display:block; font-weight:600; margin-bottom:4px;">Eyebrow (Optional Script Line)</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[eyebrow]" ); ?>" value="<?php echo esc_attr( $eyebrow ); ?>" style="width:100%;" placeholder="e.g. Smoke & Fire" />
		</div>

		<div style="grid-column:1 / -1;">
			<label style="display:block; font-weight:600; margin-bottom:4px;">Main Headline (Heading 1) *</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[heading]" ); ?>" value="<?php echo esc_attr( $heading ); ?>" style="width:100%; font-size:16px; font-weight:600;" required />
		</div>

		<div style="grid-column:1 / -1;">
			<label style="display:block; font-weight:600; margin-bottom:4px;">Subheading</label>
			<textarea name="<?php echo esc_attr( "{$prefix}[subheading]" ); ?>" rows="2" style="width:100%;"><?php echo esc_textarea( $subheading ); ?></textarea>
		</div>

		<!-- Hero Image Picker -->
		<div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:6px; padding:12px;">
			<label style="display:block; font-weight:600; margin-bottom:6px;">🖼️ Background / Poster Image</label>
			<div class="gotg-media-picker" data-picker="image">
				<input type="hidden" class="gotg-media-id-input" name="<?php echo esc_attr( "{$prefix}[image_id]" ); ?>" value="<?php echo esc_attr( (string) $image_id ); ?>" />
				<div class="gotg-media-preview-box" style="margin-bottom:8px; min-height:80px; background:#fff; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center; border-radius:4px; overflow:hidden;">
					<?php if ( $image_id ) : ?>
						<?php echo wp_get_attachment_image( $image_id, 'medium', false, array( 'style' => 'max-height:120px; width:auto;' ) ); ?>
					<?php else : ?>
						<span style="color:#999; font-size:12px;">No image chosen</span>
					<?php endif; ?>
				</div>
				<button type="button" class="button gotg-choose-image-btn">Choose / Change Image</button>
				<button type="button" class="button gotg-remove-image-btn" style="<?php echo $image_id ? '' : 'display:none;'; ?>">Remove</button>
			</div>
		</div>

		<!-- Hero Video Picker -->
		<div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:6px; padding:12px;">
			<label style="display:block; font-weight:600; margin-bottom:6px;">🎥 Portrait Hero Video (MP4)</label>
			<div class="gotg-media-picker" data-picker="video">
				<input type="hidden" class="gotg-media-id-input" name="<?php echo esc_attr( "{$prefix}[video_id]" ); ?>" value="<?php echo esc_attr( (string) $video_id ); ?>" />
				<div class="gotg-media-preview-box" style="margin-bottom:8px; min-height:80px; background:#fff; border:1px dashed #ccc; padding:10px; border-radius:4px; font-size:13px;">
					<?php if ( $video_id ) : ?>
						<div style="color:#2271b1; font-weight:600;">🎬 <?php echo esc_html( basename( wp_get_attachment_url( $video_id ) ) ); ?></div>
						<div style="color:#666; font-size:11px; margin-top:4px;">ID: <?php echo esc_html( (string) $video_id ); ?> (Active Video)</div>
					<?php else : ?>
						<span style="color:#999; font-size:12px;">No video chosen (Text-only or static image hero)</span>
					<?php endif; ?>
				</div>
				<button type="button" class="button gotg-choose-video-btn">Choose / Change Video</button>
				<button type="button" class="button gotg-remove-image-btn" style="<?php echo $video_id ? '' : 'display:none;'; ?>">Remove Video</button>
			</div>
		</div>

		<!-- CTAs -->
		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Primary Button Label</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[primary_cta_label]" ); ?>" value="<?php echo esc_attr( $p_label ); ?>" style="width:100%;" />
		</div>
		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Primary Button URL</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[primary_cta_url]" ); ?>" value="<?php echo esc_attr( $p_url ); ?>" style="width:100%;" />
		</div>

		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Secondary Button Label</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[secondary_cta_label]" ); ?>" value="<?php echo esc_attr( $s_label ); ?>" style="width:100%;" />
		</div>
		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Secondary Button URL</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[secondary_cta_url]" ); ?>" value="<?php echo esc_attr( $s_url ); ?>" style="width:100%;" />
		</div>

		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Background Overlay Opacity (%)</label>
			<input type="number" min="0" max="100" name="<?php echo esc_attr( "{$prefix}[overlay]" ); ?>" value="<?php echo esc_attr( (string) $overlay ); ?>" style="width:120px;" />
		</div>
	</div>
	<?php
}

/**
 * Renders Split Feature fields.
 */
function gotg_render_split_feature_fields( $prefix, array $b ) {
	$heading    = $b['heading'] ?? '';
	$body       = $b['body'] ?? '';
	$image_id   = absint( $b['image_id'] ?? 0 );
	$image_side = $b['image_side'] ?? 'right';
	$cta_label  = $b['cta_label'] ?? '';
	$cta_url    = $b['cta_url'] ?? '';
	?>
	<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
		<div style="grid-column:1 / -1;">
			<label style="display:block; font-weight:600; margin-bottom:4px;">Section Headline</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[heading]" ); ?>" value="<?php echo esc_attr( $heading ); ?>" style="width:100%; font-weight:600;" required />
		</div>

		<div style="grid-column:1 / -1;">
			<label style="display:block; font-weight:600; margin-bottom:4px;">Description Text</label>
			<textarea name="<?php echo esc_attr( "{$prefix}[body]" ); ?>" rows="3" style="width:100%;"><?php echo esc_textarea( $body ); ?></textarea>
		</div>

		<!-- Feature Image -->
		<div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:6px; padding:12px;">
			<label style="display:block; font-weight:600; margin-bottom:6px;">🖼️ Feature Photo</label>
			<div class="gotg-media-picker" data-picker="image">
				<input type="hidden" class="gotg-media-id-input" name="<?php echo esc_attr( "{$prefix}[image_id]" ); ?>" value="<?php echo esc_attr( (string) $image_id ); ?>" />
				<div class="gotg-media-preview-box" style="margin-bottom:8px; min-height:80px; background:#fff; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center; border-radius:4px; overflow:hidden;">
					<?php if ( $image_id ) : ?>
						<?php echo wp_get_attachment_image( $image_id, 'medium', false, array( 'style' => 'max-height:120px; width:auto;' ) ); ?>
					<?php else : ?>
						<span style="color:#999; font-size:12px;">No image chosen</span>
					<?php endif; ?>
				</div>
				<button type="button" class="button gotg-choose-image-btn">Choose / Change Image</button>
				<button type="button" class="button gotg-remove-image-btn" style="<?php echo $image_id ? '' : 'display:none;'; ?>">Remove</button>
			</div>
		</div>

		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Image Position</label>
			<select name="<?php echo esc_attr( "{$prefix}[image_side]" ); ?>" style="width:100%;">
				<option value="right" <?php selected( $image_side, 'right' ); ?>>Right Side</option>
				<option value="left" <?php selected( $image_side, 'left' ); ?>>Left Side</option>
			</select>

			<div style="margin-top:14px;">
				<label style="display:block; font-weight:600; margin-bottom:4px;">CTA Button Label</label>
				<input type="text" name="<?php echo esc_attr( "{$prefix}[cta_label]" ); ?>" value="<?php echo esc_attr( $cta_label ); ?>" style="width:100%;" />
			</div>

			<div style="margin-top:14px;">
				<label style="display:block; font-weight:600; margin-bottom:4px;">CTA Button URL</label>
				<input type="text" name="<?php echo esc_attr( "{$prefix}[cta_url]" ); ?>" value="<?php echo esc_attr( $cta_url ); ?>" style="width:100%;" />
			</div>
		</div>
	</div>
	<?php
}

/**
 * Renders Gallery block fields with multi-image selection.
 */
function gotg_render_gallery_fields( $prefix, array $b ) {
	$heading   = $b['heading'] ?? '';
	$layout    = $b['layout'] ?? 'grid';
	$image_ids = isset( $b['image_ids'] ) && is_array( $b['image_ids'] ) ? $b['image_ids'] : array();
	$ids_csv   = implode( ',', array_map( 'absint', $image_ids ) );
	?>
	<div style="display:flex; flex-direction:column; gap:14px;">
		<div style="display:grid; grid-template-columns:1fr 200px; gap:16px;">
			<div>
				<label style="display:block; font-weight:600; margin-bottom:4px;">Gallery Title</label>
				<input type="text" name="<?php echo esc_attr( "{$prefix}[heading]" ); ?>" value="<?php echo esc_attr( $heading ); ?>" style="width:100%; font-weight:600;" />
			</div>
			<div>
				<label style="display:block; font-weight:600; margin-bottom:4px;">Display Layout</label>
				<select name="<?php echo esc_attr( "{$prefix}[layout]" ); ?>" style="width:100%;">
					<option value="grid" <?php selected( $layout, 'grid' ); ?>>Grid (3 columns)</option>
					<option value="carousel" <?php selected( $layout, 'carousel' ); ?>>Carousel (Slider)</option>
				</select>
			</div>
		</div>

		<!-- Multi-image Gallery Box -->
		<div class="gotg-gallery-picker" style="background:#fafafa; border:1px solid #e0e0e0; border-radius:6px; padding:12px;">
			<label style="display:block; font-weight:600; margin-bottom:8px;">📸 Gallery Images (<?php echo esc_html( (string) count( $image_ids ) ); ?> photos selected)</label>
			
			<input type="hidden" class="gotg-gallery-ids-input" name="<?php echo esc_attr( "{$prefix}[image_ids_csv]" ); ?>" value="<?php echo esc_attr( $ids_csv ); ?>" />
			
			<div class="gotg-gallery-thumbnails" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
				<?php foreach ( $image_ids as $img_id ) : ?>
					<?php $img_id = absint( $img_id ); ?>
					<?php if ( ! $img_id ) continue; ?>
					<div class="gotg-gallery-thumb-item" data-id="<?php echo esc_attr( (string) $img_id ); ?>" style="position:relative; width:80px; height:80px; border-radius:4px; overflow:hidden; border:1px solid #ccc; background:#fff;">
						<?php echo wp_get_attachment_image( $img_id, 'thumbnail', false, array( 'style' => 'width:100%; height:100%; object-fit:cover;' ) ); ?>
						<button type="button" class="gotg-remove-thumb-btn" style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.65); color:#fff; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer; font-size:12px; line-height:1; display:flex; align-items:center; justify-content:center;">×</button>
					</div>
				<?php endforeach; ?>
			</div>

			<button type="button" class="button button-primary gotg-add-gallery-images-btn">Add Images to Gallery</button>
			<button type="button" class="button gotg-clear-gallery-btn" style="margin-left:8px;">Clear All</button>
		</div>
	</div>
	<?php
}

/**
 * Renders Text block fields.
 */
function gotg_render_text_block_fields( $prefix, array $b ) {
	$heading  = $b['heading'] ?? '';
	$body     = $b['body'] ?? '';
	$width    = $b['width'] ?? 'narrow';
	$align    = $b['align'] ?? 'center';
	$image_id = absint( $b['image_id'] ?? 0 );
	$video_id = absint( $b['video_id'] ?? 0 );
	?>
	<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
		<div style="grid-column:1 / -1;">
			<label style="display:block; font-weight:600; margin-bottom:4px;">Section Headline</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[heading]" ); ?>" value="<?php echo esc_attr( $heading ); ?>" style="width:100%; font-weight:600;" />
		</div>
		<div style="grid-column:1 / -1;">
			<label style="display:block; font-weight:600; margin-bottom:4px;">Content (HTML / Paragraphs)</label>
			<textarea name="<?php echo esc_attr( "{$prefix}[body]" ); ?>" rows="4" style="width:100%;"><?php echo esc_textarea( $body ); ?></textarea>
		</div>

		<!-- Optional Image / Photo -->
		<div>
			<div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:6px; padding:12px; height:100%;">
				<label style="display:block; font-weight:600; margin-bottom:6px;">🖼️ Optional Section Photo</label>
				<div class="gotg-media-picker" data-picker="image">
					<input type="hidden" class="gotg-media-id-input" name="<?php echo esc_attr( "{$prefix}[image_id]" ); ?>" value="<?php echo esc_attr( (string) $image_id ); ?>" />
					<div class="gotg-media-preview-box" style="margin-bottom:8px; min-height:80px; background:#fff; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center; border-radius:4px; overflow:hidden;">
						<?php if ( $image_id ) : ?>
							<?php echo wp_get_attachment_image( $image_id, 'medium', false, array( 'style' => 'max-height:120px; width:auto;' ) ); ?>
						<?php else : ?>
							<span style="color:#999; font-size:12px;">No image chosen</span>
						<?php endif; ?>
					</div>
					<button type="button" class="button gotg-choose-media-btn">Choose / Change Image</button>
					<button type="button" class="button gotg-remove-image-btn" style="<?php echo $image_id ? '' : 'display:none;'; ?>">Remove Image</button>
				</div>
			</div>
		</div>

		<!-- Optional Video -->
		<div>
			<div style="background:#fafafa; border:1px solid #e0e0e0; border-radius:6px; padding:12px; height:100%;">
				<label style="display:block; font-weight:600; margin-bottom:6px;">🎥 Optional Section Video (MP4)</label>
				<div class="gotg-media-picker" data-picker="video">
					<input type="hidden" class="gotg-media-id-input" name="<?php echo esc_attr( "{$prefix}[video_id]" ); ?>" value="<?php echo esc_attr( (string) $video_id ); ?>" />
					<div class="gotg-media-preview-box" style="margin-bottom:8px; min-height:80px; background:#fff; border:1px dashed #ccc; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:4px; padding:10px;">
						<?php if ( $video_id ) : ?>
							<span class="dashicons dashicons-video-alt3" style="font-size:28px; width:28px; height:28px; color:#2271b1; margin-bottom:4px;"></span>
							<strong style="font-size:12px;"><?php echo esc_html( basename( get_attached_file( $video_id ) ) ); ?></strong>
						<?php else : ?>
							<span style="color:#999; font-size:12px;">No video chosen</span>
						<?php endif; ?>
					</div>
					<button type="button" class="button gotg-choose-video-btn">Choose / Change Video</button>
					<button type="button" class="button gotg-remove-image-btn" style="<?php echo $video_id ? '' : 'display:none;'; ?>">Remove Video</button>
				</div>
			</div>
		</div>

		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Text Alignment</label>
			<select name="<?php echo esc_attr( "{$prefix}[align]" ); ?>" style="width:100%;">
				<option value="center" <?php selected( $align, 'center' ); ?>>Centered</option>
				<option value="left" <?php selected( $align, 'left' ); ?>>Left Aligned</option>
			</select>
		</div>
		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Container Width</label>
			<select name="<?php echo esc_attr( "{$prefix}[width]" ); ?>" style="width:100%;">
				<option value="narrow" <?php selected( $width, 'narrow' ); ?>>Narrow (Editorial Readability)</option>
				<option value="wide" <?php selected( $width, 'wide' ); ?>>Wide</option>
			</select>
		</div>
	</div>
	<?php
}

/**
 * Renders CTA Band fields.
 */
function gotg_render_cta_band_fields( $prefix, array $b ) {
	$heading   = $b['heading'] ?? '';
	$body      = $b['body'] ?? '';
	$style     = $b['style'] ?? 'brand';
	$cta_label = $b['cta_label'] ?? '';
	$cta_url   = $b['cta_url'] ?? '';
	$image_id  = absint( $b['image_id'] ?? 0 );
	?>
	<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
		<div style="grid-column:1 / -1;">
			<label style="display:block; font-weight:600; margin-bottom:4px;">Banner Headline</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[heading]" ); ?>" value="<?php echo esc_attr( $heading ); ?>" style="width:100%; font-weight:600;" />
		</div>
		<div style="grid-column:1 / -1;">
			<label style="display:block; font-weight:600; margin-bottom:4px;">Subtext</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[body]" ); ?>" value="<?php echo esc_attr( $body ); ?>" style="width:100%;" />
		</div>

		<!-- Optional Background Image -->
		<div style="grid-column:1 / -1; background:#fafafa; border:1px solid #e0e0e0; border-radius:6px; padding:12px;">
			<label style="display:block; font-weight:600; margin-bottom:6px;">🖼️ Background Photo (Optional Atmospheric Overlay)</label>
			<div class="gotg-media-picker" data-picker="image">
				<input type="hidden" class="gotg-media-id-input" name="<?php echo esc_attr( "{$prefix}[image_id]" ); ?>" value="<?php echo esc_attr( (string) $image_id ); ?>" />
				<div class="gotg-media-preview-box" style="margin-bottom:8px; min-height:80px; background:#fff; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center; border-radius:4px; overflow:hidden;">
					<?php if ( $image_id ) : ?>
						<?php echo wp_get_attachment_image( $image_id, 'medium', false, array( 'style' => 'max-height:120px; width:auto;' ) ); ?>
					<?php else : ?>
						<span style="color:#999; font-size:12px;">No custom image chosen (Uses default atmosphere)</span>
					<?php endif; ?>
				</div>
				<button type="button" class="button gotg-choose-media-btn">Choose / Change Image</button>
				<button type="button" class="button gotg-remove-image-btn" style="<?php echo $image_id ? '' : 'display:none;'; ?>">Remove Image</button>
			</div>
		</div>

		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Button Label</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[cta_label]" ); ?>" value="<?php echo esc_attr( $cta_label ); ?>" style="width:100%;" />
		</div>
		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Button URL</label>
			<input type="text" name="<?php echo esc_attr( "{$prefix}[cta_url]" ); ?>" value="<?php echo esc_attr( $cta_url ); ?>" style="width:100%;" />
		</div>
		<div>
			<label style="display:block; font-weight:600; margin-bottom:4px;">Visual Tone</label>
			<select name="<?php echo esc_attr( "{$prefix}[style]" ); ?>" style="width:100%;">
				<option value="brand" <?php selected( $style, 'brand' ); ?>>Brand Accent (Orange Ember)</option>
				<option value="ink" <?php selected( $style, 'ink' ); ?>>Dark Charcoal (Ink)</option>
			</select>
		</div>
	</div>
	<?php
}

/**
 * Generic fallback fields renderer for other block types.
 */
function gotg_render_generic_block_fields( $prefix, array $b ) {
	?>
	<div style="display:flex; flex-direction:column; gap:10px;">
		<?php foreach ( $b as $key => $val ) : ?>
			<?php if ( 'type' === $key ) continue; ?>
			<div>
				<label style="display:block; font-weight:600; font-size:12px; margin-bottom:2px;"><?php echo esc_html( ucfirst( str_replace( '_', ' ', $key ) ) ); ?></label>
				<?php if ( is_scalar( $val ) ) : ?>
					<input type="text" name="<?php echo esc_attr( "{$prefix}[{$key}]" ); ?>" value="<?php echo esc_attr( (string) $val ); ?>" style="width:100%;" />
				<?php endif; ?>
			</div>
		<?php endforeach; ?>
	</div>
	<?php
}

/**
 * Saves the Page Blocks when the page is updated.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 * @return void
 */
function gotg_save_page_blocks_box( $post_id, $post ) {
	if ( ! isset( $_POST['gotg_page_blocks_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['gotg_page_blocks_nonce'] ) ), 'gotg_save_page_blocks_box' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! current_user_can( 'edit_page', $post_id ) ) {
		return;
	}

	if ( ! isset( $_POST['gotg_blocks'] ) || ! is_array( $_POST['gotg_blocks'] ) ) {
		return;
	}

	$raw_blocks = wp_unslash( $_POST['gotg_blocks'] );
	$processed  = array();

	foreach ( $raw_blocks as $block ) {
		if ( ! is_array( $block ) || empty( $block['type'] ) ) {
			continue;
		}

		// Gallery block: convert image_ids_csv string into integer array if provided.
		if ( 'gallery' === $block['type'] && ! empty( $block['image_ids_csv'] ) ) {
			$ids = array_filter( array_map( 'absint', explode( ',', (string) $block['image_ids_csv'] ) ) );
			$block['image_ids'] = array_values( $ids );
			unset( $block['image_ids_csv'] );
		}

		$processed[] = $block;
	}

	$sanitized = gotg_sanitize_page_blocks( $processed );
	update_post_meta( $post_id, '_gotg_page_blocks', $sanitized );
}
add_action( 'save_post_page', 'gotg_save_page_blocks_box', 10, 2 );
