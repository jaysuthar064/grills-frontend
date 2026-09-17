<?php
/**
 * Seed content — DATA.
 *
 * =========================================================================
 *  THIS FILE IS DEMO CONTENT. It is the *only* thing to edit when replacing
 *  the placeholder menu, events, and settings with the client's real content.
 *  Every function below returns plain arrays. The create/update LOGIC lives in
 *  class-seed-command.php and does not need to change when the data changes —
 *  swap the arrays here, run `wp gotg seed`, done.
 * =========================================================================
 *
 * Field names and shapes are the meta keys and structures in
 * 03-CONTENT-MODEL.md. Everything the seed command creates is tagged with the
 * `_gotg_seeded` marker so `unseed` and `--fresh` touch only demo content and
 * never hand-entered content (see class-seed-command.php).
 *
 * Images are bundled as small placeholder PNGs under ../seed/assets/ and
 * sideloaded on seed; swap the files or point `image` at '' for imageless.
 *
 * @package GOTG
 */

defined( 'ABSPATH' ) || exit;

/*
 * =========================================================================
 *  PROVISIONAL MENU — every price and item below is PROVISIONAL, pending
 *  client confirmation. NOTHING here is final.
 *
 *  Each menu-item row carries `'provisional' => true`. That flag is a
 *  tracking marker only — it is NOT written to post meta (there is no
 *  provisional meta key, and adding one is out of scope for a data change).
 *  When the client confirms a price, edit that row's `amount` and flip its
 *  `'provisional' => false`. When every row is confirmed, this notice and the
 *  flags can be removed. Confirming a price is therefore a one-line data edit,
 *  never a restructure.
 *
 *  Reconciliation of the three client drafts is already decided (do not
 *  re-merge): Sandwiches & Burgers is built from the newest draft alone;
 *  Appetizers, Bowls/Salads/Wraps, Plates, and Sides come from the older,
 *  fuller draft. Items on older drafts but dropped from the newest Sandwiches
 *  list are treated as discontinued and are NOT seeded here.
 *
 *  Known gaps flagged for the client (assumptions, not invented facts):
 *   - Dayparts: the drafts specify none, so every item is marked available in
 *     all three (breakfast/lunch/dinner) — the registered default, i.e. "no
 *     daypart restriction". Confirm real service windows.
 *   - Spice levels: left at `none` for all; the client de-scoped a "Spicy"
 *     dietary tag and gave no per-item heat. Marco to confirm.
 *   - Dietary tags: only Vegetarian is applied (to the Veggie Sandwich).
 *     Marco confirms the rest later — untagged does not mean "not veg/GF".
 *   - Descriptions: the drafts carried no prose descriptions, only protein /
 *     sauce CHOICES; those choices are captured in `description` (the only
 *     field for them). Items with neither are left blank — none invented.
 *   - Per-item upcharges (Southern Style +1.50, combo +5.95) and the Mushroom
 *     Burger "crowd favorite" label have no field in the model; they live in
 *     the section intro / the `featured` flag respectively.
 * =========================================================================
 */

/**
 * Bundled placeholder images: key => file (in seed/assets/), alt, dimensions.
 *
 * @return array<string, array{file: string, alt: string, width: int, height: int}>
 */
function gotg_seed_images() {
	return array(
		'logo'    => array( 'file' => 'logo.png', 'alt' => 'Grill on the Green', 'width' => 480, 'height' => 160 ),
		'og'      => array( 'file' => 'og-default.png', 'alt' => 'Grill on the Green', 'width' => 1200, 'height' => 630 ),
		'brisket' => array( 'file' => 'brisket-plate.png', 'alt' => 'Sliced brisket with pickles and slaw', 'width' => 800, 'height' => 600 ),
		'smoker'  => array( 'file' => 'from-the-smoker.png', 'alt' => 'Brisket resting on the smoker', 'width' => 1200, 'height' => 800 ),
		'band'    => array( 'file' => 'the-canyon-band.png', 'alt' => 'Four musicians playing on an outdoor patio', 'width' => 800, 'height' => 600 ),
		'hog'     => array( 'file' => 'pig-roast.png', 'alt' => 'Whole hog on the smoker', 'width' => 800, 'height' => 600 ),
	);
}

