<?php
/**
 * gotg/v1 route registration.
 *
 * Transcribed from 04-API-CONTRACT.md §6.4. Five content routes, all GET, all
 * returning a complete pre-shaped payload for one frontend page.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers the gotg/v1 content routes.
 *
 * @return void
 */
function gotg_register_rest_routes() {
	$routes = array(
		'home'    => 'gotg_rest_home',
		'menu'    => 'gotg_rest_menu',
		'events'  => 'gotg_rest_events',
		'about'   => 'gotg_rest_about',
		'contact' => 'gotg_rest_contact',
	);

	foreach ( $routes as $slug => $callback ) {
		register_rest_route(
			'gotg/v1',
			'/' . $slug,
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => $callback,
				'permission_callback' => 'gotg_rest_permission',
				'args'                => array(
					'preview'   => array(
						'type'              => 'boolean',
						'default'           => false,
						'sanitize_callback' => 'rest_sanitize_boolean',
					),
					'previewId' => array(
						'type'              => 'integer',
						'required'          => false,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
	}
}
add_action( 'rest_api_init', 'gotg_register_rest_routes' );

/**
 * Ensures the API accepts all CORS requests.
 */
function gotg_send_cors_headers() {
	$origin = get_http_origin();
	if ( $origin ) {
		header( 'Access-Control-Allow-Origin: ' . $origin );
		header( 'Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE' );
		header( 'Access-Control-Allow-Credentials: true' );
		header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Requested-With' );
	}
	
	if ( 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
		status_header( 200 );
		exit();
	}
}
add_action( 'rest_api_init', function() {
	remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
	add_action( 'rest_pre_serve_request', 'gotg_send_cors_headers', 10 );
}, 15 );


/**
 * Allows anonymous reads, but requires edit capability for preview requests.
 *
 * Published content is public and read-only, so the permitted answer for a
 * normal request is an unconditional true — stated here rather than omitted, so
 * the decision is visible at the route rather than inferred from its absence.
 * A `preview=1` request is a different thing: it exposes unpublished content and
 * must authenticate.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return bool|WP_Error True when permitted, WP_Error otherwise.
 */
function gotg_rest_permission( WP_REST_Request $request ) {
	if ( ! $request->get_param( 'preview' ) ) {
		return true;
	}

	if ( current_user_can( 'edit_posts' ) ) {
		return true;
	}

	return new WP_Error(
		'gotg_preview_forbidden',
		__( 'Preview requires an authenticated editor.', 'gotg' ),
		array( 'status' => 401 )
	);
}

/**
 * Whether this request asked for, and is entitled to, draft content.
 *
 * The capability is re-checked here rather than trusted from
 * gotg_rest_permission(), so a code path that reaches a shaper without passing
 * the permission callback still cannot leak drafts.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return bool Whether draft content should be included.
 */
function gotg_rest_is_preview( WP_REST_Request $request ) {
	return (bool) $request->get_param( 'preview' ) && current_user_can( 'edit_posts' );
}

/**
 * Returns the post statuses a request may see.
 *
 * @param WP_REST_Request $request Incoming request.
 * @return string[] Post statuses.
 */
function gotg_rest_post_statuses( WP_REST_Request $request ) {
	return gotg_rest_is_preview( $request )
		? array( 'publish', 'draft', 'pending', 'future', 'private' )
		: array( 'publish' );
}

/**
 * Fetches the `page` post backing an endpoint.
 *
 * A missing or unpublished backing page is a configuration error, not an empty
 * state: the endpoint cannot describe a page that does not exist, so it returns
 * 404 rather than an empty payload (04-API-CONTRACT.md §7).
 *
 * @param string          $slug    Page slug.
 * @param WP_REST_Request $request Incoming request.
 * @return WP_Post|WP_Error The page, or a 404 error.
 */
function gotg_rest_get_page( $slug, WP_REST_Request $request ) {
	$substitute = gotg_rest_preview_post( $request, 'page', $slug );

	if ( $substitute instanceof WP_Post ) {
		return $substitute;
	}

	$statuses = gotg_rest_post_statuses( $request );
	$pages    = get_posts(
		array(
			'post_type'        => 'page',
			'name'             => $slug,
			'post_status'      => $statuses,
			'posts_per_page'   => 1,
			'no_found_rows'    => true,
			'suppress_filters' => false,
		)
	);

	if ( empty( $pages ) ) {
		return new WP_Error(
			'gotg_page_not_found',
			sprintf(
				/* translators: %s: page slug. */
				__( 'The page "%s" is missing or unpublished.', 'gotg' ),
				$slug
			),
			array( 'status' => 404 )
		);
	}

	return $pages[0];
}

/**
 * Builds the payload keys every page endpoint shares.
 *
 * `_global` is fetched once here and threaded through the block context, so it
 * is never recomputed per section (04-API-CONTRACT.md §3.2).
 *
 * @param string          $slug    Page slug.
 * @param WP_REST_Request $request Incoming request.
 * @return array|WP_Error Base payload, or an error.
 */
function gotg_rest_page_base( $slug, WP_REST_Request $request ) {
	$global = gotg_get_global();

	if ( is_wp_error( $global ) ) {
		return $global;
	}

	$page = gotg_rest_get_page( $slug, $request );

	if ( is_wp_error( $page ) ) {
		return $page;
	}

	$context = gotg_block_context( $global, gotg_rest_is_preview( $request ) );

	return array(
		'page'    => $page,
		'global'  => $global,
		'context' => $context,
		'payload' => array(
			'_global' => $global,
			'seo'     => gotg_shape_seo_fields( $page, $global['seoDefaults'] ),
			'title'   => gotg_decode_text( get_the_title( $page ) ),
			'blocks'  => gotg_shape_blocks( get_post_meta( $page->ID, '_gotg_page_blocks', true ), $context ),
		),
	);
}

/**
 * Denies anonymous access to core REST namespaces.
 *
 * The gotg/v1 namespace remains public; wp/v2 and oembed require authentication
 * (04-API-CONTRACT.md §9.3), so the shaped contract is the only public surface.
 *
 * @param WP_Error|null|true $result Existing authentication result.
 * @return WP_Error|null|true
 */
function gotg_restrict_core_rest( $result ) {
	if ( ! empty( $result ) ) {
		return $result;
	}

	$route = isset( $GLOBALS['wp']->query_vars['rest_route'] )
		? (string) $GLOBALS['wp']->query_vars['rest_route']
		: '';

	if ( 0 === strpos( $route, '/gotg/v1' ) ) {
		return $result;
	}

	if ( is_user_logged_in() ) {
		return $result;
	}

	return new WP_Error(
		'gotg_rest_forbidden',
		__( 'This API is not publicly available.', 'gotg' ),
		array( 'status' => 401 )
	);
}
add_filter( 'rest_authentication_errors', 'gotg_restrict_core_rest' );
