<?php
/**
 * Page block shaping.
 *
 * Blocks are a discriminated union on `type` (04-API-CONTRACT.md §4). The stored
 * shape is 03-CONTENT-MODEL.md §9.3; this file maps one to the other and
 * resolves the server-side block types.
 *
 * `reusable_block` never appears in a response — the shaper inlines the
 * referenced block's own layout object in its place, to a depth of one.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Builds the shaping context shared by every block on a page.
 *
 * @param array $global  The already-built `_global` object.
 * @param bool  $preview Whether draft content is included.
 * @return array Shaping context.
 */
function gotg_block_context( array $global, $preview = false ) {
	return array(
		'seoDefaults' => $global['seoDefaults'],
		'timezone'    => $global['hours']['timezone'],
		'preview'     => (bool) $preview,
	);
}

/**
 * Shapes an optional call to action from a block row.
 *
 * @param array  $block     Stored block row.
 * @param string $label_key Key holding the label.
 * @param string $url_key   Key holding the URL.
 * @return array|null Shaped CTA, or null when incomplete.
 */
function gotg_shape_block_cta( array $block, $label_key, $url_key ) {
	$label = isset( $block[ $label_key ] ) ? trim( (string) $block[ $label_key ] ) : '';
	$url   = isset( $block[ $url_key ] ) ? trim( (string) $block[ $url_key ] ) : '';

	if ( '' === $label || '' === $url ) {
		return null;
	}

	return gotg_shape_link( $label, $url );
}

/**
 * Copies an optional string key from a stored block into a shaped block.
 *
 * Implements ADR-0022 at the block level: an empty value produces no key.
 *
 * @param array  $shaped    Shaped block, by reference.
 * @param array  $block     Stored block.
 * @param string $out_key   Output key.
 * @param string $store_key Stored key.
 * @return void
 */
function gotg_block_optional_string( array &$shaped, array $block, $out_key, $store_key ) {
	$value = isset( $block[ $store_key ] ) ? trim( gotg_decode_text( $block[ $store_key ] ) ) : '';

	if ( '' !== $value ) {
		$shaped[ $out_key ] = $value;
	}
}

/**
 * Resolves a video attachment ID to a streaming-optimized URL.
 * Prefers .mp4 sibling over .mov for universal browser streaming support.
 *
 * @param int $video_id Media attachment ID.
 * @return string|null Resolved video URL or null.
 */
function gotg_resolve_video_url( $video_id ) {
	$video_id = absint( $video_id );
	if ( $video_id <= 0 ) {
		return null;
	}

	$video_url = wp_get_attachment_url( $video_id );
	if ( ! $video_url ) {
		return null;
	}

	if ( preg_match( '/\.mov$/i', $video_url ) ) {
		$mp4_url = preg_replace( '/\.mov$/i', '.mp4', $video_url );
		$upload_dir = wp_upload_dir();
		$mp4_file = str_replace( $upload_dir['baseurl'], $upload_dir['basedir'], $mp4_url );
		if ( file_exists( $mp4_file ) ) {
			return $mp4_url;
		}
	}

	return $video_url;
}

/**
 * Shapes a hero block.
 *
 * @param array $block Stored block.
 * @return array|null Shaped block, or null when its required image is missing.
 */
function gotg_shape_hero_block( array $block ) {
	$image = gotg_shape_image( $block['image_id'] ?? 0, 'gotg_hero' );

	if ( null === $image ) {
		return null;
	}

	$primary = gotg_shape_block_cta( $block, 'primary_cta_label', 'primary_cta_url' );

	if ( null === $primary ) {
		return null;
	}

	$shaped = array(
		'type'       => 'hero',
		'heading'    => gotg_decode_text( $block['heading'] ?? '' ),
		'image'      => $image,
		'overlay'    => (int) ( $block['overlay'] ?? 0 ),
		'primaryCta' => $primary,
	);

	// Resolve video attachment URL from the stored media library ID.
	$video_url = gotg_resolve_video_url( $block['video_id'] ?? 0 );
	if ( $video_url ) {
		$shaped['videoUrl'] = $video_url;
	}

	gotg_block_optional_string( $shaped, $block, 'subheading', 'subheading' );
	gotg_block_optional_string( $shaped, $block, 'eyebrow', 'eyebrow' );

	$secondary = gotg_shape_block_cta( $block, 'secondary_cta_label', 'secondary_cta_url' );

	if ( null !== $secondary ) {
		$shaped['secondaryCta'] = $secondary;
	}

	return $shaped;
}

