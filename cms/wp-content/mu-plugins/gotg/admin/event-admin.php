<?php
/**
 * Headless CMS Event Management: Admin Columns, Filters, Quick Edit, and Visual Calendar.
 *
 * Enables clients to set, view, sort, and manage what event is scheduled on what date.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Customizes columns on the Events list table (edit.php?post_type=gotg_event).
 *
 * @param array $columns Existing columns.
 * @return array Modified columns.
 */
function gotg_event_admin_columns( $columns ) {
	$new = array();
	$new['cb']             = $columns['cb'] ?? '<input type="checkbox" />';
	$new['title']          = __( 'Event Title', 'gotg' );
	$new['event_schedule'] = __( '📅 Event Date & Time', 'gotg' );
	$new['event_status']   = __( 'Status', 'gotg' );
	$new['event_type']     = __( 'Type', 'gotg' );
	$new['performer']      = __( 'Performer / Artist', 'gotg' );
	$new['admission']      = __( 'Admission', 'gotg' );
	$new['date']           = __( 'Published', 'gotg' );

	return $new;
}
add_filter( 'manage_gotg_event_posts_columns', 'gotg_event_admin_columns' );

/**
 * Renders custom column content on the Events list table.
 *
 * @param string $column  Column name.
 * @param int    $post_id Post ID.
 * @return void
 */
function gotg_event_admin_custom_column( $column, $post_id ) {
	$start_str = (string) get_post_meta( $post_id, '_gotg_start_datetime', true );
	$end_str   = (string) get_post_meta( $post_id, '_gotg_end_datetime', true );

	$start_ts  = ( '' !== $start_str ) ? strtotime( $start_str ) : false;
	$end_ts    = ( '' !== $end_str ) ? strtotime( $end_str ) : false;
	$now_ts    = current_time( 'timestamp' ); // phpcs:ignore WordPress.DateTime.CurrentTimeTimestamp.Requested

	switch ( $column ) {
		case 'event_schedule':
			if ( false !== $start_ts ) {
				$day_name  = date( 'l', $start_ts );
				$date_fmt  = date( 'M j, Y', $start_ts );
				$start_fmt = date( 'g:i A', $start_ts );
				$end_fmt   = ( false !== $end_ts ) ? date( 'g:i A', $end_ts ) : '';

				printf(
					'<div class="gotg-col-schedule" data-start="%s" data-end="%s">
						<strong style="font-size:13px; color:#1d2327;">%s, %s</strong><br>
						<span style="color:#50575e; font-size:12px;">⏰ %s%s</span>
					</div>',
					esc_attr( str_replace( ' ', 'T', $start_str ) ),
					esc_attr( str_replace( ' ', 'T', $end_str ) ),
					esc_html( $day_name ),
					esc_html( $date_fmt ),
					esc_html( $start_fmt ),
					$end_fmt ? ' – ' . esc_html( $end_fmt ) : ''
				);
			} else {
				echo '<span style="color:#a32118; font-style:italic;">' . esc_html__( 'No date set', 'gotg' ) . '</span>';
			}
			break;

		case 'event_status':
			if ( false === $start_ts ) {
				echo '—';
				break;
			}

			$today_start = strtotime( 'today midnight', $now_ts );
			$today_end   = strtotime( 'tomorrow midnight', $now_ts ) - 1;

			if ( false !== $end_ts && $end_ts < $now_ts ) {
				echo '<span style="background:#f1f3f4; color:#5f6368; padding:3px 8px; border-radius:10px; font-weight:600; font-size:11px; text-transform:uppercase;">' . esc_html__( 'Past', 'gotg' ) . '</span>';
			} elseif ( $start_ts >= $today_start && $start_ts <= $today_end ) {
				echo '<span style="background:#fef7e0; color:#b06000; padding:3px 8px; border-radius:10px; font-weight:700; font-size:11px; text-transform:uppercase;">' . esc_html__( 'Today', 'gotg' ) . '</span>';
			} else {
				$diff_days = round( ( $start_ts - $now_ts ) / DAY_IN_SECONDS );
				$in_label  = $diff_days > 0 ? sprintf( __( 'in %d days', 'gotg' ), $diff_days ) : __( 'Upcoming', 'gotg' );
				echo '<span style="background:#def7ec; color:#03543f; padding:3px 8px; border-radius:10px; font-weight:700; font-size:11px; text-transform:uppercase;">' . esc_html__( 'Upcoming', 'gotg' ) . '</span>';
				echo '<div style="font-size:11px; color:#50575e; margin-top:2px;">' . esc_html( $in_label ) . '</div>';
			}
			break;

		case 'event_type':
			$type = (string) get_post_meta( $post_id, '_gotg_event_type', true );
			$labels = array(
				'live_music'   => '🎸 Live Music',
				'special_menu' => '🍽️ Special Menu',
				'holiday'      => '🎉 Holiday',
				'private'      => '🔒 Private (Hidden)',
				'other'        => '📌 Other',
			);
			echo esc_html( $labels[ $type ] ?? ( $type ?: '—' ) );
			break;

		case 'performer':
			$name = (string) get_post_meta( $post_id, '_gotg_performer_name', true );
			$url  = (string) get_post_meta( $post_id, '_gotg_performer_url', true );
			if ( '' !== $name ) {
				if ( '' !== $url ) {
					printf( '<a href="%s" target="_blank" rel="noopener noreferrer">%s ↗</a>', esc_url( $url ), esc_html( $name ) );
				} else {
					echo esc_html( $name );
				}
			} else {
				echo '<span style="color:#8c8f94;">—</span>';
			}
			break;

		case 'admission':
			$ticketed = (bool) get_post_meta( $post_id, '_gotg_is_ticketed', true );
			$cover    = get_post_meta( $post_id, '_gotg_cover_charge', true );
			if ( $ticketed ) {
				if ( is_numeric( $cover ) && (float) $cover > 0 ) {
					printf( '<span style="font-weight:600;">$%s Cover</span>', esc_html( number_format( (float) $cover, 2 ) ) );
				} else {
					echo '<span style="font-weight:600; color:#0969da;">Ticketed</span>';
				}
			} else {
				echo '<span style="color:#50575e;">Free / Open</span>';
			}
			break;
	}
}
add_action( 'manage_gotg_event_posts_custom_column', 'gotg_event_admin_custom_column', 10, 2 );

