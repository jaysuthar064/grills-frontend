<?php
/**
 * Taxonomy admin UI (03-CONTENT-MODEL.md §7 and §8).
 *
 * Two parts:
 *   1. The `meta_box_cb` callbacks the taxonomies name — radio inputs for the
 *      single-select Menu Section, and a fixed checkbox list with no "Add New"
 *      control for Dietary Tags. The registration layer picks these up through
 *      its function_exists() guard once this file is loaded.
 *   2. Term-meta fields on the Add Term and Edit Term screens (display order,
 *      intro, hidden flag; abbreviation, colour, description), validated and
 *      saved with the §2 contract adapted to terms (capability edit_term,
 *      manage_categories fallback).
 *
 * Term selection itself is saved by WordPress core from the `tax_input` field
 * names below; this file only renders the controls. The image field
 * (`_gotg_image_id`) is added by the media-field task.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/*
 * --- 1. meta_box_cb callbacks (post edit screen) ---------------------------
 */

/**
 * Renders the single-select Menu Section box as radio inputs.
 *
 * A hidden `0` value clears the selection when "None" is chosen, matching how
 * core clears a hierarchical taxonomy. Cardinality is additionally enforced by
 * gotg_enforce_single_menu_section() on save (§7.3).
 *
 * @param WP_Post $post Post being edited.
 * @param array   $box  Meta box args, carrying the taxonomy.
 * @return void
 */
function gotg_render_single_section_meta_box( $post, $box ) {
	$taxonomy = isset( $box['args']['taxonomy'] ) ? (string) $box['args']['taxonomy'] : 'gotg_menu_section';
	$terms    = get_terms(
		array(
			'taxonomy'   => $taxonomy,
			'hide_empty' => false,
			'orderby'    => 'name',
		)
	);

	$assigned = wp_get_object_terms( $post->ID, $taxonomy, array( 'fields' => 'ids' ) );
	$current  = ( ! is_wp_error( $assigned ) && ! empty( $assigned ) ) ? (int) $assigned[0] : 0;
	$field    = 'tax_input[' . $taxonomy . '][]';

	echo '<div class="gotg-term-select">';
	printf( '<input type="hidden" name="%s" value="0" />', esc_attr( $field ) );

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		echo '<p>' . esc_html__( 'No sections yet. Add one under Menu Sections.', 'gotg' ) . '</p>';
		echo '</div>';
		return;
	}

	echo '<ul class="gotg-term-list">';
	printf(
		'<li><label><input type="radio" name="%s" value="0"%s /> %s</label></li>',
		esc_attr( $field ),
		checked( 0, $current, false ),
		esc_html__( '— None —', 'gotg' )
	);

	$by_parent = array();
	foreach ( $terms as $term ) {
		$by_parent[ (int) $term->parent ][] = $term;
	}

	gotg_render_section_radio_level( $by_parent, 0, $field, $current, 0 );

	echo '</ul></div>';
}

/**
 * Recursively renders one level of section radios, indenting children.
 *
 * @param array  $by_parent Terms grouped by parent ID.
 * @param int    $parent    Parent term ID to render children of.
 * @param string $field     Input name.
 * @param int    $current   Selected term ID.
 * @param int    $depth     Current depth (for indentation).
 * @return void
 */
function gotg_render_section_radio_level( array $by_parent, $parent, $field, $current, $depth ) {
	if ( empty( $by_parent[ $parent ] ) ) {
		return;
	}

	foreach ( $by_parent[ $parent ] as $term ) {
		printf(
			'<li style="padding-left:%dem"><label><input type="radio" name="%s" value="%d"%s /> %s</label></li>',
			absint( $depth ),
			esc_attr( $field ),
			(int) $term->term_id,
			checked( (int) $term->term_id, $current, false ),
			esc_html( $term->name )
		);

		gotg_render_section_radio_level( $by_parent, (int) $term->term_id, $field, $current, $depth + 1 );
	}
}

