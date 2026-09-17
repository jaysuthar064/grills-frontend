<?php
/**
 * Seed content — LOGIC.
 *
 * The `wp gotg seed` / `wp gotg unseed` WP-CLI command. Reads the arrays in
 * seed-data.php and creates/updates content through WordPress APIs only
 * (wp_insert_post, update_post_meta, wp_set_object_terms, update_option) — never
 * raw SQL — so it runs identically on local SQLite and staging/production
 * MySQL. That engine-agnosticism is the whole point: content is provisioned by
 * running this command in each environment, not by migrating a database
 * between them (10-ENVIRONMENTS-DEPLOYMENT.md §6).
 *
 * Every created object is tagged with the `_gotg_seeded` marker so `unseed` and
 * `--fresh` remove exactly what the script owns and never touch hand-entered
 * content. Site Settings ownership is tracked by the `gotg_seed_owns_settings`
 * option, so a reseed never clobbers hand-configured production settings.
 *
 * This file is loaded only under WP-CLI (gotg-core.php), never on a web request.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/**
 * Seeds and removes the Grill on the Green demo content set.
 */
class Gotg_Seed_Command {

	const SEEDED_META    = '_gotg_seeded';
	const SETTINGS_OWNED = 'gotg_seed_owns_settings';

	/**
	 * Attachment IDs keyed by image key, populated during a seed run.
	 *
	 * @var array<string, int>
	 */
	private $image_ids = array();

	/**
	 * Creates or updates the full demo content set. Idempotent.
	 *
	 * ## OPTIONS
	 *
	 * [--fresh]
	 * : Remove existing seeded content first, then seed from scratch.
	 *
	 * ## EXAMPLES
	 *
	 *     wp gotg seed
	 *     wp gotg seed --fresh
	 *
	 * @param array $args       Positional args (unused).
	 * @param array $assoc_args Associative args.
	 * @return void
	 */
	public function seed( $args, $assoc_args ) {
		unset( $args );

		if ( ! empty( $assoc_args['fresh'] ) ) {
			WP_CLI::log( 'Removing existing seeded content (--fresh)…' );
			$removed = $this->run_unseed();
			WP_CLI::log( sprintf( '  removed %d posts, %d terms.', $removed['posts'], $removed['terms'] ) );
		}

		$this->seed_images();
		$location_id = $this->seed_location();
		$this->seed_pages();
		$sections = $this->seed_sections();
		$dietary  = $this->seed_dietary();
		$items    = $this->seed_menu_items( $sections, $dietary );
		$events   = $this->seed_events();
		$block_ids = $this->seed_reusable_blocks();
		$blocks    = $this->seed_page_blocks( $block_ids );
		$this->seed_settings( $location_id );

		WP_CLI::success(
			sprintf(
				'Seeded: 1 location, %d pages (%d with blocks), %d sections, %d dietary tags, %d menu items, %d events, %d reusable blocks, %d images, and Site Settings.',
				count( gotg_seed_pages() ),
				$blocks,
				count( $sections ),
				count( $dietary ),
				$items,
				$events,
				count( $block_ids ),
				count( $this->image_ids )
			)
		);
	}

	/**
	 * Removes everything the seed script owns; leaves hand-entered content.
	 *
	 * ## EXAMPLES
	 *
	 *     wp gotg unseed
	 *
	 * @param array $args       Positional args (unused).
	 * @param array $assoc_args Associative args (unused).
	 * @return void
	 */
	public function unseed( $args, $assoc_args ) {
		unset( $args, $assoc_args );

		$removed = $this->run_unseed();

		WP_CLI::success(
			sprintf(
				'Unseeded: removed %d posts and %d terms; Site Settings %s.',
				$removed['posts'],
				$removed['terms'],
				$removed['settings'] ? 'removed' : 'left (not seed-owned)'
			)
		);
	}

