<?php
/**
 * Custom post type registration.
 *
 * Arguments are transcribed from 03-CONTENT-MODEL.md §§3–6. That document is
 * authoritative; if an argument here disagrees with it, the code is wrong.
 *
 * `show_in_rest` is false on every type (§0.2): the frontend reads `gotg/v1`
 * only, and core REST exposure would publish a second unshaped contract.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers the Menu Item post type.
 *
 * @return void
 */
function gotg_register_menu_item_post_type() {
	register_post_type(
		'gotg_menu_item',
		array(
			'labels'              => array(
				'name'          => __( 'Menu Items', 'gotg' ),
				'singular_name' => __( 'Menu Item', 'gotg' ),
				'add_new_item'  => __( 'Add New Menu Item', 'gotg' ),
				'edit_item'     => __( 'Edit Menu Item', 'gotg' ),
				'new_item'      => __( 'New Menu Item', 'gotg' ),
				'view_item'     => __( 'View Menu Item', 'gotg' ),
				'search_items'  => __( 'Search Menu Items', 'gotg' ),
				'not_found'     => __( 'No menu items found.', 'gotg' ),
				'menu_name'     => __( 'Menu Items', 'gotg' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => defined( 'GOTG_MENU_SLUG' ) ? GOTG_MENU_SLUG : true,
			'show_in_rest'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'hierarchical'        => false,
			'supports'            => array( 'title', 'thumbnail', 'revisions', 'page-attributes' ),
			'taxonomies'          => array( 'gotg_menu_section', 'gotg_dietary' ),
			'capability_type'     => 'post',
			'map_meta_cap'        => true,
		)
	);
}
add_action( 'init', 'gotg_register_menu_item_post_type' );

/**
 * Registers the Event post type.
 *
 * `editor` is supported. Because `show_in_rest` is false this is the classic
 * editor, not the block editor (03-CONTENT-MODEL.md §4).
 *
 * @return void
 */
function gotg_register_event_post_type() {
	register_post_type(
		'gotg_event',
		array(
			'labels'              => array(
				'name'          => __( 'Events', 'gotg' ),
				'singular_name' => __( 'Event', 'gotg' ),
				'add_new_item'  => __( 'Add New Event', 'gotg' ),
				'edit_item'     => __( 'Edit Event', 'gotg' ),
				'new_item'      => __( 'New Event', 'gotg' ),
				'search_items'  => __( 'Search Events', 'gotg' ),
				'not_found'     => __( 'No events found.', 'gotg' ),
				'menu_name'     => __( 'Events', 'gotg' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => defined( 'GOTG_MENU_SLUG' ) ? GOTG_MENU_SLUG : true,
			'show_in_rest'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'hierarchical'        => false,
			'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions', 'excerpt' ),
			'capability_type'     => 'post',
			'map_meta_cap'        => true,
		)
	);
}
add_action( 'init', 'gotg_register_event_post_type' );

/**
 * Registers the Location post type.
 *
 * A single location exists today. The post type exists rather than a settings
 * section so a second location costs no schema change
 * (03-CONTENT-MODEL.md §5).
 *
 * @return void
 */
function gotg_register_location_post_type() {
	register_post_type(
		'gotg_location',
		array(
			'labels'              => array(
				'name'          => __( 'Locations', 'gotg' ),
				'singular_name' => __( 'Location', 'gotg' ),
				'add_new_item'  => __( 'Add New Location', 'gotg' ),
				'edit_item'     => __( 'Edit Location', 'gotg' ),
				'new_item'      => __( 'New Location', 'gotg' ),
				'view_item'     => __( 'View Location', 'gotg' ),
				'search_items'  => __( 'Search Locations', 'gotg' ),
				'not_found'     => __( 'No locations found.', 'gotg' ),
				'menu_name'     => __( 'Locations', 'gotg' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => defined( 'GOTG_MENU_SLUG' ) ? GOTG_MENU_SLUG : true,
			'show_in_rest'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'hierarchical'        => false,
			'supports'            => array( 'title', 'revisions' ),
			'capability_type'     => 'post',
			'map_meta_cap'        => true,
		)
	);
}
add_action( 'init', 'gotg_register_location_post_type' );

/**
 * Registers the Reusable Block post type.
 *
 * Holds one page block that appears on more than one page. The shaper inlines
 * the referenced block into the page payload, so the frontend never learns that
 * a block was reusable (03-CONTENT-MODEL.md §6).
 *
 * @return void
 */
function gotg_register_block_post_type() {
	register_post_type(
		'gotg_block',
		array(
			'labels'              => array(
				'name'          => __( 'Reusable Blocks', 'gotg' ),
				'singular_name' => __( 'Reusable Block', 'gotg' ),
				'add_new_item'  => __( 'Add New Reusable Block', 'gotg' ),
				'edit_item'     => __( 'Edit Reusable Block', 'gotg' ),
				'new_item'      => __( 'New Reusable Block', 'gotg' ),
				'view_item'     => __( 'View Reusable Block', 'gotg' ),
				'search_items'  => __( 'Search Reusable Blocks', 'gotg' ),
				'not_found'     => __( 'No reusable blocks found.', 'gotg' ),
				'menu_name'     => __( 'Reusable Blocks', 'gotg' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => defined( 'GOTG_MENU_SLUG' ) ? GOTG_MENU_SLUG : true,
			'show_in_rest'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'hierarchical'        => false,
			'supports'            => array( 'title', 'revisions' ),
			'capability_type'     => 'post',
			'map_meta_cap'        => true,
		)
	);
}
add_action( 'init', 'gotg_register_block_post_type' );