/**
 * Registers sortable columns for gotg_event.
 *
 * @param array $sortable Sortable columns.
 * @return array
 */
function gotg_event_sortable_columns( $sortable ) {
	$sortable['event_schedule'] = 'event_schedule';
	return $sortable;
}
add_filter( 'manage_edit-gotg_event_sortable_columns', 'gotg_event_sortable_columns' );

/**
 * Orders and filters events query in WordPress admin.
 *
 * @param WP_Query $query Main query.
 * @return void
 */
function gotg_event_admin_pre_get_posts( $query ) {
	if ( ! is_admin() || ! $query->is_main_query() ) {
		return;
	}

	if ( 'gotg_event' !== $query->get( 'post_type' ) ) {
		return;
	}

	$orderby = $query->get( 'orderby' );

	// Default sort or explicit sort by event_schedule
	if ( empty( $orderby ) || 'event_schedule' === $orderby ) {
		$query->set( 'meta_key', '_gotg_start_datetime' );
		$query->set( 'orderby', 'meta_value' );
		if ( empty( $query->get( 'order' ) ) ) {
			$query->set( 'order', 'ASC' ); // Chronological by default
		}
	}

	// Filter by Status: upcoming or past
	if ( ! empty( $_GET['gotg_filter_status'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$status_filter = sanitize_key( $_GET['gotg_filter_status'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$now = current_time( 'Y-m-d H:i' );

		$meta_query = $query->get( 'meta_query' );
		if ( ! is_array( $meta_query ) ) {
			$meta_query = array();
		}

		if ( 'upcoming' === $status_filter ) {
			$meta_query[] = array(
				'key'     => '_gotg_end_datetime',
				'value'   => $now,
				'compare' => '>=',
				'type'    => 'CHAR',
			);
		} elseif ( 'past' === $status_filter ) {
			$meta_query[] = array(
				'key'     => '_gotg_end_datetime',
				'value'   => $now,
				'compare' => '<',
				'type'    => 'CHAR',
			);
		}

		$query->set( 'meta_query', $meta_query );
	}

	// Filter by Event Type
	if ( ! empty( $_GET['gotg_filter_type'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$type_filter = sanitize_key( $_GET['gotg_filter_type'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$meta_query  = $query->get( 'meta_query' );
		if ( ! is_array( $meta_query ) ) {
			$meta_query = array();
		}

		$meta_query[] = array(
			'key'     => '_gotg_event_type',
			'value'   => $type_filter,
			'compare' => '=',
		);

		$query->set( 'meta_query', $meta_query );
	}
}
add_action( 'pre_get_posts', 'gotg_event_admin_pre_get_posts' );

/**
 * Renders filter dropdowns above the Events list table.
 *
 * @param string $post_type Current post type.
 * @return void
 */
function gotg_event_admin_table_filters( $post_type ) {
	if ( 'gotg_event' !== $post_type ) {
		return;
	}

	$current_status = sanitize_key( $_GET['gotg_filter_status'] ?? '' ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$current_type   = sanitize_key( $_GET['gotg_filter_type'] ?? '' );   // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	?>
	<select name="gotg_filter_status">
		<option value=""><?php esc_html_e( 'All Dates (Upcoming & Past)', 'gotg' ); ?></option>
		<option value="upcoming" <?php selected( $current_status, 'upcoming' ); ?>><?php esc_html_e( '🟢 Upcoming Events Only', 'gotg' ); ?></option>
		<option value="past" <?php selected( $current_status, 'past' ); ?>><?php esc_html_e( '⚪ Past Events Only', 'gotg' ); ?></option>
	</select>

	<select name="gotg_filter_type">
		<option value=""><?php esc_html_e( 'All Event Types', 'gotg' ); ?></option>
		<option value="live_music" <?php selected( $current_type, 'live_music' ); ?>><?php esc_html_e( '🎸 Live Music', 'gotg' ); ?></option>
		<option value="special_menu" <?php selected( $current_type, 'special_menu' ); ?>><?php esc_html_e( '🍽️ Special Menu', 'gotg' ); ?></option>
		<option value="holiday" <?php selected( $current_type, 'holiday' ); ?>><?php esc_html_e( '🎉 Holiday', 'gotg' ); ?></option>
		<option value="private" <?php selected( $current_type, 'private' ); ?>><?php esc_html_e( '🔒 Private', 'gotg' ); ?></option>
	</select>
	<?php
}
add_action( 'restrict_manage_posts', 'gotg_event_admin_table_filters' );

/**
 * Adds Quick Edit fields for Event Date, Start Time, and End Time.
 *
 * @param string $column_name Column name.
 * @param string $post_type   Post type.
 * @return void
 */
function gotg_event_quick_edit_fields( $column_name, $post_type ) {
	if ( 'gotg_event' !== $post_type || 'event_schedule' !== $column_name ) {
		return;
	}
	?>
	<fieldset class="inline-edit-col-right inline-edit-event" style="margin-top:0.5rem;">
		<div class="inline-edit-col">
			<span class="title" style="font-weight:700; color:#1d2327;">📅 Event Date &amp; Time</span>
			<div class="inline-edit-group" style="display:flex; gap:10px; align-items:center; margin-top:5px;">
				<label>
					<span class="title" style="width:auto; font-size:12px;">Date:</span>
					<input type="date" name="gotg_quick_event_date" class="gotg-quick-date" style="padding:3px 6px;" />
				</label>
				<label>
					<span class="title" style="width:auto; font-size:12px;">Start:</span>
					<input type="time" name="gotg_quick_start_time" class="gotg-quick-start" style="padding:3px 6px;" />
				</label>
				<label>
					<span class="title" style="width:auto; font-size:12px;">End:</span>
					<input type="time" name="gotg_quick_end_time" class="gotg-quick-end" style="padding:3px 6px;" />
				</label>
			</div>
		</div>
	</fieldset>
	<?php
}
add_action( 'quick_edit_custom_box', 'gotg_event_quick_edit_fields', 10, 2 );

/**
 * Saves Quick Edit fields for gotg_event.
 *
 * @param int $post_id Post ID.
 * @return void
 */
function gotg_event_quick_edit_save( $post_id ) {
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( 'gotg_event' !== get_post_type( $post_id ) ) {
		return;
	}

	if ( ! empty( $_POST['gotg_quick_event_date'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$date  = sanitize_text_field( wp_unslash( $_POST['gotg_quick_event_date'] ) );
		$start = sanitize_text_field( wp_unslash( $_POST['gotg_quick_start_time'] ?? '19:00' ) );
		$end   = sanitize_text_field( wp_unslash( $_POST['gotg_quick_end_time'] ?? '22:00' ) );

		if ( '' !== $date ) {
			$start_dt = $date . ' ' . ( $start ?: '19:00' );
			if ( strtotime( $end ) <= strtotime( $start ) ) {
				$next_date = date( 'Y-m-d', strtotime( $date . ' +1 day' ) );
				$end_dt = $next_date . ' ' . ( $end ?: '22:00' );
			} else {
				$end_dt = $date . ' ' . ( $end ?: '22:00' );
			}

			update_post_meta( $post_id, '_gotg_start_datetime', date( 'Y-m-d H:i', strtotime( $start_dt ) ) );
			update_post_meta( $post_id, '_gotg_end_datetime', date( 'Y-m-d H:i', strtotime( $end_dt ) ) );
		}
	}
}
add_action( 'save_post_gotg_event', 'gotg_event_quick_edit_save' );

/**
 * Enqueues Quick Edit autofill script on edit.php?post_type=gotg_event.
 *
 * @param string $hook Admin page hook.
 * @return void
 */
function gotg_event_quick_edit_script( $hook ) {
	if ( 'edit.php' !== $hook ) {
		return;
	}

	$screen = get_current_screen();
	if ( ! $screen || 'gotg_event' !== $screen->post_type ) {
		return;
	}

	?>
	<script>
	jQuery(function($) {
		var $wp_inline_edit = inlineEditPost.edit;
		inlineEditPost.edit = function(id) {
			$wp_inline_edit.apply(this, arguments);
			var postId = 0;
			if (typeof id === 'object') {
				postId = parseInt(this.getId(id), 10);
			}
			if (postId > 0) {
				var $row = $('#post-' + postId);
				var $col = $row.find('.gotg-col-schedule');
				if ($col.length) {
					var start = $col.data('start') || '';
					var end = $col.data('end') || '';
					if (start) {
						var parts = start.replace('T', ' ').split(' ');
						var datePart = parts[0] || '';
						var timePart = (parts[1] || '').substring(0, 5);
						var $editRow = $('#edit-' + postId);
						$editRow.find('.gotg-quick-date').val(datePart);
						$editRow.find('.gotg-quick-start').val(timePart);
						if (end) {
							var endParts = end.replace('T', ' ').split(' ');
							var endTimePart = (endParts[1] || '').substring(0, 5);
							$editRow.find('.gotg-quick-end').val(endTimePart);
						}
					}
				}
			}
		};
	});
	</script>
	<?php
}
add_action( 'admin_footer-edit.php', 'gotg_event_quick_edit_script' );

/**
 * Renders the Visual Event Schedule & Calendar page in WordPress Admin.
 *
 * Accessible via admin.php?page=gotg-event-calendar.
 *
 * @return void
 */
function gotg_render_event_calendar_admin_page() {
	$current_year  = isset( $_GET['cal_year'] ) ? absint( $_GET['cal_year'] ) : absint( current_time( 'Y' ) );
	$current_month = isset( $_GET['cal_month'] ) ? absint( $_GET['cal_month'] ) : absint( current_time( 'n' ) );

	if ( $current_month < 1 || $current_month > 12 ) {
		$current_month = absint( current_time( 'n' ) );
	}
	if ( $current_year < 2020 || $current_year > 2035 ) {
		$current_year = absint( current_time( 'Y' ) );
	}

	// Calculate prev / next month links
	$prev_month = $current_month - 1;
	$prev_year  = $current_year;
	if ( $prev_month < 1 ) {
		$prev_month = 12;
		$prev_year--;
	}

	$next_month = $current_month + 1;
	$next_year  = $current_year;
	if ( $next_month > 12 ) {
		$next_month = 1;
		$next_year++;
	}

	$prev_url = add_query_arg( array( 'page' => 'gotg-event-calendar', 'cal_year' => $prev_year, 'cal_month' => $prev_month ), admin_url( 'admin.php' ) );
	$next_url = add_query_arg( array( 'page' => 'gotg-event-calendar', 'cal_year' => $next_year, 'cal_month' => $next_month ), admin_url( 'admin.php' ) );
	$today_url = add_query_arg( array( 'page' => 'gotg-event-calendar', 'cal_year' => current_time( 'Y' ), 'cal_month' => current_time( 'n' ) ), admin_url( 'admin.php' ) );

	$month_timestamp = mktime( 0, 0, 0, $current_month, 1, $current_year );
	$month_name      = date( 'F', $month_timestamp );
	$days_in_month   = date( 't', $month_timestamp );
	$first_day_of_week = date( 'w', $month_timestamp ); // 0 (Sun) to 6 (Sat)

	// Fetch all events for this month
	$month_start = sprintf( '%04d-%02d-01 00:00', $current_year, $current_month );
	$month_end   = sprintf( '%04d-%02d-%02d 23:59', $current_year, $current_month, $days_in_month );

	$all_events = get_posts(
		array(
			'post_type'      => 'gotg_event',
			'post_status'    => array( 'publish', 'draft' ),
			'posts_per_page' => -1,
			'meta_key'       => '_gotg_start_datetime',
			'orderby'        => 'meta_value',
			'order'          => 'ASC',
		)
	);

	// Group events by day of month
	$events_by_day = array();
	$upcoming_list = array();
	$now_str       = current_time( 'Y-m-d H:i' );

	foreach ( $all_events as $event_post ) {
		$start_dt = (string) get_post_meta( $event_post->ID, '_gotg_start_datetime', true );
		$end_dt   = (string) get_post_meta( $event_post->ID, '_gotg_end_datetime', true );

		if ( '' !== $start_dt ) {
			$ts = strtotime( $start_dt );
			if ( (int) date( 'Y', $ts ) === $current_year && (int) date( 'n', $ts ) === $current_month ) {
				$day_num = (int) date( 'j', $ts );
				$events_by_day[ $day_num ][] = array(
					'post'  => $event_post,
					'start' => $start_dt,
					'end'   => $end_dt,
				);
			}

			// Add to upcoming list if future
			if ( $end_dt >= $now_str ) {
				$upcoming_list[] = array(
					'post'  => $event_post,
					'start' => $start_dt,
					'end'   => $end_dt,
				);
			}
		}
	}

	$frontend_base       = (string) gotg_get_frontend_base_url();
	$frontend_events_url = rtrim( $frontend_base ?: 'http://localhost:3000', '/' ) . '/events';

	?>
	<div class="wrap gotg-calendar-wrap" style="max-width:1200px;">
		<div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.25rem; margin-bottom:1.5rem; flex-wrap:wrap; gap:12px;">
			<div>
				<h1 style="display:flex; align-items:center; gap:10px; margin:0;">
					<span>📅 <?php esc_html_e( 'Event Calendar & Schedule', 'gotg' ); ?></span>
					<span style="font-size:13px; font-weight:400; background:#e7f3ff; color:#0969da; padding:3px 10px; border-radius:12px; border:1px solid #c8e1ff;">Headless CMS</span>
				</h1>
				<p style="margin:4px 0 0; color:#50575e; font-size:14px;">
					<?php esc_html_e( 'Easily set and view what event is scheduled on what date. Published events automatically update on the live website.', 'gotg' ); ?>
				</p>
			</div>

			<div style="display:flex; gap:10px; align-items:center;">
				<a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=gotg_event' ) ); ?>" class="button button-primary button-hero" style="display:inline-flex; align-items:center; gap:6px; height:38px; line-height:36px; padding:0 20px;">
					<span class="dashicons dashicons-plus-alt" style="font-size:18px; width:18px; height:18px;"></span>
					<span><?php esc_html_e( 'Add New Event', 'gotg' ); ?></span>
				</a>
				<a href="<?php echo esc_url( $frontend_events_url ); ?>" target="_blank" rel="noopener noreferrer" class="button" style="display:inline-flex; align-items:center; gap:5px; height:38px; line-height:36px;">
					<span><?php esc_html_e( 'View Live Events Page', 'gotg' ); ?></span>
					<span class="dashicons dashicons-external" style="font-size:16px; width:16px; height:16px;"></span>
				</a>
			</div>
		</div>

		<!-- Calendar Controls Header -->
		<div style="background:#fff; border:1px solid #c3c4c7; padding:12px 18px; border-radius:8px 8px 0 0; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 2px rgba(0,0,0,0.04);">
			<div style="display:flex; align-items:center; gap:10px;">
				<a href="<?php echo esc_url( $prev_url ); ?>" class="button" title="Previous Month">‹ Previous</a>
				<h2 style="margin:0; font-size:1.35rem; font-weight:700; color:#1d2327;">
					<?php echo esc_html( $month_name . ' ' . $current_year ); ?>
				</h2>
				<a href="<?php echo esc_url( $next_url ); ?>" class="button" title="Next Month">Next ›</a>
				<a href="<?php echo esc_url( $today_url ); ?>" class="button button-secondary" style="margin-left:8px;">Today</a>
			</div>

			<div style="display:flex; align-items:center; gap:16px; font-size:12px; color:#50575e;">
				<span style="display:flex; align-items:center; gap:5px;"><span style="width:10px; height:10px; border-radius:50%; background:#2271b1; display:inline-block;"></span> 🎸 Live Music</span>
				<span style="display:flex; align-items:center; gap:5px;"><span style="width:10px; height:10px; border-radius:50%; background:#00a32a; display:inline-block;"></span> 🍽️ Special Menu</span>
				<span style="display:flex; align-items:center; gap:5px;"><span style="width:10px; height:10px; border-radius:50%; background:#8c5b00; display:inline-block;"></span> 🎉 Holiday</span>
			</div>
		</div>

		<!-- Calendar Month Grid -->
		<div style="background:#fff; border:1px solid #c3c4c7; border-top:none; border-radius:0 0 8px 8px; overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.05); margin-bottom:24px;">
			<!-- Day Names Header -->
			<div style="display:grid; grid-template-columns:repeat(7, 1fr); background:#f0f0f1; border-bottom:1px solid #c3c4c7; text-align:center; font-weight:700; font-size:12px; color:#2c3338; text-transform:uppercase; letter-spacing:0.5px;">
				<div style="padding:10px 0;">Sun</div>
				<div style="padding:10px 0;">Mon</div>
				<div style="padding:10px 0;">Tue</div>
				<div style="padding:10px 0;">Wed</div>
				<div style="padding:10px 0;">Thu</div>
				<div style="padding:10px 0;">Fri</div>
				<div style="padding:10px 0;">Sat</div>
			</div>

			<!-- Day Cells -->
			<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:1px; background:#e0e0e0;">
				<?php
				// Empty padding cells before first day
				for ( $pad = 0; $pad < $first_day_of_week; $pad++ ) {
					echo '<div style="background:#fafafa; min-height:110px; padding:8px;"></div>';
				}

				$today_day   = absint( current_time( 'j' ) );
				$today_m     = absint( current_time( 'n' ) );
				$today_y     = absint( current_time( 'Y' ) );

				for ( $day = 1; $day <= $days_in_month; $day++ ) {
					$is_today    = ( $day === $today_day && $current_month === $today_m && $current_year === $today_y );
					$date_str    = sprintf( '%04d-%02d-%02d', $current_year, $current_month, $day );
					$add_day_url = admin_url( 'post-new.php?post_type=gotg_event&event_date=' . $date_str );
					$day_events  = $events_by_day[ $day ] ?? array();

					?>
					<div style="background:<?php echo $is_today ? '#f0f6fc' : '#fff'; ?>; min-height:115px; padding:8px; display:flex; flex-direction:column; justify-content:space-between; position:relative; border:<?php echo $is_today ? '2px solid #2271b1' : 'none'; ?>;">
						<div>
							<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
								<span style="font-weight:<?php echo $is_today ? '700' : '600'; ?>; font-size:14px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:<?php echo $is_today ? '#2271b1' : 'transparent'; ?>; color:<?php echo $is_today ? '#fff' : '#1d2327'; ?>;">
									<?php echo (int) $day; ?>
								</span>
								<a href="<?php echo esc_url( $add_day_url ); ?>" title="Add Event on <?php echo esc_attr( $date_str ); ?>" style="font-size:11px; text-decoration:none; color:#2271b1; font-weight:600;">
									+ Add
								</a>
							</div>

							<!-- Events in this day -->
							<div style="display:flex; flex-direction:column; gap:4px;">
								<?php foreach ( $day_events as $item ) : ?>
									<?php
									$ev_post = $item['post'];
									$type    = (string) get_post_meta( $ev_post->ID, '_gotg_event_type', true );
									$time_label = '';
									if ( ! empty( $item['start'] ) ) {
										$time_label = date( 'g:ia', strtotime( $item['start'] ) );
									}

									$bg = '#e7f3ff';
									$fg = '#0969da';
									if ( 'special_menu' === $type ) {
										$bg = '#def7ec';
										$fg = '#03543f';
									} elseif ( 'holiday' === $type ) {
										$bg = '#fef08a';
										$fg = '#854d0e';
									} elseif ( 'private' === $type ) {
										$bg = '#f3f4f6';
										$fg = '#4b5563';
									}
									$edit_url = get_edit_post_link( $ev_post->ID ) ?: admin_url( 'post.php?post=' . $ev_post->ID . '&action=edit' );
									?>
									<a href="<?php echo esc_url( (string) $edit_url ); ?>"
									   style="background:<?php echo esc_attr( $bg ); ?>; color:<?php echo esc_attr( $fg ); ?>; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:600; text-decoration:none; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
									   title="<?php echo esc_attr( get_the_title( $ev_post ) . ' (' . $time_label . ')' ); ?>">
										<?php echo esc_html( $time_label ? $time_label . ' ' : '' ) . esc_html( get_the_title( $ev_post ) ); ?>
									</a>
								<?php endforeach; ?>
							</div>
						</div>
					</div>
					<?php
				}

				// Trailing padding cells
				$total_cells = $first_day_of_week + $days_in_month;
				$trailing    = ( 7 - ( $total_cells % 7 ) ) % 7;
				for ( $pad = 0; $pad < $trailing; $pad++ ) {
					echo '<div style="background:#fafafa; min-height:110px; padding:8px;"></div>';
				}
				?>
			</div>
		</div>

		<!-- Upcoming Scheduled Events List -->
		<div style="background:#fff; border:1px solid #c3c4c7; border-radius:8px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
			<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid #eee; pb-3;">
				<div>
					<h3 style="margin:0; font-size:16px; font-weight:700; color:#1d2327;">
						📋 <?php esc_html_e( 'Upcoming Scheduled Events (Chronological)', 'gotg' ); ?>
					</h3>
					<p style="margin:2px 0 0; color:#646970; font-size:13px;">
						<?php printf( esc_html__( '%d upcoming events currently scheduled.', 'gotg' ), count( $upcoming_list ) ); ?>
					</p>
				</div>
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=gotg_event' ) ); ?>" class="button">
					<?php esc_html_e( 'Manage All Events in Table View →', 'gotg' ); ?>
				</a>
			</div>

			<?php if ( empty( $upcoming_list ) ) : ?>
				<div style="padding:30px; text-align:center; color:#646970; background:#f9f9f9; border-radius:6px;">
					<p style="font-size:14px; margin:0 0 10px;"><?php esc_html_e( 'No upcoming events scheduled yet.', 'gotg' ); ?></p>
					<a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=gotg_event' ) ); ?>" class="button button-primary">
						<?php esc_html_e( '+ Add an Event', 'gotg' ); ?>
					</a>
				</div>
			<?php else : ?>
				<table class="wp-list-table widefat fixed striped">
					<thead>
						<tr>
							<th style="width:25%; font-weight:700;"><?php esc_html_e( 'Event Title', 'gotg' ); ?></th>
							<th style="width:28%; font-weight:700;"><?php esc_html_e( '📅 Scheduled Date & Time', 'gotg' ); ?></th>
							<th style="width:16%; font-weight:700;"><?php esc_html_e( 'Type', 'gotg' ); ?></th>
							<th style="width:20%; font-weight:700;"><?php esc_html_e( 'Performer / Summary', 'gotg' ); ?></th>
							<th style="width:11%; text-align:right; font-weight:700;"><?php esc_html_e( 'Action', 'gotg' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $upcoming_list as $item ) : ?>
							<?php
							$p         = $item['post'];
							$start_ts  = strtotime( $item['start'] );
							$end_ts    = ! empty( $item['end'] ) ? strtotime( $item['end'] ) : false;
							$type      = (string) get_post_meta( $p->ID, '_gotg_event_type', true );
							$performer = (string) get_post_meta( $p->ID, '_gotg_performer_name', true );
							$summary   = (string) get_post_meta( $p->ID, '_gotg_summary', true );
							$edit_url = get_edit_post_link( $p->ID ) ?: admin_url( 'post.php?post=' . $p->ID . '&action=edit' );
							?>
							<tr>
								<td>
									<strong>
										<a href="<?php echo esc_url( (string) $edit_url ); ?>" style="font-size:14px;">
											<?php echo esc_html( get_the_title( $p ) ); ?>
										</a>
									</strong>
								</td>
								<td>
									<strong style="color:#1d2327;">
										<?php echo esc_html( date( 'l, M j, Y', $start_ts ) ); ?>
									</strong>
									<br>
									<span style="color:#50575e; font-size:12px;">
										⏰ <?php echo esc_html( date( 'g:i A', $start_ts ) ); ?><?php echo $end_ts ? ' – ' . esc_html( date( 'g:i A', $end_ts ) ) : ''; ?>
									</span>
								</td>
								<td>
									<?php
									$labels = array(
										'live_music'   => '🎸 Live Music',
										'special_menu' => '🍽️ Special Menu',
										'holiday'      => '🎉 Holiday',
										'private'      => '🔒 Private',
									);
									echo esc_html( $labels[ $type ] ?? $type );
									?>
								</td>
								<td style="color:#50575e; font-size:13px;">
									<?php echo esc_html( $performer ?: $summary ); ?>
								</td>
								<td style="text-align:right;">
									<a href="<?php echo esc_url( (string) $edit_url ); ?>" class="button button-small">
										<?php esc_html_e( 'Edit', 'gotg' ); ?>
									</a>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
		</div>
	</div>
	<?php
}
