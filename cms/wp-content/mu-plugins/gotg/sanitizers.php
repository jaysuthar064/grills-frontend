<?php
/**
 * Shared sanitize_callback functions.
 *
 * Every sanitize_callback referenced by meta.php, taxonomies.php, and
 * settings.php lives here and is referenced by name, per
 * 07-CODING-STANDARDS.md §1.2. Field-level specifications are in
 * 03-CONTENT-MODEL.md.
 *
 * A sanitize_callback cleans and coerces; it cannot report a rejection to the
 * editor (03-CONTENT-MODEL.md §2.4). Where a value cannot be coerced into the
 * field's domain, these functions return the field's empty value rather than a
 * plausible-looking wrong one — an empty price is visibly missing, a price
 * silently coerced to 0.00 is not.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Authorises reading and writing protected post meta.
 *
 * Every post meta key in this project is protected (leading underscore), so
 * WordPress refuses generic access without this callback.
 *
 * @param bool   $allowed   Current permission.
 * @param string $meta_key  Meta key.
 * @param int    $object_id Post ID.
 * @return bool Whether the current user may edit this meta.
 */
function gotg_meta_auth_callback( $allowed, $meta_key, $object_id ) {
	return current_user_can( 'edit_post', (int) $object_id );
}

/**
 * Authorises reading and writing protected term meta.
 *
 * The per-post capability check of gotg_meta_auth_callback() has no meaning for
 * a term, so the term equivalent is used (03-CONTENT-MODEL.md §7.2).
 *
 * @param bool   $allowed   Current permission.
 * @param string $meta_key  Meta key.
 * @param int    $object_id Term ID.
 * @return bool Whether the current user may edit this term's meta.
 */
function gotg_term_meta_auth_callback( $allowed, $meta_key, $object_id ) {
	return current_user_can( 'edit_term', (int) $object_id );
}

/**
 * Returns the weekday keys in Monday-first order.
 *
 * @return string[] Seven lowercase weekday keys.
 */
function gotg_weekday_keys() {
	return array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' );
}

/**
 * Returns the daypart keys.
 *
 * @return string[] Three lowercase daypart keys.
 */
function gotg_daypart_keys() {
	return array( 'breakfast', 'lunch', 'dinner' );
}

/**
 * Normalises the price variants array.
 *
 * Drops malformed rows, coerces types, reindexes, and caps the row count at six
 * (03-CONTENT-MODEL.md §3.4). Range rejection — the 0–999 rule — is the
 * validator's job, not this function's.
 *
 * A row is dropped rather than coerced when its amount is not numeric. Casting
 * "market price" to (float) yields 0.0, which would publish a free item; an
 * absent row is a visible gap the editor can act on.
 *
 * @param mixed $value Raw meta value.
 * @return array<int, array{label: string, amount: float}> Normalised variant rows.
 */
function gotg_sanitize_price_variants( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$clean = array();

	foreach ( $value as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$label = isset( $row['label'] ) && is_scalar( $row['label'] )
			? sanitize_text_field( (string) $row['label'] )
			: '';

		$amount = isset( $row['amount'] ) ? $row['amount'] : null;

		if ( is_string( $amount ) ) {
			// Tolerate a currency symbol, thousands separators, and stray spaces.
			$amount = trim( preg_replace( '/[$,\s]/', '', $amount ) );
		}

		// A row with neither a label nor an amount is a repeater artefact.
		if ( '' === $label && ( null === $amount || '' === $amount ) ) {
			continue;
		}

		if ( ! is_numeric( $amount ) ) {
			continue;
		}

		$amount = round( (float) $amount, 2 );

		if ( $amount < 0 ) {
			continue;
		}

		$clean[] = array(
			'label'  => $label,
			'amount' => $amount,
		);
	}

	return array_slice( array_values( $clean ), 0, 6 );
}

/**
 * Normalises a daypart list to known values.
 *
 * @param mixed $value Raw meta value.
 * @return string[] Valid daypart keys, in the order supplied.
 */