	/**
	 * Deletes all `_gotg_seeded` posts, attachments, and terms, and the seeded
	 * settings if the seed owns them.
	 *
	 * @return array{posts: int, terms: int, settings: bool}
	 */
	private function run_unseed() {
		$post_ids = get_posts(
			array(
				'post_type'   => array( 'page', 'gotg_menu_item', 'gotg_event', 'gotg_location', 'gotg_block', 'attachment' ),
				'post_status' => 'any',
				'numberposts' => -1,
				'fields'      => 'ids',
				'meta_key'    => self::SEEDED_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value'  => '1', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			)
		);

		foreach ( $post_ids as $post_id ) {
			wp_delete_post( (int) $post_id, true );
		}

		$term_count = 0;
		foreach ( array( 'gotg_menu_section', 'gotg_dietary' ) as $taxonomy ) {
			$terms = get_terms(
				array(
					'taxonomy'   => $taxonomy,
					'hide_empty' => false,
					'fields'     => 'ids',
					'meta_query' => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
						array( 'key' => self::SEEDED_META, 'value' => '1' ),
					),
				)
			);

			if ( is_wp_error( $terms ) ) {
				continue;
			}

			// Child terms first so a parent is never orphaned mid-delete.
			usort(
				$terms,
				static function ( $a, $b ) {
					return (int) get_term( (int) $b )->parent <=> (int) get_term( (int) $a )->parent;
				}
			);

			foreach ( $terms as $term_id ) {
				wp_delete_term( (int) $term_id, $taxonomy );
				++$term_count;
			}
		}

		$settings_removed = false;
		if ( get_option( self::SETTINGS_OWNED ) ) {
			delete_option( 'gotg_site_settings' );
			delete_option( self::SETTINGS_OWNED );
			$settings_removed = true;
		}

		return array(
			'posts'    => count( $post_ids ),
			'terms'    => $term_count,
			'settings' => $settings_removed,
		);
	}

	/**
	 * Finds a post by slug and type, or 0.
	 *
	 * @param string $type Post type.
	 * @param string $slug Post slug.
	 * @return int
	 */
	private function find_post( $type, $slug ) {
		$found = get_posts(
			array(
				'post_type'   => $type,
				'name'        => $slug,
				'post_status' => 'any',
				'numberposts' => 1,
				'fields'      => 'ids',
			)
		);

		return $found ? (int) $found[0] : 0;
	}

	/**
	 * Creates or updates a post by slug, tagging it seeded.
	 *
	 * @param string $type    Post type.
	 * @param string $slug    Slug.
	 * @param string $title   Title.
	 * @param string $content Post content (rich text), or ''.
	 * @return int Post ID.
	 */
	private function upsert_post( $type, $slug, $title, $content = '' ) {
		$id   = $this->find_post( $type, $slug );
		$data = array(
			'post_type'    => $type,
			'post_name'    => $slug,
			'post_title'   => $title,
			'post_status'  => 'publish',
			'post_content' => $content,
		);

		if ( $id ) {
			$data['ID'] = $id;
			wp_update_post( $data );
		} else {
			$id = (int) wp_insert_post( $data );
		}

		update_post_meta( $id, self::SEEDED_META, '1' );

		return $id;
	}

	/**
	 * Sideloads the bundled placeholder images into the media library, once
	 * each, tagged seeded. Populates $this->image_ids.
	 *
	 * @return void
	 */
	private function seed_images() {
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$assets_dir = dirname( __DIR__ ) . '/seed/assets/';

		foreach ( gotg_seed_images() as $key => $img ) {
			$slug     = 'gotg-seed-' . $key;
			$existing = $this->find_post( 'attachment', $slug );

			if ( $existing ) {
				update_post_meta( $existing, self::SEEDED_META, '1' );
				$this->image_ids[ $key ] = $existing;
				continue;
			}

			$source = $assets_dir . $img['file'];
			if ( ! file_exists( $source ) ) {
				WP_CLI::warning( 'Missing seed image: ' . $img['file'] );
				continue;
			}

			$uploads = wp_upload_dir();
			$dest    = trailingslashit( $uploads['path'] ) . $img['file'];
			copy( $source, $dest );

			$attach_id = (int) wp_insert_attachment(
				array(
					'post_mime_type' => 'image/png',
					'post_title'     => $img['alt'],
					'post_name'      => $slug,
					'post_status'    => 'inherit',
				),
				$dest
			);

			wp_update_attachment_metadata( $attach_id, wp_generate_attachment_metadata( $attach_id, $dest ) );
			update_post_meta( $attach_id, '_wp_attachment_image_alt', $img['alt'] );
			update_post_meta( $attach_id, self::SEEDED_META, '1' );

			$this->image_ids[ $key ] = $attach_id;
		}
	}

