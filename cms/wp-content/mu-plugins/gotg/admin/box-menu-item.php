<?php
/**
 * Menu Item meta boxes (03-CONTENT-MODEL.md §3.3).
 *
 * Details box (`normal`, `high`): Price Variants → Description → Availability →
 * Spice Level → Is Featured → Is Available. Flags box (`side`): a read-only
 * summary of the two booleans for scanning a long list.
 *
 * The save handler validates and writes; sanitization is owned by each key's
 * registered sanitize_callback (see meta-box-framework.php).
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers the Menu Item meta boxes.
 *
 * @return void
 */
function gotg_register_menu_item_meta_boxes() {
	add_meta_box(
		'gotg_menu_item_details_box',
		__( 'Menu Item Details', 'gotg' ),
		'gotg_render_menu_item_details_box',
		'gotg_menu_item',
		'normal',
		'high'
	);

	add_meta_box(
		'gotg_menu_item_flags_box',
		__( 'Availability', 'gotg' ),
		'gotg_render_menu_item_flags_box',
		'gotg_menu_item',
		'side',
		'default'
	);
}
add_action( 'add_meta_boxes_gotg_menu_item', 'gotg_register_menu_item_meta_boxes' );

/**
 * Renders the Menu Item Details box.
 *
 * @param WP_Post $post Menu item being edited.
 * @return void
 */
function gotg_render_menu_item_details_box( $post ) {
	wp_nonce_field( 'gotg_save_gotg_menu_item_details_box', 'gotg_menu_item_details_box_nonce' );

	$errors = gotg_take_meta_errors( $post->ID );

	gotg_render_price_variants_field(
		get_post_meta( $post->ID, '_gotg_price_variants', true ),
		$errors
	);

	gotg_render_textarea_field(
		array(
			'key'      => 'description',
			'name'     => 'gotg_description',
			'label'    => __( 'Description', 'gotg' ),
			'value'    => (string) get_post_meta( $post->ID, '_gotg_description', true ),
			'help'     => __( 'Shown under the item name. One or two sentences, plain text, 240 characters or fewer.', 'gotg' ),
			'errors'   => $errors,
			'rows'     => 3,
			'attrs'    => array( 'maxlength' => '240' ),
		)
	);

	$availability = get_post_meta( $post->ID, '_gotg_availability', true );

	gotg_render_checkbox_group_field(
		array(
			'key'      => 'availability',
			'name'     => 'gotg_availability',
			'label'    => __( 'Availability', 'gotg' ),
			'required' => true,
			'options'  => array(
				'breakfast' => __( 'Breakfast', 'gotg' ),
				'lunch'     => __( 'Lunch', 'gotg' ),
				'dinner'    => __( 'Dinner', 'gotg' ),
			),
			'values'   => is_array( $availability ) ? $availability : array(),
			'help'     => __( 'Which dayparts this item is served. At least one is required.', 'gotg' ),
			'errors'   => $errors,
		)
	);

	gotg_render_select_field(
		array(
			'key'     => 'spice_level',
			'name'    => 'gotg_spice_level',
			'label'   => __( 'Spice Level', 'gotg' ),
			'value'   => (string) get_post_meta( $post->ID, '_gotg_spice_level', true ),
			'options' => array(
				'none'   => __( 'None', 'gotg' ),
				'mild'   => __( 'Mild', 'gotg' ),
				'medium' => __( 'Medium', 'gotg' ),
				'hot'    => __( 'Hot', 'gotg' ),
			),
			'help'    => __( 'Optional heat indicator. Leave as “None” for items that are not spicy.', 'gotg' ),
			'errors'  => $errors,
		)
	);

	gotg_render_checkbox_field(
		array(
			'key'     => 'is_featured',
			'name'    => 'gotg_is_featured',
			'label'   => __( 'Featured item', 'gotg' ),
			'checked' => (bool) get_post_meta( $post->ID, '_gotg_is_featured', true ),
			'help'    => __( 'Featured items appear in the highlights row on the home page. Six are shown at most.', 'gotg' ),
			'errors'  => $errors,
		)
	);

	gotg_render_checkbox_field(
		array(
			'key'     => 'is_available',
			'name'    => 'gotg_is_available',
			'label'   => __( 'Available', 'gotg' ),
			'checked' => (bool) get_post_meta( $post->ID, '_gotg_is_available', true ),
			'help'    => __( 'Turn off to hide this item from the site without deleting it.', 'gotg' ),
			'errors'  => $errors,
		)
	);
}

/**
 * Renders the price-variants repeater: existing rows, a blank row template, an
 * add button, and a polite live region for announcements (§2.6).
 *
 * Without JavaScript, existing rows still render and save; only add, remove,
 * and reorder require the enqueued script.
 *
 * @param mixed $stored Stored `_gotg_price_variants` value.
 * @param array $errors Error map.
 * @return void
 */