function gotg_sanitize_daypart_list( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$allowed = gotg_daypart_keys();
	$clean   = array();

	foreach ( $value as $daypart ) {
		if ( ! is_scalar( $daypart ) ) {
			continue;
		}

		$daypart = sanitize_key( (string) $daypart );

		if ( in_array( $daypart, $allowed, true ) && ! in_array( $daypart, $clean, true ) ) {
			$clean[] = $daypart;
		}
	}

	return $clean;
}

/**
 * Normalises a weekday list to known values.
 *
 * @param mixed $value Raw value.
 * @return string[] Valid weekday keys, in the order supplied.
 */
function gotg_sanitize_weekday_list( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$allowed = gotg_weekday_keys();
	$clean   = array();

	foreach ( $value as $day ) {
		if ( ! is_scalar( $day ) ) {
			continue;
		}

		$day = sanitize_key( (string) $day );

		if ( in_array( $day, $allowed, true ) && ! in_array( $day, $clean, true ) ) {
			$clean[] = $day;
		}
	}

	return $clean;
}

/**
 * Normalises a datetime-local value to Y-m-d H:i.
 *
 * @param mixed $value Raw value.
 * @return string Normalised datetime, or an empty string when unparseable.
 */
function gotg_sanitize_datetime( $value ) {
	if ( ! is_string( $value ) || '' === trim( $value ) ) {
		return '';
	}

	$timestamp = strtotime( sanitize_text_field( $value ) );

	if ( false === $timestamp ) {
		return '';
	}

	return gmdate( 'Y-m-d H:i', $timestamp );
}

/**
 * Normalises a calendar date to Y-m-d.
 *
 * A date that does not exist — 2026-02-30 — is rejected rather than rolled
 * forward, so an editor's typo cannot become a silently different date.
 *
 * @param mixed $value Raw value.
 * @return string Normalised date, or an empty string when invalid.
 */
function gotg_sanitize_date( $value ) {
	if ( ! is_string( $value ) || '' === trim( $value ) ) {
		return '';
	}

	$value = trim( sanitize_text_field( $value ) );

	if ( 1 !== preg_match( '/^\d{4}-\d{2}-\d{2}$/', $value ) ) {
		return '';
	}

	list( $year, $month, $day ) = array_map( 'intval', explode( '-', $value ) );

	if ( ! checkdate( $month, $day, $year ) ) {
		return '';
	}

	return $value;
}

/**
 * Normalises a 24-hour time to HH:MM.
 *
 * @param mixed $value Raw value.
 * @return string Normalised time, or an empty string when invalid.
 */
function gotg_sanitize_time( $value ) {
	if ( ! is_string( $value ) || '' === trim( $value ) ) {
		return '';
	}

	$value = trim( sanitize_text_field( $value ) );

	if ( 1 !== preg_match( '/^(\d{2}):(\d{2})$/', $value, $matches ) ) {
		return '';
	}

	$hours   = (int) $matches[1];
	$minutes = (int) $matches[2];

	if ( $hours > 23 || $minutes > 59 ) {
		return '';
	}

	return sprintf( '%02d:%02d', $hours, $minutes );
}

/**
 * Normalises a money amount to a non-negative float with two decimal places.
 *
 * Non-numeric and negative input returns an empty string rather than 0.0: the
 * fields using this sanitizer are optional, and an empty optional field is
 * omitted from the payload (ADR-0022), whereas 0.0 would publish "free".
 * The 0–999 ceiling is a validator rule, not a coercion.
 *
 * @param mixed $value Raw value.
 * @return float|string Amount, or an empty string when not a usable number.
 */
function gotg_sanitize_money( $value ) {
	if ( is_string( $value ) ) {
		$value = trim( preg_replace( '/[$,\s]/', '', $value ) );
	}

	if ( null === $value || '' === $value || is_bool( $value ) || ! is_numeric( $value ) ) {
		return '';
	}

	$amount = round( (float) $value, 2 );

	if ( $amount < 0 ) {
		return '';
	}

	return $amount;
}

