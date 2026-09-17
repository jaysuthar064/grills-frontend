<?php
/**
 * GET /wp-json/gotg/v1/contact
 *
 * Serves the `/contact` route. Shape: 04-API-CONTRACT.md §5.5.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Builds the enquiry form's subject list.
 *
 * A fixed list, plus a subject for each action the client has no platform for:
 * with no reservation URL, "Reservation enquiry" becomes a form subject instead
 * (04-API-CONTRACT.md §5.5).
 *
 * Reads the settings rather than the shaped `_global.actions`, which is an
 * object by then so the payload encodes `{}` rather than `[]`.
 *
 * @param array $settings Site settings.
 * @return string[] Subject labels.
 */
function gotg_shape_form_subjects( array $settings ) {
	$actions = gotg_shape_actions( $settings );

	$subjects = array(
		__( 'General enquiry', 'gotg' ),
		__( 'Catering', 'gotg' ),
		__( 'Private event', 'gotg' ),
		__( 'Live Music Booking / Musician Inquiry', 'gotg' ),
	);

	if ( ! isset( $actions['reservationUrl'] ) ) {
		$subjects[] = __( 'Reservation enquiry', 'gotg' );
	}

	if ( ! isset( $actions['orderingUrl'] ) ) {
		$subjects[] = __( 'Takeaway order enquiry', 'gotg' );
	}

	if ( ! isset( $actions['giftCardUrl'] ) ) {
		$subjects[] = __( 'Gift cards', 'gotg' );
	}

	$subjects[] = __( 'Feedback', 'gotg' );

	return $subjects;
}

/**
 * Returns the contact page payload.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return WP_REST_Response|WP_Error Response, or an error.
 */
function gotg_rest_contact( WP_REST_Request $request ) {
	$base = gotg_rest_page_base( 'contact', $request );

	if ( is_wp_error( $base ) ) {
		return $base;
	}

	$settings = gotg_get_site_settings();

	// The form can only be enabled if submissions have somewhere to go.
	$recipient = (string) ( $settings['form_recipient_email'] ?? '' );

	$payload = $base['payload'];

	$payload['formEnabled']  = '' !== $recipient && is_email( $recipient );
	$payload['formSubjects'] = gotg_shape_form_subjects( $settings );

	return rest_ensure_response( $payload );
}