/**
 * Renders the Dietary Tags box as a fixed checkbox list, with no "Add New"
 * control so new dietary claims cannot be invented while editing an item (§8).
 *
 * @param WP_Post $post Post being edited.
 * @param array   $box  Meta box args, carrying the taxonomy.
 * @return void
 */
function gotg_render_fixed_dietary_meta_box( $post, $box ) {
	$taxonomy = isset( $box['args']['taxonomy'] ) ? (string) $box['args']['taxonomy'] : 'gotg_dietary';
	$terms    = get_terms(
		array(
			'taxonomy'   => $taxonomy,
			'hide_empty' => false,
			'orderby'    => 'name',
		)
	);

	$assigned = wp_get_object_terms( $post->ID, $taxonomy, array( 'fields' => 'ids' ) );
	$assigned = is_wp_error( $assigned ) ? array() : array_map( 'intval', $assigned );
	$field    = 'tax_input[' . $taxonomy . '][]';

	echo '<div class="gotg-term-select">';
	printf( '<input type="hidden" name="%s" value="0" />', esc_attr( $field ) );

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		echo '<p>' . esc_html__( 'No dietary tags defined. Add them under Dietary Tags.', 'gotg' ) . '</p>';
		echo '</div>';
		return;
	}

	echo '<ul class="gotg-term-list">';
	foreach ( $terms as $term ) {
		printf(
			'<li><label><input type="checkbox" name="%s" value="%d"%s /> %s</label></li>',
			esc_attr( $field ),
			(int) $term->term_id,
			checked( in_array( (int) $term->term_id, $assigned, true ), true, false ),
			esc_html( $term->name )
		);
	}
	echo '</ul>';
	echo '<p class="description">' . esc_html__( 'Select all that apply. Leave empty if unsure — do not guess.', 'gotg' ) . '</p>';
	echo '</div>';
}

/*
 * --- 2. Term-meta fields (term add / edit screens) -------------------------
 */

/**
 * Reads and clears term validation errors, idempotent within a request.
 *
 * @param int $term_id Term ID.
 * @return array
 */
function gotg_take_term_errors( $term_id ) {
	static $cache = array();
	$term_id = (int) $term_id;

	if ( isset( $cache[ $term_id ] ) ) {
		return $cache[ $term_id ];
	}

	$key    = 'gotg_term_errors_' . $term_id . '_' . get_current_user_id();
	$errors = get_transient( $key );

	if ( ! is_array( $errors ) ) {
		$errors = array();
	} else {
		delete_transient( $key );
	}

	$cache[ $term_id ] = $errors;
	return $errors;
}

/**
 * Stores term validation errors for display after the term-save redirect.
 *
 * @param int   $term_id Term ID.
 * @param array $errors  Error map.
 * @return void
 */
function gotg_store_term_errors( $term_id, array $errors ) {
	if ( empty( $errors ) ) {
		return;
	}
	set_transient( 'gotg_term_errors_' . (int) $term_id . '_' . get_current_user_id(), $errors, 60 );
}

/**
 * Renders a term-meta control for both the Add (div) and Edit (tr) layouts.
 *
 * @param string $context 'add' or 'edit'.
 * @param string $control The control HTML.
 * @param string $id      Control id.
 * @param string $label   Label text.
 * @param string $help    Help text.
 * @param bool   $required Whether required.
 * @param string $error   Error message, or ''.
 * @return void
 */
function gotg_render_term_row( $context, $control, $id, $label, $help, $required, $error ) {
	$label_html = esc_html( $label );
	if ( $required ) {
		$label_html .= ' <span class="gotg-required">' . esc_html__( '(required)', 'gotg' ) . '</span>';
	}

	$error_html = ( '' !== $error )
		? '<p class="gotg-field-error" role="alert">' . esc_html( $error ) . '</p>'
		: '';
	$help_html = ( '' !== $help )
		? '<p class="description" id="' . esc_attr( $id . '-help' ) . '">' . esc_html( $help ) . '</p>'
		: '';

	if ( 'edit' === $context ) {
		echo '<tr class="form-field">';
		echo '<th scope="row"><label for="' . esc_attr( $id ) . '">' . $label_html . '</label></th>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- label escaped above.
		echo '<td>' . $error_html . $control . $help_html . '</td>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- parts escaped at construction.
		echo '</tr>';
		return;
	}

	echo '<div class="form-field">';
	echo '<label for="' . esc_attr( $id ) . '">' . $label_html . '</label>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- label escaped above.
	echo $error_html . $control . $help_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- parts escaped at construction.
	echo '</div>';
}