/**
 * Coerces a value to a float.
 *
 * Exists because `floatval` cannot be used as a meta sanitize_callback.
 * WordPress invokes the callback through the `sanitize_{type}_meta_{key}` filter
 * with four arguments — value, key, object type, object subtype — and PHP 8
 * throws ArgumentCountError when an *internal* function receives more arguments
 * than it declares. A userland wrapper accepts and ignores the extras.
 *
 * Non-numeric input returns an empty string rather than 0.0, for the reason
 * given in §0.4 of 03-CONTENT-MODEL.md: the fields using this sanitizer are
 * coordinates, where 0.0 is a real place. Range checks belong to the validator;
 * this only fixes the type.
 *
 * @param mixed $value Raw value.
 * @return float|string Coerced value, or an empty string when not a number.
 */
function gotg_sanitize_float( $value ) {
	if ( is_string( $value ) ) {
		$value = trim( $value );
	}

	if ( '' === $value || is_bool( $value ) || ! is_numeric( $value ) ) {
		return '';
	}

	return (float) $value;
}

/**
 * Validates a base64 image data URI.
 *
 * Backs `_gotg_blur_data_url`, which is emitted directly into the page as an
 * image source, so it is checked structurally rather than merely escaped.
 * Anything that is not a decodable base64 raster data URI returns an empty
 * string, which the shaper then omits — an image with no placeholder is a
 * degraded but correct page.
 *
 * `image/svg+xml` is deliberately absent from the allow-list: SVG can carry
 * script, and a blur placeholder has no reason to be vector.
 *
 * @param mixed $value Raw value.
 * @return string The data URI, or an empty string when it is not usable.
 */
function gotg_sanitize_data_uri( $value ) {
	if ( ! is_string( $value ) ) {
		return '';
	}

	$value = trim( $value );

	if ( '' === $value ) {
		return '';
	}

	// A placeholder is a tiny thumbnail; anything larger is not doing its job.
	if ( strlen( $value ) > 4096 ) {
		return '';
	}

	if ( 1 !== preg_match( '#^data:image/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$#', $value, $matches ) ) {
		return '';
	}

	if ( false === base64_decode( $matches[2], true ) ) {
		return '';
	}

	return $value;
}

/**
 * Normalises a two-letter uppercase code.
 *
 * Generic: any field whose domain is a two-letter alphabetic code. Used by the
 * state and country fields (03-CONTENT-MODEL.md §5.1), which share the domain
 * but not the vocabulary — membership of a real state or ISO country list is a
 * validator rule, not a coercion.
 *
 * Anything that is not exactly two letters after stripping non-alphabetic
 * characters is returned empty, so a partial code never reaches structured data.
 *
 * @param mixed $value Raw value.
 * @return string Two uppercase letters, or an empty string.
 */
function gotg_sanitize_two_letter_code( $value ) {
	if ( ! is_scalar( $value ) ) {
		return '';
	}

	$clean = strtoupper( preg_replace( '/[^A-Za-z]/', '', (string) $value ) );

	return 2 === strlen( $clean ) ? $clean : '';
}

/**
 * Normalises a dietary abbreviation to 1–3 uppercase letters.
 *
 * @param mixed $value Raw value.
 * @return string Abbreviation, or an empty string when nothing usable remains.
 */
function gotg_sanitize_abbreviation( $value ) {
	if ( ! is_scalar( $value ) ) {
		return '';
	}

	$clean = strtoupper( preg_replace( '/[^A-Za-z]/', '', (string) $value ) );

	return substr( $clean, 0, 3 );
}

/**
 * Normalises a link that may be a relative path, an absolute URL, or a
 * tel:/mailto: URI.
 *
 * @param mixed $value Raw value.
 * @return string Sanitised link, or an empty string.
 */
