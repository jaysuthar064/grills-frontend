<?php
/**
 * Site Settings option registration.
 *
 * One option holding one associative array (03-CONTENT-MODEL.md §11). One
 * option rather than thirty is deliberate: `_global` reads the entire settings
 * set on every endpoint, so a single autoloaded option is one array fetch.
 *
 * Option array keys are snake_case and unprefixed — the option name already
 * namespaces them and the whole option is read and written as one unit (§0.1).
 *
 * This file registers the option and its sanitizer. The admin page that renders
 * the six tabs is admin UI and lands with the meta box work.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Returns the documented default value for every Site Settings key.
 *
 * Defaults are transcribed from the Default column of 03-CONTENT-MODEL.md
 * §§11.1–11.6. A field documented with no default takes the empty value for its
 * type, so every key this project reads is always present.
 *
 * @return array<string, mixed> Default settings.
 */
function gotg_site_settings_defaults() {
	return array(
		// §11.1 Identity.
		'site_name'               => 'Grill on the Green',
		'legal_name'              => '',
		'tagline'                 => 'American classics & slow-smoked barbecue',
		'short_description'       => '',
		'frontend_url'            => '',
		'logo_primary_id'         => 0,
		'logo_inverse_id'         => 0,
		'favicon_id'              => 0,
		'primary_location_id'     => 0,

		// §11.2 Contact & Social.
		// Empty by design. `url` is required on every social row, so a
		// placeholder Instagram row would fail the field's own validation the
		// moment it was saved, and gotg_sanitize_social_links() drops a row
		// with no destination — a social link that points nowhere is not a link.
		'social_links'            => array(),
		'form_recipient_email'    => '',
		'reservation_url'         => '',
		'ordering_url'            => '',
		'gift_card_url'           => '',

		// §11.3 Navigation.
		'nav_primary'             => array(
			array(
				'label' => 'Home',
				'url'   => '/',
			),
			array(
				'label' => 'Menu',
				'url'   => '/menu',
			),
			array(
				'label' => 'Catering',
				'url'   => '/catering',
			),
			array(
				'label' => 'Events',
				'url'   => '/events',
			),
			array(
				'label' => 'About',
				'url'   => '/about',
			),
			array(
				'label' => 'Contact',
				'url'   => '/contact',
			),
		),
		'nav_footer'              => array(
			array(
				'label' => 'Menu',
				'url'   => '/menu',
			),
			array(
				'label' => 'Catering',
				'url'   => '/catering',
			),
			array(
				'label' => 'Events',
				'url'   => '/events',
			),
			array(
				'label' => 'About',
				'url'   => '/about',
			),
			array(
				'label' => 'Contact',
				'url'   => '/contact',
			),
		),
		'header_cta_label'        => 'Call 805-842-2947',
		'header_cta_url'          => 'tel:8058422947',
		'announcement_text'       => '',
		'announcement_url'        => '',
		'announcement_expires'    => '',

		// §11.4 SEO Defaults.
		'seo_title_template'      => '%s | Grill on the Green',
		'seo_default_description' => '',
		'seo_default_og_image_id' => 0,
		'google_business_url'     => '',
		'price_range'             => '$$',
		'cuisine_types'           => array( 'American', 'Barbecue' ),

		// §11.5 Menu Page.
		'menu_disclaimer'         => '',
		'show_dietary_legend'     => true,
		'default_daypart'         => 'auto',
		'daypart_windows'         => gotg_sanitize_daypart_windows( array() ),

		// §11.6 Events Page.
		'show_recurring'          => true,
		'recurring_heading'       => 'Live music every Friday & Saturday',
		'recurring_body'          => '',
		'recurring_days'          => array( 'friday', 'saturday' ),
		'recurring_starts'        => '18:00',
		'recurring_ends'          => '21:00',
		'events_empty_message'    => 'No dated events scheduled right now — live music continues every Friday and Saturday, 6–9pm.',
	);
}

/**
 * Maps every Site Settings key to the cleaner that normalises it.
 *
 * @return array<string, string> Option key to cleaner name.
 */
function gotg_site_settings_schema() {
	return array(
		// §11.1 Identity.
		'site_name'               => 'text',
		'legal_name'              => 'text',
		'tagline'                 => 'text',
		'short_description'       => 'textarea',
		'frontend_url'            => 'url',
		'logo_primary_id'         => 'int',
		'logo_inverse_id'         => 'int',
		'favicon_id'              => 'int',
		'primary_location_id'     => 'int',

		// §11.2 Contact & Social.
		'social_links'            => 'social_links',
		'form_recipient_email'    => 'email',
		'reservation_url'         => 'url',
		'ordering_url'            => 'url',
		'gift_card_url'           => 'url',

		// §11.3 Navigation.
		'nav_primary'             => 'nav_rows',
		'nav_footer'              => 'nav_rows',
		'header_cta_label'        => 'text',
		'header_cta_url'          => 'link',
		'announcement_text'       => 'text',
		'announcement_url'        => 'link',
		'announcement_expires'    => 'date',

		// §11.4 SEO Defaults.
		'seo_title_template'      => 'text',
		'seo_default_description' => 'textarea',
		'seo_default_og_image_id' => 'int',
		'google_business_url'     => 'url',
		'price_range'             => 'text',
		'cuisine_types'           => 'string_list',

		// §11.5 Menu Page.
		'menu_disclaimer'         => 'textarea',
		'show_dietary_legend'     => 'bool',
		'default_daypart'         => 'key',
		'daypart_windows'         => 'daypart_windows',

		// §11.6 Events Page.
		'show_recurring'          => 'bool',
		'recurring_heading'       => 'text',
		'recurring_body'          => 'textarea',
		'recurring_days'          => 'weekday_list',
		'recurring_starts'        => 'time',
		'recurring_ends'          => 'time',
		'events_empty_message'    => 'textarea',
	);
}

