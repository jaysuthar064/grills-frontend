<?php
/**
 * Site Settings admin page.
 *
 * Renders a tabbed settings form under the Grill on the Green parent menu.
 * Each tab maps to one section of the gotg_site_settings option
 * (03-CONTENT-MODEL.md §§11.1–11.6).
 *
 * Saves are handled by WordPress's options.php, using the registered
 * sanitize_callback in settings.php.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Returns the tab definitions.
 *
 * @return array<string, string> Slug => label.
 */
function gotg_settings_tabs() {
	return array(
		'identity'   => __( 'Identity', 'gotg' ),
		'contact'    => __( 'Contact & Social', 'gotg' ),
		'navigation' => __( 'Navigation', 'gotg' ),
		'seo'        => __( 'SEO', 'gotg' ),
		'menu-page'  => __( 'Menu Page', 'gotg' ),
		'events'     => __( 'Events Page', 'gotg' ),
	);
}

/**
 * Returns the settings keys that belong to a given tab.
 *
 * @param string $tab Tab slug.
 * @return string[] Settings keys.
 */
function gotg_settings_tab_keys( $tab ) {
	$map = array(
		'identity'   => array(
			'site_name', 'legal_name', 'tagline', 'short_description',
			'logo_primary_id', 'logo_inverse_id', 'favicon_id', 'primary_location_id',
		),
		'contact'    => array(
			'social_links', 'form_recipient_email',
			'reservation_url', 'ordering_url', 'gift_card_url',
		),
		'navigation' => array(
			'nav_primary', 'nav_footer',
			'header_cta_label', 'header_cta_url',
			'announcement_text', 'announcement_url', 'announcement_expires',
		),
		'seo'        => array(
			'seo_title_template', 'seo_default_description', 'seo_default_og_image_id',
			'google_business_url', 'price_range', 'cuisine_types',
		),
		'menu-page'  => array(
			'menu_disclaimer', 'show_dietary_legend', 'default_daypart', 'daypart_windows',
		),
		'events'     => array(
			'show_recurring', 'recurring_heading', 'recurring_body',
			'recurring_days', 'recurring_starts', 'recurring_ends',
			'events_empty_message',
		),
	);

	return $map[ $tab ] ?? array();
}

/**
 * Renders the Site Settings page.
 *
 * @return void
 */
function gotg_render_settings_page() {
	$tabs        = gotg_settings_tabs();
	$current_tab = isset( $_GET['tab'] ) && array_key_exists( $_GET['tab'], $tabs )
		? sanitize_key( $_GET['tab'] )
		: 'identity';

	$settings = gotg_get_site_settings();
	$schema   = gotg_site_settings_schema();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Site Settings', 'gotg' ); ?></h1>

		<nav class="nav-tab-wrapper" style="margin-bottom:1.5rem;">
			<?php foreach ( $tabs as $slug => $label ) : ?>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=gotg-settings&tab=' . $slug ) ); ?>"
				   class="nav-tab <?php echo $current_tab === $slug ? 'nav-tab-active' : ''; ?>">
					<?php echo esc_html( $label ); ?>
				</a>
			<?php endforeach; ?>
		</nav>

		<?php if ( isset( $_GET['settings-updated'] ) && 'true' === $_GET['settings-updated'] ) : ?>
			<div class="notice notice-success is-dismissible">
				<p><strong><?php esc_html_e( 'Settings saved.', 'gotg' ); ?></strong></p>
			</div>
		<?php endif; ?>

		<form method="post" action="<?php echo esc_url( admin_url( 'options.php' ) ); ?>">
			<?php settings_fields( 'gotg_site_settings_group' ); ?>
			<input type="hidden" name="_wp_http_referer"
			       value="<?php echo esc_url( admin_url( 'admin.php?page=gotg-settings&tab=' . $current_tab . '&settings-updated=true' ) ); ?>" />

			<table class="form-table" role="presentation">
				<tbody>
					<?php
					$tab_keys = gotg_settings_tab_keys( $current_tab );

					foreach ( $tab_keys as $key ) :
						$value   = $settings[ $key ] ?? '';
						$type    = $schema[ $key ] ?? 'text';
						$label   = gotg_settings_field_label( $key );
						$field_name = 'gotg_site_settings[' . $key . ']';

						// Skip complex array fields for now — they need custom UI.
						if ( in_array( $type, array( 'social_links', 'nav_rows', 'daypart_windows' ), true ) ) {
							gotg_render_complex_field( $key, $label, $value, $type );
							continue;
						}
						?>
						<tr>
							<th scope="row">
								<label for="gotg-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label>
							</th>
							<td>
								<?php gotg_render_settings_field( $key, $value, $type, $field_name ); ?>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>

			<?php submit_button( __( 'Save Settings', 'gotg' ) ); ?>
		</form>
	</div>
	<?php
}

/**
 * Renders one settings field based on its type.
 *
 * @param string $key        Settings key.
 * @param mixed  $value      Current value.
 * @param string $type       Field type from schema.
 * @param string $field_name HTML name attribute.
 * @return void
 */
