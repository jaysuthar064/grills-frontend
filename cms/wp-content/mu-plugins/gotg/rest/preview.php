<?php
/**
 * Preview and draft access.
 *
 * Implements 04-API-CONTRACT.md §9. Authentication itself lives on the route's
 * permission callback in routes.php, where the contract's §6.4 puts it: an
 * unauthenticated `preview=1` request never reaches a shaper. This file handles
 * what an *authenticated* preview request is allowed to see.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Returns the specific post a preview request asked to substitute.
 *
 * `previewId` names a draft to render in place of the published page. It is
 * validated against the endpoint's own slug and post type, so an editor cannot
 * use the menu endpoint to read an unrelated draft — the parameter selects
 * between revisions of one page, it does not select the page.
 *
 * @param WP_REST_Request $request   Incoming request.
 * @param string          $post_type Expected post type.
 * @param string          $slug      Expected page slug, empty to skip the check.
 * @return WP_Post|null The substitute post, or null when there is none.
 */
function gotg_rest_preview_post( WP_REST_Request $request, $post_type, $slug = '' ) {
	if ( ! gotg_rest_is_preview( $request ) ) {
		return null;
	}

	$preview_id = absint( $request->get_param( 'previewId' ) );

	if ( $preview_id <= 0 ) {
		return null;
	}

	$post = get_post( $preview_id );

	if ( ! $post instanceof WP_Post || $post_type !== $post->post_type ) {
		return null;
	}

	if ( '' !== $slug && $post->post_name !== $slug ) {
		return null;
	}

	// An editor may only preview what they may edit.
	if ( ! current_user_can( 'edit_post', $post->ID ) ) {
		return null;
	}

	return gotg_rest_apply_autosave( $post );
}

/**
 * Overlays the newest autosave revision onto a post, when one exists.
 *
 * WordPress stores an in-progress edit as an autosave revision rather than on
 * the post itself, so previewing the post alone shows the last *saved* state,
 * not what the editor is looking at.
 *
 * @param WP_Post $post Post to preview.
 * @return WP_Post The post, with autosave content applied when available.
 */
function gotg_rest_apply_autosave( WP_Post $post ) {
	$autosave = wp_get_post_autosave( $post->ID, get_current_user_id() );

	if ( ! $autosave instanceof WP_Post ) {
		return $post;
	}

	$merged                = clone $post;
	$merged->post_title    = $autosave->post_title;
	$merged->post_content  = $autosave->post_content;
	$merged->post_excerpt  = $autosave->post_excerpt;

	return $merged;
}
