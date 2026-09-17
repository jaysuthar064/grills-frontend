<?php
/**
 * Location meta boxes (03-CONTENT-MODEL.md §5.1–§5.3).
 *
 * Address & Contact box (`normal`/`high`) and Opening Hours box
 * (`normal`/`default`). Regular hours is a fixed seven-row table — no add or
 * remove — while Hours Exceptions is a full repeater reusing gotg-repeater.js.
 * Timezone is a disabled display input plus a hidden field so the value is
 * explicit.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers the Location meta boxes.
 *
 * @return void
 */
function gotg_register_location_meta_boxes() {
	add_meta_box(
		'gotg_location_address_box',
		__( 'Address & Contact', 'gotg' ),
		'gotg_render_location_address_box',
		'gotg_location',
		'normal',
		'high'
	);

	add_meta_box(
		'gotg_location_hours_box',
		__( 'Opening Hours', 'gotg' ),
		'gotg_render_location_hours_box',
		'gotg_location',
		'normal',
		'default'
	);
}
add_action( 'add_meta_boxes_gotg_location', 'gotg_register_location_meta_boxes' );

/**
 * Renders the Address & Contact box.
 *
 * @param WP_Post $post Location being edited.
 * @return void
 */
function gotg_render_location_address_box( $post ) {
	wp_nonce_field( 'gotg_save_gotg_location_address_box', 'gotg_location_address_box_nonce' );

	$errors = gotg_take_meta_errors( $post->ID );

	$text_fields = array(
		array( 'street_address', 'gotg_street_address', __( 'Street Address', 'gotg' ), true, __( 'Street number and name only.', 'gotg' ), '100' ),
		array( 'address_line_2', 'gotg_address_line_2', __( 'Address Line 2', 'gotg' ), false, __( 'Suite, building, or “at Simi Hills Golf Course”.', 'gotg' ), '60' ),
		array( 'city', 'gotg_city', __( 'City', 'gotg' ), true, '', '60' ),
		array( 'state', 'gotg_state', __( 'State', 'gotg' ), true, __( 'Two-letter state code.', 'gotg' ), '2' ),
		array( 'postal_code', 'gotg_postal_code', __( 'Postal Code', 'gotg' ), true, __( 'Five digits, optionally ZIP+4.', 'gotg' ), '10' ),
		array( 'country', 'gotg_country', __( 'Country', 'gotg' ), true, __( 'Two-letter ISO country code.', 'gotg' ), '2' ),
		array( 'latitude', 'gotg_latitude', __( 'Latitude', 'gotg' ), true, __( 'Decimal latitude, −90 to 90. Copy from Google Maps.', 'gotg' ), '' ),
		array( 'longitude', 'gotg_longitude', __( 'Longitude', 'gotg' ), true, __( 'Decimal longitude, −180 to 180.', 'gotg' ), '' ),
		array( 'phone', 'gotg_phone', __( 'Phone', 'gotg' ), true, __( 'Format as 805-842-2947.', 'gotg' ), '' ),
		array( 'email', 'gotg_email', __( 'Email', 'gotg' ), false, __( 'Public enquiry address.', 'gotg' ), '' ),
		array( 'directions_url', 'gotg_directions_url', __( 'Directions URL', 'gotg' ), true, __( 'Google Maps link for the “Get Directions” button.', 'gotg' ), '' ),
	);

	foreach ( $text_fields as $field ) {
		list( $key, $name, $label, $required, $help, $maxlength ) = $field;

		$type = 'email' === $key ? 'email' : ( 'directions_url' === $key ? 'url' : 'text' );

		gotg_render_text_field(
			array(
				'key'      => $key,
				'name'     => $name,
				'type'     => $type,
				'label'    => $label,
				'value'    => (string) get_post_meta( $post->ID, '_' . $name, true ),
				'help'     => $help,
				'required' => $required,
				'errors'   => $errors,
				'attrs'    => '' !== $maxlength ? array( 'maxlength' => $maxlength ) : array(),
			)
		);
	}

	gotg_render_textarea_field(
		array(
			'key'    => 'parking_note',
			'name'   => 'gotg_parking_note',
			'label'  => __( 'Parking Note', 'gotg' ),
			'value'  => (string) get_post_meta( $post->ID, '_gotg_parking_note', true ),
			'help'   => __( 'Short parking or access instruction shown under the address. 200 characters or fewer.', 'gotg' ),
			'rows'   => 2,
			'attrs'  => array( 'maxlength' => '200' ),
			'errors' => $errors,
		)
	);
}