/**
 * Shapes a text block.
 *
 * @param array $block Stored block.
 * @return array|null Shaped block, or null when the body is empty.
 */
function gotg_shape_text_block( array $block ) {
	$body = gotg_shape_html( $block['body'] ?? '' );

	if ( '' === $body ) {
		return null;
	}

	$shaped = array(
		'type'     => 'text',
		'bodyHtml' => $body,
		'width'    => 'wide' === ( $block['width'] ?? '' ) ? 'wide' : 'narrow',
		'align'    => 'center' === ( $block['align'] ?? '' ) ? 'center' : 'left',
	);

	$media_display = sanitize_key( (string) ( $block['media_display'] ?? 'auto' ) );
	$image_id      = absint( $block['image_id'] ?? 0 );
	$video_id      = absint( $block['video_id'] ?? 0 );

	if ( 'photo' === $media_display ) {
		if ( $image_id > 0 ) {
			$image = gotg_shape_image( $image_id, 'gotg_card' );
			if ( null !== $image ) {
				$shaped['image'] = $image;
			}
		}
	} elseif ( 'video' === $media_display ) {
		if ( $video_id > 0 ) {
			$video_url = gotg_resolve_video_url( $video_id );
			if ( $video_url ) {
				$shaped['videoUrl'] = $video_url;
			}
		}
		if ( $image_id > 0 ) {
			$image = gotg_shape_image( $image_id, 'gotg_card' );
			if ( null !== $image ) {
				$shaped['image'] = $image;
			}
		}
	} elseif ( 'none' === $media_display ) {
		// Suppress media output
	} else {
		// Default / auto mode
		if ( $image_id > 0 ) {
			$image = gotg_shape_image( $image_id, 'gotg_card' );
			if ( null !== $image ) {
				$shaped['image'] = $image;
			}
		}
		if ( $video_id > 0 ) {
			$video_url = gotg_resolve_video_url( $video_id );
			if ( $video_url ) {
				$shaped['videoUrl'] = $video_url;
			}
		}
	}

	gotg_block_optional_string( $shaped, $block, 'heading', 'heading' );

	return $shaped;
}

/**
 * Shapes a split feature block.
 *
 * @param array $block Stored block.
 * @return array|null Shaped block, or null when its required image is missing.
 */
function gotg_shape_split_feature_block( array $block ) {
	$image = gotg_shape_image( $block['image_id'] ?? 0, 'gotg_card' );

	if ( null === $image ) {
		return null;
	}

	$shaped = array(
		'type'      => 'split_feature',
		'heading'   => gotg_decode_text( $block['heading'] ?? '' ),
		'body'      => gotg_decode_text( $block['body'] ?? '' ),
		'image'     => $image,
		'imageSide' => 'right' === ( $block['image_side'] ?? '' ) ? 'right' : 'left',
	);

	$cta = gotg_shape_block_cta( $block, 'cta_label', 'cta_url' );

	if ( null !== $cta ) {
		$shaped['cta'] = $cta;
	}

	return $shaped;
}

/**
 * Shapes a gallery block.
 *
 * @param array $block Stored block.
 * @return array|null Shaped block, or null when no image resolves.
 */
function gotg_shape_gallery_block( array $block ) {
	$ids    = isset( $block['image_ids'] ) && is_array( $block['image_ids'] ) ? $block['image_ids'] : array();
	$images = array();

	foreach ( $ids as $id ) {
		$image = gotg_shape_image( $id, 'gotg_card' );

		if ( null !== $image ) {
			$images[] = $image;
		}
	}

	if ( empty( $images ) ) {
		return null;
	}

	$shaped = array(
		'type'   => 'gallery',
		'images' => $images,
		'layout' => 'carousel' === ( $block['layout'] ?? '' ) ? 'carousel' : 'grid',
	);

	gotg_block_optional_string( $shaped, $block, 'heading', 'heading' );

	return $shaped;
}

