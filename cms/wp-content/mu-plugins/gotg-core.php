<?php
/**
 * Plugin Name:  Grill on the Green — Core
 * Description:  Registers the project's post types, taxonomies, meta, and site settings.
 * Version:      1.0.0
 * Requires PHP: 8.1
 * Text Domain:  gotg
 *
 * Bootstrap only. This file requires the implementation files in ./gotg/ in an
 * explicit order and contains no logic of its own. The directory structure is
 * fixed by 07-CODING-STANDARDS.md §1.2.
 *
 * Files in a mu-plugins subdirectory are not auto-loaded by WordPress, so this
 * top-level file is the single entry point.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Absolute path to the implementation directory, with a trailing slash.
 */
define( 'GOTG_CORE_PATH', __DIR__ . '/gotg/' );

// Sanitizers first: every later file references them by name.
require_once GOTG_CORE_PATH . 'sanitizers.php';

require_once GOTG_CORE_PATH . 'post-types.php';
require_once GOTG_CORE_PATH . 'taxonomies.php';
require_once GOTG_CORE_PATH . 'meta.php';
require_once GOTG_CORE_PATH . 'settings.php';

// REST layer. Shapers load before the routes that delegate to them.
require_once GOTG_CORE_PATH . 'rest/shape-image.php';
require_once GOTG_CORE_PATH . 'rest/shape-global.php';
require_once GOTG_CORE_PATH . 'rest/shape-menu-item.php';
require_once GOTG_CORE_PATH . 'rest/shape-event.php';
require_once GOTG_CORE_PATH . 'rest/shape-blocks.php';
require_once GOTG_CORE_PATH . 'rest/preview.php';
require_once GOTG_CORE_PATH . 'rest/routes.php';
require_once GOTG_CORE_PATH . 'rest/endpoint-home.php';
require_once GOTG_CORE_PATH . 'rest/endpoint-about.php';
require_once GOTG_CORE_PATH . 'rest/endpoint-menu.php';
require_once GOTG_CORE_PATH . 'rest/endpoint-events.php';
require_once GOTG_CORE_PATH . 'rest/endpoint-contact.php';

// Admin edit-screen UI. Only loaded in the admin; the framework loads before
// the box files that call it.
if ( is_admin() ) {
	require_once GOTG_CORE_PATH . 'admin/admin-menu.php';
	require_once GOTG_CORE_PATH . 'admin/settings-page.php';
	require_once GOTG_CORE_PATH . 'admin/meta-box-framework.php';
	require_once GOTG_CORE_PATH . 'admin/fields.php';
	require_once GOTG_CORE_PATH . 'admin/enqueue.php';
	require_once GOTG_CORE_PATH . 'admin/box-menu-item.php';
	require_once GOTG_CORE_PATH . 'admin/box-event.php';
	require_once GOTG_CORE_PATH . 'admin/box-location.php';
	require_once GOTG_CORE_PATH . 'admin/box-page-blocks.php';
	require_once GOTG_CORE_PATH . 'admin/pages-editor.php';
	require_once GOTG_CORE_PATH . 'admin/term-fields.php';
	require_once GOTG_CORE_PATH . 'admin/event-admin.php';
}

// Seed command. CLI only — never loaded on a web request. The data file loads
// before the command that reads it.
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require_once GOTG_CORE_PATH . 'cli/seed-data.php';
	require_once GOTG_CORE_PATH . 'cli/class-seed-command.php';
}
