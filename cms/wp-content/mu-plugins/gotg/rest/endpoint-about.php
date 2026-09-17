<?php
/**
 * GET /wp-json/gotg/v1/about
 *
 * Serves the `/about` route. Shape: 04-API-CONTRACT.md §5.4.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Returns the about page payload.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return WP_REST_Response|WP_Error Response, or an error.
 */
function gotg_rest_about( WP_REST_Request $request ) {
	$base = gotg_rest_page_base( 'about', $request );

	if ( is_wp_error( $base ) ) {
		return $base;
	}

	return rest_ensure_response( $base['payload'] );
}
