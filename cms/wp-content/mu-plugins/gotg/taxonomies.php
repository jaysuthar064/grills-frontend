<?php
/**
 * Taxonomy registration.
 *
 * Arguments are transcribed from 03-CONTENT-MODEL.md §§7–8.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Returns a meta box callback name only once it is defined.
 *
 * The custom `meta_box_cb` callbacks named in 03-CONTENT-MODEL.md §§7–8 are
 * built with the admin UI, which lands after this registration layer. Passing
 * the name of a function that does not yet exist makes WordPress fatal on the
 * menu item edit screen, so until the admin files define them the taxonomy falls
 * back to the WordPress default box. This guard removes itself: once the
 * callback exists the documented value is used, with no change here.
 *
 * @param string $callback Callback function name.
 * @return string|null The callback name, or null to use the WordPress default.
 */
function gotg_taxonomy_meta_box_cb( $callback ) {
	return function_exists( $callback ) ? $callback : null;
}

/**
 * Registers the Menu Section taxonomy.
 *
 * Hierarchical so a section can nest one level. Nesting deeper than two levels
 * is not supported by MenuSection in 06-COMPONENT-SPEC.md and must not be
 * created.
 *
 * @return void
 */
function gotg_register_menu_section_taxonomy() {
	register_taxonomy(
		'gotg_menu_section',
		array( 'gotg_menu_item' ),
		array(
			'labels'             => array(
				'name'          => __( 'Menu Sections', 'gotg' ),
				'singular_name' => __( 'Menu Section', 'gotg' ),
				'add_new_item'  => __( 'Add New Menu Section', 'gotg' ),
				'edit_item'     => __( 'Edit Menu Section', 'gotg' ),
				'menu_name'     => __( 'Menu Sections', 'gotg' ),
			),
			'public'             => false,
			'publicly_queryable' => false,
			'show_ui'            => true,
			'show_admin_column'  => true,
			'show_in_rest'       => false,
			'hierarchical'       => true,
			'rewrite'            => false,
			'meta_box_cb'        => gotg_taxonomy_meta_box_cb( 'gotg_render_single_section_meta_box' ),
		)
	);
}
add_action( 'init', 'gotg_register_menu_section_taxonomy' );

/**
 * Registers the Dietary Tag taxonomy.
 *
 * Fixed vocabulary. The custom meta box callback renders checkboxes over
 * existing terms and omits the "Add New" control, so new dietary claims cannot
 * be invented while editing an item (03-CONTENT-MODEL.md §8).
 *
 * @return void
 */
function gotg_register_dietary_taxonomy() {
	register_taxonomy(
		'gotg_dietary',
		array( 'gotg_menu_item' ),
		array(
			'labels'             => array(
				'name'          => __( 'Dietary Tags', 'gotg' ),
				'singular_name' => __( 'Dietary Tag', 'gotg' ),
				'add_new_item'  => __( 'Add New Dietary Tag', 'gotg' ),
				'edit_item'     => __( 'Edit Dietary Tag', 'gotg' ),
				'menu_name'     => __( 'Dietary Tags', 'gotg' ),
			),
			'public'             => false,
			'publicly_queryable' => false,
			'show_ui'            => true,
			'show_admin_column'  => true,
			'show_in_rest'       => false,
			'hierarchical'       => false,
			'rewrite'            => false,
			'meta_box_cb'        => gotg_taxonomy_meta_box_cb( 'gotg_render_fixed_dietary_meta_box' ),
		)
	);
}
add_action( 'init', 'gotg_register_dietary_taxonomy' );

/**
 * Forces a menu item to hold at most one gotg_menu_section term.
 *
 * The radio meta box cannot express more than one selection, but WP-CLI, the
 * seed script, and any other path bypass it. This correction is the mechanism
 * that actually enforces the 1..1 cardinality (03-CONTENT-MODEL.md §7.3).
 *
 * @param int $post_id Post being saved.
 * @return void
 */
function gotg_enforce_single_menu_section( $post_id ) {
	if ( 'gotg_menu_item' !== get_post_type( $post_id ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	$terms = wp_get_object_terms( $post_id, 'gotg_menu_section', array( 'fields' => 'ids' ) );

	if ( is_wp_error( $terms ) || count( $terms ) <= 1 ) {
		return;
	}

	wp_set_object_terms( $post_id, array( (int) $terms[0] ), 'gotg_menu_section', false );
}
add_action( 'save_post', 'gotg_enforce_single_menu_section', 20, 1 );
