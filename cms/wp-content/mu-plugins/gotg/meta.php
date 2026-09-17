<?php
/**
 * Post meta and term meta registration.
 *
 * Every field is transcribed from the field tables in 03-CONTENT-MODEL.md.
 * Sanitize callbacks live in sanitizers.php and are referenced by name so a grep
 * for a callback finds every field that uses it.
 *
 * Two conventions from 03-CONTENT-MODEL.md govern this file:
 *
 * - Every key is `_gotg_`-prefixed. The leading underscore is load-bearing: it
 *   makes the meta protected, so WordPress refuses generic access without an
 *   explicit auth_callback and hides it from the Custom Fields panel (§0.1).
 * - `show_in_rest` is false on every registration (§0.2). Meta reaches the
 *   frontend only through `gotg/v1` shapers.
 *
 * Where a field table gives a default of "—", the registered default is the
 * empty value for its type. Numeric fields with no meaningful zero — latitude,
 * longitude, cover charge — register no default at all, so an unset coordinate
 * reads as empty rather than as the middle of the Atlantic.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers Menu Item post meta.
 *
 * @return void
 */
function gotg_register_menu_item_meta() {
	$post_type = 'gotg_menu_item';

	register_post_meta(
		$post_type,
		'_gotg_price_variants',
		array(
			'type'              => 'array',
			'single'            => true,
			'default'           => array(),
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_price_variants',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_description',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_textarea_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_availability',
		array(
			'type'              => 'array',
			'single'            => true,
			'default'           => array( 'breakfast', 'lunch', 'dinner' ),
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_daypart_list',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_is_featured',
		array(
			'type'              => 'boolean',
			'single'            => true,
			'default'           => false,
			'show_in_rest'      => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_is_available',
		array(
			'type'              => 'boolean',
			'single'            => true,
			'default'           => true,
			'show_in_rest'      => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_spice_level',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => 'none',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_key',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);
}
add_action( 'init', 'gotg_register_menu_item_meta' );

/**
 * Registers Event post meta.
 *
 * @return void
 */
function gotg_register_event_meta() {
	$post_type = 'gotg_event';

	register_post_meta(
		$post_type,
		'_gotg_start_datetime',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_datetime',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_end_datetime',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_datetime',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_event_type',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => 'live_music',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_key',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_performer_name',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_performer_url',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'esc_url_raw',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_summary',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_textarea_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_is_ticketed',
		array(
			'type'              => 'boolean',
			'single'            => true,
			'default'           => false,
			'show_in_rest'      => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_ticket_url',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'esc_url_raw',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	// No default: an unset cover charge means "free", which 0.00 would also mean.
	register_post_meta(
		$post_type,
		'_gotg_cover_charge',
		array(
			'type'              => 'number',
			'single'            => true,
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_money',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_is_recurring_instance',
		array(
			'type'              => 'boolean',
			'single'            => true,
			'default'           => false,
			'show_in_rest'      => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);
}
add_action( 'init', 'gotg_register_event_meta' );

/**
 * Registers Location post meta.
 *
 * @return void
 */
function gotg_register_location_meta() {
	$post_type = 'gotg_location';

	register_post_meta(
		$post_type,
		'_gotg_street_address',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_address_line_2',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_city',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => 'Simi Valley',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_state',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => 'CA',
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_two_letter_code',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_postal_code',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_country',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => 'US',
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_two_letter_code',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	// No default: 0.0 is a real coordinate, and an unset location must not
	// silently claim to be in the Gulf of Guinea.
	register_post_meta(
		$post_type,
		'_gotg_latitude',
		array(
			'type'              => 'number',
			'single'            => true,
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_float',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_longitude',
		array(
			'type'              => 'number',
			'single'            => true,
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_float',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_phone',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '805-842-2947',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_email',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_email',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_directions_url',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'esc_url_raw',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_parking_note',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_textarea_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_timezone',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => 'America/Los_Angeles',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_regular_hours',
		array(
			'type'              => 'array',
			'single'            => true,
			// Seven rows, Mon–Sun 06:00–21:00, produced by the sanitizer itself
			// so the default and a saved value can never drift apart.
			'default'           => gotg_sanitize_regular_hours( array() ),
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_regular_hours',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_hours_exceptions',
		array(
			'type'              => 'array',
			'single'            => true,
			'default'           => array(),
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_hours_exceptions',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);
}
add_action( 'init', 'gotg_register_location_meta' );

/**
 * Registers Reusable Block post meta.
 *
 * Stored in the same shape as one entry of `_gotg_page_blocks`. The
 * "exactly one block" and "not a reusable_block" rules are validator rules
 * (03-CONTENT-MODEL.md §6), not coercions.
 *
 * @return void
 */
function gotg_register_block_meta() {
	register_post_meta(
		'gotg_block',
		'_gotg_block',
		array(
			'type'              => 'array',
			'single'            => true,
			'default'           => array(),
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_page_blocks',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);
}
add_action( 'init', 'gotg_register_block_meta' );

/**
 * Registers the page builder meta on the core page post type.
 *
 * @return void
 */
function gotg_register_page_blocks_meta() {
	register_post_meta(
		'page',
		'_gotg_page_blocks',
		array(
			'type'              => 'array',
			'single'            => true,
			'default'           => array(),
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_page_blocks',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);
}
add_action( 'init', 'gotg_register_page_blocks_meta' );

/**
 * Registers per-post SEO meta on the page and event post types.
 *
 * The same five fields apply to both, so they are registered in a loop rather
 * than transcribed twice (03-CONTENT-MODEL.md §10.1).
 *
 * @return void
 */
function gotg_register_seo_meta() {
	$fields = array(
		'_gotg_seo_title'       => array(
			'type'              => 'string',
			'default'           => '',
			'sanitize_callback' => 'sanitize_text_field',
		),
		'_gotg_seo_description' => array(
			'type'              => 'string',
			'default'           => '',
			'sanitize_callback' => 'sanitize_textarea_field',
		),
		'_gotg_seo_image_id'    => array(
			'type'              => 'integer',
			'default'           => 0,
			'sanitize_callback' => 'absint',
		),
		'_gotg_seo_noindex'     => array(
			'type'              => 'boolean',
			'default'           => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
		),
		'_gotg_seo_canonical'   => array(
			'type'              => 'string',
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		),
	);

	foreach ( array( 'page', 'gotg_event' ) as $post_type ) {
		foreach ( $fields as $meta_key => $args ) {
			register_post_meta(
				$post_type,
				$meta_key,
				array(
					'type'              => $args['type'],
					'single'            => true,
					'default'           => $args['default'],
					'show_in_rest'      => false,
					'sanitize_callback' => $args['sanitize_callback'],
					'auth_callback'     => 'gotg_meta_auth_callback',
				)
			);
		}
	}
}
add_action( 'init', 'gotg_register_seo_meta' );

/**
 * Registers attachment meta.
 *
 * Registered on `attachment` rather than on any project post type: the blur
 * placeholder is a property of the image, so one generated value serves every
 * context that image appears in (03-CONTENT-MODEL.md §2.8).
 *
 * @return void
 */
function gotg_register_attachment_meta() {
	register_post_meta(
		'attachment',
		'_gotg_blur_data_url',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_data_uri',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);
}
add_action( 'init', 'gotg_register_attachment_meta' );

/**
 * Registers Menu Section term meta.
 *
 * @return void
 */
function gotg_register_menu_section_term_meta() {
	$taxonomy = 'gotg_menu_section';

	register_term_meta(
		$taxonomy,
		'_gotg_display_order',
		array(
			'type'              => 'integer',
			'single'            => true,
			'default'           => 10,
			'show_in_rest'      => false,
			'sanitize_callback' => 'absint',
			'auth_callback'     => 'gotg_term_meta_auth_callback',
		)
	);

	register_term_meta(
		$taxonomy,
		'_gotg_intro',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_textarea_field',
			'auth_callback'     => 'gotg_term_meta_auth_callback',
		)
	);

	register_term_meta(
		$taxonomy,
		'_gotg_image_id',
		array(
			'type'              => 'integer',
			'single'            => true,
			'default'           => 0,
			'show_in_rest'      => false,
			'sanitize_callback' => 'absint',
			'auth_callback'     => 'gotg_term_meta_auth_callback',
		)
	);

	register_term_meta(
		$taxonomy,
		'_gotg_is_hidden',
		array(
			'type'              => 'boolean',
			'single'            => true,
			'default'           => false,
			'show_in_rest'      => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
			'auth_callback'     => 'gotg_term_meta_auth_callback',
		)
	);
}
add_action( 'init', 'gotg_register_menu_section_term_meta' );

/**
 * Registers Dietary Tag term meta.
 *
 * `_gotg_description_text` is named to avoid confusion with the core term
 * description, which is unused (03-CONTENT-MODEL.md §8.1).
 *
 * @return void
 */
function gotg_register_dietary_term_meta() {
	$taxonomy = 'gotg_dietary';

	register_term_meta(
		$taxonomy,
		'_gotg_abbreviation',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_abbreviation',
			'auth_callback'     => 'gotg_term_meta_auth_callback',
		)
	);

	register_term_meta(
		$taxonomy,
		'_gotg_color',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => 'neutral',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_key',
			'auth_callback'     => 'gotg_term_meta_auth_callback',
		)
	);

	register_term_meta(
		$taxonomy,
		'_gotg_description_text',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_textarea_field',
			'auth_callback'     => 'gotg_term_meta_auth_callback',
		)
	);
}
add_action( 'init', 'gotg_register_dietary_term_meta' );
