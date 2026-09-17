<?php
/**
 * GET /wp-json/gotg/v1/events
 *
 * Serves `/events` and every `/events/[slug]`. Shape: 04-API-CONTRACT.md §5.3.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Shapes the standing recurring programme card.
 *
 * Nullable by design: the key is always present, and is null when the programme
 * is switched off (04-API-CONTRACT.md §1).
 *
 * @param array $settings Site settings.
 * @return array|null Shaped programme, or null.
 */
function gotg_shape_recurring_programme( array $settings ) {
	if ( empty( $settings['show_recurring'] ) ) {
		return null;
	}

	$days = $settings['recurring_days'] ?? array();

	return array(
		'heading' => gotg_decode_text( $settings['recurring_heading'] ?? '' ),
		'body'    => gotg_decode_text( $settings['recurring_body'] ?? '' ),
		'days'    => is_array( $days ) ? array_values( array_map( 'strval', $days ) ) : array(),
		'starts'  => (string) ( $settings['recurring_starts'] ?? '' ),
		'ends'    => (string) ( $settings['recurring_ends'] ?? '' ),
	);
}

/**
 * Returns the events page payload.
 *
 * An events page with nothing scheduled is a valid empty state, not an error:
 * `upcoming` is `[]` and the frontend renders `emptyMessage`.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return WP_REST_Response|WP_Error Response, or an error.
 */
function gotg_rest_events( WP_REST_Request $request ) {
	$base = gotg_rest_page_base( 'events', $request );

	if ( is_wp_error( $base ) ) {
		return $base;
	}

	$global   = $base['global'];
	$settings = gotg_get_site_settings();
	$timezone = $global['hours']['timezone'];

	$posts = gotg_get_upcoming_events( $timezone, 50, gotg_rest_is_preview( $request ) );

	$payload = $base['payload'];

	$payload['recurring']    = gotg_shape_recurring_programme( $settings );
	$payload['upcoming']     = gotg_shape_events( $posts, $global['seoDefaults'], $timezone );
	$payload['emptyMessage'] = gotg_decode_text( $settings['events_empty_message'] ?? '' );

	return rest_ensure_response( $payload );
}
