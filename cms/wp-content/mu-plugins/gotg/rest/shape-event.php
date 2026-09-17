<?php
/**
 * Event shaping and the upcoming-events query.
 *
 * Transcribed from 04-API-CONTRACT.md §5.3.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Shapes an event post into the API event object.
 *
 * @param WP_Post $post         Event post.
 * @param array   $seo_defaults Shaped `_global.seoDefaults`.
 * @param string  $timezone     Site timezone identifier.
 * @return array Shaped event.
 */
function gotg_shape_event( WP_Post $post, array $seo_defaults, $timezone ) {
	$summary    = gotg_decode_text( get_post_meta( $post->ID, '_gotg_summary', true ) );
	$event_type = (string) get_post_meta( $post->ID, '_gotg_event_type', true );
	$allowed    = array( 'live_music', 'special_menu', 'holiday', 'private', 'other' );

	$event = array(
		'id'                  => (int) $post->ID,
		'slug'                => (string) $post->post_name,
		'title'               => gotg_decode_text( get_the_title( $post ) ),
		'summary'             => $summary,
		'startDateTime'       => gotg_shape_datetime(
			get_post_meta( $post->ID, '_gotg_start_datetime', true ),
			$timezone
		),
		'endDateTime'         => gotg_shape_datetime(
			get_post_meta( $post->ID, '_gotg_end_datetime', true ),
			$timezone
		),
		'eventType'           => in_array( $event_type, $allowed, true ) ? $event_type : 'other',
		'isTicketed'          => (bool) get_post_meta( $post->ID, '_gotg_is_ticketed', true ),
		'isRecurringInstance' => (bool) get_post_meta( $post->ID, '_gotg_is_recurring_instance', true ),
		'seo'                 => gotg_shape_seo_fields( $post, $seo_defaults, $summary ),
	);

	$description = gotg_shape_html( $post->post_content );

	if ( '' !== $description ) {
		$event['descriptionHtml'] = $description;
	}

	// Performer fields belong to live music only, whatever is stored
	// (03-CONTENT-MODEL.md §4.4).
	if ( 'live_music' === $event['eventType'] ) {
		foreach ( array( 'performerName' => '_gotg_performer_name', 'performerUrl' => '_gotg_performer_url' ) as $key => $meta_key ) {
			$raw = (string) get_post_meta( $post->ID, $meta_key, true );

			// performerName is display text; performerUrl is a URL and is left as-is.
			$value = 'performerName' === $key ? gotg_decode_text( $raw ) : $raw;

			if ( '' !== $value ) {
				$event[ $key ] = $value;
			}
		}
	}

	// Ticket fields belong to ticketed events only.
	if ( $event['isTicketed'] ) {
		$ticket_url = (string) get_post_meta( $post->ID, '_gotg_ticket_url', true );

		if ( '' !== $ticket_url ) {
			$event['ticketUrl'] = $ticket_url;
		}

		$cover = get_post_meta( $post->ID, '_gotg_cover_charge', true );

		if ( is_numeric( $cover ) ) {
			$event['coverCharge'] = round( (float) $cover, 2 );
		}
	}

	$image = gotg_shape_image( get_post_thumbnail_id( $post->ID ), 'gotg_card' );

	if ( null !== $image ) {
		$event['image'] = $image;
	}

	return $event;
}

/**
 * Returns upcoming event posts, ordered by start time ascending.
 *
 * Inclusion rule from 04-API-CONTRACT.md §5.3: published, ending at or after
 * now in the site timezone, and not private. Ordering is done in PHP because
 * `_gotg_start_datetime` is a `Y-m-d H:i` string — lexicographic order is
 * chronological order for that format, but a meta_query numeric sort is not.
 *
 * @param string $timezone Site timezone identifier.
 * @param int    $limit    Maximum events to return.
 * @param bool   $preview  Whether to include draft events.
 * @return WP_Post[] Ordered event posts.
 */
function gotg_get_upcoming_events( $timezone, $limit = 50, $preview = false ) {
	try {
		$zone = new DateTimeZone( $timezone );
	} catch ( Exception $e ) {
		$zone = new DateTimeZone( 'UTC' );
	}

	$now = ( new DateTimeImmutable( 'now', $zone ) )->format( 'Y-m-d H:i' );

	$posts = get_posts(
		array(
			'post_type'              => 'gotg_event',
			'post_status'            => $preview ? array( 'publish', 'draft', 'pending' ) : 'publish',
			'posts_per_page'         => -1,
			'orderby'                => 'ID',
			'order'                  => 'ASC',
			'no_found_rows'          => true,
			'update_post_term_cache' => false,
		)
	);

	if ( empty( $posts ) ) {
		return array();
	}

	$ids = array();

	foreach ( $posts as $post ) {
		$ids[] = (int) $post->ID;
	}

	update_meta_cache( 'post', $ids );

	$upcoming = array();

	foreach ( $posts as $post ) {
		$end = (string) get_post_meta( $post->ID, '_gotg_end_datetime', true );

		if ( '' === $end || $end < $now ) {
			continue;
		}

		if ( 'private' === (string) get_post_meta( $post->ID, '_gotg_event_type', true ) ) {
			continue;
		}

		$upcoming[] = $post;
	}

	usort(
		$upcoming,
		static function ( $a, $b ) {
			$start_a = (string) get_post_meta( $a->ID, '_gotg_start_datetime', true );
			$start_b = (string) get_post_meta( $b->ID, '_gotg_start_datetime', true );

			return strcmp( $start_a, $start_b );
		}
	);

	if ( count( $upcoming ) > $limit ) {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				sprintf( 'gotg: %d upcoming events exceeds the %d limit; payload truncated.', count( $upcoming ), $limit )
			);
		}

		$upcoming = array_slice( $upcoming, 0, $limit );
	}

	return $upcoming;
}

/**
 * Shapes a list of event posts.
 *
 * @param WP_Post[] $posts        Event posts.
 * @param array     $seo_defaults Shaped `_global.seoDefaults`.
 * @param string    $timezone     Site timezone identifier.
 * @return array Shaped events.
 */
function gotg_shape_events( array $posts, array $seo_defaults, $timezone ) {
	$events = array();

	foreach ( $posts as $post ) {
		$events[] = gotg_shape_event( $post, $seo_defaults, $timezone );
	}

	return $events;
}
