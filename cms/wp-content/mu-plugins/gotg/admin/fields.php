<?php
/**
 * Field render partials.
 *
 * Each function renders one complete field block: a wrapper carrying
 * `id="gotg-field-{key}"` (the anchor the error summary links to, §2.5), an
 * inline error with `role="alert"` above the control when the field failed
 * validation, a real `<label for>`, the control, and optional help text in
 * `<p class="description">` referenced by `aria-describedby` (§2.2).
 *
 * Escaping is applied at every output: esc_attr on attributes, esc_html on
 * text nodes, esc_textarea on textarea content, esc_url on URLs.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Opens a field wrapper and emits the inline error, if any.
 *
 * @param string $key    Field key (wrapper id and error map key).
 * @param array  $errors Error map.
 * @return void
 */
function gotg_field_open( $key, array $errors ) {
	printf( '<div class="gotg-field" id="%s">', esc_attr( 'gotg-field-' . $key ) );

	if ( isset( $errors[ $key ] ) ) {
		printf(
			'<p class="gotg-field-error" role="alert">%s</p>',
			esc_html( $errors[ $key ] )
		);
	}
}

/**
 * Closes a field wrapper.
 *
 * @return void
 */
function gotg_field_close() {
	echo '</div>';
}

/**
 * Renders a label, with a visible "(required)" marker when required.
 *
 * @param string $for      Control id.
 * @param string $label    Label text.
 * @param bool   $required Whether the field is required.
 * @return void
 */
function gotg_field_label( $for, $label, $required ) {
	printf( '<label for="%s">%s', esc_attr( $for ), esc_html( $label ) );

	if ( $required ) {
		echo ' <span class="gotg-required">' . esc_html__( '(required)', 'gotg' ) . '</span>';
	}

	echo '</label>';
}

/**
 * Renders help text and returns the id to wire into `aria-describedby`.
 *
 * @param string $control_id Control id.
 * @param string $help       Help text, or ''.
 * @return string The help element id, or '' when there is no help.
 */
function gotg_field_help( $control_id, $help ) {
	if ( '' === $help ) {
		return '';
	}

	$help_id = $control_id . '-help';

	printf(
		'<p class="description" id="%s">%s</p>',
		esc_attr( $help_id ),
		esc_html( $help )
	);

	return $help_id;
}

/**
 * Renders a single-line text-like input (text, email, tel, url, number, …).
 *
 * @param array $args key, name, label, value, help, required, errors, type,
 *                    and optional attrs (map of extra attributes).
 * @return void
 */
