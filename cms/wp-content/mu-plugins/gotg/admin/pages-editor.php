<?php
/**
 * Custom Headless Page Content & Media Editor.
 *
 * Provides a dedicated, user-friendly CMS screen inside the custom plugin
 * (admin.php?page=gotg-page-editor) to manage page text, headings, background images,
 * and videos without redirecting to standard WordPress post editing screens.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Returns available headless pages for editing.
 *
 * @return array<string, array{title: string, default_id: int, path: string, icon: string}>
 */
function gotg_get_editor_pages_map() {
	return array(
		'home'    => array(
			'title'      => __( 'Home Page', 'gotg' ),
			'menu_title' => __( '🏠 Home Page', 'gotg' ),
			'default_id' => 12,
			'path'       => '/',
			'icon'       => 'dashicons-admin-home',
			'desc'       => __( 'Hero video banner, Slow-smoked intro, Catering showcase, and Fresh from the Pit gallery.', 'gotg' ),
		),
		'about'   => array(
			'title'      => __( 'About Page', 'gotg' ),
			'menu_title' => __( '⛳ About Page', 'gotg' ),
			'default_id' => 15,
			'path'       => '/about',
			'icon'       => 'dashicons-info',
			'desc'       => __( 'Pitmaster story, Oak & smoke feature photo, and Around the Pit restaurant photo gallery.', 'gotg' ),
		),
		'contact' => array(
			'title'      => __( 'Contact Page', 'gotg' ),
			'menu_title' => __( '📞 Contact Page', 'gotg' ),
			'default_id' => 16,
			'path'       => '/contact',
			'icon'       => 'dashicons-phone',
			'desc'       => __( 'Catering planning text, inquiries intro, and location contact details.', 'gotg' ),
		),
		'menu'    => array(
			'title'      => __( 'Menu Page', 'gotg' ),
			'menu_title' => __( '🍽️ Menu Page', 'gotg' ),
			'default_id' => 13,
			'path'       => '/menu',
			'icon'       => 'dashicons-food',
			'desc'       => __( 'Menu disclaimer, dietary info, and general menu presentation.', 'gotg' ),
		),
		'events'  => array(
			'title'      => __( 'Events Page', 'gotg' ),
			'menu_title' => __( '📅 Events Page', 'gotg' ),
			'default_id' => 14,
			'path'       => '/events',
			'icon'       => 'dashicons-calendar-alt',
			'desc'       => __( 'Events header, recurring specials, and upcoming event schedules.', 'gotg' ),
		),
	);
}

/**
 * Resolves a page post ID from its slug or fallback.
 *
 * @param string $slug Page slug.
 * @return int Page ID.
 */
function gotg_resolve_editor_page_id( $slug ) {
	$map = gotg_get_editor_pages_map();
	if ( ! isset( $map[ $slug ] ) ) {
		$slug = 'home';
	}

	$page = get_page_by_path( $slug );
	return $page ? $page->ID : $map[ $slug ]['default_id'];
}

/**
 * Handles saving custom page blocks submission.
 *
 * @return void
 */
function gotg_handle_custom_page_save() {
	if ( ! isset( $_POST['gotg_save_custom_page_action'] ) ) {
		return;
	}

	if ( ! check_admin_referer( 'gotg_custom_page_editor_nonce', 'gotg_custom_page_editor_nonce' ) ) {
		wp_die( esc_html__( 'Security check failed. Please refresh and try again.', 'gotg' ) );
	}

	if ( ! current_user_can( 'edit_pages' ) ) {
		wp_die( esc_html__( 'Unauthorized user.', 'gotg' ) );
	}

	$page_id = absint( $_POST['gotg_page_id'] ?? 0 );
	if ( ! $page_id ) {
		return;
	}

	$raw_blocks = isset( $_POST['gotg_blocks'] ) && is_array( $_POST['gotg_blocks'] )
		? wp_unslash( $_POST['gotg_blocks'] )
		: array();

	$processed = array();
	foreach ( $raw_blocks as $block ) {
		if ( ! is_array( $block ) || empty( $block['type'] ) ) {
			continue;
		}

		if ( 'gallery' === $block['type'] && ! empty( $block['image_ids_csv'] ) ) {
			$ids = array_filter( array_map( 'absint', explode( ',', (string) $block['image_ids_csv'] ) ) );
			$block['image_ids'] = array_values( $ids );
			unset( $block['image_ids_csv'] );
		}

		$processed[] = $block;
	}

	$sanitized = gotg_sanitize_page_blocks( $processed );
	update_post_meta( $page_id, '_gotg_page_blocks', $sanitized );

	$current_slug = sanitize_key( $_POST['gotg_page_slug'] ?? 'home' );
	wp_safe_redirect( admin_url( 'admin.php?page=gotg-page-editor&page_slug=' . $current_slug . '&updated=true' ) );
	exit;
}
add_action( 'admin_init', 'gotg_handle_custom_page_save' );

/**
 * Renders the custom Page Content Editor page.
 *
 * @return void
 */