function gotg_sanitize_link( $value ) {
	if ( ! is_string( $value ) ) {
		return '';
	}

	$value = trim( $value );

	if ( '' === $value ) {
		return '';
	}

	// A root-relative path or a fragment is not a URL and must not be given a scheme.
	if ( str_starts_with( $value, '/' ) || str_starts_with( $value, '#' ) ) {
		return esc_url_raw( $value );
	}

	return esc_url_raw( $value, array( 'http', 'https', 'tel', 'mailto' ) );
}

/**
 * Applies the block-body HTML allow-list.
 *
 * The list matches the `text` block's permitted tags in 03-CONTENT-MODEL.md
 * §9.3 and the event description list in 04-API-CONTRACT.md §6.2.
 *
 * @param mixed $value Raw value.
 * @return string Sanitised HTML.
 */
function gotg_kses_block_html( $value ) {
	if ( ! is_string( $value ) ) {
		return '';
	}

	$allowed = array(
		'p'      => array(),
		'br'     => array(),
		'strong' => array(),
		'em'     => array(),
		'a'      => array(
			'href'   => array(),
			'title'  => array(),
			'rel'    => array(),
			'target' => array(),
		),
		'ul'     => array(),
		'ol'     => array(),
		'li'     => array(),
		'h3'     => array(),
	);

	return wp_kses( $value, $allowed );
}

/**
 * Normalises a list of attachment or post IDs.
 *
 * Drops non-positive and duplicate IDs and reindexes. Existence and type are
 * checked at read time by the shapers (03-CONTENT-MODEL.md §12).
 *
 * @param mixed $value Raw value.
 * @return int[] Positive integer IDs.
 */
function gotg_sanitize_id_list( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$clean = array();

	foreach ( $value as $id ) {
		if ( ! is_scalar( $id ) ) {
			continue;
		}

		$id = absint( $id );

		if ( $id > 0 && ! in_array( $id, $clean, true ) ) {
			$clean[] = $id;
		}
	}

	return $clean;
}

/**
 * Normalises a list of plain strings.
 *
 * @param mixed $value Raw value.
 * @return string[] Non-empty sanitised strings, reindexed.
 */
function gotg_sanitize_string_list( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$clean = array();

	foreach ( $value as $entry ) {
		if ( ! is_scalar( $entry ) ) {
			continue;
		}

		$entry = sanitize_text_field( (string) $entry );

		if ( '' !== $entry ) {
			$clean[] = $entry;
		}
	}

	return array_values( $clean );
}

/**
 * Normalises the seven regular-hours rows.
 *
 * Always returns exactly seven rows in Monday-first order. A day absent from the
 * input takes the documented default of 06:00–21:00, so the meta is never
 * partially populated (03-CONTENT-MODEL.md §5.2).
 *
 * @param mixed $value Raw meta value.
 * @return array<int, array{day: string, opens: string, closes: string, is_closed: bool}> Seven rows.
 */
function gotg_sanitize_regular_hours( $value ) {
	$days   = gotg_weekday_keys();
	$by_day = array();

	if ( is_array( $value ) ) {
		foreach ( $value as $row ) {
			if ( ! is_array( $row ) || ! isset( $row['day'] ) || ! is_scalar( $row['day'] ) ) {
				continue;
			}

			$day = sanitize_key( (string) $row['day'] );

			if ( ! in_array( $day, $days, true ) ) {
				continue;
			}

			$is_closed = isset( $row['is_closed'] ) ? (bool) rest_sanitize_boolean( $row['is_closed'] ) : false;

			$by_day[ $day ] = array(
				'day'       => $day,
				'opens'     => $is_closed ? '' : gotg_sanitize_time( $row['opens'] ?? '' ),
				'closes'    => $is_closed ? '' : gotg_sanitize_time( $row['closes'] ?? '' ),
				'is_closed' => $is_closed,
			);
		}
	}

	$clean = array();

	foreach ( $days as $day ) {
		$clean[] = $by_day[ $day ] ?? array(
			'day'       => $day,
			'opens'     => '06:00',
			'closes'    => '21:00',
			'is_closed' => false,
		);
	}

	return $clean;
}