/**
 * Renders the Opening Hours box.
 *
 * @param WP_Post $post Location being edited.
 * @return void
 */
function gotg_render_location_hours_box( $post ) {
	wp_nonce_field( 'gotg_save_gotg_location_hours_box', 'gotg_location_hours_box_nonce' );

	$errors = gotg_take_meta_errors( $post->ID );

	gotg_render_regular_hours_field( get_post_meta( $post->ID, '_gotg_regular_hours', true ), $errors );
	gotg_render_hours_exceptions_field( get_post_meta( $post->ID, '_gotg_hours_exceptions', true ), $errors );

	$timezone = (string) get_post_meta( $post->ID, '_gotg_timezone', true );
	if ( '' === $timezone ) {
		$timezone = 'America/Los_Angeles';
	}

	gotg_field_open( 'timezone', $errors );
	gotg_field_label( 'gotg_timezone_display', __( 'Timezone', 'gotg' ), true );
	printf(
		'<input type="text" id="gotg_timezone_display" value="%s" disabled aria-describedby="gotg_timezone-help" />',
		esc_attr( $timezone )
	);
	printf( '<input type="hidden" name="gotg_timezone" value="%s" />', esc_attr( $timezone ) );
	printf(
		'<p class="description" id="%s">%s</p>',
		esc_attr( 'gotg_timezone-help' ),
		esc_html__( 'Do not change. All hours are Pacific.', 'gotg' )
	);
	gotg_field_close();
}

/**
 * Renders the fixed seven-row regular-hours table.
 *
 * @param mixed $stored Stored `_gotg_regular_hours`.
 * @param array $errors Error map.
 * @return void
 */
function gotg_render_regular_hours_field( $stored, array $errors ) {
	$normalised = gotg_sanitize_regular_hours( is_array( $stored ) ? $stored : array() );
	$by_day     = array();
	foreach ( $normalised as $row ) {
		$by_day[ $row['day'] ] = $row;
	}

	$labels = array(
		'monday'    => __( 'Monday', 'gotg' ),
		'tuesday'   => __( 'Tuesday', 'gotg' ),
		'wednesday' => __( 'Wednesday', 'gotg' ),
		'thursday'  => __( 'Thursday', 'gotg' ),
		'friday'    => __( 'Friday', 'gotg' ),
		'saturday'  => __( 'Saturday', 'gotg' ),
		'sunday'    => __( 'Sunday', 'gotg' ),
	);

	gotg_field_open( 'regular_hours', $errors );
	echo '<div class="gotg-field-heading"><strong>' . esc_html__( 'Regular Hours', 'gotg' ) . '</strong></div>';
	printf(
		'<p class="description">%s</p>',
		esc_html__( 'One row per day. Rows cannot be added or removed. Tick “Closed” for a day with no hours.', 'gotg' )
	);

	echo '<table class="gotg-hours-table"><tbody>';

	foreach ( $labels as $day => $label ) {
		$row       = $by_day[ $day ];
		$opens_id  = 'gotg_regular_hours_' . $day . '_opens';
		$closes_id = 'gotg_regular_hours_' . $day . '_closes';
		$closed_id = 'gotg_regular_hours_' . $day . '_closed';

		echo '<tr>';
		echo '<th scope="row">' . esc_html( $label ) . '</th>';
		printf( '<td><input type="hidden" name="%s" value="%s" />', esc_attr( 'gotg_regular_hours[' . $day . '][day]' ), esc_attr( $day ) );
		printf(
			'<label class="screen-reader-text" for="%1$s">%2$s</label><input type="time" id="%1$s" name="%3$s" value="%4$s" />',
			esc_attr( $opens_id ),
			esc_html( $label . ' ' . __( 'opens', 'gotg' ) ),
			esc_attr( 'gotg_regular_hours[' . $day . '][opens]' ),
			esc_attr( $row['opens'] )
		);
		echo '</td>';
		printf(
			'<td><label class="screen-reader-text" for="%1$s">%2$s</label><input type="time" id="%1$s" name="%3$s" value="%4$s" /></td>',
			esc_attr( $closes_id ),
			esc_html( $label . ' ' . __( 'closes', 'gotg' ) ),
			esc_attr( 'gotg_regular_hours[' . $day . '][closes]' ),
			esc_attr( $row['closes'] )
		);
		printf(
			'<td><label class="gotg-checkbox" for="%1$s"><input type="checkbox" id="%1$s" name="%2$s" value="1"%3$s /> %4$s</label></td>',
			esc_attr( $closed_id ),
			esc_attr( 'gotg_regular_hours[' . $day . '][is_closed]' ),
			checked( ! empty( $row['is_closed'] ), true, false ),
			esc_html__( 'Closed', 'gotg' )
		);
		echo '</tr>';
	}

	echo '</tbody></table>';
	gotg_field_close();
}