/**
 * The single Location.
 *
 * @return array{slug: string, title: string, meta: array<string, mixed>}
 */
function gotg_seed_location() {
	return array(
		'slug'  => 'grill-on-the-green',
		'title' => 'Grill on the Green',
		'meta'  => array(
			'_gotg_street_address' => '5031 Alamo Street',
			'_gotg_address_line_2' => 'at Simi Hills Golf Course',
			'_gotg_city'           => 'Simi Valley',
			'_gotg_state'          => 'CA',
			'_gotg_postal_code'    => '93063',
			'_gotg_country'        => 'US',
			'_gotg_latitude'       => 34.263611,
			'_gotg_longitude'      => -118.735278,
			'_gotg_phone'          => '805-842-2947',
			'_gotg_email'          => 'hello@grillonthegreen.test',
			'_gotg_directions_url' => 'https://maps.google.com/?cid=0000000000000000000',
			'_gotg_parking_note'   => 'Free parking in the clubhouse lot. Enter from Alamo Street.',
			'_gotg_timezone'       => 'America/Los_Angeles',
		),
	);
}

/**
 * The five routed pages, by slug.
 *
 * @return array<int, array{slug: string, title: string, seo_title: string, seo_description: string}>
 */
function gotg_seed_pages() {
	return array(
		array( 'slug' => 'home', 'title' => 'Home', 'seo_title' => 'Grill on the Green | Smoked BBQ in Simi Valley', 'seo_description' => 'American classics and slow-smoked barbecue on Simi Hills Golf Course. Open daily 6am to 9pm.' ),
		array( 'slug' => 'menu', 'title' => 'Menu', 'seo_title' => 'Menu | Grill on the Green', 'seo_description' => 'Breakfast, lunch, and dinner. Smoked brisket, ribs, burgers, and American classics in Simi Valley.' ),
		array( 'slug' => 'events', 'title' => 'Events', 'seo_title' => 'Events & Live Music | Grill on the Green', 'seo_description' => 'Live music every Friday and Saturday from 6pm, plus special events at Grill on the Green.' ),
		array( 'slug' => 'about', 'title' => 'About', 'seo_title' => 'About | Grill on the Green', 'seo_description' => 'Mark runs the course, Marco runs the smoker. The story behind Grill on the Green.' ),
		array( 'slug' => 'contact', 'title' => 'Contact', 'seo_title' => 'Contact & Hours | Grill on the Green', 'seo_description' => 'Call 805-842-2947. Open daily 6am to 9pm at Simi Hills Golf Course, Simi Valley.' ),
	);
}

/**
 * Menu sections. Parents are listed before children; `parent` is a slug or ''.
 *
 * @return array<int, array{slug: string, name: string, parent: string, order: int, intro: string, image: string}>
 */
function gotg_seed_sections() {
	return array(
		array( 'slug' => 'appetizers', 'name' => 'Appetizers', 'parent' => '', 'order' => 10, 'intro' => '', 'image' => '' ),
		array( 'slug' => 'bowls-salads-wraps', 'name' => 'Bowls, Salads & Wraps', 'parent' => '', 'order' => 20, 'intro' => '', 'image' => '' ),
		array( 'slug' => 'plates', 'name' => 'Plates', 'parent' => '', 'order' => 30, 'intro' => 'Comes with choice of 2 sides and homemade cornbread.', 'image' => '' ),
		array( 'slug' => 'sandwiches-burgers', 'name' => 'Sandwiches & Burgers', 'parent' => '', 'order' => 40, 'intro' => 'All BBQ Sandwiches can be “Southern Style” with coleslaw for +1.50. Make it a combo (soda & sides) +5.95.', 'image' => '' ),
		array( 'slug' => 'sides', 'name' => 'Sides', 'parent' => '', 'order' => 50, 'intro' => '', 'image' => '' ),
	);
}