/**
 * Normalises the hours-exception rows.
 *
 * A row without a valid date names no day and is dropped. Times are cleared when
 * the row is marked closed, matching the storage rule in
 * 03-CONTENT-MODEL.md §5.2.
 *
 * @param mixed $value Raw meta value.
 * @return array<int, array{date: string, label: string, is_closed: bool, opens: string, closes: string}> Rows.
 */
function gotg_sanitize_hours_exceptions( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$clean = array();

	foreach ( $value as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$date = gotg_sanitize_date( $row['date'] ?? '' );

		if ( '' === $date ) {
			continue;
		}

		$is_closed = isset( $row['is_closed'] ) ? (bool) rest_sanitize_boolean( $row['is_closed'] ) : false;

		$clean[] = array(
			'date'      => $date,
			'label'     => isset( $row['label'] ) && is_scalar( $row['label'] )
				? sanitize_text_field( (string) $row['label'] )
				: '',
			'is_closed' => $is_closed,
			'opens'     => $is_closed ? '' : gotg_sanitize_time( $row['opens'] ?? '' ),
			'closes'    => $is_closed ? '' : gotg_sanitize_time( $row['closes'] ?? '' ),
		);
	}

	return array_slice( array_values( $clean ), 0, 50 );
}

/**
 * Normalises the people rows of a `people` block.
 *
 * @param mixed $value Raw value.
 * @return array<int, array{name: string, role: string, bio: string, photo_id: int}> Rows.
 */
function gotg_sanitize_people_rows( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$clean = array();

	foreach ( $value as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$name = isset( $row['name'] ) && is_scalar( $row['name'] )
			? sanitize_text_field( (string) $row['name'] )
			: '';
		$role = isset( $row['role'] ) && is_scalar( $row['role'] )
			? sanitize_text_field( (string) $row['role'] )
			: '';
		$bio  = isset( $row['bio'] ) && is_scalar( $row['bio'] )
			? sanitize_textarea_field( (string) $row['bio'] )
			: '';

		$photo_id = isset( $row['photo_id'] ) && is_scalar( $row['photo_id'] ) ? absint( $row['photo_id'] ) : 0;

		// A row naming nobody carries no content.
		if ( '' === $name && '' === $role && '' === $bio && 0 === $photo_id ) {
			continue;
		}

		$clean[] = array(
			'name'     => $name,
			'role'     => $role,
			'bio'      => $bio,
			'photo_id' => $photo_id,
		);
	}

	return array_slice( array_values( $clean ), 0, 6 );
}

/**
 * Returns the field schema for every page block type.
 *
 * Each entry maps a block field key to the cleaner that normalises it. The
 * cleaner names are the vocabulary understood by gotg_clean_block_field().
 * Field lists are transcribed from 03-CONTENT-MODEL.md §9.3.
 *
 * @return array<string, array<string, string>> Block type to field map.
 */
function gotg_page_block_schema() {
	return array(
		'hero'            => array(
			'heading'             => 'text',
			'subheading'          => 'text',
			'eyebrow'             => 'text',
			'image_id'            => 'int',
			'video_id'            => 'int',
			'overlay'             => 'int',
			'primary_cta_label'   => 'text',
			'primary_cta_url'     => 'link',
			'secondary_cta_label' => 'text',
			'secondary_cta_url'   => 'link',
		),
		'text'            => array(
			'heading'  => 'text',
			'body'     => 'html',
			'width'    => 'key',
			'align'    => 'key',
			'image_id' => 'int',
			'video_id' => 'int',
		),
		'split_feature'   => array(
			'heading'    => 'text',
			'body'       => 'textarea',
			'image_id'   => 'int',
			'image_side' => 'key',
			'cta_label'  => 'text',
			'cta_url'    => 'link',
		),
		'gallery'         => array(
			'heading'   => 'text',
			'image_ids' => 'id_list',
			'layout'    => 'key',
		),
		'cta_band'        => array(
			'heading'   => 'text',
			'body'      => 'text',
			'cta_label' => 'text',
			'cta_url'   => 'link',
			'style'     => 'key',
			'image_id'  => 'int',
		),
		'featured_items'  => array(
			'heading'   => 'text',
			'mode'      => 'key',
			'item_ids'  => 'id_list',
			'cta_label' => 'text',
		),
		'events_preview'  => array(
			'heading'         => 'text',
			'count'           => 'int',
			'cta_label'       => 'text',
			'hide_when_empty' => 'bool',
		),
		'people'          => array(
			'heading' => 'text',
			'people'  => 'people',
		),
		'instagram_feed'  => array(
			'heading' => 'text',
			'handle'  => 'text',
			'count'   => 'int',
		),
		'reusable_block'  => array(
			'block_ref_id' => 'int',
		),
	);
}

