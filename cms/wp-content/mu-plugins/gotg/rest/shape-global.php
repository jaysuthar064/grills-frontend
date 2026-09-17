<?php
/**
 * The `_global` payload shaper and its supporting primitives.
 *
 * `_global` is defined once in 04-API-CONTRACT.md §2 and is byte-identical
 * across all five endpoints. It is built once per request and memoised — the
 * contract's §3.2 cost argument only holds if it is not recomputed per section.
 *
 * Sources: the `gotg_site_settings` option and the `gotg_location` post it
 * references through `primary_location_id`.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Determines whether a href leaves the site.
 *
 * A root-relative path is internal. Anything carrying a scheme — including
 * `tel:` and `mailto:` — is external, matching the contract's example where the
 * header call button is `isExternal: true`.
 *
 * @param string $href Link target.
 * @return bool Whether the link is external.
 */
function gotg_is_external_url( $href ) {
	$href = trim( (string) $href );

	if ( '' === $href || str_starts_with( $href, '/' ) || str_starts_with( $href, '#' ) ) {
		return false;
	}

	$scheme = wp_parse_url( $href, PHP_URL_SCHEME );

	if ( null === $scheme || '' === $scheme ) {
		return false;
	}

	if ( in_array( strtolower( $scheme ), array( 'tel', 'mailto' ), true ) ) {
		return true;
	}

	$host = wp_parse_url( $href, PHP_URL_HOST );
	$home = wp_parse_url( home_url(), PHP_URL_HOST );

	return $host !== $home;
}

/**
 * Shapes a label and href into the API link object.
 *
 * @param string $label Link text.
 * @param string $href  Link target.
 * @return array{label: string, href: string, isExternal: bool} Link object.
 */
function gotg_shape_link( $label, $href ) {
	$href = (string) $href;

	// Normalise tel: to E.164, matching the contract's §3.1 example where the
	// header call button is `tel:+18058422947`. Editors type the display form.
	if ( str_starts_with( strtolower( $href ), 'tel:' ) ) {
		$normalised = gotg_shape_phone_href( substr( $href, 4 ) );

		if ( '' !== $normalised ) {
			$href = $normalised;
		}
	}

	return array(
		'label'      => gotg_decode_text( $label ),
		'href'       => $href,
		'isExternal' => gotg_is_external_url( $href ),
	);
}

/**
 * Derives a dialable href from a display phone number.
 *
 * @param string $phone Display phone, e.g. 805-842-2947.
 * @return string A tel: URI, or an empty string when no digits are present.
 */
function gotg_shape_phone_href( $phone ) {
	$digits = preg_replace( '/\D/', '', (string) $phone );

	if ( '' === $digits ) {
		return '';
	}

	if ( 10 === strlen( $digits ) ) {
		$digits = '1' . $digits;
	}

	return 'tel:+' . $digits;
}

/**
 * Converts a stored `Y-m-d H:i` local datetime into ISO 8601 with offset.
 *
 * Stored event times are wall-clock Pacific (03-CONTENT-MODEL.md §4.2). The
 * offset is resolved against the location's timezone so a summer event carries
 * -07:00 and a winter event -08:00.
 *
 * @param string $stored   Stored datetime.
 * @param string $timezone Timezone identifier.
 * @return string ISO 8601 datetime, or an empty string when unparseable.
 */
function gotg_shape_datetime( $stored, $timezone ) {
	$stored = trim( (string) $stored );

	if ( '' === $stored ) {
		return '';
	}

	try {
		$zone = new DateTimeZone( $timezone );
		$date = new DateTimeImmutable( $stored, $zone );
	} catch ( Exception $e ) {
		return '';
	}

	return $date->format( 'c' );
}

/**
 * Returns the current moment as ISO 8601 in the given timezone.
 *
 * @param string $timezone Timezone identifier.
 * @return string ISO 8601 datetime.
 */
function gotg_shape_now( $timezone ) {
	try {
		$zone = new DateTimeZone( $timezone );
	} catch ( Exception $e ) {
		$zone = new DateTimeZone( 'UTC' );
	}

	return ( new DateTimeImmutable( 'now', $zone ) )->format( 'c' );
}

/**
 * Shapes the SEO field set for a post.
 *
 * Falls back per 03-CONTENT-MODEL.md §10.1: an unset title becomes the post
 * title run through the global title template; an unset description becomes the
 * supplied fallback, then the global default.
 *
 * @param WP_Post $post              Post carrying the SEO meta.
 * @param array   $seo_defaults      The shaped `_global.seoDefaults` object.
 * @param string  $description_fallback Entity-specific description fallback.
 * @return array Shaped SEO fields.
 */