/**
 * Renders the Menu Section term-meta fields.
 *
 * @param string  $context 'add' or 'edit'.
 * @param WP_Term|null $term Term on the edit screen, null on add.
 * @return void
 */
function gotg_render_menu_section_fields( $context, $term = null ) {
	$term_id = $term instanceof WP_Term ? (int) $term->term_id : 0;
	$errors  = $term_id ? gotg_take_term_errors( $term_id ) : array();

	wp_nonce_field( 'gotg_save_term_meta', 'gotg_term_meta_nonce' );

	$order = $term_id ? get_term_meta( $term_id, '_gotg_display_order', true ) : 10;
	$order = ( '' === $order ) ? 10 : $order;
	gotg_render_term_row(
		$context,
		sprintf(
			'<input type="number" id="gotg_display_order" name="gotg_display_order" value="%s" min="0" max="999" />',
			esc_attr( (string) $order )
		),
		'gotg_display_order',
		__( 'Display Order', 'gotg' ),
		__( 'Lower numbers appear first. Use increments of 10 so sections can be inserted later.', 'gotg' ),
		true,
		$errors['display_order'] ?? ''
	);

	$intro = $term_id ? (string) get_term_meta( $term_id, '_gotg_intro', true ) : '';
	gotg_render_term_row(
		$context,
		sprintf(
			'<textarea id="gotg_intro" name="gotg_intro" rows="2" maxlength="200">%s</textarea>',
			esc_textarea( $intro )
		),
		'gotg_intro',
		__( 'Section Intro', 'gotg' ),
		__( 'Optional sentence under the section heading. 200 characters or fewer.', 'gotg' ),
		false,
		$errors['intro'] ?? ''
	);

	$image_id = $term_id ? get_term_meta( $term_id, '_gotg_image_id', true ) : 0;
	gotg_render_term_row(
		$context,
		gotg_media_field_control( 'gotg_image_id', $image_id ),
		'gotg_image_id',
		__( 'Section Image', 'gotg' ),
		__( 'Optional banner for this section.', 'gotg' ),
		false,
		$errors['image_id'] ?? ''
	);

	$hidden = $term_id ? (bool) get_term_meta( $term_id, '_gotg_is_hidden', true ) : false;
	gotg_render_term_row(
		$context,
		sprintf(
			'<label class="gotg-checkbox"><input type="checkbox" id="gotg_is_hidden" name="gotg_is_hidden" value="1"%s /> %s</label>',
			checked( $hidden, true, false ),
			esc_html__( 'Hide this section from the site', 'gotg' )
		),
		'gotg_is_hidden',
		__( 'Hide Section', 'gotg' ),
		__( 'Turn on to hide this whole section without deleting it.', 'gotg' ),
		false,
		''
	);
}

/**
 * Renders the Dietary Tag term-meta fields.
 *
 * @param string       $context 'add' or 'edit'.
 * @param WP_Term|null $term    Term on the edit screen, null on add.
 * @return void
 */