/**
 * Shapes a CTA band block.
 *
 * @param array $block Stored block.
 * @return array|null Shaped block, or null when its required CTA is incomplete.
 */
function gotg_shape_cta_band_block( array $block ) {
	$cta = gotg_shape_block_cta( $block, 'cta_label', 'cta_url' );

	if ( null === $cta ) {
		return null;
	}

	$style   = (string) ( $block['style'] ?? '' );
	$allowed = array( 'brand', 'ink', 'surface' );

	$shaped = array(
		'type'    => 'cta_band',
		'heading' => gotg_decode_text( $block['heading'] ?? '' ),
		'cta'     => $cta,
		'style'   => in_array( $style, $allowed, true ) ? $style : 'brand',
	);

	gotg_block_optional_string( $shaped, $block, 'body', 'body' );

	$image_id = absint( $block['image_id'] ?? 0 );
	if ( $image_id > 0 ) {
		$image = gotg_shape_image( $image_id, 'gotg_hero' );
		if ( null !== $image ) {
			$shaped['image'] = $image;
		}
	}

	return $shaped;
}

/**
 * Shapes a featured items block, resolving the items server-side.
 *
 * @param array $block Stored block.
 * @return array|null Shaped block, or null when no items resolve.
 */
function gotg_shape_featured_items_block( array $block ) {
	$mode = (string) ( $block['mode'] ?? 'auto' );

	if ( 'manual' === $mode ) {
		$ids = isset( $block['item_ids'] ) && is_array( $block['item_ids'] ) ? $block['item_ids'] : array();

		$posts = empty( $ids ) ? array() : get_posts(
			array(
				'post_type'      => 'gotg_menu_item',
				'post_status'    => 'publish',
				'post__in'       => array_map( 'absint', $ids ),
				'orderby'        => 'post__in',
				'posts_per_page' => 6,
				'no_found_rows'  => true,
			)
		);
	} else {
		$posts = get_posts(
			array(
				'post_type'      => 'gotg_menu_item',
				'post_status'    => 'publish',
				'posts_per_page' => 6,
				'orderby'        => array(
					'menu_order' => 'ASC',
					'title'      => 'ASC',
				),
				'no_found_rows'  => true,
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'   => '_gotg_is_featured',
						'value' => '1',
					),
				),
			)
		);
	}

	$items = gotg_shape_menu_items( $posts );

	if ( empty( $items ) ) {
		return null;
	}

	$shaped = array(
		'type'    => 'featured_items',
		'heading' => gotg_decode_text( $block['heading'] ?? '' ),
		'items'   => $items,
	);

	$label = isset( $block['cta_label'] ) ? trim( (string) $block['cta_label'] ) : '';

	if ( '' !== $label ) {
		$shaped['cta'] = gotg_shape_link( $label, '/menu' );
	}

	return $shaped;
}

/**
 * Shapes an events preview block, resolving the events server-side.
 *
 * @param array $block   Stored block.
 * @param array $context Shaping context.
 * @return array|null Shaped block, or null when it must be omitted.
 */
function gotg_shape_events_preview_block( array $block, array $context ) {
	$count = isset( $block['count'] ) ? (int) $block['count'] : 3;
	$count = max( 1, min( 6, $count ) );

	$posts  = gotg_get_upcoming_events( $context['timezone'], $count, $context['preview'] );
	$events = gotg_shape_events( $posts, $context['seoDefaults'], $context['timezone'] );

	$hide_when_empty = ! isset( $block['hide_when_empty'] ) || ! empty( $block['hide_when_empty'] );

	if ( empty( $events ) && $hide_when_empty ) {
		return null;
	}

	$shaped = array(
		'type'    => 'events_preview',
		'heading' => gotg_decode_text( $block['heading'] ?? '' ),
		'events'  => $events,
	);

	$label = isset( $block['cta_label'] ) ? trim( (string) $block['cta_label'] ) : '';

	if ( '' !== $label ) {
		$shaped['cta'] = gotg_shape_link( $label, '/events' );
	}

	return $shaped;
}