function gotg_shape_seo_fields( WP_Post $post, array $seo_defaults, $description_fallback = '' ) {
	$title = (string) get_post_meta( $post->ID, '_gotg_seo_title', true );

	if ( '' === $title ) {
		$template = isset( $seo_defaults['titleTemplate'] ) ? (string) $seo_defaults['titleTemplate'] : '%s';
		$title    = str_contains( $template, '%s' )
			? sprintf( $template, get_the_title( $post ) )
			: (string) get_the_title( $post );
	}

	$description = (string) get_post_meta( $post->ID, '_gotg_seo_description', true );

	if ( '' === $description ) {
		$description = (string) $description_fallback;
	}

	if ( '' === $description && isset( $seo_defaults['description'] ) ) {
		$description = (string) $seo_defaults['description'];
	}

	$seo = array(
		'title'       => gotg_decode_text( $title ),
		'description' => gotg_decode_text( $description ),
		'noindex'     => (bool) get_post_meta( $post->ID, '_gotg_seo_noindex', true ),
	);

	$og_image = gotg_shape_image( get_post_meta( $post->ID, '_gotg_seo_image_id', true ), 'gotg_card' );

	if ( null === $og_image && isset( $seo_defaults['ogImage'] ) ) {
		$og_image = $seo_defaults['ogImage'];
	}

	if ( null !== $og_image ) {
		$seo['ogImage'] = $og_image;
	}

	$canonical = (string) get_post_meta( $post->ID, '_gotg_seo_canonical', true );

	if ( '' !== $canonical ) {
		$seo['canonical'] = $canonical;
	}

	return $seo;
}

/**
 * Shapes a location post into the API location object.
 *
 * @param WP_Post $post Location post.
 * @return array Shaped location.
 */
function gotg_shape_location( WP_Post $post ) {
	$phone = (string) get_post_meta( $post->ID, '_gotg_phone', true );

	$location = array(
		'name'          => gotg_decode_text( get_the_title( $post ) ),
		'streetAddress' => gotg_decode_text( get_post_meta( $post->ID, '_gotg_street_address', true ) ),
		'city'          => gotg_decode_text( get_post_meta( $post->ID, '_gotg_city', true ) ),
		'state'         => gotg_decode_text( get_post_meta( $post->ID, '_gotg_state', true ) ),
		'postalCode'    => gotg_decode_text( get_post_meta( $post->ID, '_gotg_postal_code', true ) ),
		'country'       => gotg_decode_text( get_post_meta( $post->ID, '_gotg_country', true ) ),
		'latitude'      => (float) get_post_meta( $post->ID, '_gotg_latitude', true ),
		'longitude'     => (float) get_post_meta( $post->ID, '_gotg_longitude', true ),
		'phone'         => gotg_decode_text( $phone ),
		'phoneHref'     => gotg_shape_phone_href( $phone ),
		'directionsUrl' => (string) get_post_meta( $post->ID, '_gotg_directions_url', true ),
	);

	$optional = array(
		'addressLine2' => '_gotg_address_line_2',
		'email'        => '_gotg_email',
		'parkingNote'  => '_gotg_parking_note',
	);

	foreach ( $optional as $key => $meta_key ) {
		$value = gotg_decode_text( get_post_meta( $post->ID, $meta_key, true ) );

		if ( '' !== $value ) {
			$location[ $key ] = $value;
		}
	}

	return $location;
}

/**
 * Shapes the opening hours for a location.
 *
 * @param int $location_id Location post ID.
 * @return array Shaped hours object.
 */