function gotg_render_dietary_fields( $context, $term = null ) {
	$term_id = $term instanceof WP_Term ? (int) $term->term_id : 0;
	$errors  = $term_id ? gotg_take_term_errors( $term_id ) : array();

	wp_nonce_field( 'gotg_save_term_meta', 'gotg_term_meta_nonce' );

	$abbr = $term_id ? (string) get_term_meta( $term_id, '_gotg_abbreviation', true ) : '';
	gotg_render_term_row(
		$context,
		sprintf(
			'<input type="text" id="gotg_abbreviation" name="gotg_abbreviation" value="%s" maxlength="3" />',
			esc_attr( $abbr )
		),
		'gotg_abbreviation',
		__( 'Abbreviation', 'gotg' ),
		__( 'Short code shown on menu cards, e.g. VG, GF. 1–3 letters.', 'gotg' ),
		true,
		$errors['abbreviation'] ?? ''
	);

	$color   = $term_id ? (string) get_term_meta( $term_id, '_gotg_color', true ) : 'neutral';
	$color   = ( '' === $color ) ? 'neutral' : $color;
	$options = array(
		'neutral' => __( 'Neutral', 'gotg' ),
		'green'   => __( 'Green', 'gotg' ),
		'amber'   => __( 'Amber', 'gotg' ),
		'red'     => __( 'Red (allergen)', 'gotg' ),
	);
	$select = '<select id="gotg_color" name="gotg_color">';
	foreach ( $options as $value => $label ) {
		$select .= sprintf(
			'<option value="%s"%s>%s</option>',
			esc_attr( $value ),
			selected( $value, $color, false ),
			esc_html( $label )
		);
	}
	$select .= '</select>';
	gotg_render_term_row(
		$context,
		$select,
		'gotg_color',
		__( 'Colour', 'gotg' ),
		__( 'Badge colour. Use red only for allergen warnings.', 'gotg' ),
		true,
		$errors['color'] ?? ''
	);

	$desc = $term_id ? (string) get_term_meta( $term_id, '_gotg_description_text', true ) : '';
	gotg_render_term_row(
		$context,
		sprintf(
			'<textarea id="gotg_description_text" name="gotg_description_text" rows="2" maxlength="120">%s</textarea>',
			esc_textarea( $desc )
		),
		'gotg_description_text',
		__( 'Full Description', 'gotg' ),
		__( 'Explained in the dietary legend at the bottom of the menu. 1–120 characters.', 'gotg' ),
		true,
		$errors['description_text'] ?? ''
	);
}

// Add / edit form hooks.
add_action(
	'gotg_menu_section_add_form_fields',
	function () {
		gotg_render_menu_section_fields( 'add' );
	}
);
add_action(
	'gotg_menu_section_edit_form_fields',
	function ( $term ) {
		gotg_render_menu_section_fields( 'edit', $term );
	}
);
add_action(
	'gotg_dietary_add_form_fields',
	function () {
		gotg_render_dietary_fields( 'add' );
	}
);
add_action(
	'gotg_dietary_edit_form_fields',
	function ( $term ) {
		gotg_render_dietary_fields( 'edit', $term );
	}
);

/**
 * Whether the current request may write this term's meta.
 *
 * @param int $term_id Term ID.
 * @return bool
 */
function gotg_can_save_term_meta( $term_id ) {
	$nonce = isset( $_POST['gotg_term_meta_nonce'] )
		? sanitize_text_field( wp_unslash( $_POST['gotg_term_meta_nonce'] ) )
		: '';

	if ( '' === $nonce || ! wp_verify_nonce( $nonce, 'gotg_save_term_meta' ) ) {
		return false;
	}

	return current_user_can( 'manage_categories' ) && current_user_can( 'edit_term', $term_id );
}

/**
 * Validates and saves Menu Section term meta.
 *
 * @param int $term_id Term ID.
 * @return void
 */