function gotg_render_settings_field( $key, $value, $type, $field_name ) {
	$id = 'gotg-' . $key;

	switch ( $type ) {
		case 'textarea':
			printf(
				'<textarea id="%s" name="%s" rows="4" class="large-text">%s</textarea>',
				esc_attr( $id ),
				esc_attr( $field_name ),
				esc_textarea( $value )
			);
			break;

		case 'bool':
			printf(
				'<label><input type="checkbox" id="%s" name="%s" value="1" %s /> %s</label>',
				esc_attr( $id ),
				esc_attr( $field_name ),
				checked( $value, true, false ),
				esc_html__( 'Enabled', 'gotg' )
			);
			break;

		case 'int':
			printf(
				'<input type="number" id="%s" name="%s" value="%s" class="small-text" min="0" />',
				esc_attr( $id ),
				esc_attr( $field_name ),
				esc_attr( $value )
			);
			break;

		case 'email':
			printf(
				'<input type="email" id="%s" name="%s" value="%s" class="regular-text" />',
				esc_attr( $id ),
				esc_attr( $field_name ),
				esc_attr( $value )
			);
			break;

		case 'url':
		case 'link':
			printf(
				'<input type="url" id="%s" name="%s" value="%s" class="regular-text" />',
				esc_attr( $id ),
				esc_attr( $field_name ),
				esc_attr( $value )
			);
			break;

		case 'date':
			printf(
				'<input type="date" id="%s" name="%s" value="%s" />',
				esc_attr( $id ),
				esc_attr( $field_name ),
				esc_attr( $value )
			);
			break;

		case 'time':
			printf(
				'<input type="time" id="%s" name="%s" value="%s" />',
				esc_attr( $id ),
				esc_attr( $field_name ),
				esc_attr( $value )
			);
			break;

		case 'string_list':
			$list_value = is_array( $value ) ? implode( ', ', $value ) : (string) $value;
			printf(
				'<input type="text" id="%s" name="%s" value="%s" class="large-text" />' .
				'<p class="description">Comma-separated list.</p>',
				esc_attr( $id ),
				esc_attr( $field_name ),
				esc_attr( $list_value )
			);
			break;

		case 'weekday_list':
			$days = array( 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' );
			$checked = is_array( $value ) ? $value : array();
			foreach ( $days as $day ) {
				printf(
					'<label style="display:inline-block;margin-right:1rem;">' .
					'<input type="checkbox" name="%s[]" value="%s" %s /> %s</label>',
					esc_attr( $field_name ),
					esc_attr( $day ),
					checked( in_array( $day, $checked, true ), true, false ),
					esc_html( ucfirst( $day ) )
				);
			}
			break;

		case 'key':
			if ( 'default_daypart' === $key ) {
				$options = array( 'auto' => 'Auto', 'breakfast' => 'Breakfast', 'lunch' => 'Lunch', 'dinner' => 'Dinner' );
				echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $field_name ) . '">';
				foreach ( $options as $opt_val => $opt_label ) {
					printf(
						'<option value="%s" %s>%s</option>',
						esc_attr( $opt_val ),
						selected( $value, $opt_val, false ),
						esc_html( $opt_label )
					);
				}
				echo '</select>';
			} else {
				printf(
					'<input type="text" id="%s" name="%s" value="%s" class="regular-text" />',
					esc_attr( $id ),
					esc_attr( $field_name ),
					esc_attr( $value )
				);
			}
			break;

		default: // text
			printf(
				'<input type="text" id="%s" name="%s" value="%s" class="regular-text" />',
				esc_attr( $id ),
				esc_attr( $field_name ),
				esc_attr( $value )
			);
			break;
	}
}

/**
 * Renders a complex repeater-style field (nav rows, social links, daypart windows).
 *
 * @param string $key   Settings key.
 * @param string $label Human label.
 * @param mixed  $value Current value.
 * @param string $type  Schema type.
 * @return void
 */
