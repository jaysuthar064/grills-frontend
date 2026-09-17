<?php
/**
 * Menu item and dietary tag shaping.
 *
 * Transcribed from 04-API-CONTRACT.md §6.3 and §2.1.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Shapes stored price variants into the API array.
 *
 * Always an array, never a scalar, even for a single-priced item
 * (04-API-CONTRACT.md §2.1). `label` is omitted when empty per ADR-0022, so a
 * single unlabelled variant serialises as `[{"amount":13.5}]`.
 *
 * @param mixed $stored Raw _gotg_price_variants meta value.
 * @return array<int, array{amount: float, label?: string}> Shaped variants.
 */
function gotg_shape_price_variants( $stored ) {
	if ( ! is_array( $stored ) ) {
		return array();
	}

	$shaped = array();

	foreach ( $stored as $row ) {
		if ( ! is_array( $row ) || ! isset( $row['amount'] ) || ! is_numeric( $row['amount'] ) ) {
			continue;
		}

		$amount = round( (float) $row['amount'], 2 );

		if ( $amount < 0 ) {
			continue;
		}

		$variant = array( 'amount' => $amount );
		$label   = isset( $row['label'] ) ? trim( (string) $row['label'] ) : '';

		if ( '' !== $label ) {
			$variant['label'] = $label;
		}

		$shaped[] = $variant;
	}

	return array_slice( $shaped, 0, 6 );
}

/**
 * Shapes the availability daypart list.
 *
 * @param int $post_id Menu item ID.
 * @return string[] Daypart keys.
 */
function gotg_shape_availability( $post_id ) {
	$stored = get_post_meta( $post_id, '_gotg_availability', true );

	if ( ! is_array( $stored ) ) {
		return array();
	}

	$allowed = array( 'breakfast', 'lunch', 'dinner' );

	return array_values( array_intersect( array_map( 'strval', $stored ), $allowed ) );
}

/**
 * Shapes the spice level, falling back to the documented default.
 *
 * @param int $post_id Menu item ID.
 * @return string One of none, mild, medium, hot.
 */
function gotg_shape_spice_level( $post_id ) {
	$level   = (string) get_post_meta( $post_id, '_gotg_spice_level', true );
	$allowed = array( 'none', 'mild', 'medium', 'hot' );

	return in_array( $level, $allowed, true ) ? $level : 'none';
}

/**
 * Shapes one dietary term.
 *
 * @param WP_Term $term Dietary term.
 * @return array Shaped dietary tag.
 */
function gotg_shape_dietary_term( WP_Term $term ) {
	$color   = (string) get_term_meta( $term->term_id, '_gotg_color', true );
	$allowed = array( 'neutral', 'green', 'amber', 'red' );

	return array(
		'slug'         => (string) $term->slug,
		'name'         => gotg_decode_text( $term->name ),
		'abbreviation' => gotg_decode_text( get_term_meta( $term->term_id, '_gotg_abbreviation', true ) ),
		'color'        => in_array( $color, $allowed, true ) ? $color : 'neutral',
		'description'  => gotg_decode_text( get_term_meta( $term->term_id, '_gotg_description_text', true ) ),
	);
}

/**
 * Shapes the dietary tags assigned to a menu item.
 *
 * @param int $post_id Menu item ID.
 * @return array Shaped dietary tags.
 */
function gotg_shape_dietary_tags( $post_id ) {
	$terms = get_the_terms( $post_id, 'gotg_dietary' );

	if ( ! is_array( $terms ) ) {
		return array();
	}

	$tags = array();

	foreach ( $terms as $term ) {
		$tags[] = gotg_shape_dietary_term( $term );
	}

	return $tags;
}

/**
 * Shapes a menu item post into the API menu item object.
 *
 * Call update_meta_cache() for the full ID set before invoking this in a loop.
 *
 * @param WP_Post $post Menu item post.
 * @return array|null Shaped item, or null when the item must be excluded.
 */
function gotg_shape_menu_item( WP_Post $post ) {
	if ( ! get_post_meta( $post->ID, '_gotg_is_available', true ) ) {
		return null;
	}

	$variants = gotg_shape_price_variants(
		get_post_meta( $post->ID, '_gotg_price_variants', true )
	);

	if ( empty( $variants ) ) {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				sprintf( 'gotg: menu item %d has no price variants; excluded.', $post->ID )
			);
		}

		return null;
	}

	$item = array(
		'id'            => (int) $post->ID,
		'slug'          => (string) $post->post_name,
		'name'          => gotg_decode_text( get_the_title( $post ) ),
		'priceVariants' => $variants,
		'availability'  => gotg_shape_availability( $post->ID ),
		'dietaryTags'   => gotg_shape_dietary_tags( $post->ID ),
		'isFeatured'    => (bool) get_post_meta( $post->ID, '_gotg_is_featured', true ),
		'spiceLevel'    => gotg_shape_spice_level( $post->ID ),
	);

	$description = gotg_decode_text( get_post_meta( $post->ID, '_gotg_description', true ) );

	if ( '' !== $description ) {
		$item['description'] = $description;
	}

	$image = gotg_shape_image( get_post_thumbnail_id( $post->ID ), 'gotg_card' );

	if ( null !== $image ) {
		$item['image'] = $image;
	}

	return $item;
}

/**
 * Shapes a list of menu item posts, priming the meta cache once.
 *
 * The single update_meta_cache() call is the rule in 04-API-CONTRACT.md §5.2:
 * a 300-item menu costs one meta query rather than eighteen hundred.
 *
 * @param WP_Post[] $posts Menu item posts.
 * @return array Shaped items, excluding those that must not be returned.
 */
function gotg_shape_menu_items( array $posts ) {
	if ( empty( $posts ) ) {
		return array();
	}

	$ids = array();

	foreach ( $posts as $post ) {
		$ids[] = (int) $post->ID;
	}

	update_meta_cache( 'post', $ids );

	$items = array();

	foreach ( $posts as $post ) {
		$item = gotg_shape_menu_item( $post );

		if ( null !== $item ) {
			$items[] = $item;
		}
	}

	return $items;
}
