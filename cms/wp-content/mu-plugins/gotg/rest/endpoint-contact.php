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
	$recipient = (string) ( $settings['form_recipient_email'] ?? 'bbq101catering@yahoo.com' );

	$payload = $base['payload'];

	$payload['formEnabled']  = '' !== $recipient && is_email( $recipient );
	$payload['formSubjects'] = gotg_shape_form_subjects( $settings );

	return rest_ensure_response( $payload );
}

/**
 * Handles incoming contact form submissions from the frontend.
 * Delivers email via WordPress native wp_mail() which FluentSMTP intercepts and logs.
 *
 * @param WP_REST_Request $request Incoming REST request.
 * @return WP_REST_Response|WP_Error
 */
function gotg_rest_submit_contact( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	if ( empty( $params ) ) {
		$params = $request->get_body_params();
	}

	$name    = sanitize_text_field( $params['name'] ?? '' );
	$email   = sanitize_email( $params['email'] ?? '' );
	$phone   = sanitize_text_field( $params['phone'] ?? '' );
	$subject = sanitize_text_field( $params['subject'] ?? 'Website Enquiry' );
	$message = sanitize_textarea_field( $params['message'] ?? '' );

	// Honeypot check
	$honeypot = sanitize_text_field( $params['company'] ?? '' );
	if ( ! empty( $honeypot ) ) {
		return rest_ensure_response( array( 'success' => true ) );
	}

	if ( empty( $name ) || empty( $email ) || ! is_email( $email ) || empty( $message ) ) {
		return new WP_Error(
			'gotg_invalid_fields',
			__( 'Please fill in all required fields with a valid email address.', 'gotg' ),
			array( 'status' => 400 )
		);
	}

	$settings = gotg_get_site_settings();
	$to = ! empty( $settings['form_recipient_email'] ) && is_email( $settings['form_recipient_email'] )
		? $settings['form_recipient_email']
		: 'bbq101catering@yahoo.com';

	$site_name = get_bloginfo( 'name' );
	if ( empty( $site_name ) ) {
		$site_name = 'Grill on the Green';
	}

	$mail_subject = sprintf( '[%s Contact Form] %s - %s', $site_name, $subject, $name );

	$body_html  = '<div style="font-family: Arial, sans-serif; max-width: 600px; line-height: 1.6; color: #333;">';
	$body_html .= '<h2 style="color: #2c4a30; border-bottom: 2px solid #2c4a30; padding-bottom: 8px;">New Contact Form Submission</h2>';
	$body_html .= '<p><strong>Name:</strong> ' . esc_html( $name ) . '</p>';
	$body_html .= '<p><strong>Email:</strong> <a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a></p>';
	$body_html .= '<p><strong>Phone:</strong> ' . esc_html( $phone ?: 'Not provided' ) . '</p>';
	$body_html .= '<p><strong>Subject:</strong> ' . esc_html( $subject ) . '</p>';
	$body_html .= '<div style="background: #f8f6f0; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #e2ddd3;">';
	$body_html .= '<p style="margin-top: 0;"><strong>Message:</strong></p>';
	$body_html .= '<p style="white-space: pre-wrap; margin-bottom: 0;">' . esc_html( $message ) . '</p>';
	$body_html .= '</div>';
	$body_html .= '<p style="font-size: 12px; color: #888; margin-top: 20px;">Sent from ' . esc_html( $site_name ) . ' website.</p>';
	$body_html .= '</div>';

	$headers = array(
		'Content-Type: text/html; charset=UTF-8',
		'Reply-To: ' . $name . ' <' . $email . '>',
	);

	$sent = wp_mail( $to, $mail_subject, $body_html, $headers );

	return rest_ensure_response( array(
		'success' => (bool) $sent,
		'message' => __( 'Thank you! Your message has been sent.', 'gotg' ),
	) );
}

/**
 * Handles incoming catering inquiry form submissions from the frontend.
 * Delivers email via WordPress native wp_mail() which FluentSMTP intercepts and logs.
 *
 * @param WP_REST_Request $request Incoming REST request.
 * @return WP_REST_Response|WP_Error
 */
function gotg_rest_submit_catering( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	if ( empty( $params ) ) {
		$params = $request->get_body_params();
	}

	$name   = sanitize_text_field( $params['name'] ?? '' );
	$email  = sanitize_email( $params['email'] ?? '' );
	$phone  = sanitize_text_field( $params['phone'] ?? '' );
	$date   = sanitize_text_field( $params['date'] ?? '' );
	$guests = sanitize_text_field( $params['guests'] ?? '' );
	$type   = sanitize_text_field( $params['type'] ?? '' );
	$notes  = sanitize_textarea_field( $params['notes'] ?? '' );

	// Honeypot check
	$honeypot = sanitize_text_field( $params['company'] ?? '' );
	if ( ! empty( $honeypot ) ) {
		return rest_ensure_response( array( 'success' => true ) );
	}

	if ( empty( $name ) || empty( $email ) || ! is_email( $email ) || empty( $phone ) ) {
		return new WP_Error(
			'gotg_invalid_fields',
			__( 'Please fill in your name, email, and phone number.', 'gotg' ),
			array( 'status' => 400 )
		);
	}

	$settings = gotg_get_site_settings();
	$to = ! empty( $settings['form_recipient_email'] ) && is_email( $settings['form_recipient_email'] )
		? $settings['form_recipient_email']
		: 'bbq101catering@yahoo.com';

	$site_name = get_bloginfo( 'name' );
	if ( empty( $site_name ) ) {
		$site_name = 'Grill on the Green';
	}

	$mail_subject = sprintf( '[%s Catering Inquiry] From %s', $site_name, $name );

	$body_html  = '<div style="font-family: Arial, sans-serif; max-width: 600px; line-height: 1.6; color: #333;">';
	$body_html .= '<h2 style="color: #2c4a30; border-bottom: 2px solid #2c4a30; padding-bottom: 8px;">New Catering / Event Inquiry</h2>';
	$body_html .= '<p><strong>Client Name:</strong> ' . esc_html( $name ) . '</p>';
	$body_html .= '<p><strong>Email:</strong> <a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a></p>';
	$body_html .= '<p><strong>Phone:</strong> ' . esc_html( $phone ) . '</p>';
	$body_html .= '<p><strong>Event Date:</strong> ' . esc_html( $date ?: 'Not specified' ) . '</p>';
	$body_html .= '<p><strong>Estimated Guests:</strong> ' . esc_html( $guests ?: 'Not specified' ) . '</p>';
	$body_html .= '<p><strong>Event Type:</strong> ' . esc_html( $type ?: 'Not specified' ) . '</p>';
	$body_html .= '<div style="background: #f8f6f0; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #e2ddd3;">';
	$body_html .= '<p style="margin-top: 0;"><strong>Dietary Needs & Notes:</strong></p>';
	$body_html .= '<p style="white-space: pre-wrap; margin-bottom: 0;">' . esc_html( $notes ?: 'None' ) . '</p>';
	$body_html .= '</div>';
	$body_html .= '<p style="font-size: 12px; color: #888; margin-top: 20px;">Sent from ' . esc_html( $site_name ) . ' website catering form.</p>';
	$body_html .= '</div>';

	$headers = array(
		'Content-Type: text/html; charset=UTF-8',
		'Reply-To: ' . $name . ' <' . $email . '>',
	);

	$sent = wp_mail( $to, $mail_subject, $body_html, $headers );

	return rest_ensure_response( array(
		'success' => (bool) $sent,
		'message' => __( 'Thank you! Your catering inquiry has been received.', 'gotg' ),
	) );
}