function gotg_shape_hours( $location_id ) {
	$timezone = (string) get_post_meta( $location_id, '_gotg_timezone', true );

	if ( '' === $timezone ) {
		$timezone = 'America/Los_Angeles';
	}

	$stored_regular = get_post_meta( $location_id, '_gotg_regular_hours', true );
	$regular        = array();

	if ( is_array( $stored_regular ) ) {
		foreach ( $stored_regular as $row ) {
			if ( ! is_array( $row ) || ! isset( $row['day'] ) ) {
				continue;
			}

			$regular[] = array(
				'day'      => (string) $row['day'],
				'opens'    => isset( $row['opens'] ) ? (string) $row['opens'] : '',
				'closes'   => isset( $row['closes'] ) ? (string) $row['closes'] : '',
				'isClosed' => ! empty( $row['is_closed'] ),
			);
		}
	}

	$stored_exceptions = get_post_meta( $location_id, '_gotg_hours_exceptions', true );
	$exceptions        = array();

	if ( is_array( $stored_exceptions ) ) {
		foreach ( $stored_exceptions as $row ) {
			if ( ! is_array( $row ) || empty( $row['date'] ) ) {
				continue;
			}

			$exception = array(
				'date'     => (string) $row['date'],
				'label'    => isset( $row['label'] ) ? gotg_decode_text( $row['label'] ) : '',
				'isClosed' => ! empty( $row['is_closed'] ),
			);

			// Omitted when closed, per 03-CONTENT-MODEL.md §5.2 and ADR-0022.
			foreach ( array( 'opens', 'closes' ) as $key ) {
				$value = isset( $row[ $key ] ) ? (string) $row[ $key ] : '';

				if ( '' !== $value ) {
					$exception[ $key ] = $value;
				}
			}

			$exceptions[] = $exception;
		}
	}

	return array(
		'timezone'   => $timezone,
		'regular'    => $regular,
		'exceptions' => $exceptions,
	);
}

/**
 * Shapes the site identity block of `_global`.
 *
 * @param array $settings Site settings.
 * @return array Shaped identity.
 */
function gotg_shape_site_identity( array $settings ) {
	$identity = array(
		'name'        => gotg_decode_text( $settings['site_name'] ?? '' ),
		'legalName'   => gotg_decode_text( $settings['legal_name'] ?? '' ),
		'tagline'     => gotg_decode_text( $settings['tagline'] ?? '' ),
		'description' => gotg_decode_text( $settings['short_description'] ?? '' ),
	);

	$images = array(
		'logo'        => 'logo_primary_id',
		'logoInverse' => 'logo_inverse_id',
		'favicon'     => 'favicon_id',
	);

	foreach ( $images as $key => $option_key ) {
		$image = gotg_shape_image( $settings[ $option_key ] ?? 0, 'full' );

		if ( null !== $image ) {
			$identity[ $key ] = $image;
		}
	}

	return $identity;
}

/**
 * Shapes the navigation block of `_global`.
 *
 * @param array $settings Site settings.
 * @return array Shaped navigation.
 */
function gotg_shape_navigation( array $settings ) {
	$shape_rows = static function ( $rows ) {
		$links = array();

		if ( ! is_array( $rows ) ) {
			return $links;
		}

		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}

			$links[] = gotg_shape_link( $row['label'] ?? '', $row['url'] ?? '' );
		}

		return $links;
	};

	return array(
		'primary'   => $shape_rows( $settings['nav_primary'] ?? array() ),
		'footer'    => $shape_rows( $settings['nav_footer'] ?? array() ),
		'headerCta' => gotg_shape_link(
			$settings['header_cta_label'] ?? '',
			$settings['header_cta_url'] ?? ''
		),
	);
}

/**
 * Shapes the social links array of `_global`.
 *
 * @param array $settings Site settings.
 * @return array Shaped social links.
 */
function gotg_shape_social( array $settings ) {
	$rows   = $settings['social_links'] ?? array();
	$social = array();

	if ( ! is_array( $rows ) ) {
		return $social;
	}

	foreach ( $rows as $row ) {
		if ( ! is_array( $row ) || empty( $row['platform'] ) || empty( $row['url'] ) ) {
			continue;
		}

		$link = array(
			'platform' => (string) $row['platform'],
			'url'      => (string) $row['url'],
		);

		$handle = isset( $row['handle'] ) ? gotg_decode_text( $row['handle'] ) : '';

		if ( '' !== $handle ) {
			$link['handle'] = $handle;
		}

		$social[] = $link;
	}

	return $social;
}

/**
 * Shapes the site actions block of `_global`.
 *
 * Every key is optional; an unset URL is omitted so the frontend hides the
 * corresponding button rather than rendering a dead one.
 *
 * @param array $settings Site settings.
 * @return array Shaped actions.
 */
function gotg_shape_actions( array $settings ) {
	$actions = array();

	$map = array(
		'reservationUrl' => 'reservation_url',
		'orderingUrl'    => 'ordering_url',
		'giftCardUrl'    => 'gift_card_url',
	);

	foreach ( $map as $key => $option_key ) {
		$value = (string) ( $settings[ $option_key ] ?? '' );

		if ( '' !== $value ) {
			$actions[ $key ] = $value;
		}
	}

	return $actions;
}