/**
 * Shapes a people block.
 *
 * @param array $block Stored block.
 * @return array|null Shaped block, or null when it holds nobody.
 */
function gotg_shape_people_block( array $block ) {
	$rows   = isset( $block['people'] ) && is_array( $block['people'] ) ? $block['people'] : array();
	$people = array();

	foreach ( $rows as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$name = isset( $row['name'] ) ? trim( gotg_decode_text( $row['name'] ) ) : '';

		if ( '' === $name ) {
			continue;
		}

		$person = array(
			'name' => $name,
			'role' => isset( $row['role'] ) ? gotg_decode_text( $row['role'] ) : '',
		);

		$bio = isset( $row['bio'] ) ? trim( gotg_decode_text( $row['bio'] ) ) : '';

		if ( '' !== $bio ) {
			$person['bio'] = $bio;
		}

		$photo = gotg_shape_image( $row['photo_id'] ?? 0, 'gotg_card' );

		if ( null !== $photo ) {
			$person['photo'] = $photo;
		}

		$people[] = $person;
	}

	if ( empty( $people ) ) {
		return null;
	}

	$shaped = array(
		'type'   => 'people',
		'people' => $people,
	);

	gotg_block_optional_string( $shaped, $block, 'heading', 'heading' );

	return $shaped;
}

/**
 * Shapes an Instagram feed block.
 *
 * @param array $block Stored block.
 * @return array Shaped block.
 */
function gotg_shape_instagram_block( array $block ) {
	$count   = isset( $block['count'] ) ? (int) $block['count'] : 6;
	$handle  = ltrim( gotg_decode_text( $block['handle'] ?? 'grillonthegreen_simi' ), '@' );
	$heading = gotg_decode_text( $block['heading'] ?? 'Fresh from the Pit' );

	$shaped = array(
		'type'    => 'instagram_feed',
		'heading' => '' !== $heading ? $heading : 'Fresh from the Pit',
		'handle'  => '' !== $handle ? $handle : 'grillonthegreen_simi',
		'count'   => max( 1, min( 12, $count ) ),
	);

	if ( ! empty( $block['subtitle'] ) ) {
		$shaped['subtitle'] = gotg_decode_text( $block['subtitle'] );
	}

	if ( ! empty( $block['profile_url'] ) ) {
		$shaped['profileUrl'] = (string) $block['profile_url'];
	} else if ( '' !== $handle ) {
		$shaped['profileUrl'] = "https://www.instagram.com/{$handle}/";
	}

	$posts_raw = isset( $block['posts'] ) && is_array( $block['posts'] ) ? $block['posts'] : array();
	$posts     = array();

	foreach ( $posts_raw as $idx => $p ) {
		if ( ! is_array( $p ) ) {
			continue;
		}

		$image_id  = isset( $p['image_id'] ) ? absint( $p['image_id'] ) : 0;
		$image_url = isset( $p['image_url'] ) ? trim( (string) $p['image_url'] ) : '';
		$caption   = isset( $p['caption'] ) ? gotg_decode_text( $p['caption'] ) : '';
		$permalink = isset( $p['permalink'] ) ? trim( (string) $p['permalink'] ) : '';

		// Shape image: from WP attachment or direct URL
		$image = null;
		if ( $image_id > 0 ) {
			$image = gotg_shape_image( $image_id, 'gotg_card' );
		}
		if ( null === $image && '' !== $image_url ) {
			$image = array(
				'src'    => $image_url,
				'alt'    => $caption ? $caption : 'Grill on the Green Instagram feature',
				'width'  => 800,
				'height' => 800,
			);
		}

		if ( null !== $image || '' !== $permalink ) {
			$is_reel = ! empty( $p['is_reel'] ) || ( '' !== $permalink && false !== strpos( $permalink, '/reel/' ) );
			$posts[] = array(
				'id'        => 'post-' . ( $idx + 1 ),
				'permalink' => '' !== $permalink ? $permalink : ( $shaped['profileUrl'] ?? "https://www.instagram.com/{$handle}/" ),
				'image'     => $image ? $image : array(
					'src'    => '/media/instagram/post-' . ( ( $idx % 6 ) + 1 ) . '.jpg',
					'alt'    => $caption ? $caption : 'Grill on the Green Instagram feature',
					'width'  => 800,
					'height' => 800,
				),
				'caption'   => $caption,
				'isReel'    => (bool) $is_reel,
			);
		}
	}

	if ( ! empty( $posts ) ) {
		$shaped['posts'] = array_slice( $posts, 0, $shaped['count'] );
	}

	return $shaped;
}