/**
 * Applies one named cleaner to one block field value.
 *
 * @param string $cleaner Cleaner name from gotg_page_block_schema().
 * @param mixed  $value   Raw field value.
 * @return mixed Cleaned value.
 */
function gotg_clean_block_field( $cleaner, $value ) {
	switch ( $cleaner ) {
		case 'text':
			return is_scalar( $value ) ? sanitize_text_field( (string) $value ) : '';

		case 'textarea':
			return is_scalar( $value ) ? sanitize_textarea_field( (string) $value ) : '';

		case 'html':
			return gotg_kses_block_html( is_scalar( $value ) ? (string) $value : '' );

		case 'key':
			return is_scalar( $value ) ? sanitize_key( (string) $value ) : '';

		case 'int':
			return is_scalar( $value ) ? absint( $value ) : 0;

		case 'bool':
			return (bool) rest_sanitize_boolean( $value );

		case 'link':
			return gotg_sanitize_link( is_scalar( $value ) ? (string) $value : '' );

		case 'id_list':
			return gotg_sanitize_id_list( $value );

		case 'people':
			return gotg_sanitize_people_rows( $value );

		default:
			return '';
	}
}

/**
 * Normalises the page-blocks array.
 *
 * Each row is cleaned against its type's field schema; keys the schema does not
 * name are discarded. A row whose `type` is unknown is kept with its scalar
 * values sanitised as text, because 03-CONTENT-MODEL.md §9.2 requires an
 * unrecognised block to render as a read-only panel rather than disappear —
 * dropping it here would destroy content the editor never chose to remove.
 *
 * Per-type required-field and range rules belong to the validator, not here.
 *
 * @param mixed $value Raw meta value.
 * @return array<int, array<string, mixed>> Normalised block rows.
 */
function gotg_sanitize_page_blocks( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$schema = gotg_page_block_schema();
	$clean  = array();

	foreach ( $value as $row ) {
		if ( ! is_array( $row ) || ! isset( $row['type'] ) || ! is_scalar( $row['type'] ) ) {
			continue;
		}

		$type = sanitize_key( (string) $row['type'] );

		if ( '' === $type ) {
			continue;
		}

		if ( ! isset( $schema[ $type ] ) ) {
			$unknown = array( 'type' => $type );

			foreach ( $row as $key => $field_value ) {
				if ( 'type' === $key || ! is_scalar( $field_value ) ) {
					continue;
				}

				$unknown[ sanitize_key( (string) $key ) ] = sanitize_text_field( (string) $field_value );
			}

			$clean[] = $unknown;
			continue;
		}

		$block = array( 'type' => $type );

		foreach ( $schema[ $type ] as $field => $cleaner ) {
			if ( ! array_key_exists( $field, $row ) ) {
				continue;
			}

			$block[ $field ] = gotg_clean_block_field( $cleaner, $row[ $field ] );
		}

		$clean[] = $block;
	}

	return array_slice( array_values( $clean ), 0, 20 );
}

/**
 * Normalises the social links rows of the Site Settings option.
 *
 * @param mixed $value Raw value.
 * @return array<int, array{platform: string, url: string, handle: string}> Rows.
 */