/**
 * Shapes the announcement bar, or null when there is nothing to show.
 *
 * Nullable by design: the key is always present (04-API-CONTRACT.md §1).
 *
 * @param array  $settings Site settings.
 * @param string $timezone Timezone for evaluating the expiry date.
 * @return array|null Shaped announcement, or null.
 */
function gotg_shape_announcement( array $settings, $timezone ) {
	$text = gotg_decode_text( $settings['announcement_text'] ?? '' );

	if ( '' === $text ) {
		return null;
	}

	$expires = (string) ( $settings['announcement_expires'] ?? '' );

	if ( '' !== $expires ) {
		try {
			$zone  = new DateTimeZone( $timezone );
			$today = new DateTimeImmutable( 'now', $zone );
			$until = new DateTimeImmutable( $expires . ' 23:59:59', $zone );

			if ( $today > $until ) {
				return null;
			}
		} catch ( Exception $e ) {
			return null;
		}
	}

	$announcement = array( 'text' => $text );

	$href = (string) ( $settings['announcement_url'] ?? '' );

	if ( '' !== $href ) {
		$announcement['href'] = $href;
	}

	return $announcement;
}

/**
 * Shapes the SEO defaults block of `_global`.
 *
 * `sameAs` is assembled from the social profile URLs plus the Google Business
 * profile, matching the contract's §3.1 example where an unset Google URL leaves
 * only the social entries.
 *
 * @param array $settings Site settings.
 * @param array $social   Already-shaped social links.
 * @return array Shaped SEO defaults.
 */
function gotg_shape_seo_defaults( array $settings, array $social ) {
	$same_as = array();

	foreach ( $social as $link ) {
		$same_as[] = $link['url'];
	}

	$google = (string) ( $settings['google_business_url'] ?? '' );

	if ( '' !== $google ) {
		$same_as[] = $google;
	}

	$cuisines = $settings['cuisine_types'] ?? array();

	$defaults = array(
		'titleTemplate' => gotg_decode_text( $settings['seo_title_template'] ?? '' ),
		'description'   => gotg_decode_text( $settings['seo_default_description'] ?? '' ),
		'sameAs'        => array_values( array_unique( $same_as ) ),
		'priceRange'    => gotg_decode_text( $settings['price_range'] ?? '' ),
		'servesCuisine' => is_array( $cuisines ) ? array_values( array_map( 'gotg_decode_text', $cuisines ) ) : array(),
	);

	$og_image = gotg_shape_image( $settings['seo_default_og_image_id'] ?? 0, 'full' );

	if ( null !== $og_image ) {
		$defaults['ogImage'] = $og_image;
	}

	return $defaults;
}

/**
 * Builds the `_global` object, once per request.
 *
 * @return array|WP_Error Shaped global data, or an error when configuration is missing.
 */
function gotg_get_global() {
	static $global = null;

	if ( null !== $global ) {
		return $global;
	}

	$raw = get_option( 'gotg_site_settings' );

	if ( ! is_array( $raw ) ) {
		return new WP_Error(
			'gotg_settings_unavailable',
			__( 'Site Settings are missing or unreadable.', 'gotg' ),
			array( 'status' => 500 )
		);
	}

	$settings    = gotg_get_site_settings();
	$location_id = (int) ( $settings['primary_location_id'] ?? 0 );
	$location    = $location_id > 0 ? get_post( $location_id ) : null;

	if ( ! $location instanceof WP_Post
		|| 'gotg_location' !== $location->post_type
		|| 'publish' !== $location->post_status
	) {
		return new WP_Error(
			'gotg_missing_primary_location',
			__( 'Site Settings has no published primary location.', 'gotg' ),
			array( 'status' => 500 )
		);
	}

	$hours    = gotg_shape_hours( $location->ID );
	$social   = gotg_shape_social( $settings );
	$timezone = $hours['timezone'];

	$global = array(
		'site'         => gotg_shape_site_identity( $settings ),
		'navigation'   => gotg_shape_navigation( $settings ),
		'location'     => gotg_shape_location( $location ),
		'hours'        => $hours,
		'social'       => $social,
		// Cast to object: SiteActions is an interface, and an empty PHP array
		// would encode as `[]` where the contract requires `{}`.
		'actions'      => (object) gotg_shape_actions( $settings ),
		'announcement' => gotg_shape_announcement( $settings, $timezone ),
		'seoDefaults'  => gotg_shape_seo_defaults( $settings, $social ),
		'generatedAt'  => gotg_shape_now( $timezone ),
	);

	return $global;
}