	/**
	 * Returns the attachment id for an image key, or 0.
	 *
	 * @param string $key Image key.
	 * @return int
	 */
	private function image_id( $key ) {
		return ( '' !== $key && isset( $this->image_ids[ $key ] ) ) ? $this->image_ids[ $key ] : 0;
	}

	/**
	 * Seeds the single Location.
	 *
	 * @return int Location post ID.
	 */
	private function seed_location() {
		$data = gotg_seed_location();
		$id   = $this->upsert_post( 'gotg_location', $data['slug'], $data['title'] );

		foreach ( $data['meta'] as $key => $value ) {
			update_post_meta( $id, $key, $value );
		}
		update_post_meta( $id, '_gotg_regular_hours', gotg_sanitize_regular_hours( array() ) );
		update_post_meta(
			$id,
			'_gotg_hours_exceptions',
			array(
				array( 'date' => gmdate( 'Y' ) . '-11-26', 'label' => 'Thanksgiving', 'is_closed' => true, 'opens' => '', 'closes' => '' ),
			)
		);

		return $id;
	}

	/**
	 * Seeds the five routed pages.
	 *
	 * @return void
	 */
	private function seed_pages() {
		foreach ( gotg_seed_pages() as $page ) {
			$id = $this->upsert_post( 'page', $page['slug'], $page['title'] );
			update_post_meta( $id, '_gotg_seo_title', $page['seo_title'] );
			update_post_meta( $id, '_gotg_seo_description', $page['seo_description'] );
		}
	}

	/**
	 * Seeds menu sections, parents before children, tagging term meta seeded.
	 *
	 * @return array<string, int> Section slug to term ID.
	 */
	private function seed_sections() {
		$ids = array();

		foreach ( gotg_seed_sections() as $section ) {
			$parent_id = ( '' !== $section['parent'] && isset( $ids[ $section['parent'] ] ) ) ? $ids[ $section['parent'] ] : 0;
			$term_id   = $this->upsert_term( 'gotg_menu_section', $section['slug'], $section['name'], $parent_id );

			update_term_meta( $term_id, '_gotg_display_order', $section['order'] );
			if ( '' !== $section['intro'] ) {
				update_term_meta( $term_id, '_gotg_intro', $section['intro'] );
			} else {
				delete_term_meta( $term_id, '_gotg_intro' );
			}
			$image_id = $this->image_id( $section['image'] );
			update_term_meta( $term_id, '_gotg_image_id', $image_id );

			$ids[ $section['slug'] ] = $term_id;
		}

		return $ids;
	}

	/**
	 * Seeds dietary terms.
	 *
	 * @return array<string, int> Dietary slug to term ID.
	 */
	private function seed_dietary() {
		$ids = array();

		foreach ( gotg_seed_dietary() as $tag ) {
			$term_id = $this->upsert_term( 'gotg_dietary', $tag['slug'], $tag['name'], 0 );
			update_term_meta( $term_id, '_gotg_abbreviation', $tag['abbreviation'] );
			update_term_meta( $term_id, '_gotg_color', $tag['color'] );
			update_term_meta( $term_id, '_gotg_description_text', $tag['description'] );
			$ids[ $tag['slug'] ] = $term_id;
		}

		return $ids;
	}

	/**
	 * Creates or updates a term by slug, tagging it seeded.
	 *
	 * @param string $taxonomy Taxonomy.
	 * @param string $slug     Slug.
	 * @param string $name     Name.
	 * @param int    $parent   Parent term ID.
	 * @return int Term ID.
	 */
	private function upsert_term( $taxonomy, $slug, $name, $parent ) {
		$existing = get_term_by( 'slug', $slug, $taxonomy );

		if ( $existing instanceof WP_Term ) {
			$term_id = (int) $existing->term_id;
			wp_update_term( $term_id, $taxonomy, array( 'name' => $name, 'parent' => $parent ) );
		} else {
			$result  = wp_insert_term( $name, $taxonomy, array( 'slug' => $slug, 'parent' => $parent ) );
			$term_id = (int) $result['term_id'];
		}

		update_term_meta( $term_id, self::SEEDED_META, '1' );

		return $term_id;
	}