/**
 * Renders the hours-exceptions repeater.
 *
 * @param mixed $stored Stored `_gotg_hours_exceptions`.
 * @param array $errors Error map.
 * @return void
 */
function gotg_render_hours_exceptions_field( $stored, array $errors ) {
	$rows = is_array( $stored ) ? array_values( $stored ) : array();

	gotg_field_open( 'hours_exceptions', $errors );
	echo '<div class="gotg-field-heading"><strong>' . esc_html__( 'Hours Exceptions', 'gotg' ) . '</strong></div>';
	printf(
		'<p class="description" id="%s">%s</p>',
		esc_attr( 'gotg-field-hours_exceptions-help' ),
		esc_html__( 'Holiday and special hours. Add a row for each date that differs from the regular schedule. Up to 50.', 'gotg' )
	);

	echo '<div class="gotg-repeater" data-gotg-repeater="gotg_hours_exceptions" aria-describedby="gotg-field-hours_exceptions-help">';
	echo '<div class="gotg-repeater-rows" data-gotg-repeater-rows>';

	foreach ( $rows as $index => $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}
		echo gotg_hours_exception_row_html( (string) $index, $row ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside the builder.
	}

	echo '</div>';

	printf(
		'<p class="gotg-repeater-empty"%s>%s</p>',
		empty( $rows ) ? '' : ' hidden',
		esc_html__( 'No exceptions yet.', 'gotg' )
	);

	echo '<template data-gotg-repeater-template>';
	echo gotg_hours_exception_row_html( '__INDEX__', array() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside the builder.
	echo '</template>';

	printf(
		'<p><button type="button" class="button button-secondary" data-gotg-repeater-add>%s</button></p>',
		esc_html__( 'Add exception', 'gotg' )
	);

	echo '<div class="screen-reader-text" aria-live="polite" data-gotg-repeater-status></div>';
	echo '</div>';
	gotg_field_close();
}

/**
 * Builds one hours-exception row.
 *
 * @param string $index Row index or the `__INDEX__` placeholder.
 * @param array  $row   Stored row values.
 * @return string Escaped markup.
 */
function gotg_hours_exception_row_html( $index, array $row ) {
	$date      = isset( $row['date'] ) ? (string) $row['date'] : '';
	$label     = isset( $row['label'] ) ? (string) $row['label'] : '';
	$is_closed = ! empty( $row['is_closed'] );
	$opens     = isset( $row['opens'] ) ? (string) $row['opens'] : '';
	$closes    = isset( $row['closes'] ) ? (string) $row['closes'] : '';
	$base      = 'gotg_hours_exceptions[' . $index . ']';

	ob_start();
	?>
	<div class="gotg-repeater-row" data-gotg-repeater-row>
		<div class="gotg-field-inline">
			<label for="<?php echo esc_attr( 'gotg_he_' . $index . '_date' ); ?>"><?php esc_html_e( 'Date', 'gotg' ); ?></label>
			<input type="date" id="<?php echo esc_attr( 'gotg_he_' . $index . '_date' ); ?>" name="<?php echo esc_attr( $base . '[date]' ); ?>" value="<?php echo esc_attr( $date ); ?>" />
		</div>
		<div class="gotg-field-inline">
			<label for="<?php echo esc_attr( 'gotg_he_' . $index . '_label' ); ?>"><?php esc_html_e( 'Label', 'gotg' ); ?></label>
			<input type="text" id="<?php echo esc_attr( 'gotg_he_' . $index . '_label' ); ?>" name="<?php echo esc_attr( $base . '[label]' ); ?>" value="<?php echo esc_attr( $label ); ?>" maxlength="40" placeholder="<?php esc_attr_e( 'e.g. Thanksgiving', 'gotg' ); ?>" />
		</div>
		<div class="gotg-field-inline">
			<label for="<?php echo esc_attr( 'gotg_he_' . $index . '_opens' ); ?>"><?php esc_html_e( 'Opens', 'gotg' ); ?></label>
			<input type="time" id="<?php echo esc_attr( 'gotg_he_' . $index . '_opens' ); ?>" name="<?php echo esc_attr( $base . '[opens]' ); ?>" value="<?php echo esc_attr( $opens ); ?>" />
		</div>
		<div class="gotg-field-inline">
			<label for="<?php echo esc_attr( 'gotg_he_' . $index . '_closes' ); ?>"><?php esc_html_e( 'Closes', 'gotg' ); ?></label>
			<input type="time" id="<?php echo esc_attr( 'gotg_he_' . $index . '_closes' ); ?>" name="<?php echo esc_attr( $base . '[closes]' ); ?>" value="<?php echo esc_attr( $closes ); ?>" />
		</div>
		<div class="gotg-field-inline">
			<label class="gotg-checkbox" for="<?php echo esc_attr( 'gotg_he_' . $index . '_closed' ); ?>">
				<input type="checkbox" id="<?php echo esc_attr( 'gotg_he_' . $index . '_closed' ); ?>" name="<?php echo esc_attr( $base . '[is_closed]' ); ?>" value="1" <?php checked( $is_closed ); ?> /> <?php esc_html_e( 'Closed', 'gotg' ); ?>
			</label>
		</div>
		<div class="gotg-repeater-controls">
			<button type="button" class="button" data-gotg-repeater-up><?php esc_html_e( 'Move up', 'gotg' ); ?></button>
			<button type="button" class="button" data-gotg-repeater-down><?php esc_html_e( 'Move down', 'gotg' ); ?></button>
			<button type="button" class="button gotg-repeater-remove" data-gotg-repeater-remove><?php esc_html_e( 'Remove', 'gotg' ); ?></button>
		</div>
	</div>
	<?php
	return (string) ob_get_clean();
}

/**
 * Validates the Address & Contact box.
 *
 * @param array $input  Submitted data.
 * @param array $errors Error map, by reference.
 * @return array<string, mixed> Meta key to value (or null to delete).
 */
function gotg_validate_location_address_input( array $input, array &$errors ) {
	$values = array();

	$street = gotg_posted_string( $input, 'gotg_street_address' );
	if ( '' === $street || mb_strlen( $street ) > 100 ) {
		$errors['street_address'] = __( 'The street address is required and must be 100 characters or fewer.', 'gotg' );
	} else {
		$values['_gotg_street_address'] = $street;
	}

	$line2 = gotg_posted_string( $input, 'gotg_address_line_2' );
	if ( mb_strlen( $line2 ) > 60 ) {
		$errors['address_line_2'] = __( 'Address line 2 must be 60 characters or fewer.', 'gotg' );
	} else {
		$values['_gotg_address_line_2'] = ( '' === $line2 ) ? null : $line2;
	}

	$city = gotg_posted_string( $input, 'gotg_city' );
	if ( '' === $city || mb_strlen( $city ) > 60 ) {
		$errors['city'] = __( 'The city is required and must be 60 characters or fewer.', 'gotg' );
	} else {
		$values['_gotg_city'] = $city;
	}

	$state = gotg_posted_string( $input, 'gotg_state' );
	if ( 1 !== preg_match( '/^[A-Za-z]{2}$/', $state ) ) {
		$errors['state'] = __( 'Enter a two-letter state code.', 'gotg' );
	} else {
		$values['_gotg_state'] = $state;
	}

	$postal = gotg_posted_string( $input, 'gotg_postal_code' );
	if ( 1 !== preg_match( '/^\d{5}(-\d{4})?$/', $postal ) ) {
		$errors['postal_code'] = __( 'Enter a valid postal code (12345 or 12345-6789).', 'gotg' );
	} else {
		$values['_gotg_postal_code'] = $postal;
	}

	$country = gotg_posted_string( $input, 'gotg_country' );
	if ( 1 !== preg_match( '/^[A-Za-z]{2}$/', $country ) ) {
		$errors['country'] = __( 'Enter a two-letter country code.', 'gotg' );
	} else {
		$values['_gotg_country'] = $country;
	}

	$lat = gotg_posted_string( $input, 'gotg_latitude' );
	if ( '' === $lat || ! is_numeric( $lat ) || (float) $lat < -90 || (float) $lat > 90 ) {
		$errors['latitude'] = __( 'Enter a latitude between −90 and 90.', 'gotg' );
	} else {
		$values['_gotg_latitude'] = $lat;
	}

	$lng = gotg_posted_string( $input, 'gotg_longitude' );
	if ( '' === $lng || ! is_numeric( $lng ) || (float) $lng < -180 || (float) $lng > 180 ) {
		$errors['longitude'] = __( 'Enter a longitude between −180 and 180.', 'gotg' );
	} else {
		$values['_gotg_longitude'] = $lng;
	}

	$phone = gotg_posted_string( $input, 'gotg_phone' );
	if ( 1 !== preg_match( '/^\d{3}-\d{3}-\d{4}$/', $phone ) ) {
		$errors['phone'] = __( 'Enter a phone number as 805-842-2947.', 'gotg' );
	} else {
		$values['_gotg_phone'] = $phone;
	}

	$email = gotg_posted_string( $input, 'gotg_email' );
	if ( '' !== $email && ! is_email( $email ) ) {
		$errors['email'] = __( 'Enter a valid email address.', 'gotg' );
	} else {
		$values['_gotg_email'] = ( '' === $email ) ? null : $email;
	}

	$directions = gotg_posted_string( $input, 'gotg_directions_url' );
	if ( '' === $directions || false === wp_http_validate_url( $directions ) ) {
		$errors['directions_url'] = __( 'Enter a valid directions URL.', 'gotg' );
	} else {
		$values['_gotg_directions_url'] = $directions;
	}

	$parking = gotg_posted_string( $input, 'gotg_parking_note' );
	if ( mb_strlen( $parking ) > 200 ) {
		$errors['parking_note'] = __( 'The parking note must be 200 characters or fewer.', 'gotg' );
	} else {
		$values['_gotg_parking_note'] = ( '' === $parking ) ? null : $parking;
	}

	return $values;
}

/**
 * Validates the Opening Hours box.
 *
 * @param array $input  Submitted data.
 * @param array $errors Error map, by reference.
 * @return array<string, mixed> Meta key to value (or null to delete).
 */
function gotg_validate_location_hours_input( array $input, array &$errors ) {
	$values = array();
	$days   = array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' );

	$regular      = gotg_posted_array( $input, 'gotg_regular_hours' );
	$regular_fail = false;

	foreach ( $days as $day ) {
		$row = isset( $regular[ $day ] ) && is_array( $regular[ $day ] ) ? $regular[ $day ] : array();

		if ( ! empty( $row['is_closed'] ) ) {
			continue;
		}

		$opens  = isset( $row['opens'] ) ? (string) $row['opens'] : '';
		$closes = isset( $row['closes'] ) ? (string) $row['closes'] : '';

		if ( 1 !== preg_match( '/^\d{2}:\d{2}$/', $opens ) || 1 !== preg_match( '/^\d{2}:\d{2}$/', $closes ) || $closes <= $opens ) {
			$regular_fail = true;
		}
	}

	if ( $regular_fail ) {
		$errors['regular_hours'] = __( 'Each open day needs an opening and closing time, with the close after the open.', 'gotg' );
	} else {
		$values['_gotg_regular_hours'] = $regular;
	}

	$exceptions      = gotg_posted_array( $input, 'gotg_hours_exceptions' );
	$exceptions_fail = false;
	$kept            = 0;

	foreach ( $exceptions as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$date  = isset( $row['date'] ) ? trim( (string) $row['date'] ) : '';
		$label = isset( $row['label'] ) ? trim( (string) $row['label'] ) : '';

		if ( '' === $date && '' === $label ) {
			continue; // Empty repeater row.
		}

		++$kept;

		if ( 1 !== preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) || mb_strlen( $label ) < 1 || mb_strlen( $label ) > 40 ) {
			$exceptions_fail = true;
			continue;
		}

		if ( empty( $row['is_closed'] ) ) {
			$opens  = isset( $row['opens'] ) ? (string) $row['opens'] : '';
			$closes = isset( $row['closes'] ) ? (string) $row['closes'] : '';
			if ( 1 !== preg_match( '/^\d{2}:\d{2}$/', $opens ) || 1 !== preg_match( '/^\d{2}:\d{2}$/', $closes ) ) {
				$exceptions_fail = true;
			}
		}
	}

	if ( $exceptions_fail || $kept > 50 ) {
		$errors['hours_exceptions'] = __( 'Each exception needs a date and a 1–40 character label, and times unless it is closed. Up to 50.', 'gotg' );
	} else {
		$values['_gotg_hours_exceptions'] = $exceptions;
	}

	$timezone = gotg_posted_string( $input, 'gotg_timezone' );
	if ( 'America/Los_Angeles' !== $timezone ) {
		$errors['timezone'] = __( 'The timezone must be America/Los_Angeles.', 'gotg' );
	} else {
		$values['_gotg_timezone'] = $timezone;
	}

	return $values;
}