function gotg_render_complex_field( $key, $label, $value, $type ) {
	$rows = is_array( $value ) ? $value : array();
	$field_name = 'gotg_site_settings[' . $key . ']';
	?>
	<tr>
		<th scope="row"><?php echo esc_html( $label ); ?></th>
		<td>
			<div id="gotg-<?php echo esc_attr( $key ); ?>-repeater">
				<?php if ( 'nav_rows' === $type ) : ?>
					<?php foreach ( $rows as $i => $row ) : ?>
						<div class="gotg-repeater-row">
							<div class="gotg-field-inline">
								<label>Label</label>
								<input type="text" name="<?php echo esc_attr( $field_name ); ?>[<?php echo $i; ?>][label]"
								       value="<?php echo esc_attr( $row['label'] ?? '' ); ?>" style="width:160px;" />
							</div>
							<div class="gotg-field-inline">
								<label>URL</label>
								<input type="text" name="<?php echo esc_attr( $field_name ); ?>[<?php echo $i; ?>][url]"
								       value="<?php echo esc_attr( $row['url'] ?? '' ); ?>" style="width:200px;" />
							</div>
						</div>
					<?php endforeach; ?>
					<p class="description">Edit navigation links above. To add/remove items use WP-CLI or contact your developer.</p>

				<?php elseif ( 'social_links' === $type ) : ?>
					<?php foreach ( $rows as $i => $row ) : ?>
						<div class="gotg-repeater-row">
							<div class="gotg-field-inline">
								<label>Platform</label>
								<input type="text" name="<?php echo esc_attr( $field_name ); ?>[<?php echo $i; ?>][platform]"
								       value="<?php echo esc_attr( $row['platform'] ?? '' ); ?>" style="width:120px;" />
							</div>
							<div class="gotg-field-inline">
								<label>URL</label>
								<input type="url" name="<?php echo esc_attr( $field_name ); ?>[<?php echo $i; ?>][url]"
								       value="<?php echo esc_attr( $row['url'] ?? '' ); ?>" style="width:260px;" />
							</div>
							<div class="gotg-field-inline">
								<label>Handle</label>
								<input type="text" name="<?php echo esc_attr( $field_name ); ?>[<?php echo $i; ?>][handle]"
								       value="<?php echo esc_attr( $row['handle'] ?? '' ); ?>" style="width:140px;" />
							</div>
						</div>
					<?php endforeach; ?>

				<?php elseif ( 'daypart_windows' === $type ) : ?>
					<?php foreach ( $rows as $i => $row ) : ?>
						<div class="gotg-repeater-row">
							<div class="gotg-field-inline">
								<label>Key</label>
								<input type="text" name="<?php echo esc_attr( $field_name ); ?>[<?php echo $i; ?>][key]"
								       value="<?php echo esc_attr( $row['key'] ?? '' ); ?>" style="width:100px;" />
							</div>
							<div class="gotg-field-inline">
								<label>Label</label>
								<input type="text" name="<?php echo esc_attr( $field_name ); ?>[<?php echo $i; ?>][label]"
								       value="<?php echo esc_attr( $row['label'] ?? '' ); ?>" style="width:120px;" />
							</div>
							<div class="gotg-field-inline">
								<label>Starts</label>
								<input type="time" name="<?php echo esc_attr( $field_name ); ?>[<?php echo $i; ?>][starts]"
								       value="<?php echo esc_attr( $row['starts'] ?? '' ); ?>" />
							</div>
							<div class="gotg-field-inline">
								<label>Ends</label>
								<input type="time" name="<?php echo esc_attr( $field_name ); ?>[<?php echo $i; ?>][ends]"
								       value="<?php echo esc_attr( $row['ends'] ?? '' ); ?>" />
							</div>
						</div>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
		</td>
	</tr>
	<?php
}

/**
 * Returns a human-readable label for a settings key.
 *
 * @param string $key Settings key.
 * @return string Label.
 */
function gotg_settings_field_label( $key ) {
	$labels = array(
		'site_name'               => 'Site Name',
		'legal_name'              => 'Legal Name',
		'tagline'                 => 'Tagline',
		'short_description'       => 'Short Description',
		'logo_primary_id'         => 'Primary Logo (Attachment ID)',
		'logo_inverse_id'         => 'Inverse Logo (Attachment ID)',
		'favicon_id'              => 'Favicon (Attachment ID)',
		'primary_location_id'     => 'Primary Location (Post ID)',
		'social_links'            => 'Social Links',
		'form_recipient_email'    => 'Contact Form Email',
		'reservation_url'         => 'Reservation URL',
		'ordering_url'            => 'Online Ordering URL',
		'gift_card_url'           => 'Gift Card URL',
		'nav_primary'             => 'Primary Navigation',
		'nav_footer'              => 'Footer Navigation',
		'header_cta_label'        => 'Header CTA Label',
		'header_cta_url'          => 'Header CTA URL',
		'announcement_text'       => 'Announcement Text',
		'announcement_url'        => 'Announcement URL',
		'announcement_expires'    => 'Announcement Expiry',
		'seo_title_template'      => 'SEO Title Template',
		'seo_default_description' => 'Default Meta Description',
		'seo_default_og_image_id' => 'Default OG Image (Attachment ID)',
		'google_business_url'     => 'Google Business URL',
		'price_range'             => 'Price Range',
		'cuisine_types'           => 'Cuisine Types',
		'menu_disclaimer'         => 'Menu Disclaimer',
		'show_dietary_legend'     => 'Show Dietary Legend',
		'default_daypart'         => 'Default Daypart',
		'daypart_windows'         => 'Daypart Windows',
		'show_recurring'          => 'Show Recurring Events',
		'recurring_heading'       => 'Recurring Heading',
		'recurring_body'          => 'Recurring Body',
		'recurring_days'          => 'Recurring Days',
		'recurring_starts'        => 'Recurring Start Time',
		'recurring_ends'          => 'Recurring End Time',
		'events_empty_message'    => 'Events Empty Message',
	);

	return $labels[ $key ] ?? ucwords( str_replace( '_', ' ', $key ) );
}
