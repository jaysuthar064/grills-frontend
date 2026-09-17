<?php
/**
 * Admin asset enqueuing.
 *
 * Each script is loaded only on the screens that need it, checked against
 * get_current_screen() (07-CODING-STANDARDS.md §1.2). Admin assets have no
 * build step — plain ES2017 and plain CSS, served as authored.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Absolute URL to the admin assets directory, with a trailing slash.
 *
 * @return string
 */
function gotg_admin_assets_url() {
	return plugin_dir_url( __FILE__ ) . 'assets/';
}

/**
 * Enqueues admin styles and screen-scoped scripts.
 *
 * @param string $hook_suffix Current admin page.
 * @return void
 */
function gotg_admin_enqueue_assets( $hook_suffix ) {
	$screen = get_current_screen();

	if ( ! $screen instanceof WP_Screen ) {
		return;
	}

	$base    = gotg_admin_assets_url();
	$version = '1.0.0';

	// Term add / edit screens for the taxonomies with custom fields.
	if ( in_array( $hook_suffix, array( 'edit-tags.php', 'term.php' ), true ) ) {
		if ( in_array( $screen->taxonomy, array( 'gotg_menu_section', 'gotg_dietary' ), true ) ) {
			wp_enqueue_style( 'gotg-admin', $base . 'gotg-admin.css', array(), $version );
		}

		// The Menu Section image uses the media modal.
		if ( 'gotg_menu_section' === $screen->taxonomy ) {
			wp_enqueue_media();
			wp_enqueue_script( 'gotg-media-field', $base . 'gotg-media-field.js', array(), $version, true );
		}

		return;
	}

	// GOTG Settings, Dashboard, and custom Page Editor pages.
	if ( 'grill-on-the-green_page_gotg-settings' === $hook_suffix
		|| 'toplevel_page_gotg-dashboard' === $hook_suffix
		|| false !== strpos( $hook_suffix, 'gotg-page' ) ) {
		wp_enqueue_style( 'gotg-admin', $base . 'gotg-admin.css', array(), $version );
		wp_enqueue_media();
		wp_enqueue_script( 'gotg-page-blocks', $base . 'gotg-page-blocks.js', array( 'jquery' ), $version, true );
		return;
	}

	if ( 'post.php' !== $hook_suffix && 'post-new.php' !== $hook_suffix ) {
		return;
	}

	$gotg_types = array( 'gotg_menu_item', 'gotg_event', 'gotg_location', 'gotg_block', 'page' );

	if ( ! in_array( $screen->post_type, $gotg_types, true ) ) {
		return;
	}

	wp_enqueue_style( 'gotg-admin', $base . 'gotg-admin.css', array(), $version );

	// Headless page blocks media picker and gallery scripts.
	if ( 'page' === $screen->post_type ) {
		wp_enqueue_media();
		wp_enqueue_script( 'gotg-page-blocks', $base . 'gotg-page-blocks.js', array( 'jquery' ), $version, true );
	}

	// The repeater is used by the menu item price variants and the location
	// hours exceptions.
	if ( in_array( $screen->post_type, array( 'gotg_menu_item', 'gotg_location' ), true ) ) {
		wp_enqueue_script( 'gotg-repeater', $base . 'gotg-repeater.js', array(), $version, true );
	}

	// Conditional field display is the event box only.
	if ( 'gotg_event' === $screen->post_type ) {
		wp_enqueue_script( 'gotg-conditional-fields', $base . 'gotg-conditional-fields.js', array(), $version, true );
	}
}
add_action( 'admin_enqueue_scripts', 'gotg_admin_enqueue_assets' );
