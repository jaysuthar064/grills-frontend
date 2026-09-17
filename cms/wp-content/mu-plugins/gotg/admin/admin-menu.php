<?php
/**
 * Headless CMS admin menu.
 *
 * Registers one top-level "Grill on the Green" sidebar entry and nests every
 * headless content type and the Site Settings page beneath it.
 *
 * The parent slug is `gotg-dashboard`, so each post type sets
 * `show_in_menu => 'gotg-dashboard'` to appear as a submenu child.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * The parent menu slug. Post types reference this value.
 */
define( 'GOTG_MENU_SLUG', 'gotg-dashboard' );

/**
 * Registers the top-level menu and its submenu pages.
 *
 * Order of add_submenu_page calls controls the submenu order.
 * Post types that use `show_in_menu => GOTG_MENU_SLUG` are appended after
 * these manually registered pages.
 *
 * @return void
 */
function gotg_register_admin_menu() {
	// ── Top-level menu ──────────────────────────────────────────────────
	add_menu_page(
		__( 'Grill on the Green', 'gotg' ),   // page title
		__( 'Grill on the Green', 'gotg' ),   // menu title
		'edit_posts',                          // capability
		GOTG_MENU_SLUG,                        // slug
		'gotg_render_dashboard_page',          // callback
		'dashicons-restaurant',                // icon
		3                                      // position: right below Dashboard
	);

	// ── Dashboard (replaces the auto-generated duplicate) ───────────────
	add_submenu_page(
		GOTG_MENU_SLUG,
		__( 'Dashboard', 'gotg' ),
		__( 'Dashboard', 'gotg' ),
		'edit_posts',
		GOTG_MENU_SLUG,
		'gotg_render_dashboard_page'
	);

	// ── Site Settings ──────────────────────────────────────────────────
	add_submenu_page(
		GOTG_MENU_SLUG,
		__( 'Site Settings', 'gotg' ),
		__( 'Site Settings', 'gotg' ),
		'manage_options',
		'gotg-settings',
		'gotg_render_settings_page'
	);

	// ── Visual Event Schedule & Calendar ───────────────────────────────
	add_submenu_page(
		GOTG_MENU_SLUG,
		__( 'Event Calendar', 'gotg' ),
		__( '📅 Event Calendar', 'gotg' ),
		'edit_posts',
		'gotg-event-calendar',
		'gotg_render_event_calendar_admin_page'
	);

	// ── Custom Headless Page Content Editor ─────────────────────────────
	add_submenu_page(
		GOTG_MENU_SLUG,
		__( 'Page Content Editor', 'gotg' ),
		__( '📄 Page Content Editor', 'gotg' ),
		'edit_pages',
		'gotg-page-editor',
		'gotg_render_custom_page_editor'
	);

	// ── Dedicated Page Submenus (Inside Custom Plugin) ───────────────────
	$pages_map = array(
		'home'    => __( '🏠 Home Page', 'gotg' ),
		'about'   => __( '⛳ About Page', 'gotg' ),
		'contact' => __( '📞 Contact Page', 'gotg' ),
		'menu'    => __( '🍽️ Menu Page', 'gotg' ),
		'events'  => __( '📅 Events Page', 'gotg' ),
	);

	foreach ( $pages_map as $slug => $title ) {
		add_submenu_page(
			GOTG_MENU_SLUG,
			$title,
			$title,
			'edit_pages',
			'admin.php?page=gotg-page-editor&page_slug=' . $slug
		);
	}
}
add_action( 'admin_menu', 'gotg_register_admin_menu' );

/**
 * Keeps the parent menu highlighted when editing a Page.
 *
 * WordPress does not know that Pages belong under our menu, so when the user
 * edits a page it un-highlights the parent. This filter corrects that.
 *
 * @param string $parent_file Current parent file.
 * @return string Corrected parent file.
 */
function gotg_fix_parent_menu_for_pages( $parent_file ) {
	$screen = get_current_screen();

	if ( $screen && 'page' === $screen->post_type ) {
		return GOTG_MENU_SLUG;
	}

	return $parent_file;
}
add_filter( 'parent_file', 'gotg_fix_parent_menu_for_pages' );

/**
 * Highlights the correct submenu item for Pages.
 *
 * @param string $submenu_file Current submenu file.
 * @return string Corrected submenu file.
 */
function gotg_fix_submenu_for_pages( $submenu_file ) {
	$screen = get_current_screen();

	if ( $screen && 'page' === $screen->post_type ) {
		return 'edit.php?post_type=page';
	}

	return $submenu_file;
}
add_filter( 'submenu_file', 'gotg_fix_submenu_for_pages' );

/**
 * Removes the default top-level Pages menu that WordPress auto-registers.
 *
 * @return void
 */