/**
 * Shapes one stored block row.
 *
 * @param array $block   Stored block.
 * @param array $context Shaping context.
 * @return array|null Shaped block, or null when it must be omitted.
 */
function gotg_shape_block( array $block, array $context ) {
	$type = isset( $block['type'] ) ? (string) $block['type'] : '';

	switch ( $type ) {
		case 'hero':
			return gotg_shape_hero_block( $block );

		case 'text':
			return gotg_shape_text_block( $block );

		case 'split_feature':
			return gotg_shape_split_feature_block( $block );

		case 'gallery':
			return gotg_shape_gallery_block( $block );

		case 'cta_band':
			return gotg_shape_cta_band_block( $block );

		case 'featured_items':
			return gotg_shape_featured_items_block( $block );

		case 'events_preview':
			return gotg_shape_events_preview_block( $block, $context );

		case 'people':
			return gotg_shape_people_block( $block );

		case 'instagram_feed':
			return gotg_shape_instagram_block( $block );

		default:
			// An unregistered type has no interface in the union; it cannot be
			// returned. It survives in meta and renders in the admin (§9.2).
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					sprintf( 'gotg: unknown block type "%s"; omitted from the payload.', $type )
				);
			}

			return null;
	}
}

/**
 * Resolves a reusable block reference to the block it provides.
 *
 * Resolution depth is one: a reusable block cannot contain another
 * (04-API-CONTRACT.md §4).
 *
 * @param array $block Stored reusable_block row.
 * @return array|null The referenced stored block row, or null when unresolvable.
 */
function gotg_resolve_reusable_block( array $block ) {
	$ref_id = isset( $block['block_ref_id'] ) ? absint( $block['block_ref_id'] ) : 0;

	if ( $ref_id <= 0 ) {
		return null;
	}

	$referenced = get_post( $ref_id );

	if ( ! $referenced instanceof WP_Post
		|| 'gotg_block' !== $referenced->post_type
		|| 'publish' !== $referenced->post_status
	) {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				sprintf( 'gotg: reusable block %d is missing or unpublished; entry omitted.', $ref_id )
			);
		}

		return null;
	}

	$stored = get_post_meta( $referenced->ID, '_gotg_block', true );

	if ( ! is_array( $stored ) || empty( $stored ) ) {
		return null;
	}

	// Stored as a list holding exactly one entry (03-CONTENT-MODEL.md §6).
	$inner = isset( $stored['type'] ) ? $stored : ( $stored[0] ?? null );

	if ( ! is_array( $inner ) || ! isset( $inner['type'] ) || 'reusable_block' === $inner['type'] ) {
		return null;
	}

	return $inner;
}

/**
 * Shapes a stored page-blocks array into the API blocks array.
 *
 * @param mixed $stored  Raw `_gotg_page_blocks` meta value.
 * @param array $context Shaping context from gotg_block_context().
 * @return array Shaped blocks, in editor order.
 */
function gotg_shape_blocks( $stored, array $context ) {
	if ( ! is_array( $stored ) ) {
		return array();
	}

	$blocks = array();

	foreach ( $stored as $block ) {
		if ( ! is_array( $block ) || ! isset( $block['type'] ) ) {
			continue;
		}

		if ( 'reusable_block' === $block['type'] ) {
			$block = gotg_resolve_reusable_block( $block );

			if ( null === $block ) {
				continue;
			}
		}

		$shaped = gotg_shape_block( $block, $context );

		if ( null !== $shaped ) {
			$blocks[] = $shaped;
		}
	}

	return $blocks;
}