	/**
	 * Seeds menu items.
	 *
	 * @param array<string, int> $sections Section slug to term ID.
	 * @param array<string, int> $dietary  Dietary slug to term ID.
	 * @return int Count seeded.
	 */
	private function seed_menu_items( array $sections, array $dietary ) {
		$count = 0;

		foreach ( gotg_seed_menu_items() as $item ) {
			$id = $this->upsert_post( 'gotg_menu_item', $item['slug'], $item['name'] );

			update_post_meta( $id, '_gotg_price_variants', $item['variants'] );
			if ( '' === $item['description'] ) {
				delete_post_meta( $id, '_gotg_description' );
			} else {
				update_post_meta( $id, '_gotg_description', $item['description'] );
			}
			update_post_meta( $id, '_gotg_availability', $item['availability'] );
			update_post_meta( $id, '_gotg_is_available', $item['is_available'] ? '1' : '0' );
			update_post_meta( $id, '_gotg_is_featured', empty( $item['featured'] ) ? '0' : '1' );
			update_post_meta( $id, '_gotg_spice_level', $item['spice'] );

			$section_id = isset( $sections[ $item['section'] ] ) ? array( $sections[ $item['section'] ] ) : array();
			wp_set_object_terms( $id, $section_id, 'gotg_menu_section', false );

			$dietary_ids = array();
			foreach ( $item['dietary'] as $slug ) {
				if ( isset( $dietary[ $slug ] ) ) {
					$dietary_ids[] = $dietary[ $slug ];
				}
			}
			wp_set_object_terms( $id, $dietary_ids, 'gotg_dietary', false );

			$image_id = $this->image_id( $item['image'] );
			if ( $image_id ) {
				set_post_thumbnail( $id, $image_id );
			} else {
				delete_post_thumbnail( $id );
			}

			++$count;
		}

		return $count;
	}

	/**
	 * Seeds events. Relative offsets are resolved to wall-clock Pacific
	 * datetimes so seeded events stay upcoming whenever the script runs.
	 *
	 * @return int Count seeded.
	 */
	private function seed_events() {
		$count = 0;
		$zone  = new DateTimeZone( 'America/Los_Angeles' );

		foreach ( gotg_seed_events() as $event ) {
			$id = $this->upsert_post( 'gotg_event', $event['slug'], $event['title'], $event['description'] );

			list( $hour, $minute ) = array_map( 'intval', explode( ':', $event['start_time'] ) );
			$start = ( new DateTimeImmutable( 'now', $zone ) )
				->modify( sprintf( '%+d days', (int) $event['start_offset_days'] ) )
				->setTime( $hour, $minute );
			$end = $start->modify( '+' . (int) $event['duration_hours'] . ' hours' );

			update_post_meta( $id, '_gotg_start_datetime', $start->format( 'Y-m-d H:i' ) );
			update_post_meta( $id, '_gotg_end_datetime', $end->format( 'Y-m-d H:i' ) );
			update_post_meta( $id, '_gotg_event_type', $event['event_type'] );
			update_post_meta( $id, '_gotg_summary', $event['summary'] );
			update_post_meta( $id, '_gotg_is_ticketed', $event['is_ticketed'] ? '1' : '0' );
			update_post_meta( $id, '_gotg_is_recurring_instance', $event['is_recurring_instance'] ? '1' : '0' );

			$this->set_or_delete( $id, '_gotg_performer_name', $event['performer_name'] );
			$this->set_or_delete( $id, '_gotg_performer_url', $event['performer_url'] );
			$this->set_or_delete( $id, '_gotg_ticket_url', $event['ticket_url'] );

			if ( null !== $event['cover_charge'] ) {
				update_post_meta( $id, '_gotg_cover_charge', $event['cover_charge'] );
			} else {
				delete_post_meta( $id, '_gotg_cover_charge' );
			}

			$image_id = $this->image_id( $event['image'] );
			if ( $image_id ) {
				set_post_thumbnail( $id, $image_id );
			} else {
				delete_post_thumbnail( $id );
			}

			++$count;
		}

		return $count;
	}

	/**
	 * Seeds the reusable blocks as `gotg_block` posts. Each stores exactly one
	 * block under `_gotg_block`, as a list holding one entry (the shape the
	 * shaper and admin both read).
	 *
	 * @return array<string, int> Reusable-block slug to post ID.
	 */
	private function seed_reusable_blocks() {
		$ids = array();

		foreach ( gotg_seed_reusable_blocks() as $slug => $block ) {
			$title = ucwords( str_replace( '-', ' ', $slug ) );
			$id    = $this->upsert_post( 'gotg_block', $slug, $title );

			// A reusable block cannot reference another, so no block ids are needed.
			$resolved = $this->resolve_block_refs( $block, array() );
			update_post_meta( $id, '_gotg_block', array( $resolved ) );

			$ids[ $slug ] = $id;
		}

		return $ids;
	}