function gotg_remove_default_pages_menu() {
	remove_menu_page( 'edit.php?post_type=page' );
}
add_action( 'admin_menu', 'gotg_remove_default_pages_menu', 9999 );

/**
 * Redirects legacy edit.php?post_type=page to our custom Page Content Editor.
 */
function gotg_redirect_pages_to_editor() {
	global $pagenow;
	if ( is_admin() && 'edit.php' === $pagenow && isset( $_GET['post_type'] ) && 'page' === $_GET['post_type'] ) {
		wp_safe_redirect( admin_url( 'admin.php?page=gotg-page-editor' ) );
		exit;
	}
}
add_action( 'admin_init', 'gotg_redirect_pages_to_editor' );

/**
 * Renders the CMS dashboard page.
 *
 * @return void
 */
function gotg_render_dashboard_page() {
	$settings = gotg_get_site_settings();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Grill on the Green — Headless CMS', 'gotg' ); ?></h1>

		<div class="gotg-dashboard-grid" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1.5rem; margin-top:1.5rem;">

			<div class="card" style="padding:1.25rem;">
				<h2 style="margin-top:0;">🍖 Menu Items</h2>
				<p>Add, edit, and organise your restaurant menu.</p>
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=gotg_menu_item' ) ); ?>" class="button button-primary">Manage Menu</a>
			</div>

			<div class="card" style="padding:1.25rem;">
				<h2 style="margin-top:0;">📅 Events</h2>
				<p>Live music, specials, and private events.</p>
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=gotg_event' ) ); ?>" class="button button-primary">Manage Events</a>
			</div>

			<div class="card" style="padding:1.25rem;">
				<h2 style="margin-top:0;">📍 Locations</h2>
				<p>Address, hours, and contact information.</p>
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=gotg_location' ) ); ?>" class="button button-primary">Manage Locations</a>
			</div>

			<div class="card" style="padding:1.25rem;">
				<h2 style="margin-top:0;">📄 Page Content Editor</h2>
				<p>Edit text, titles, hero video, and gallery images.</p>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=gotg-page-editor' ) ); ?>" class="button button-primary">Open Page Editor</a>
			</div>

			<div class="card" style="padding:1.25rem;">
				<h2 style="margin-top:0;">🧩 Reusable Blocks</h2>
				<p>Shared content blocks across pages.</p>
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=gotg_block' ) ); ?>" class="button button-primary">Manage Blocks</a>
			</div>

			<div class="card" style="padding:1.25rem;">
				<h2 style="margin-top:0;">⚙️ Site Settings</h2>
				<p>Branding, navigation, SEO, and global config.</p>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=gotg-settings' ) ); ?>" class="button button-primary">Open Settings</a>
			</div>
		</div>

		<h2 style="margin-top:2.5rem; margin-bottom:0.5rem; font-size:1.3rem;">📄 Direct Page Content & Media Editors</h2>
		<p style="color:#646970; margin-top:0;">Click any page below to edit its text, headings, background images, and videos.</p>
		<div class="gotg-pages-grid" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1.25rem; margin-top:1rem;">
			<div class="card" style="padding:1.25rem; border-top:3px solid #2271b1;">
				<h3 style="margin-top:0;">🏠 Home Page</h3>
				<p style="color:#50575e; font-size:13px;">Edit hero video, poster image, headlines, catering split feature, and the food gallery.</p>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=gotg-page-editor&page_slug=home' ) ); ?>" class="button button-primary">Edit Home Content &amp; Media</a>
			</div>
			<div class="card" style="padding:1.25rem; border-top:3px solid #00a32a;">
				<h3 style="margin-top:0;">⛳ About Page</h3>
				<p style="color:#50575e; font-size:13px;">Edit the pitmaster story, smoker feature photos, and restaurant gallery grid.</p>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=gotg-page-editor&page_slug=about' ) ); ?>" class="button button-primary">Edit About Content &amp; Media</a>
			</div>
			<div class="card" style="padding:1.25rem; border-top:3px solid #d63638;">
				<h3 style="margin-top:0;">📞 Contact Page</h3>
				<p style="color:#50575e; font-size:13px;">Edit inquiry text, booking details, and re-usable location blocks.</p>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=gotg-page-editor&page_slug=contact' ) ); ?>" class="button button-primary">Edit Contact Content &amp; Media</a>
			</div>
		</div>

		<div style="margin-top:2rem; padding:1rem 1.25rem; background:#f0f6fc; border-left:4px solid #2271b1; border-radius:4px;">
			<strong>Headless architecture:</strong>
			The frontend is a separate Next.js application that reads content from the
			<code>gotg/v1</code> REST API. Changes saved here are reflected on the
			live site after the next page revalidation.
		</div>
	</div>
	<?php
}