/**
 * Saves the Address & Contact box.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 * @return void
 */
function gotg_save_location_address_box( $post_id, $post ) {
	if ( ! gotg_meta_box_can_save(
		$post_id,
		$post,
		'gotg_location',
		'gotg_location_address_box_nonce',
		'gotg_save_gotg_location_address_box'
	) ) {
		return;
	}

	$errors = array();
	$values = gotg_validate_location_address_input( $_POST, $errors ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- nonce verified in gotg_meta_box_can_save().

	if ( ! empty( $errors ) ) {
		gotg_store_meta_errors( $post_id, $errors );
	}

	gotg_meta_box_write( $post_id, $values );
}
add_action( 'save_post', 'gotg_save_location_address_box', 10, 2 );

/**
 * Saves the Opening Hours box.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 * @return void
 */
function gotg_save_location_hours_box( $post_id, $post ) {
	if ( ! gotg_meta_box_can_save(
		$post_id,
		$post,
		'gotg_location',
		'gotg_location_hours_box_nonce',
		'gotg_save_gotg_location_hours_box'
	) ) {
		return;
	}

	$errors = array();
	$values = gotg_validate_location_hours_input( $_POST, $errors ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- nonce verified in gotg_meta_box_can_save().

	if ( ! empty( $errors ) ) {
		gotg_store_meta_errors( $post_id, $errors );
	}

	gotg_meta_box_write( $post_id, $values );
}
add_action( 'save_post', 'gotg_save_location_hours_box', 10, 2 );