function gotg_render_price_variants_field( $stored, array $errors ) {
	$rows = is_array( $stored ) ? array_values( $stored ) : array();

	gotg_field_open( 'price_variants', $errors );

	echo '<div class="gotg-field-heading">';
	gotg_field_label( 'gotg_price_variants_0_amount', __( 'Price Variants', 'gotg' ), true );
	echo '</div>';

	printf(
		'<p class="description" id="%s">%s</p>',
		esc_attr( 'gotg-field-price_variants-help' ),
		esc_html__( 'Add one row per size or portion this item is sold in. Most items have a single row — leave its label empty. Amounts are 0–999, up to two decimals.', 'gotg' )
	);

	echo '<div class="gotg-repeater" data-gotg-repeater="gotg_price_variants" aria-describedby="gotg-field-price_variants-help">';
	echo '<div class="gotg-repeater-rows" data-gotg-repeater-rows>';

	foreach ( $rows as $index => $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$label  = isset( $row['label'] ) ? (string) $row['label'] : '';
		$amount = isset( $row['amount'] ) ? (string) $row['amount'] : '';

		echo gotg_price_variant_row_html( (string) $index, $label, $amount ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside the builder.
	}

	echo '</div>';

	printf(
		'<p class="gotg-repeater-empty"%s>%s</p>',
		empty( $rows ) ? '' : ' hidden',
		esc_html__( 'No price rows yet. Add one below.', 'gotg' )
	);

	// The template row: __INDEX__ is replaced with the next integer by the JS.
	echo '<template data-gotg-repeater-template>';
	echo gotg_price_variant_row_html( '__INDEX__', '', '' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside the builder.
	echo '</template>';

	printf(
		'<p><button type="button" class="button button-secondary" data-gotg-repeater-add>%s</button></p>',
		esc_html__( 'Add price row', 'gotg' )
	);

	echo '<div class="screen-reader-text" aria-live="polite" data-gotg-repeater-status></div>';
	echo '</div>';

	gotg_field_close();
}

/**
 * Builds the markup for one price-variant row.
 *
 * @param string $index Row index, or the `__INDEX__` template placeholder.
 * @param string $label Row label.
 * @param string $amount Row amount, as stored.
 * @return string Escaped row markup.
 */
function gotg_price_variant_row_html( $index, $label, $amount ) {
	$label_id  = 'gotg_price_variants_' . $index . '_label';
	$amount_id = 'gotg_price_variants_' . $index . '_amount';

	ob_start();
	?>
	<div class="gotg-repeater-row" data-gotg-repeater-row>
		<div class="gotg-field-inline">
			<label for="<?php echo esc_attr( $label_id ); ?>"><?php esc_html_e( 'Label', 'gotg' ); ?></label>
			<input type="text" id="<?php echo esc_attr( $label_id ); ?>"
				name="<?php echo esc_attr( 'gotg_price_variants[' . $index . '][label]' ); ?>"
				value="<?php echo esc_attr( $label ); ?>" maxlength="24"
				placeholder="<?php esc_attr_e( 'e.g. half rack', 'gotg' ); ?>" />
		</div>
		<div class="gotg-field-inline">
			<label for="<?php echo esc_attr( $amount_id ); ?>"><?php esc_html_e( 'Amount', 'gotg' ); ?></label>
			<input type="text" inputmode="decimal" id="<?php echo esc_attr( $amount_id ); ?>"
				name="<?php echo esc_attr( 'gotg_price_variants[' . $index . '][amount]' ); ?>"
				value="<?php echo esc_attr( $amount ); ?>" />
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
 * Renders the read-only flags summary box.
 *
 * @param WP_Post $post Menu item being edited.
 * @return void
 */
function gotg_render_menu_item_flags_box( $post ) {
	$available = (bool) get_post_meta( $post->ID, '_gotg_is_available', true );
	$featured  = (bool) get_post_meta( $post->ID, '_gotg_is_featured', true );

	echo '<p class="description">' . esc_html__( 'A read-only summary. Edit these in the Menu Item Details box.', 'gotg' ) . '</p>';
	echo '<ul class="gotg-flags-summary">';
	printf(
		'<li><strong>%s</strong> %s</li>',
		esc_html__( 'Available:', 'gotg' ),
		$available ? esc_html__( 'Yes — shown on the site', 'gotg' ) : esc_html__( 'No — hidden from the site', 'gotg' )
	);
	printf(
		'<li><strong>%s</strong> %s</li>',
		esc_html__( 'Featured:', 'gotg' ),
		$featured ? esc_html__( 'Yes', 'gotg' ) : esc_html__( 'No', 'gotg' )
	);
	echo '</ul>';
}

/**
 * Validates submitted Menu Item input.
 *
 * Returns a map of meta key to the raw value to write (or null to delete an
 * empty optional). A field that fails validation is omitted from the map and an
 * error is recorded, so its previous value survives (partial-write rule). No
 * value here is sanitized; each key's registered sanitize_callback does that on
 * write.
 *
 * @param array $input  Submitted data ($_POST).
 * @param array $errors Error map, by reference.
 * @return array<string, mixed> Meta key to value (or null to delete).
 */
function gotg_validate_menu_item_input( array $input, array &$errors ) {
	$values = array();

	// Price variants: 1–6 rows; amount numeric 0–999; label ≤ 24 chars.
	$raw_rows   = gotg_posted_array( $input, 'gotg_price_variants' );
	$kept       = 0;
	$row_failed = false;

	foreach ( $raw_rows as $row ) {
		if ( ! is_array( $row ) ) {
			continue;
		}

		$label      = isset( $row['label'] ) ? (string) $row['label'] : '';
		$amount_raw = isset( $row['amount'] ) ? trim( (string) $row['amount'] ) : '';

		if ( '' === trim( $label ) && '' === $amount_raw ) {
			continue; // Empty repeater row — the sanitizer drops it too.
		}

		if ( '' === $amount_raw || ! is_numeric( $amount_raw ) ) {
			$row_failed = true;
			continue;
		}

		$amount = (float) $amount_raw;

		if ( $amount < 0 || $amount > 999 || mb_strlen( $label ) > 24 ) {
			$row_failed = true;
			continue;
		}

		++$kept;
	}

	if ( $row_failed || $kept < 1 || $kept > 6 ) {
		$errors['price_variants'] = __( 'Enter 1–6 price rows. Each amount must be a number from 0 to 999, and each label 24 characters or fewer.', 'gotg' );
	} else {
		// Write the raw rows; gotg_sanitize_price_variants shapes them on store.
		$values['_gotg_price_variants'] = $raw_rows;
	}

	// Description: ≤ 240 chars; empty deletes.
	$description = gotg_posted_string( $input, 'gotg_description' );

	if ( mb_strlen( $description ) > 240 ) {
		$errors['description'] = __( 'The description must be 240 characters or fewer.', 'gotg' );
	} else {
		$values['_gotg_description'] = ( '' === $description ) ? null : $description;
	}

	// Availability: non-empty, values within the daypart set.
	$dayparts    = gotg_posted_array( $input, 'gotg_availability' );
	$allowed_dp  = array( 'breakfast', 'lunch', 'dinner' );
	$clean_dp    = array_values( array_intersect( array_map( 'strval', $dayparts ), $allowed_dp ) );

	if ( empty( $clean_dp ) ) {
		$errors['availability'] = __( 'Select at least one daypart.', 'gotg' );
	} else {
		$values['_gotg_availability'] = $dayparts;
	}

	// Spice level: must be a known value.
	$spice   = gotg_posted_string( $input, 'gotg_spice_level' );
	$allowed = array( 'none', 'mild', 'medium', 'hot' );

	if ( '' === $spice ) {
		$values['_gotg_spice_level'] = 'none';
	} elseif ( in_array( $spice, $allowed, true ) ) {
		$values['_gotg_spice_level'] = $spice;
	} else {
		$errors['spice_level'] = __( 'Choose a valid spice level.', 'gotg' );
	}

	// Booleans: always written explicitly (absent checkbox → '0').
	$values['_gotg_is_featured']  = gotg_posted_checkbox( $input, 'gotg_is_featured' );
	$values['_gotg_is_available'] = gotg_posted_checkbox( $input, 'gotg_is_available' );

	return $values;
}

/**
 * Saves Menu Item Details meta.
 *
 * @param int     $post_id Post being saved.
 * @param WP_Post $post    Post object.
 * @return void
 */
function gotg_save_menu_item_details_box( $post_id, $post ) {
	if ( ! gotg_meta_box_can_save(
		$post_id,
		$post,
		'gotg_menu_item',
		'gotg_menu_item_details_box_nonce',
		'gotg_save_gotg_menu_item_details_box'
	) ) {
		return;
	}

	$errors = array();
	$values = gotg_validate_menu_item_input( $_POST, $errors ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- nonce verified in gotg_meta_box_can_save().

	if ( ! empty( $errors ) ) {
		gotg_store_meta_errors( $post_id, $errors );
	}

	gotg_meta_box_write( $post_id, $values );
}
add_action( 'save_post', 'gotg_save_menu_item_details_box', 10, 2 );