function gotg_render_custom_page_editor() {
	$map          = gotg_get_editor_pages_map();
	$current_slug = isset( $_GET['page_slug'] ) && array_key_exists( $_GET['page_slug'], $map )
		? sanitize_key( $_GET['page_slug'] )
		: 'home';

	$current_info = $map[ $current_slug ];
	$page_id      = gotg_resolve_editor_page_id( $current_slug );
	$blocks       = get_post_meta( $page_id, '_gotg_page_blocks', true );

	if ( ! is_array( $blocks ) ) {
		$blocks = array();
	}

	$site_url = gotg_get_frontend_base_url();
	$frontend_url = rtrim( $site_url, '/' ) . $current_info['path'];

	?>
	<div class="wrap gotg-page-editor-wrap" style="max-width:1100px;">
		<div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; margin-bottom:1rem;">
			<div>
				<h1 style="display:flex; align-items:center; gap:10px; margin:0;">
					<span><?php echo esc_html( $current_info['title'] ); ?></span>
					<span style="font-size:13px; font-weight:400; background:#e7f3ff; color:#0969da; padding:3px 10px; border-radius:12px; border:1px solid #c8e1ff;">Headless CMS</span>
				</h1>
				<p style="margin:4px 0 0; color:#50575e;"><?php echo esc_html( $current_info['desc'] ); ?></p>
			</div>

			<div>
				<a href="<?php echo esc_url( $frontend_url ); ?>" target="_blank" rel="noopener noreferrer" class="button" style="display:inline-flex; align-items:center; gap:5px; font-weight:600;">
					<span>View Live on Site</span>
					<span class="dashicons dashicons-external" style="font-size:16px; width:16px; height:16px;"></span>
				</a>
			</div>
		</div>

		<!-- Per-Page Tabs Navigation -->
		<nav class="nav-tab-wrapper" style="margin-bottom:1.5rem;">
			<?php foreach ( $map as $slug => $data ) : ?>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=gotg-page-editor&page_slug=' . $slug ) ); ?>"
				   class="nav-tab <?php echo $current_slug === $slug ? 'nav-tab-active' : ''; ?>"
				   style="font-size:14px; padding:8px 16px;">
					<?php echo esc_html( $data['menu_title'] ); ?>
				</a>
			<?php endforeach; ?>
		</nav>

		<?php if ( isset( $_GET['updated'] ) && 'true' === $_GET['updated'] ) : ?>
			<div class="notice notice-success is-dismissible" style="border-left-color:#00a32a; padding:12px 16px; margin-bottom:20px;">
				<p style="margin:0; font-size:14px;">
					<strong>✅ Changes saved!</strong> Your updates to <strong><?php echo esc_html( $current_info['title'] ); ?></strong> are now live on the frontend.
				</p>
			</div>
		<?php endif; ?>

		<form method="post" action="<?php echo esc_url( admin_url( 'admin.php?page=gotg-page-editor&page_slug=' . $current_slug ) ); ?>">
			<?php wp_nonce_field( 'gotg_custom_page_editor_nonce', 'gotg_custom_page_editor_nonce' ); ?>
			<input type="hidden" name="gotg_save_custom_page_action" value="1" />
			<input type="hidden" name="gotg_page_id" value="<?php echo esc_attr( (string) $page_id ); ?>" />
			<input type="hidden" name="gotg_page_slug" value="<?php echo esc_attr( $current_slug ); ?>" />

			<!-- Top Actions Bar -->
			<div style="background:#fff; border:1px solid #c3c4c7; padding:12px 18px; border-radius:6px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
				<div style="color:#50575e; font-size:13px;">
					Editing <strong><?php echo esc_html( (string) count( $blocks ) ); ?> section blocks</strong> on this page.
				</div>
				<button type="submit" class="button button-primary button-hero" style="height:38px; line-height:36px; padding:0 24px; font-weight:600;">
					Save &amp; Publish Live
				</button>
			</div>

			<!-- Sections List -->
			<?php if ( empty( $blocks ) ) : ?>
				<div style="background:#fff; border:1px dashed #c3c4c7; padding:40px; text-align:center; border-radius:6px;">
					<p style="color:#646970; font-size:15px; margin-bottom:12px;">No custom section blocks configured for this page yet.</p>
				</div>
			<?php else : ?>
				<div class="gotg-blocks-list" style="display:flex; flex-direction:column; gap:20px;">
					<?php foreach ( $blocks as $idx => $block ) : ?>
						<?php gotg_render_single_block_editor( $idx, $block ); ?>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

			<!-- Bottom Actions Bar -->
			<div style="background:#fff; border:1px solid #c3c4c7; padding:16px 20px; border-radius:6px; margin-top:24px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
				<span style="color:#646970; font-size:13px;">Review your text, images, and videos before saving.</span>
				<button type="submit" class="button button-primary button-hero" style="height:42px; line-height:40px; padding:0 28px; font-weight:600; font-size:15px;">
					Save &amp; Publish Live
				</button>
			</div>
		</form>
	</div>
	<?php
}