/**
 * Applies one named cleaner to one settings value.
 *
 * @param string $cleaner Cleaner name from gotg_site_settings_schema().
 * @param mixed  $value   Raw value.
 * @return mixed Cleaned value.
 */
function gotg_clean_setting( $cleaner, $value ) {
	switch ( $cleaner ) {
		case 'text':
			return is_scalar( $value ) ? sanitize_text_field( (string) $value ) : '';

		case 'textarea':
			return is_scalar( $value ) ? sanitize_textarea_field( (string) $value ) : '';

		case 'int':
			return is_scalar( $value ) ? absint( $value ) : 0;

		case 'bool':
			return (bool) rest_sanitize_boolean( $value );

		case 'key':
			return is_scalar( $value ) ? sanitize_key( (string) $value ) : '';

		case 'email':
			return is_scalar( $value ) ? sanitize_email( (string) $value ) : '';

		case 'url':
			return is_string( $value ) ? esc_url_raw( trim( $value ) ) : '';

		case 'link':
			return gotg_sanitize_link( is_scalar( $value ) ? (string) $value : '' );

		case 'date':
			return gotg_sanitize_date( $value );

		case 'time':
			return gotg_sanitize_time( $value );

		case 'string_list':
			return gotg_sanitize_string_list( $value );

		case 'social_links':
			return gotg_sanitize_social_links( $value );

		case 'nav_rows':
			return gotg_sanitize_nav_rows( $value );

		case 'weekday_list':
			return gotg_sanitize_weekday_list( $value );

		case 'daypart_windows':
			return gotg_sanitize_daypart_windows( $value );

		default:
			return '';
	}
}

/**
 * Sanitises the Site Settings option.
 *
 * The admin page posts one tab at a time, so submitted keys are merged over the
 * stored array rather than replacing it — otherwise saving the Navigation tab
 * would blank Identity (03-CONTENT-MODEL.md §11). Keys the schema does not name
 * are discarded.
 *
 * @param mixed $value Submitted option value.
 * @return array<string, mixed> Merged, sanitised settings.
 */
function gotg_sanitize_site_settings( $value ) {
	$stored = get_option( 'gotg_site_settings', array() );

	if ( ! is_array( $stored ) ) {
		$stored = array();
	}

	if ( ! is_array( $value ) ) {
		return $stored;
	}

	$schema = gotg_site_settings_schema();
	$clean  = array();

	foreach ( $schema as $key => $cleaner ) {
		if ( ! array_key_exists( $key, $value ) ) {
			continue;
		}

		$clean[ $key ] = gotg_clean_setting( $cleaner, $value[ $key ] );
	}

	return array_merge( $stored, $clean );
}

/**
 * Registers the Site Settings option.
 *
 * Hooked to `init`, not `admin_init`. On `admin_init` the setting is
 * unregistered outside admin requests, so a WP-CLI or seed-script write to
 * `gotg_site_settings` would bypass gotg_sanitize_site_settings() entirely.
 * Post meta already registers on `init`; this makes the two consistent, and
 * means the sanitizer is the floor for every write path rather than for admin
 * form submissions only.
 *
 * @return void
 */
function gotg_register_settings() {
	register_setting(
		'gotg_site_settings_group',
		'gotg_site_settings',
		array(
			'type'              => 'array',
			'default'           => array(),
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_site_settings',
		)
	);
}
add_action( 'init', 'gotg_register_settings' );

/**
 * Returns the Site Settings with documented defaults filled in.
 *
 * The stored option holds only what has been saved. Reading it through this
 * function means every documented key is present with the right type, so a
 * shaper never has to guard a missing key.
 *
 * @return array<string, mixed> Complete settings.
 */
function gotg_get_site_settings() {
	$stored = get_option( 'gotg_site_settings', array() );

	if ( ! is_array( $stored ) ) {
		$stored = array();
	}

	return array_merge( gotg_site_settings_defaults(), $stored );
}

/**
 * Resolves the frontend base URL dynamically for local development and live production.
 *
 * Checks:
 * 1. Constant GOTG_FRONTEND_URL (e.g. from wp-config.php or platform env)
 * 2. Site settings 'frontend_url' if saved
 * 3. Dynamic HTTP_HOST: if running on a live domain (e.g. grills.launchpreview.live),
 *    automatically builds the https:// URL for the frontend
 * 4. Defaults to http://localhost:3000 for local development
 *
 * @return string Frontend base URL without trailing slash.
 */
function gotg_get_frontend_base_url() {
	if ( defined( 'GOTG_FRONTEND_URL' ) && ! empty( GOTG_FRONTEND_URL ) ) {
		return untrailingslashit( GOTG_FRONTEND_URL );
	}

	$settings = gotg_get_site_settings();
	if ( ! empty( $settings['frontend_url'] ) ) {
		return untrailingslashit( $settings['frontend_url'] );
	}

	$http_host = isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '';
	if ( $http_host && ! in_array( $http_host, array( 'localhost:8885', 'localhost', '127.0.0.1' ), true ) ) {
		$scheme = is_ssl() ? 'https://' : 'http://';
		// If the domain is e.g. api.domain.com or cms.domain.com, could be domain.com or same host
		return untrailingslashit( $scheme . $http_host );
	}

	return 'http://localhost:3000';
}

