<?php
/**
 * Meta box framework.
 *
 * The seven-step save contract (03-CONTENT-MODEL.md §2.3) and the validation
 * error surface (§2.5) are implemented once here. A box-*.php file must not
 * re-implement nonce or capability checking (07-CODING-STANDARDS.md §1.2); it
 * calls gotg_meta_box_can_save() and delegates errors to the functions below.
 *
 * Sanitization is deliberately NOT performed here. Each meta key's registered
 * `sanitize_callback` (meta.php → sanitizers.php) is the single sanitizer and
 * runs on every update_post_meta() call. Save handlers validate — they reject
 * out-of-range, over-length, and non-member values and surface an error — but
 * they write the raw unslashed value and let the registered callback clean it.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Runs the first five steps of the save contract (§2.3): correct post type,
 * not an autosave, not a revision, a present and valid nonce, and the per-post
 * capability. Returns false to abort the save early.
 *
 * @param int     $post_id      Post being saved.
 * @param WP_Post $post         Post object.
 * @param string  $post_type    Expected post type.
 * @param string  $nonce_field  Name of the nonce field in $_POST.
 * @param string  $nonce_action Nonce action string.
 * @return bool Whether the caller may proceed to validate and write.
 */
function gotg_meta_box_can_save( $post_id, $post, $post_type, $nonce_field, $nonce_action ) {
	if ( $post_type !== $post->post_type ) {
		return false;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return false;
	}

	if ( wp_is_post_revision( $post_id ) ) {
		return false;
	}

	$nonce = isset( $_POST[ $nonce_field ] )
		? sanitize_text_field( wp_unslash( $_POST[ $nonce_field ] ) )
		: '';

	if ( '' === $nonce || ! wp_verify_nonce( $nonce, $nonce_action ) ) {
		return false;
	}

	return current_user_can( 'edit_post', $post_id );
}

/**
 * Applies a validated field map to a post.
 *
 * A `null` value deletes the key — the empty-optional rule in §2.3, so
 * get_post_meta() returns the registered default and the shaper omits it. Any
 * other value is written through update_post_meta(), which triggers the key's
 * registered sanitize_callback. Keys absent from the map (a field that failed
 * validation) are left untouched, so the previous value survives — the
 * partial-write rule.
 *
 * @param int                  $post_id Post ID.
 * @param array<string, mixed> $values  Meta key to value; null means delete.
 * @return void
 */
function gotg_meta_box_write( $post_id, array $values ) {
	foreach ( $values as $meta_key => $value ) {
		if ( null === $value ) {
			delete_post_meta( $post_id, $meta_key );
			continue;
		}

		update_post_meta( $post_id, $meta_key, $value );
	}
}

/**
 * Reads a raw scalar from submitted input, unslashed but NOT sanitized.
 *
 * The registered sanitize_callback owns sanitization; this returns the value as
 * typed so the save handler can validate it and hand it to update_post_meta().
 *
 * @param array  $input Submitted data ($_POST).
 * @param string $key   Input field name.
 * @return string The unslashed value, or '' when absent.
 */
function gotg_posted_string( array $input, $key ) {
	if ( ! isset( $input[ $key ] ) || ! is_scalar( $input[ $key ] ) ) {
		return '';
	}

	return trim( (string) wp_unslash( $input[ $key ] ) );
}

/**
 * Reads a raw array from submitted input, unslashed but NOT sanitized.
 *
 * @param array  $input Submitted data ($_POST).
 * @param string $key   Input field name.
 * @return array The unslashed array, or an empty array when absent.
 */
function gotg_posted_array( array $input, $key ) {
	if ( ! isset( $input[ $key ] ) || ! is_array( $input[ $key ] ) ) {
		return array();
	}

	return wp_unslash( $input[ $key ] );
}

/**
 * Reads a checkbox as an explicit boolean string.
 *
 * An unchecked checkbox sends no key, so absence is `'0'` — the absent-checkbox
 * rule in §2.3. Always written, never left at its previous value.
 *
 * @param array  $input Submitted data ($_POST).
 * @param string $key   Input field name.
 * @return string `'1'` when present, `'0'` when absent.
 */
function gotg_posted_checkbox( array $input, $key ) {
	return isset( $input[ $key ] ) ? '1' : '0';
}

/*
 * --- Validation error surface (§2.5, transcribed) --------------------------
 * Errors survive the post-save redirect through a user-scoped transient, keyed
 * by both post ID and user ID so two editors never see each other's errors.
 */

/**
 * Stores validation errors for display after the save redirect.
 *
 * Merges with any errors already stored this request. A post type with two
 * boxes (Location) runs two save handlers in one save; without the merge the
 * second would overwrite the first, silently dropping its errors — which §2.5's
 * single-box example does not account for.
 *
 * @param int   $post_id Post ID.
 * @param array $errors  Map of field key to error message.
 * @return void
 */
function gotg_store_meta_errors( $post_id, array $errors ) {
	$key      = 'gotg_meta_errors_' . (int) $post_id . '_' . get_current_user_id();
	$existing = get_transient( $key );

	if ( is_array( $existing ) ) {
		$errors = array_merge( $existing, $errors );
	}

	set_transient( $key, $errors, 60 );
}

/**
 * Returns stored validation errors for the current screen.
 *
 * Idempotent within a request: the transient is read and cleared once, then the
 * result is cached, so the admin_notices summary and every box render can each
 * call this and receive the same errors regardless of hook order. §2.5's plain
 * read-and-clear only works when a single consumer reads it.
 *
 * @param int $post_id Post ID.
 * @return array Map of field key to error message.
 */
function gotg_take_meta_errors( $post_id ) {
	static $cache = array();

	$post_id = (int) $post_id;

	if ( isset( $cache[ $post_id ] ) ) {
		return $cache[ $post_id ];
	}

	$key    = 'gotg_meta_errors_' . $post_id . '_' . get_current_user_id();
	$errors = get_transient( $key );

	if ( ! is_array( $errors ) ) {
		$errors = array();
	} else {
		delete_transient( $key );
	}

	$cache[ $post_id ] = $errors;

	return $errors;
}

/**
 * Renders a summary notice listing validation errors, each linking to its
 * field wrapper (`#gotg-field-{key}`) so the summary is keyboard navigable.
 *
 * @return void
 */
function gotg_render_meta_error_notice() {
	$screen = get_current_screen();

	if ( ! $screen || 'post' !== $screen->base ) {
		return;
	}

	$post_id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	if ( 0 === $post_id ) {
		return;
	}

	$errors = gotg_take_meta_errors( $post_id );

	if ( empty( $errors ) ) {
		return;
	}

	echo '<div class="notice notice-error"><p><strong>';
	esc_html_e( 'Some fields were not saved:', 'gotg' );
	echo '</strong></p><ul>';

	foreach ( $errors as $field => $message ) {
		printf(
			'<li><a href="#%1$s">%2$s</a></li>',
			esc_attr( 'gotg-field-' . $field ),
			esc_html( $message )
		);
	}

	echo '</ul></div>';
}
add_action( 'admin_notices', 'gotg_render_meta_error_notice' );
