<?php
/**
 * Image and rich-text shaping primitives.
 *
 * Transcribed from 04-API-CONTRACT.md §6.1 and §6.2. Every image in every
 * payload passes through gotg_shape_image(), so a deleted attachment produces an
 * omitted key rather than a broken `src`.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Decodes HTML entities in a human-readable display-text field.
 *
 * WordPress stores term names, and returns post titles, carrying HTML entities
 * (`&amp;`, `&#8217;`). The gotg/v1 contract types every display-text field as
 * plain UTF-8 with no entities (04-API-CONTRACT.md §2), so decoding happens once
 * here — at the API boundary — and every consumer receives clean text.
 *
 * Apply to display strings ONLY. Never to URLs, slugs, enums, IDs, or the
 * sanitised rich-text (HTML) fields, where an entity can be significant.
 *
 * @param mixed $value Raw display string.
 * @return string Decoded UTF-8 text.
 */
function gotg_decode_text( $value ) {
	return html_entity_decode(
		wp_specialchars_decode( (string) $value, ENT_QUOTES ),
		ENT_QUOTES,
		'UTF-8'
	);
}

/**
 * Shapes an attachment into the API image object.
 *
 * @param int    $attachment_id Attachment post ID.
 * @param string $size          Registered image size.
 * @return array|null Image object, or null when the attachment is unavailable.
 */
function gotg_shape_image( $attachment_id, $size = 'gotg_card' ) {
	$attachment_id = (int) $attachment_id;

	if ( $attachment_id <= 0 ) {
		return null;
	}

	$src = wp_get_attachment_image_src( $attachment_id, $size );

	if ( false === $src ) {
		return null;
	}

	$alt = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );

	$image = array(
		'src'    => $src[0],
		'alt'    => is_string( $alt ) ? gotg_decode_text( $alt ) : '',
		'width'  => (int) $src[1],
		'height' => (int) $src[2],
	);

	$blur = get_post_meta( $attachment_id, '_gotg_blur_data_url', true );

	if ( is_string( $blur ) && '' !== $blur ) {
		$image['blurDataUrl'] = $blur;
	}

	return $image;
}

/**
 * Returns the allowed HTML tag set for API rich text fields.
 *
 * @return array Allowed tags and attributes for wp_kses().
 */
function gotg_allowed_html() {
	return array(
		'p'      => array(),
		'br'     => array(),
		'strong' => array(),
		'em'     => array(),
		'ul'     => array(),
		'ol'     => array(),
		'li'     => array(),
		'h3'     => array( 'id' => true ),
		'a'      => array(
			'href'   => true,
			'title'  => true,
			'rel'    => true,
			'target' => true,
		),
	);
}

/**
 * Applies the API allow-list to a rich text value.
 *
 * Sanitisation happens at shaping time, not save time, so widening the
 * allow-list does not require re-saving posts (03-CONTENT-MODEL.md §4.2).
 *
 * @param mixed $html Raw HTML.
 * @return string Sanitised HTML.
 */
function gotg_shape_html( $html ) {
	if ( ! is_string( $html ) || '' === trim( $html ) ) {
		return '';
	}

	return trim( wp_kses( $html, gotg_allowed_html() ) );
}