/**
 * Dietary tags (the fixed vocabulary from 03-CONTENT-MODEL.md §8).
 *
 * @return array<int, array{slug: string, name: string, abbreviation: string, color: string, description: string}>
 */
function gotg_seed_dietary() {
	return array(
		array( 'slug' => 'vegetarian', 'name' => 'Vegetarian', 'abbreviation' => 'V', 'color' => 'green', 'description' => 'Contains no meat, poultry, or fish.' ),
		array( 'slug' => 'gluten-free', 'name' => 'Gluten-Free', 'abbreviation' => 'GF', 'color' => 'neutral', 'description' => 'Prepared without gluten-containing ingredients.' ),
	);
}

/**
 * Menu items — the real Grill on the Green menu, all prices PROVISIONAL (see the
 * notice at the top of this file). Every row carries `provisional => true` and,
 * lacking draft dayparts, is available in all three. Half/Full Rack ribs, 1/4 //
 * 1/2 BBQ Chicken, and Bowl/Cup chili are modelled as multi-row price variants
 * on a single item, per 03-CONTENT-MODEL.md §3.4.
 *
 * @return array<int, array<string, mixed>>
 */
function gotg_seed_menu_items() {
	$all = array( 'breakfast', 'lunch', 'dinner' );

	return array(
		// --- Appetizers ---
		array( 'slug' => 'ahi-tuna-tostada', 'name' => 'Ahi Tuna Tostada', 'section' => 'appetizers', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'quesadilla-roll', 'name' => 'Quesadilla Roll', 'section' => 'appetizers', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => 'Choice of beef, pulled pork, or chicken.', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'shrimp-ceviche-tostada', 'name' => 'Shrimp Ceviche Tostada', 'section' => 'appetizers', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'tavern-wings', 'name' => 'Tavern Wings', 'section' => 'appetizers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => 'Choice of Buffalo or Spicy BBQ.', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'chicken-tenders', 'name' => 'Chicken Tenders', 'section' => 'appetizers', 'variants' => array( array( 'label' => '', 'amount' => 11.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-baby-back-ribs', 'name' => 'BBQ Baby Back Ribs', 'section' => 'appetizers', 'variants' => array( array( 'label' => '', 'amount' => 16.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'street-tacos', 'name' => 'Street Tacos', 'section' => 'appetizers', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => 'Choice of brisket, pork, chicken, or tri-tip.', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'louisiana-hot-links', 'name' => 'Louisiana Hot Links', 'section' => 'appetizers', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'mac-and-cheese', 'name' => 'Mac & Cheese', 'section' => 'appetizers', 'variants' => array( array( 'label' => '', 'amount' => 14.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'award-winning-chili', 'name' => 'Award Winning Chili', 'section' => 'appetizers', 'variants' => array( array( 'label' => 'Bowl', 'amount' => 13.95 ), array( 'label' => 'Cup', 'amount' => 7.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'nathans-hot-dog', 'name' => 'All Beef Nathan\'s Hot Dog', 'section' => 'appetizers', 'variants' => array( array( 'label' => '', 'amount' => 9.00 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),

		// --- Bowls, Salads & Wraps ---
		array( 'slug' => 'protein-bowl', 'name' => 'Protein Bowl', 'section' => 'bowls-salads-wraps', 'variants' => array( array( 'label' => '', 'amount' => 15.95 ) ), 'description' => 'Choice of protein: grilled chicken, tri-tip, BBQ brisket, BBQ pulled pork, or blackened salmon.', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-chopped-salad', 'name' => 'BBQ Chopped Salad', 'section' => 'bowls-salads-wraps', 'variants' => array( array( 'label' => '', 'amount' => 15.95 ) ), 'description' => 'Choice of protein: grilled chicken, tri-tip, BBQ brisket, BBQ pulled pork, or blackened salmon.', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'cajun-salmon-salad', 'name' => 'Cajun Salmon Salad', 'section' => 'bowls-salads-wraps', 'variants' => array( array( 'label' => '', 'amount' => 15.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'cajun-blackened-ahi-tuna-salad', 'name' => 'Cajun Blackened Ahi Tuna Salad', 'section' => 'bowls-salads-wraps', 'variants' => array( array( 'label' => '', 'amount' => 16.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-wrap', 'name' => 'BBQ Wrap', 'section' => 'bowls-salads-wraps', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => 'Choice of protein.', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'chicken-caesar-wrap', 'name' => 'Chicken Caesar Wrap', 'section' => 'bowls-salads-wraps', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-burrito', 'name' => 'BBQ Burrito', 'section' => 'bowls-salads-wraps', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => 'Choice of pulled pork, brisket, tri-tip, or pulled chicken.', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),

		// --- Plates (2 sides + cornbread; see section intro) ---
		array( 'slug' => 'ribs', 'name' => 'Ribs', 'section' => 'plates', 'variants' => array( array( 'label' => 'Half Rack', 'amount' => 22.95 ), array( 'label' => 'Full Rack', 'amount' => 33.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-chicken', 'name' => 'BBQ Chicken', 'section' => 'plates', 'variants' => array( array( 'label' => '1/4', 'amount' => 17.95 ), array( 'label' => '1/2', 'amount' => 22.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'tri-tip-steak', 'name' => '1/2 Pound of Tri-Tip Steak', 'section' => 'plates', 'variants' => array( array( 'label' => '', 'amount' => 23.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-pulled-pork-plate', 'name' => '1/2 Pound of BBQ Pulled Pork', 'section' => 'plates', 'variants' => array( array( 'label' => '', 'amount' => 22.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-brisket-plate', 'name' => '1/2 Pound of BBQ Brisket', 'section' => 'plates', 'variants' => array( array( 'label' => '', 'amount' => 23.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'combo-plate', 'name' => 'Combo', 'section' => 'plates', 'variants' => array( array( 'label' => '', 'amount' => 26.95 ) ), 'description' => '1/4 pound of meat & 3 ribs, or 1/4 chicken.', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),

		// --- Sandwiches & Burgers (newest draft, authoritative) ---
		array( 'slug' => 'brisket-sandwich', 'name' => 'Brisket Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'smoked-prime-ny-steak-sandwich', 'name' => 'Smoked Prime NY Steak Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 14.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'prime-rib-sandwich', 'name' => 'Prime Rib Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 14.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'short-rib-sandwich', 'name' => 'Short Rib Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'pulled-pork-sandwich', 'name' => 'Pulled Pork Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'tri-tip-sandwich', 'name' => 'Tri-Tip Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-pulled-chicken-sandwich', 'name' => 'BBQ Pulled Chicken Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'santa-fe-chicken-sandwich', 'name' => 'Santa Fe Chicken Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'buffalo-fried-chicken-sandwich', 'name' => 'Buffalo Fried Chicken Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-brisket-sandwich', 'name' => 'BBQ Brisket Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'pork-belly-sandwich', 'name' => 'Pork Belly Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'louisiana-hot-links-sandwich', 'name' => 'Louisiana Hot Links Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'blackened-salmon-sandwich', 'name' => 'Blackened Salmon Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 14.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'veggie-sandwich', 'name' => 'Veggie Sandwich', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 12.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array( 'vegetarian' ), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'turkey-burger', 'name' => 'Turkey Burger', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'grill-on-the-green-cheeseburger', 'name' => 'Grill on the Green Cheeseburger', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 14.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'classic-cheeseburger', 'name' => 'Classic Cheeseburger', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'blue-cheese-bacon-cheeseburger', 'name' => 'Blue Cheese Bacon Cheeseburger', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.50 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'mushroom-burger', 'name' => 'Mushroom Burger', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'featured' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-bacon-cheeseburger', 'name' => 'BBQ Bacon Cheeseburger', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.25 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'award-winning-chili-cheeseburger', 'name' => 'Award Winning Chili Cheeseburger', 'section' => 'sandwiches-burgers', 'variants' => array( array( 'label' => '', 'amount' => 13.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),

		// --- Sides ---
		array( 'slug' => 'side-salad', 'name' => 'Side Salad', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 5.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'french-fries', 'name' => 'French Fries', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 4.99 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'mac-and-cheese-side', 'name' => 'Mac & Cheese', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 4.99 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'bbq-beans', 'name' => 'BBQ Beans', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 4.99 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'mashed-potatoes', 'name' => 'Mashed Potatoes', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 4.99 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'coleslaw', 'name' => 'Coleslaw', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 4.25 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'sauteed-sweet-corn', 'name' => 'Sauteed Sweet Corn', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 4.75 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'sweet-potato-fries', 'name' => 'Sweet Potato Fries', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 4.99 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'caesar-salad', 'name' => 'Caesar Salad', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 5.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'onion-rings', 'name' => 'Onion Rings', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 5.99 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
		array( 'slug' => 'corn-bread', 'name' => 'Corn Bread', 'section' => 'sides', 'variants' => array( array( 'label' => '', 'amount' => 3.95 ) ), 'description' => '', 'availability' => $all, 'dietary' => array(), 'spice' => 'none', 'is_available' => true, 'provisional' => true, 'image' => '' ),
	);
}

/**
 * Events. Dates are relative to now (offset in days) so seeded events stay
 * "upcoming" whenever the script runs; the command resolves them to wall-clock
 * Pacific datetimes. Covers upcoming/past, with/without performer and ticket
 * link, with/without image, ticketed with cover, a recurring instance, and a
 * private event (both past and private are excluded from the payload).
 *
 * @return array<int, array<string, mixed>>
 */
function gotg_seed_events() {
	return array(
		array( 'slug' => 'the-canyon-band', 'title' => 'The Canyon Band', 'summary' => 'Country covers and originals on the patio.', 'description' => '<p>The Canyon Band return for a three-hour set of country covers and originals. Kitchen serves until 9pm.</p>', 'event_type' => 'live_music', 'start_offset_days' => 7, 'start_time' => '18:00', 'duration_hours' => 3, 'performer_name' => 'The Canyon Band', 'performer_url' => 'https://www.instagram.com/thecanyonband/', 'is_ticketed' => false, 'ticket_url' => '', 'cover_charge' => null, 'is_recurring_instance' => true, 'image' => 'band' ),
		array( 'slug' => 'summer-kickoff', 'title' => 'Summer Kickoff Cookout', 'summary' => 'Extended smoker menu and patio games.', 'description' => '<p>A relaxed afternoon with an extended smoker menu, patio games, and cold drinks.</p>', 'event_type' => 'special_menu', 'start_offset_days' => 14, 'start_time' => '17:00', 'duration_hours' => 4, 'performer_name' => '', 'performer_url' => '', 'is_ticketed' => true, 'ticket_url' => '', 'cover_charge' => 20, 'is_recurring_instance' => false, 'image' => '' ),
		array( 'slug' => 'labor-day-pig-roast', 'title' => 'Labor Day Pig Roast', 'summary' => 'Whole hog, all afternoon, until it runs out.', 'description' => '<p>Marco puts a whole hog on at midnight. Service starts at noon and runs until the hog is gone. Ticket includes a plate and two sides.</p>', 'event_type' => 'special_menu', 'start_offset_days' => 21, 'start_time' => '12:00', 'duration_hours' => 6, 'performer_name' => '', 'performer_url' => '', 'is_ticketed' => true, 'ticket_url' => 'https://www.eventbrite.com/e/000000000000', 'cover_charge' => 45, 'is_recurring_instance' => false, 'image' => 'hog' ),
		array( 'slug' => 'harvest-brunch', 'title' => 'Harvest Brunch', 'summary' => 'A one-morning seasonal brunch menu.', 'description' => '', 'event_type' => 'holiday', 'start_offset_days' => 35, 'start_time' => '10:00', 'duration_hours' => 3, 'performer_name' => '', 'performer_url' => '', 'is_ticketed' => false, 'ticket_url' => '', 'cover_charge' => null, 'is_recurring_instance' => false, 'image' => '' ),
		array( 'slug' => 'delta-blues-night', 'title' => 'Delta Blues Night', 'summary' => 'A past show — excluded from the site.', 'description' => '<p>An archived event that has already happened.</p>', 'event_type' => 'live_music', 'start_offset_days' => -14, 'start_time' => '18:00', 'duration_hours' => 3, 'performer_name' => 'Delta Blues Trio', 'performer_url' => '', 'is_ticketed' => false, 'ticket_url' => '', 'cover_charge' => null, 'is_recurring_instance' => false, 'image' => '' ),
		array( 'slug' => 'members-only-mixer', 'title' => 'Members-Only Mixer', 'summary' => 'A private booking — excluded from the site.', 'description' => '<p>Private event; not shown publicly.</p>', 'event_type' => 'private', 'start_offset_days' => 10, 'start_time' => '19:00', 'duration_hours' => 3, 'performer_name' => '', 'performer_url' => '', 'is_ticketed' => false, 'ticket_url' => '', 'cover_charge' => null, 'is_recurring_instance' => false, 'image' => '' ),
	);
}

/**
 * Site Settings, built on the registered defaults with demo overrides. The
 * command injects the primary location id and the seeded logo / OG-image
 * attachment ids before writing.
 *
 * @return array<string, mixed>
 */
function gotg_seed_settings() {
	$settings = gotg_site_settings_defaults();

	$settings['site_name']              = 'Grill on the Green';
	$settings['legal_name']             = 'Grill on the Green LLC';
	$settings['tagline']                = 'American classics & slow-smoked barbecue';
	$settings['short_description']      = 'American classics and slow-smoked barbecue on Simi Hills Golf Course. Breakfast, lunch, and dinner, seven days a week.';
	$settings['form_recipient_email']   = 'hello@grillonthegreen.test';
	$settings['social_links']           = array(
		array( 'platform' => 'instagram', 'url' => 'https://www.instagram.com/grillonthegreen_simi/', 'handle' => 'grillonthegreen_simi' ),
	);
	$settings['seo_default_description'] = 'American classics and slow-smoked barbecue on Simi Hills Golf Course in Simi Valley, California. Open daily 6am to 9pm.';
	$settings['menu_disclaimer']        = 'Prices and availability change without notice. Please tell your server about any allergies — we cannot guarantee an allergen-free kitchen.';
	$settings['recurring_body']         = 'Local acts on the patio from 6 to 9pm. No cover, no reservation needed — arrive early for a table by the fire pit.';

	return $settings;
}

/**
 * Reusable blocks, by slug. Each is one block, stored on a `gotg_block` post and
 * referenced from a page by a `reusable_block` entry. Image and block references
 * are given as the friendly keys of gotg_seed_images() / this array; the seed
 * command resolves them to attachment and post ids before writing.
 *
 * @return array<string, array<string, mixed>>
 */
function gotg_seed_reusable_blocks() {
	return array(
		'reserve-cta' => array(
			'type'      => 'cta_band',
			'heading'   => 'Reserve a table',
			'body'      => 'Walk-ins are always welcome. For a large party, give us a call and we will set it up.',
			'cta_label' => 'Call 805-842-2947',
			'cta_url'   => 'tel:8058422947',
			'style'     => 'ink',
		),
	);
}

/**
 * Page blocks, keyed by page slug, in editor order. Exercises every one of the
 * nine block types plus a reusable reference. Friendly reference keys:
 *   `image`      => a gotg_seed_images() key (resolved to image_id)
 *   `image_ids`  => a list of image keys      (resolved to image_ids)
 *   people `photo` => an image key            (resolved to photo_id)
 *   `block_ref`  => a gotg_seed_reusable_blocks() key (resolved to block_ref_id)
 * All other keys are the stored shapes from 03-CONTENT-MODEL.md §9.3.
 *
 * @return array<string, array<int, array<string, mixed>>>
 */
function gotg_seed_page_blocks() {
	return array(
		'home' => array(
			array(
				'type'                => 'hero',
				'heading'             => 'Slow-smoked, fairway-side',
				'subheading'          => 'Breakfast through dinner, seven days a week, at the eighteenth hole.',
				'eyebrow'             => 'American classics & slow-smoked barbecue',
				'image'               => 'smoker',
				'overlay'             => 45,
				'primary_cta_label'   => 'View the menu',
				'primary_cta_url'     => '/menu',
				'secondary_cta_label' => 'Call 805-842-2947',
				'secondary_cta_url'   => 'tel:8058422947',
			),
			array(
				'type'    => 'text',
				'heading' => 'American classics, Texas patience',
				'body'    => '<p>Marco runs the smoker from four in the morning; Mark runs the course. Between them there is brisket, ribs, and a breakfast that starts before the first tee time.</p>',
				'width'   => 'narrow',
				'align'   => 'center',
			),
			array(
				'type'      => 'featured_items',
				'heading'   => 'Off the smoker',
				'mode'      => 'auto',
				'cta_label' => 'See the full menu',
			),
			array(
				'type'            => 'events_preview',
				'heading'         => "What's on",
				'count'           => 3,
				'cta_label'       => 'All events',
				'hide_when_empty' => true,
			),
			array(
				'type'       => 'split_feature',
				'heading'    => 'Catering & private events',
				'body'       => "Whole hogs, brisket by the pound, and a smoker that travels.\nTell us the date and the headcount and we will build the rest.",
				'image'      => 'brisket',
				'image_side' => 'right',
				'cta_label'  => 'Get in touch',
				'cta_url'    => '/contact',
			),
			array(
				'type'      => 'cta_band',
				'heading'   => 'Come hungry',
				'body'      => 'Breakfast starts at 6am. The smoker starts a good deal earlier.',
				'cta_label' => 'View the menu',
				'cta_url'   => '/menu',
				'style'     => 'brand',
			),
			array(
				'type'    => 'instagram_feed',
				'heading' => 'From the grill',
				'handle'  => 'grillonthegreen_simi',
				'count'   => 6,
			),
			array(
				'type'      => 'reusable_block',
				'block_ref' => 'reserve-cta',
			),
		),
		'about' => array(
			array(
				'type'    => 'text',
				'heading' => 'How it started',
				'body'    => '<p>Grill on the Green sits at the eighteenth hole of Simi Hills Golf Course. It began as a snack window and grew into a full kitchen the day Marco wheeled his smoker over from a catering trailer and never took it back.</p>',
				'width'   => 'narrow',
				'align'   => 'left',
			),
			array(
				'type'       => 'split_feature',
				'heading'    => 'Oak, salt, pepper, patience',
				'body'       => "The smoker runs on oak and time.\nNothing on the barbecue menu is rushed, and it shows.",
				'image'      => 'smoker',
				'image_side' => 'left',
			),
			array(
				'type'      => 'gallery',
				'heading'   => 'Around the pit',
				'image_ids' => array( 'brisket', 'smoker', 'band', 'hog' ),
				'layout'    => 'grid',
			),
			array(
				'type'    => 'people',
				'heading' => "Who's here",
				'people'  => array(
					array(
						'name'  => 'Mark',
						'role'  => 'Co-owner',
						'bio'   => 'Plays the course most mornings before service. Runs the front of house and the golf side of the business.',
						'photo' => 'band',
					),
					array(
						'name'  => 'Marco',
						'role'  => 'Co-owner & pitmaster',
						'bio'   => 'Runs the smoker from four in the morning. Oak, salt, pepper, patience — in that order.',
						'photo' => 'hog',
					),
				),
			),
			array(
				'type'      => 'cta_band',
				'heading'   => 'Come hungry',
				'body'      => 'The kitchen is open daily from 6am to 9pm.',
				'cta_label' => 'View the menu',
				'cta_url'   => '/menu',
				'style'     => 'surface',
			),
		),
		'contact' => array(
			array(
				'type'    => 'text',
				'heading' => 'Planning something bigger?',
				'body'    => '<p>Call and someone in the kitchen will pick up. For catering and private events, tell us the date and the headcount below.</p>',
				'width'   => 'narrow',
				'align'   => 'left',
			),
			array(
				'type'      => 'reusable_block',
				'block_ref' => 'reserve-cta',
			),
		),
	);
}
