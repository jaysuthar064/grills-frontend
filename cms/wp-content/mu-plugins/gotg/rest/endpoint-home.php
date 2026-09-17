<?php
/**
 * GET /wp-json/gotg/v1/home
 *
 * Serves the `/` route. Shape: 04-API-CONTRACT.md §5.1.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Returns the home page payload.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return WP_REST_Response|WP_Error Response, or an error.
 */
function gotg_rest_home( WP_REST_Request $request ) {
	$base = gotg_rest_page_base( 'home', $request );

	if ( is_wp_error( $base ) ) {
		return $base;
	}

	// HomeResponse carries no title or intro: the hero block supplies both.
	$payload = array(
		'_global' => $base['payload']['_global'],
		'seo'     => $base['payload']['seo'],
		'blocks'  => $base['payload']['blocks'],
	);

	return rest_ensure_response( $payload );
}