function gotg_sanitize_social_links( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$platforms = array( 'instagram', 'facebook', 'yelp', 'google', 'tripadvisor', 'youtube' );
	$clean     = array();

	foreach ( $value as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$platform = isset( $row['platform'] ) && is_scalar( $row['platform'] )
			? sanitize_key( (string) $row['platform'] )
			: '';

		if ( ! in_array( $platform, $platforms, true ) ) {
			continue;
		}

		$url = isset( $row['url'] ) && is_string( $row['url'] ) ? esc_url_raw( trim( $row['url'] ) ) : '';

		if ( '' === $url ) {
			continue;
		}

		$handle = isset( $row['handle'] ) && is_scalar( $row['handle'] )
			? sanitize_text_field( ltrim( (string) $row['handle'], '@' ) )
			: '';

		$clean[] = array(
			'platform' => $platform,
			'url'      => $url,
			'handle'   => $handle,
		);
	}

	return array_slice( array_values( $clean ), 0, 6 );
}

/**
 * Normalises a navigation rows array.
 *
 * @param mixed $value Raw value.
 * @return array<int, array{label: string, url: string}> Rows.
 */
function gotg_sanitize_nav_rows( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$clean = array();

	foreach ( $value as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$label = isset( $row['label'] ) && is_scalar( $row['label'] )
			? sanitize_text_field( (string) $row['label'] )
			: '';
		$url   = isset( $row['url'] ) ? gotg_sanitize_link( is_scalar( $row['url'] ) ? (string) $row['url'] : '' ) : '';

		// A link with no label and no destination is an empty repeater row.
		if ( '' === $label && '' === $url ) {
			continue;
		}

		$clean[] = array(
			'label' => $label,
			'url'   => $url,
		);
	}

	return array_slice( array_values( $clean ), 0, 8 );
}

/**
 * Normalises the three daypart window rows.
 *
 * Always returns exactly three rows, one per daypart, in breakfast-lunch-dinner
 * order. A daypart absent from the input takes its documented default window
 * (03-CONTENT-MODEL.md §11.5).
 *
 * @param mixed $value Raw value.
 * @return array<int, array{key: string, label: string, starts: string, ends: string}> Three rows.
 */
function gotg_sanitize_daypart_windows( $value ) {
	$defaults = array(
		'breakfast' => array(
			'key'    => 'breakfast',
			'label'  => 'Breakfast',
			'starts' => '06:00',
			'ends'   => '11:00',
		),
		'lunch'     => array(
			'key'    => 'lunch',
			'label'  => 'Lunch',
			'starts' => '11:00',
			'ends'   => '16:00',
		),
		'dinner'    => array(
			'key'    => 'dinner',
			'label'  => 'Dinner',
			'starts' => '16:00',
			'ends'   => '21:00',
		),
	);

	$by_key = array();

	if ( is_array( $value ) ) {
		foreach ( $value as $row ) {
			if ( ! is_array( $row ) || ! isset( $row['key'] ) || ! is_scalar( $row['key'] ) ) {
				continue;
			}

			$key = sanitize_key( (string) $row['key'] );

			if ( ! isset( $defaults[ $key ] ) ) {
				continue;
			}

			$label  = isset( $row['label'] ) && is_scalar( $row['label'] )
				? sanitize_text_field( (string) $row['label'] )
				: '';
			$starts = gotg_sanitize_time( $row['starts'] ?? '' );
			$ends   = gotg_sanitize_time( $row['ends'] ?? '' );

			$by_key[ $key ] = array(
				'key'    => $key,
				'label'  => '' !== $label ? $label : $defaults[ $key ]['label'],
				'starts' => '' !== $starts ? $starts : $defaults[ $key ]['starts'],
				'ends'   => '' !== $ends ? $ends : $defaults[ $key ]['ends'],
			);
		}
	}

	$clean = array();

	foreach ( gotg_daypart_keys() as $key ) {
		$clean[] = $by_key[ $key ] ?? $defaults[ $key ];
	}

	return $clean;
}