function gotg_render_text_field( array $args ) {
	$args    = gotg_field_defaults( $args );
	$control = $args['name'];
	$type    = $args['type'];

	gotg_field_open( $args['key'], $args['errors'] );
	gotg_field_label( $control, $args['label'], $args['required'] );

	echo '<input type="' . esc_attr( $type ) . '"';
	echo ' id="' . esc_attr( $control ) . '"';
	echo ' name="' . esc_attr( $args['name'] ) . '"';
	echo ' value="' . esc_attr( $args['value'] ) . '"';
	echo gotg_field_attrs( $args['attrs'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- pre-escaped in gotg_field_attrs().

	$help_id = ( '' !== $args['help'] ) ? $control . '-help' : '';

	if ( '' !== $help_id ) {
		echo ' aria-describedby="' . esc_attr( $help_id ) . '"';
	}

	echo ' />';

	gotg_field_help( $control, $args['help'] );
	gotg_field_close();
}

/**
 * Renders a textarea.
 *
 * @param array $args key, name, label, value, help, required, errors, rows,
 *                    and optional attrs.
 * @return void
 */
function gotg_render_textarea_field( array $args ) {
	$args    = gotg_field_defaults( $args );
	$control = $args['name'];
	$rows    = isset( $args['rows'] ) ? (int) $args['rows'] : 3;

	gotg_field_open( $args['key'], $args['errors'] );
	gotg_field_label( $control, $args['label'], $args['required'] );

	echo '<textarea id="' . esc_attr( $control ) . '"';
	echo ' name="' . esc_attr( $args['name'] ) . '"';
	echo ' rows="' . esc_attr( (string) $rows ) . '"';
	echo gotg_field_attrs( $args['attrs'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- pre-escaped in gotg_field_attrs().

	if ( '' !== $args['help'] ) {
		echo ' aria-describedby="' . esc_attr( $control . '-help' ) . '"';
	}

	echo '>' . esc_textarea( $args['value'] ) . '</textarea>';

	gotg_field_help( $control, $args['help'] );
	gotg_field_close();
}

/**
 * Renders a select control.
 *
 * @param array $args key, name, label, value, help, required, errors, options
 *                    (map of value => label).
 * @return void
 */
function gotg_render_select_field( array $args ) {
	$args    = gotg_field_defaults( $args );
	$control = $args['name'];
	$options = isset( $args['options'] ) && is_array( $args['options'] ) ? $args['options'] : array();

	gotg_field_open( $args['key'], $args['errors'] );
	gotg_field_label( $control, $args['label'], $args['required'] );

	echo '<select id="' . esc_attr( $control ) . '" name="' . esc_attr( $args['name'] ) . '"';

	if ( '' !== $args['help'] ) {
		echo ' aria-describedby="' . esc_attr( $control . '-help' ) . '"';
	}

	echo '>';

	foreach ( $options as $value => $label ) {
		printf(
			'<option value="%s"%s>%s</option>',
			esc_attr( (string) $value ),
			selected( (string) $value, $args['value'], false ),
			esc_html( (string) $label )
		);
	}

	echo '</select>';

	gotg_field_help( $control, $args['help'] );
	gotg_field_close();
}

/**
 * Renders a single checkbox with an inline label.
 *
 * @param array $args key, name, label, checked (bool), help, errors.
 * @return void
 */
function gotg_render_checkbox_field( array $args ) {
	$args    = gotg_field_defaults( $args );
	$control = $args['name'];
	$checked = ! empty( $args['checked'] );

	gotg_field_open( $args['key'], $args['errors'] );

	echo '<label class="gotg-checkbox" for="' . esc_attr( $control ) . '">';
	echo '<input type="checkbox" id="' . esc_attr( $control ) . '"';
	echo ' name="' . esc_attr( $args['name'] ) . '" value="1"';
	echo checked( $checked, true, false );

	if ( '' !== $args['help'] ) {
		echo ' aria-describedby="' . esc_attr( $control . '-help' ) . '"';
	}

	echo ' /> ' . esc_html( $args['label'] ) . '</label>';

	gotg_field_help( $control, $args['help'] );
	gotg_field_close();
}

/**
 * Renders a group of checkboxes sharing one array-valued name.
 *
 * @param array $args key, name (without the trailing []), label, options (map
 *                    of value => label), values (array of checked values),
 *                    help, required, errors.
 * @return void
 */
function gotg_render_checkbox_group_field( array $args ) {
	$args    = gotg_field_defaults( $args );
	$options = isset( $args['options'] ) && is_array( $args['options'] ) ? $args['options'] : array();
	$values  = isset( $args['values'] ) && is_array( $args['values'] ) ? array_map( 'strval', $args['values'] ) : array();
	$help_id = ( '' !== $args['help'] ) ? $args['key'] . '-help' : '';

	gotg_field_open( $args['key'], $args['errors'] );

	echo '<fieldset';

	if ( '' !== $help_id ) {
		echo ' aria-describedby="' . esc_attr( $help_id ) . '"';
	}

	echo '><legend>' . esc_html( $args['label'] );

	if ( $args['required'] ) {
		echo ' <span class="gotg-required">' . esc_html__( '(required)', 'gotg' ) . '</span>';
	}

	echo '</legend>';

	$index = 0;

	foreach ( $options as $value => $label ) {
		$control = $args['name'] . '_' . $index;

		echo '<label class="gotg-checkbox" for="' . esc_attr( $control ) . '">';
		echo '<input type="checkbox" id="' . esc_attr( $control ) . '"';
		echo ' name="' . esc_attr( $args['name'] ) . '[]"';
		echo ' value="' . esc_attr( (string) $value ) . '"';
		echo checked( in_array( (string) $value, $values, true ), true, false );
		echo ' /> ' . esc_html( (string) $label ) . '</label>';

		++$index;
	}

	echo '</fieldset>';

	if ( '' !== $args['help'] ) {
		printf(
			'<p class="description" id="%s">%s</p>',
			esc_attr( $help_id ),
			esc_html( $args['help'] )
		);
	}

	gotg_field_close();
}

/**
 * Builds the control markup for a media (attachment ID) field (§2.7).
 *
 * A hidden input holds the ID, a preview shows the current image, and two real
 * buttons choose and remove it. The picker itself is wired by
 * gotg-media-field.js against the WordPress media modal; without JS the stored
 * ID still submits. Reusable across post boxes and term forms, so it returns a
 * string rather than echoing.
 *
 * @param string $name  Input name (and id).
 * @param mixed  $value Stored attachment ID.
 * @return string Control markup.
 */
function gotg_media_field_control( $name, $value ) {
	$id      = absint( $value );
	$preview = $id ? wp_get_attachment_image( $id, 'thumbnail' ) : '';

	ob_start();
	?>
	<div class="gotg-media-field" data-gotg-media>
		<input type="hidden" id="<?php echo esc_attr( $name ); ?>" name="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( (string) $id ); ?>" data-gotg-media-input />
		<div class="gotg-media-preview" data-gotg-media-preview><?php echo $preview; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() returns safe markup. ?></div>
		<button type="button" class="button" data-gotg-media-choose data-gotg-media-title="<?php esc_attr_e( 'Select image', 'gotg' ); ?>"><?php esc_html_e( 'Choose image', 'gotg' ); ?></button>
		<button type="button" class="button" data-gotg-media-remove<?php echo $id ? '' : ' hidden'; ?>><?php esc_html_e( 'Remove image', 'gotg' ); ?></button>
	</div>
	<?php
	return (string) ob_get_clean();
}

/**
 * Fills field argument defaults so partials can read every key.
 *
 * @param array $args Partial arguments.
 * @return array Arguments with defaults applied.
 */
function gotg_field_defaults( array $args ) {
	return array_merge(
		array(
			'key'      => '',
			'name'     => '',
			'label'    => '',
			'value'    => '',
			'help'     => '',
			'required' => false,
			'errors'   => array(),
			'type'     => 'text',
			'attrs'    => array(),
		),
		$args
	);
}

/**
 * Renders a map of extra HTML attributes, each value escaped.
 *
 * @param array $attrs Map of attribute name => value.
 * @return string A leading-space-prefixed attribute string.
 */
function gotg_field_attrs( array $attrs ) {
	$out = '';

	foreach ( $attrs as $name => $value ) {
		if ( is_bool( $value ) ) {
			if ( $value ) {
				$out .= ' ' . esc_attr( (string) $name );
			}
			continue;
		}

		$out .= ' ' . esc_attr( (string) $name ) . '="' . esc_attr( (string) $value ) . '"';
	}

	return $out;
}
