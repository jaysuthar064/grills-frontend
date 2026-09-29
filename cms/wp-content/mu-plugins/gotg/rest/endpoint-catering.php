<?php
/**
 * GET /wp-json/gotg/v1/catering
 *
 * Serves the `/catering` route and provisions the Catering page in Headless CMS.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Ensures the Catering page exists in WordPress and is seeded with custom blocks.
 *
 * @return int Page ID.
 */
function gotg_ensure_catering_page() {
	$existing = get_page_by_path( 'catering' );
	if ( $existing instanceof WP_Post ) {
		return $existing->ID;
	}

	// Resolve media attachment IDs dynamically if present
	$video_id  = 0;
	$poster_id = 0;
	$feat_id   = 0;

	global $wpdb;
	$v_row = $wpdb->get_var( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment' AND guid LIKE %s LIMIT 1", '%IMG_2207%' ) );
	if ( $v_row ) {
		$video_id = (int) $v_row;
	}
	$p_row = $wpdb->get_var( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment' AND guid LIKE %s LIMIT 1", '%IMG_2175%' ) );
	if ( $p_row ) {
		$poster_id = (int) $p_row;
	}
	$f_row = $wpdb->get_var( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment' AND guid LIKE %s LIMIT 1", '%IMG_2176%' ) );
	if ( $f_row ) {
		$feat_id = (int) $f_row;
	}

	$page_id = wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_name'    => 'catering',
			'post_title'   => 'Catering & Private Events',
			'post_status'  => 'publish',
			'post_content' => '',
		)
	);

	if ( ! is_wp_error( $page_id ) && $page_id ) {
		$gallery_ids = array_filter( array( $poster_id, $feat_id ) );

		$blocks = array(
			array(
				'type'                => 'hero',
				'heading'             => 'Catering & Private Events',
				'subheading'          => 'Slow-smoked Texas brisket, baby back ribs, and fresh golf-side classics for your next event. From intimate family feasts to 500-person tournament banquets.',
				'eyebrow'             => 'Wood. Smoke. Fire.',
				'video_id'            => $video_id ? $video_id : 189,
				'image_id'            => $poster_id ? $poster_id : 174,
				'overlay'             => 30,
				'primary_cta_label'   => 'Request Catering Quote',
				'primary_cta_url'     => '#catering-form',
				'secondary_cta_label' => 'Call Catering: 805-842-2947',
				'secondary_cta_url'   => 'tel:+18058422947',
			),
			array(
				'type'       => 'split_feature',
				'heading'    => 'Full Service Buffet & On-Site Smoking',
				'body'       => "From golf tournaments to wedding banquets, Marco and the pit crew bring the smoker to life with wood-fired meats carved hot and served fresh.",
				'image_id'   => $feat_id ? $feat_id : 173,
				'image_side' => 'right',
				'cta_label'  => 'Download Catering Menu',
				'cta_url'    => '/menu',
			),
			array(
				'type'      => 'cta_band',
				'heading'   => 'Plan Your Event With Us',
				'body'      => 'Tell us your date, expected headcount, and preferred meats. Our catering manager will contact you within 24 hours.',
				'cta_label' => 'Call 805-842-2947',
				'cta_url'   => 'tel:+18058422947',
				'style'     => 'brand',
			),
		);

		update_post_meta( $page_id, '_gotg_page_blocks', gotg_sanitize_page_blocks( $blocks ) );
		update_post_meta( $page_id, '_gotg_seo_title', 'Catering & Private Events | Grill On the Green' );
		update_post_meta( $page_id, '_gotg_seo_description', 'BBQ catering for weddings, golf tournaments, corporate events, and parties in Simi Valley. Smoked brisket, ribs, and sides for 10 to 500+ guests.' );
		return $page_id;
	}

	return 0;
}
add_action( 'init', 'gotg_ensure_catering_page' );

/**
 * Serves the catering page REST endpoint.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return WP_REST_Response|WP_Error Response or error.
 */
function gotg_rest_catering( WP_REST_Request $request ) {
	// Auto-provision if missing
	gotg_ensure_catering_page();

	$base = gotg_rest_page_base( 'catering', $request );

	if ( is_wp_error( $base ) ) {
		return $base;
	}

	return rest_ensure_response( $base['payload'] );
}
