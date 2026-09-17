<?php
/**
 * GET /wp-json/gotg/v1/menu
 *
 * Serves the `/menu` route. Shape: 04-API-CONTRACT.md §5.2.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Shapes one menu section term and the items it holds.
 *
 * Returns null when the section holds no items, because an empty section is
 * excluded from `sections` (04-API-CONTRACT.md §5.2). A parent with no items of
 * its own survives when a child does, so a grouping term is not lost.
 *
 * @param WP_Term  $term       Section term.
 * @param WP_Term[] $all_terms All visible section terms.
 * @param array    $collected  Dietary tags seen so far, by slug, by reference.
 * @return array|null Shaped section, or null when it and its children are empty.
 */
function gotg_shape_menu_section( WP_Term $term, array $all_terms, array &$collected ) {
	$posts = get_posts(
		array(
			'post_type'      => 'gotg_menu_item',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => array(
				'menu_order' => 'ASC',
				'title'      => 'ASC',
			),
			'no_found_rows'  => true,
			'tax_query'      => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				array(
					'taxonomy'         => 'gotg_menu_section',
					'field'            => 'term_id',
					'terms'            => $term->term_id,
					'include_children' => false,
				),
			),
		)
	);

	$items = gotg_shape_menu_items( $posts );

	foreach ( $items as $item ) {
		foreach ( $item['dietaryTags'] as $tag ) {
			$collected[ $tag['slug'] ] = $tag;
		}
	}

	$children = array();

	foreach ( $all_terms as $candidate ) {
		if ( (int) $candidate->parent !== (int) $term->term_id ) {
			continue;
		}

		$child = gotg_shape_menu_section( $candidate, $all_terms, $collected );

		if ( null !== $child ) {
			$children[] = $child;
		}
	}

	if ( empty( $items ) && empty( $children ) ) {
		return null;
	}

	$section = array(
		'slug'     => (string) $term->slug,
		'title'    => gotg_decode_text( $term->name ),
		'order'    => (int) get_term_meta( $term->term_id, '_gotg_display_order', true ),
		'items'    => $items,
		'children' => $children,
	);

	$intro = gotg_decode_text( get_term_meta( $term->term_id, '_gotg_intro', true ) );

	if ( '' !== $intro ) {
		$section['intro'] = $intro;
	}

	$image = gotg_shape_image( get_term_meta( $term->term_id, '_gotg_image_id', true ), 'gotg_card' );

	if ( null !== $image ) {
		$section['image'] = $image;
	}

	return $section;
}

/**
 * Returns the menu page payload.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return WP_REST_Response|WP_Error Response, or an error.
 */
function gotg_rest_menu( WP_REST_Request $request ) {
	$base = gotg_rest_page_base( 'menu', $request );

	if ( is_wp_error( $base ) ) {
		return $base;
	}

	$settings = gotg_get_site_settings();

	$terms = get_terms(
		array(
			'taxonomy'   => 'gotg_menu_section',
			'hide_empty' => false,
			'orderby'    => 'name',
			'order'      => 'ASC',
		)
	);

	if ( is_wp_error( $terms ) ) {
		$terms = array();
	}

	// Hidden sections never reach the payload, and neither do their children.
	$visible = array();

	foreach ( $terms as $term ) {
		if ( get_term_meta( $term->term_id, '_gotg_is_hidden', true ) ) {
			continue;
		}

		$visible[] = $term;
	}

	// Ordered by display order, then name — the tie-break in §5.2.
	usort(
		$visible,
		static function ( $a, $b ) {
			$order_a = (int) get_term_meta( $a->term_id, '_gotg_display_order', true );
			$order_b = (int) get_term_meta( $b->term_id, '_gotg_display_order', true );

			if ( $order_a === $order_b ) {
				return strcmp( $a->name, $b->name );
			}

			return $order_a <=> $order_b;
		}
	);

	$collected = array();
	$sections  = array();

	foreach ( $visible as $term ) {
		// Children are nested by their parent; they never appear at top level.
		if ( 0 !== (int) $term->parent ) {
			continue;
		}

		$section = gotg_shape_menu_section( $term, $visible, $collected );

		if ( null !== $section ) {
			$sections[] = $section;
		}
	}

	$dayparts = $settings['daypart_windows'] ?? array();
	$shaped_dayparts = array();

	if ( is_array( $dayparts ) ) {
		foreach ( $dayparts as $window ) {
			if ( ! is_array( $window ) || empty( $window['key'] ) ) {
				continue;
			}

			$shaped_dayparts[] = array(
				'key'    => (string) $window['key'],
				'label'  => gotg_decode_text( $window['label'] ?? '' ),
				'starts' => (string) ( $window['starts'] ?? '' ),
				'ends'   => (string) ( $window['ends'] ?? '' ),
			);
		}
	}

	$default_daypart = (string) ( $settings['default_daypart'] ?? 'auto' );
	$allowed_default = array( 'auto', 'all', 'breakfast', 'lunch', 'dinner' );

	$payload = $base['payload'];

	$payload['dayparts']          = $shaped_dayparts;
	$payload['defaultDaypart']    = in_array( $default_daypart, $allowed_default, true ) ? $default_daypart : 'auto';
	$payload['sections']          = $sections;
	$payload['dietaryTags']       = array_values( $collected );
	$payload['showDietaryLegend'] = ! empty( $settings['show_dietary_legend'] );
	$payload['disclaimer']        = gotg_decode_text( $settings['menu_disclaimer'] ?? '' );

	return rest_ensure_response( $payload );
}