function gotg_save_menu_section_term( $term_id ) {
	if ( ! gotg_can_save_term_meta( $term_id ) ) {
		return;
	}

	$input  = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified in gotg_can_save_term_meta().
	$errors = array();
	$values = array();

	$order = gotg_posted_string( $input, 'gotg_display_order' );
	if ( '' === $order || ! ctype_digit( $order ) || (int) $order > 999 ) {
		$errors['display_order'] = __( 'Display order must be a whole number from 0 to 999.', 'gotg' );
	} else {
		$values['_gotg_display_order'] = $order;
	}

	$intro = gotg_posted_string( $input, 'gotg_intro' );
	if ( mb_strlen( $intro ) > 200 ) {
		$errors['intro'] = __( 'The intro must be 200 characters or fewer.', 'gotg' );
	} else {
		$values['_gotg_intro'] = $intro;
	}

	$values['_gotg_is_hidden'] = gotg_posted_checkbox( $input, 'gotg_is_hidden' );

	// Section image: an attachment ID that must resolve to an image (§2.7).
	$image_id = absint( gotg_posted_string( $input, 'gotg_image_id' ) );
	if ( 0 === $image_id ) {
		$values['_gotg_image_id'] = 0;
	} elseif ( ! wp_attachment_is_image( $image_id ) ) {
		$errors['image_id'] = __( 'That file is not an image.', 'gotg' );
	} else {
		$values['_gotg_image_id'] = $image_id;
	}

	foreach ( $values as $key => $value ) {
		if ( '' === $value && in_array( $key, array( '_gotg_intro' ), true ) ) {
			delete_term_meta( $term_id, $key );
			continue;
		}
		update_term_meta( $term_id, $key, $value );
	}

	gotg_store_term_errors( $term_id, $errors );
}
add_action( 'created_gotg_menu_section', 'gotg_save_menu_section_term' );
add_action( 'edited_gotg_menu_section', 'gotg_save_menu_section_term' );

/**
 * Validates and saves Dietary Tag term meta.
 *
 * @param int $term_id Term ID.
 * @return void
 */
function gotg_save_dietary_term( $term_id ) {
	if ( ! gotg_can_save_term_meta( $term_id ) ) {
		return;
	}

	$input  = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified in gotg_can_save_term_meta().
	$errors = array();
	$values = array();

	$abbr = gotg_posted_string( $input, 'gotg_abbreviation' );
	if ( 1 !== preg_match( '/^[A-Za-z]{1,3}$/', $abbr ) ) {
		$errors['abbreviation'] = __( 'The abbreviation must be 1–3 letters.', 'gotg' );
	} else {
		$values['_gotg_abbreviation'] = $abbr;
	}

	$color   = gotg_posted_string( $input, 'gotg_color' );
	$allowed = array( 'neutral', 'green', 'amber', 'red' );
	if ( in_array( $color, $allowed, true ) ) {
		$values['_gotg_color'] = $color;
	} else {
		$errors['color'] = __( 'Choose a valid colour.', 'gotg' );
	}

	$desc = gotg_posted_string( $input, 'gotg_description_text' );
	$len  = mb_strlen( $desc );
	if ( $len < 1 || $len > 120 ) {
		$errors['description_text'] = __( 'The description is required and must be 1–120 characters.', 'gotg' );
	} else {
		$values['_gotg_description_text'] = $desc;
	}

	foreach ( $values as $key => $value ) {
		update_term_meta( $term_id, $key, $value );
	}

	gotg_store_term_errors( $term_id, $errors );
}
add_action( 'created_gotg_dietary', 'gotg_save_dietary_term' );
add_action( 'edited_gotg_dietary', 'gotg_save_dietary_term' );

/**
 * Shows term validation errors on the Edit Term screen.
 *
 * @return void
 */
function gotg_render_term_error_notice() {
	$screen = get_current_screen();
	if ( ! $screen || 'term' !== $screen->base ) {
		return;
	}

	$term_id = isset( $_GET['tag_ID'] ) ? absint( $_GET['tag_ID'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( 0 === $term_id ) {
		return;
	}

	$errors = gotg_take_term_errors( $term_id );
	if ( empty( $errors ) ) {
		return;
	}

	echo '<div class="notice notice-error"><p><strong>';
	esc_html_e( 'Some term fields were not saved:', 'gotg' );
	echo '</strong></p><ul>';
	foreach ( $errors as $message ) {
		echo '<li>' . esc_html( $message ) . '</li>';
	}
	echo '</ul></div>';
}
add_action( 'admin_notices', 'gotg_render_term_error_notice' );
