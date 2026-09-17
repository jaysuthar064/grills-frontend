<?php
/**
 * Event meta box (03-CONTENT-MODEL.md §4.3–§4.5).
 *
 * One box, `normal`/`high`, fields in the documented order. Performer fields
 * show only for live music and ticket fields only when ticketed — toggled by
 * `hidden` on their wrappers (gotg-conditional-fields.js). Hidden fields are
 * never disabled and are still submitted; without JavaScript every field is
 * visible. The end-after-start rule lives in the save handler (§4.5).
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers the Event Details box.
 *
 * @return void
 */
function gotg_register_event_meta_boxes() {
	add_meta_box(
		'gotg_event_details_box',
		__( 'Event Details', 'gotg' ),
		'gotg_render_event_details_box',
		'gotg_event',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes_gotg_event', 'gotg_register_event_meta_boxes' );

/**
 * Opens a conditional wrapper the JS shows or hides.
 *
 * @param string $condition `event-type` or `ticketed`.
 * @param string $value     For `event-type`, the value that reveals the group.
 * @return void
 */
function gotg_event_conditional_open( $condition, $value = '' ) {
	printf(
		'<div data-gotg-show-if="%s"%s>',
		esc_attr( $condition ),
		'' !== $value ? ' data-gotg-show-value="' . esc_attr( $value ) . '"' : ''
	);
}

/**
 * Renders the Event Details box.
 *
 * @param WP_Post $post Event being edited.
 * @return void
 */
function gotg_render_event_details_box( $post ) {
	wp_nonce_field( 'gotg_save_gotg_event_details_box', 'gotg_event_details_box_nonce' );

	$errors = gotg_take_meta_errors( $post->ID );

	$start = (string) get_post_meta( $post->ID, '_gotg_start_datetime', true );
	$end   = (string) get_post_meta( $post->ID, '_gotg_end_datetime', true );

	$default_date = '';
	$start_time   = '19:00';
	$end_time     = '22:00';

	if ( '' !== $start ) {
		$parts        = explode( ' ', str_replace( 'T', ' ', $start ) );
		$default_date = $parts[0] ?? '';
		$start_time   = substr( $parts[1] ?? '19:00', 0, 5 );
	} elseif ( ! empty( $_GET['event_date'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$default_date = sanitize_text_field( wp_unslash( $_GET['event_date'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	}

	if ( '' !== $end ) {
		$end_parts = explode( ' ', str_replace( 'T', ' ', $end ) );
		$end_time  = substr( $end_parts[1] ?? '22:00', 0, 5 );
	}

	?>
	<div class="gotg-field" id="gotg-field-event-schedule" style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px 18px; border-radius:8px; margin-bottom:20px;">
		<label style="font-size:14px; font-weight:700; color:#0f172a; display:block; margin-bottom:6px;">
			📅 <?php esc_html_e( 'Event Date & Schedule', 'gotg' ); ?> <span class="gotg-required">(required)</span>
		</label>
		<p class="description" style="margin-top:0; margin-bottom:12px; color:#475569;">
			<?php esc_html_e( 'Set what date and time this event should be held. It will appear on the website calendar for this day.', 'gotg' ); ?>
		</p>

		<?php if ( isset( $errors['start_datetime'] ) ) : ?>
			<p class="gotg-field-error" role="alert"><?php echo esc_html( $errors['start_datetime'] ); ?></p>
		<?php endif; ?>
		<?php if ( isset( $errors['end_datetime'] ) ) : ?>
			<p class="gotg-field-error" role="alert"><?php echo esc_html( $errors['end_datetime'] ); ?></p>
		<?php endif; ?>

		<div style="display:flex; flex-wrap:wrap; gap:14px; align-items:flex-end;">
			<div>
				<label for="gotg_event_date" style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:4px;">
					<?php esc_html_e( 'Event Date', 'gotg' ); ?>
				</label>
				<input
					type="date"
					id="gotg_event_date"
					name="gotg_event_date"
					value="<?php echo esc_attr( $default_date ); ?>"
					required
					style="font-size:14px; padding:6px 10px; border-radius:4px; border:1px solid #94a3b8; font-weight:600; min-width:180px;"
				/>
			</div>

			<div>
				<label for="gotg_start_time" style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:4px;">
					<?php esc_html_e( 'Start Time', 'gotg' ); ?>
				</label>
				<input
					type="time"
					id="gotg_start_time"
					name="gotg_start_time"
					value="<?php echo esc_attr( $start_time ); ?>"
					required
					style="font-size:14px; padding:6px 10px; border-radius:4px; border:1px solid #94a3b8; font-weight:600; min-width:130px;"
				/>
			</div>

			<div>
				<label for="gotg_end_time" style="display:block; font-size:12px; font-weight:600; color:#334155; margin-bottom:4px;">
					<?php esc_html_e( 'End Time', 'gotg' ); ?>
				</label>
				<input
					type="time"
					id="gotg_end_time"
					name="gotg_end_time"
					value="<?php echo esc_attr( $end_time ); ?>"
					style="font-size:14px; padding:6px 10px; border-radius:4px; border:1px solid #94a3b8; font-weight:600; min-width:130px;"
				/>
			</div>
		</div>

		<!-- Quick Presets Toolbar -->
		<div style="margin-top:12px; padding-top:10px; border-top:1px dashed #cbd5e1; display:flex; flex-wrap:wrap; align-items:center; gap:8px;">
			<span style="font-size:12px; font-weight:600; color:#475569;"><?php esc_html_e( 'Quick Time Presets:', 'gotg' ); ?></span>
			<button type="button" class="button button-small gotg-preset-time" data-start="19:00" data-end="22:00">
				🎸 Weekend Night (7:00 PM – 10:00 PM)
			</button>
			<button type="button" class="button button-small gotg-preset-time" data-start="13:00" data-end="16:00">
				🎵 Sunday Acoustic (1:00 PM – 4:00 PM)
			</button>
			<button type="button" class="button button-small gotg-preset-time" data-start="12:00" data-end="17:00">
				🍖 Afternoon BBQ (12:00 PM – 5:00 PM)
			</button>
			<button type="button" class="button button-small gotg-preset-time" data-start="10:00" data-end="14:00">
				🥞 Brunch Special (10:00 AM – 2:00 PM)
			</button>
		</div>

		<script>
		jQuery(function($) {
			$('.gotg-preset-time').on('click', function(e) {
				e.preventDefault();
				var start = $(this).data('start');
				var end = $(this).data('end');
				$('#gotg_start_time').val(start);
				$('#gotg_end_time').val(end);
			});
		});
		</script>
	</div>
	<?php

	gotg_render_select_field(
		array(
			'key'      => 'event_type',
			'name'     => 'gotg_event_type',
			'label'    => __( 'Event Type', 'gotg' ),
			'value'    => (string) get_post_meta( $post->ID, '_gotg_event_type', true ),
			'required' => true,
			'options'  => array(
				'live_music'   => __( 'Live Music', 'gotg' ),
				'special_menu' => __( 'Special Menu', 'gotg' ),
				'holiday'      => __( 'Holiday', 'gotg' ),
				'private'      => __( 'Private', 'gotg' ),
				'other'        => __( 'Other', 'gotg' ),
			),
			'help'     => __( 'Drives the icon and label on the event card. Private events are excluded from the site.', 'gotg' ),
			'errors'   => $errors,
		)
	);

	gotg_event_conditional_open( 'event-type', 'live_music' );
	gotg_render_text_field(
		array(
			'key'    => 'performer_name',
			'name'   => 'gotg_performer_name',
			'label'  => __( 'Performer Name', 'gotg' ),
			'value'  => (string) get_post_meta( $post->ID, '_gotg_performer_name', true ),
			'help'   => __( 'Band or artist name. Fill this in for live music events.', 'gotg' ),
			'attrs'  => array( 'maxlength' => '80' ),
			'errors' => $errors,
		)
	);
	gotg_render_text_field(
		array(
			'key'    => 'performer_url',
			'name'   => 'gotg_performer_url',
			'type'   => 'url',
			'label'  => __( 'Performer Link', 'gotg' ),
			'value'  => (string) get_post_meta( $post->ID, '_gotg_performer_url', true ),
			'help'   => __( 'Optional https link to the performer’s site or Instagram.', 'gotg' ),
			'errors' => $errors,
		)
	);
	echo '</div>';

	gotg_render_textarea_field(
		array(
			'key'      => 'summary',
			'name'     => 'gotg_summary',
			'label'    => __( 'Short Summary', 'gotg' ),
			'value'    => (string) get_post_meta( $post->ID, '_gotg_summary', true ),
			'help'     => __( 'One sentence shown on event cards and used as the search-result description. 1–160 characters.', 'gotg' ),
			'required' => true,
			'rows'     => 2,
			'attrs'    => array( 'maxlength' => '160' ),
			'errors'   => $errors,
		)
	);

	gotg_render_checkbox_field(
		array(
			'key'     => 'is_ticketed',
			'name'    => 'gotg_is_ticketed',
			'label'   => __( 'Ticketed', 'gotg' ),
			'checked' => (bool) get_post_meta( $post->ID, '_gotg_is_ticketed', true ),
			'help'    => __( 'Turn on if attendance requires a ticket or a cover charge.', 'gotg' ),
			'errors'  => $errors,
		)
	);

	gotg_event_conditional_open( 'ticketed' );
	gotg_render_text_field(
		array(
			'key'    => 'ticket_url',
			'name'   => 'gotg_ticket_url',
			'type'   => 'url',
			'label'  => __( 'Ticket / Info URL', 'gotg' ),
			'value'  => (string) get_post_meta( $post->ID, '_gotg_ticket_url', true ),
			'help'   => __( 'Where to buy tickets or read more.', 'gotg' ),
			'errors' => $errors,
		)
	);

	$cover = get_post_meta( $post->ID, '_gotg_cover_charge', true );
	gotg_render_text_field(
		array(
			'key'    => 'cover_charge',
			'name'   => 'gotg_cover_charge',
			'type'   => 'text',
			'label'  => __( 'Cover Charge', 'gotg' ),
			'value'  => is_numeric( $cover ) ? (string) $cover : '',
			'help'   => __( 'Cover charge in USD, 0–999. Leave empty if free.', 'gotg' ),
			'attrs'  => array( 'inputmode' => 'decimal' ),
			'errors' => $errors,
		)
	);
	echo '</div>';

	gotg_render_checkbox_field(
		array(
			'key'     => 'is_recurring_instance',
			'name'    => 'gotg_is_recurring_instance',
			'label'   => __( 'One night of the standing live music', 'gotg' ),
			'checked' => (bool) get_post_meta( $post->ID, '_gotg_is_recurring_instance', true ),
			'help'    => __( 'Turn on if this is one night of the standing Friday and Saturday live music. Prevents duplicating the programme card.', 'gotg' ),
			'errors'  => $errors,
		)
	);
}

/**
 * Validates submitted Event input.
 *
 * @param array $input  Submitted data ($_POST).
 * @param array $errors Error map, by reference.
 * @return array<string, mixed> Meta key to value (or null to delete).
 */
function gotg_validate_event_input( array $input, array &$errors ) {
	$values = array();

	$event_date = gotg_posted_string( $input, 'gotg_event_date' );
	$start_time = gotg_posted_string( $input, 'gotg_start_time' );
	$end_time   = gotg_posted_string( $input, 'gotg_end_time' );

	if ( '' !== $event_date ) {
		if ( '' === $start_time ) {
			$start_time = '19:00';
		}
		if ( '' === $end_time ) {
			$end_time = '22:00';
		}

		$start = $event_date . ' ' . $start_time;

		// If end time is earlier than or equal to start time, it crosses midnight into the next day
		if ( strtotime( $end_time ) <= strtotime( $start_time ) ) {
			$next_day = date( 'Y-m-d', strtotime( $event_date . ' +1 day' ) );
			$end      = $next_day . ' ' . $end_time;
		} else {
			$end      = $event_date . ' ' . $end_time;
		}
	} else {
		$start = gotg_posted_string( $input, 'gotg_start_datetime' );
		$end   = gotg_posted_string( $input, 'gotg_end_datetime' );
	}

	$start_ts = ( '' !== $start ) ? strtotime( $start ) : false;
	$end_ts   = ( '' !== $end ) ? strtotime( $end ) : false;

	if ( '' === $start || false === $start_ts ) {
		$errors['start_datetime'] = __( 'Enter a valid event date and start time.', 'gotg' );
	} else {
		$values['_gotg_start_datetime'] = date( 'Y-m-d H:i', $start_ts );
	}

	if ( '' === $end || false === $end_ts ) {
		$errors['end_datetime'] = __( 'Enter a valid end date and time.', 'gotg' );
	} elseif ( false !== $start_ts && $end_ts <= $start_ts ) {
		$errors['end_datetime'] = __( 'The end time must be after the start time.', 'gotg' );
	} else {
		$values['_gotg_end_datetime'] = date( 'Y-m-d H:i', $end_ts );
	}

	$type    = gotg_posted_string( $input, 'gotg_event_type' );
	$allowed = array( 'live_music', 'special_menu', 'holiday', 'private', 'other' );

	if ( in_array( $type, $allowed, true ) ) {
		$values['_gotg_event_type'] = $type;
	} else {
		$errors['event_type'] = __( 'Choose a valid event type.', 'gotg' );
	}

	// Performer fields — validated regardless of type; the shaper decides what
	// reaches the API. Values are kept so a type switch does not lose them.
	$performer = gotg_posted_string( $input, 'gotg_performer_name' );
	if ( mb_strlen( $performer ) > 80 ) {
		$errors['performer_name'] = __( 'The performer name must be 80 characters or fewer.', 'gotg' );
	} else {
		$values['_gotg_performer_name'] = ( '' === $performer ) ? null : $performer;
	}

	$performer_url = gotg_posted_string( $input, 'gotg_performer_url' );
	if ( '' !== $performer_url && ! gotg_is_https_url( $performer_url ) ) {
		$errors['performer_url'] = __( 'The performer link must be a valid https URL.', 'gotg' );
	} else {
		$values['_gotg_performer_url'] = ( '' === $performer_url ) ? null : $performer_url;
	}

	$summary = gotg_posted_string( $input, 'gotg_summary' );
	$summary_len = mb_strlen( $summary );
	if ( $summary_len < 1 || $summary_len > 160 ) {
		$errors['summary'] = __( 'The summary is required and must be 1–160 characters.', 'gotg' );
	} else {
		$values['_gotg_summary'] = $summary;
	}

	$ticket_url = gotg_posted_string( $input, 'gotg_ticket_url' );
	if ( '' !== $ticket_url && false === wp_http_validate_url( $ticket_url ) ) {
		$errors['ticket_url'] = __( 'The ticket URL must be a valid URL.', 'gotg' );
	} else {
		$values['_gotg_ticket_url'] = ( '' === $ticket_url ) ? null : $ticket_url;
	}

	$cover = gotg_posted_string( $input, 'gotg_cover_charge' );
	if ( '' === $cover ) {
		$values['_gotg_cover_charge'] = null;
	} elseif ( ! is_numeric( $cover ) || (float) $cover < 0 || (float) $cover > 999 ) {
		$errors['cover_charge'] = __( 'The cover charge must be a number from 0 to 999.', 'gotg' );
	} else {
		$values['_gotg_cover_charge'] = $cover;
	}

	$values['_gotg_is_ticketed']           = gotg_posted_checkbox( $input, 'gotg_is_ticketed' );
	$values['_gotg_is_recurring_instance'] = gotg_posted_checkbox( $input, 'gotg_is_recurring_instance' );

	return $values;
}

/**
 * Whether a string is a valid https URL.
 *
 * @param string $url Candidate URL.
 * @return bool
 */
function gotg_is_https_url( $url ) {
	if ( false === wp_http_validate_url( $url ) ) {
		return false;
	}

	return 'https' === wp_parse_url( $url, PHP_URL_SCHEME );
}

/**
 * Saves Event Details meta.
 *
 * @param int     $post_id Post being saved.
 * @param WP_Post $post    Post object.
 * @return void
 */
function gotg_save_event_details_box( $post_id, $post ) {
	if ( ! gotg_meta_box_can_save(
		$post_id,
		$post,
		'gotg_event',
		'gotg_event_details_box_nonce',
		'gotg_save_gotg_event_details_box'
	) ) {
		return;
	}

	$errors = array();
	$values = gotg_validate_event_input( $_POST, $errors ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- nonce verified in gotg_meta_box_can_save().

	if ( ! empty( $errors ) ) {
		gotg_store_meta_errors( $post_id, $errors );
	}

	gotg_meta_box_write( $post_id, $values );
}
add_action( 'save_post', 'gotg_save_event_details_box', 10, 2 );