	/**
	 * Seeds each page's `_gotg_page_blocks`, resolving friendly image and
	 * reusable-block references to ids first.
	 *
	 * @param array<string, int> $block_ids Reusable-block slug to post ID.
	 * @return int Number of pages given blocks.
	 */
	private function seed_page_blocks( array $block_ids ) {
		$count = 0;

		foreach ( gotg_seed_page_blocks() as $slug => $blocks ) {
			$page_id = $this->find_post( 'page', $slug );

			if ( ! $page_id ) {
				WP_CLI::warning( sprintf( 'Page "%s" not found; its blocks were skipped.', $slug ) );
				continue;
			}

			$resolved = array();
			foreach ( $blocks as $block ) {
				$resolved[] = $this->resolve_block_refs( $block, $block_ids );
			}

			update_post_meta( $page_id, '_gotg_page_blocks', $resolved );
			++$count;
		}

		return $count;
	}

	/**
	 * Converts a block's friendly references to stored ids: `image` to `image_id`,
	 * `image_ids` (image keys) in place, people `photo` to `photo_id`, and
	 * `block_ref` to `block_ref_id`. All other keys pass through untouched; the
	 * meta sanitiser drops anything the block's schema does not name.
	 *
	 * @param array<string, mixed> $block     One seed block row.
	 * @param array<string, int>   $block_ids Reusable-block slug to post ID.
	 * @return array<string, mixed> Block row with references resolved to ids.
	 */
	private function resolve_block_refs( array $block, array $block_ids ) {
		if ( isset( $block['image'] ) ) {
			$block['image_id'] = $this->image_id( $block['image'] );
			unset( $block['image'] );
		}

		if ( isset( $block['image_ids'] ) && is_array( $block['image_ids'] ) ) {
			$block['image_ids'] = array_values(
				array_filter( array_map( array( $this, 'image_id' ), $block['image_ids'] ) )
			);
		}

		if ( isset( $block['people'] ) && is_array( $block['people'] ) ) {
			$block['people'] = array_map(
				function ( $person ) {
					if ( isset( $person['photo'] ) ) {
						$person['photo_id'] = $this->image_id( $person['photo'] );
						unset( $person['photo'] );
					}

					return $person;
				},
				$block['people']
			);
		}

		if ( isset( $block['block_ref'] ) ) {
			$block['block_ref_id'] = $block_ids[ $block['block_ref'] ] ?? 0;
			unset( $block['block_ref'] );
		}

		return $block;
	}

	/**
	 * Writes a meta value, or deletes the key when the value is empty.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $key     Meta key.
	 * @param string $value   Value.
	 * @return void
	 */
	private function set_or_delete( $post_id, $key, $value ) {
		if ( '' === $value ) {
			delete_post_meta( $post_id, $key );
		} else {
			update_post_meta( $post_id, $key, $value );
		}
	}

	/**
	 * Seeds Site Settings, unless they exist and are not seed-owned (so a
	 * reseed never clobbers hand-configured production settings).
	 *
	 * @param int $location_id Primary location post ID.
	 * @return void
	 */
	private function seed_settings( $location_id ) {
		$exists = get_option( 'gotg_site_settings' );
		$owned  = get_option( self::SETTINGS_OWNED );

		if ( $exists && ! $owned ) {
			WP_CLI::log( 'Site Settings already present and not seed-owned — left untouched.' );
			return;
		}

		$settings                            = gotg_seed_settings();
		$settings['primary_location_id']     = $location_id;
		$settings['logo_primary_id']         = $this->image_id( 'logo' );
		$settings['logo_inverse_id']         = $this->image_id( 'logo' );
		$settings['favicon_id']              = $this->image_id( 'logo' );
		$settings['seo_default_og_image_id'] = $this->image_id( 'og' );

		update_option( 'gotg_site_settings', $settings );
		update_option( self::SETTINGS_OWNED, true );
	}
}

WP_CLI::add_command( 'gotg', 'Gotg_Seed_Command' );
