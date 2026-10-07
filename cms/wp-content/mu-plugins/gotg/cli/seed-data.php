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
		array( 'slug' => 'salads-wraps', 'name' => 'Salads & Wraps', 'parent' => '', 'order' => 20, 'intro' => '', 'image' => '' ),
		array( 'slug' => 'sandwiches-burgers', 'name' => 'Sandwiches & Burgers', 'parent' => '', 'order' => 30, 'intro' => 'All BBQ Sandwiches you have an option to have it Southern Style With Coleslaw on the Sandwich For $1.50', 'image' => '' ),
		array( 'slug' => 'sides', 'name' => 'Sides', 'parent' => '', 'order' => 40, 'intro' => '', 'image' => '' ),
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
		// --- Appetizers (5 items) ---
		array(
			'slug'         => 'wings',
			'name'         => 'Wings',
			'section'      => 'appetizers',
			'variants'     => array( array( 'label' => '', 'amount' => 11.95 ) ),
			'description'  => 'Choice of Buffalo or BBQ Jumbo wing.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'mild',
			'is_available' => true,
			'featured'     => true,
			'image'        => '',
		),
		array(
			'slug'         => 'quesadilla-roll',
			'name'         => 'Quesadilla Roll',
			'section'      => 'appetizers',
			'variants'     => array( array( 'label' => '', 'amount' => 12.95 ) ),
			'description'  => 'Choice of Beef, Pulled Pork or Chicken Roll with mix cheese and topped with our homemade Chipotle aioli, pico de gallo, guacamole and sriracha sauce.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'chicken-tenders',
			'name'         => 'Chicken Tenders',
			'section'      => 'appetizers',
			'variants'     => array( array( 'label' => '', 'amount' => 11.95 ) ),
			'description'  => 'Crispy chicken tender served with Ranch dressing.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'all-beef-nathans-hot-dog',
			'name'         => 'All Beef Nathan\'s Hot Dog',
			'section'      => 'appetizers',
			'variants'     => array( array( 'label' => '', 'amount' => 9.00 ) ),
			'description'  => 'On the side: chopped onions, tomatoes, relish, soft potato bun.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => true,
			'image'        => '',
		),
		array(
			'slug'         => 'street-tacos',
			'name'         => 'Street Tacos',
			'section'      => 'appetizers',
			'variants'     => array( array( 'label' => '', 'amount' => 13.95 ) ),
			'description'  => 'Three Tacos with choice of Brisket, Pulled Pork or Pulled Chicken. Topped with onions, cilantro topped with homemade roasted salsa.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),

		// --- Salads & Wraps (7 items) ---
		array(
			'slug'         => 'bbq-chopped-salad',
			'name'         => 'BBQ Chopped Salad',
			'section'      => 'salads-wraps',
			'variants'     => array( array( 'label' => '', 'amount' => 15.95 ) ),
			'description'  => 'Choice of protein: Pulled Chicken, brisket, Pulled Pork or Tri-Tip. Mix greens, sweet corn, tomatoes, cucumbers, carrots, mix cheese and tortillas strips. Tossed in our house BBQ Ranch dressing.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => true,
			'image'        => '',
		),
		array(
			'slug'         => 'classic-chicken-caesar-salad',
			'name'         => 'Classic Chicken Caesar Salad',
			'section'      => 'salads-wraps',
			'variants'     => array( array( 'label' => '', 'amount' => 13.95 ) ),
			'description'  => 'Heart of romaine lettuce our homemade parmesan/garlic croutons tossed with Caesar dressing and topped with parmesan cheese.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'blackened-salmon-salad',
			'name'         => 'Blackened Salmon Salad',
			'section'      => 'salads-wraps',
			'variants'     => array( array( 'label' => '', 'amount' => 16.95 ) ),
			'description'  => 'Juicy Grilled Blackened Fillet of Salmon served over mixed greens. Topped with roasted red peppers, roasted corn, tomatoes and cucumber. Tossed in our house made creamy cilantro dressing.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'bbq-wraps',
			'name'         => 'BBQ Wraps',
			'section'      => 'salads-wraps',
			'variants'     => array( array( 'label' => '', 'amount' => 12.95 ) ),
			'description'  => 'Choice of Brisket, pulled Chicken or BBQ Pork or Tri-Tip. Mix greens, sweet corn, pico de gallo, cucumbers, Mix cheese Tossed with BBQ ranch then wrapped in a sundried tomatoes flour tortilla.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'chicken-caesar-wrap',
			'name'         => 'Chicken Caesar Wrap',
			'section'      => 'salads-wraps',
			'variants'     => array( array( 'label' => '', 'amount' => 12.95 ) ),
			'description'  => 'Grilled Chicken Breast, Romaine lettuce, parmesan cheese, wrapped in a tomato basil flour tortilla.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'turkey-wrap',
			'name'         => 'Turkey Wrap',
			'section'      => 'salads-wraps',
			'variants'     => array( array( 'label' => '', 'amount' => 12.95 ) ),
			'description'  => 'Sliced Turkey breast with lettuce, tomato, mayo and mustard wrapped in a tomato basil tortilla.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'albacore-tuna-wrap',
			'name'         => 'Albacore Tuna Wrap',
			'section'      => 'salads-wraps',
			'variants'     => array( array( 'label' => '', 'amount' => 12.95 ) ),
			'description'  => 'Albacore Tuna mixed with chives, celery, carrots and a mustard seed aioli.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),

		// --- Sandwiches & Burgers (15 items) ---
		array(
			'slug'         => 'santa-fe-chicken-sandwich',
			'name'         => 'Santa Fe Chicken Sandwich',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 12.95 ) ),
			'description'  => 'Grilled chicken breast topped with Monterey cheese caramelized onions and pepper, sliced tomato and mix greens. Served on a brioche bun with chipotle aioli.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'steak-sandwich',
			'name'         => 'Steak Sandwich',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 13.95 ) ),
			'description'  => 'Sliced Rib eye steak, sauteed mushrooms, grilled onions, grilled tomatoes, served on a Brioche Bun. Dressed with steak aioli.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'turkey-club',
			'name'         => 'Turkey Club',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 12.95 ) ),
			'description'  => 'Smoked Turkey, mayo, mustard, tomatoes, pickles and bacon. Choice of white, wheat or sourdough.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'fried-chicken-sandwich',
			'name'         => 'Fried Chicken Sandwich',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 12.95 ) ),
			'description'  => 'Tomatoes, mix greens, pickles, with mustard aioli on a Brioche bun. (Make it buffalo style).',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'smoked-prime-rib-sandwich',
			'name'         => 'Smoked Prime Rib Sandwich',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 14.95 ) ),
			'description'  => 'Slow-cooked Prime Rib topped with Monterey jack cheese, caramelized peppers and onions with creamy aioli sauce. Served on a Brioche bun.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => true,
			'image'        => '',
		),
		array(
			'slug'         => 'mushroom-burger',
			'name'         => 'Mushroom Burger',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 13.50 ) ),
			'description'  => 'Angus patty grilled to your liking. Served on a Brioche bun topped with sauteed mushroom, jack cheese, caramelized onion and garlic aioli.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'blue-cheese-bacon-burger',
			'name'         => 'Blue Cheese Bacon Burger',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 13.95 ) ),
			'description'  => '1/3 of a LB Angus patty grilled to your liking. Served on a Brioche bun topped with melted blue cheese, caramelized onions, sliced tomatoes, lettuce and garlic aioli.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'blackened-salmon-sandwich',
			'name'         => 'Blackened Salmon Sandwich',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 15.95 ) ),
			'description'  => 'Topped with melted Monterey jack cheese, sliced tomatoes, mix greens, sauteed peppers and onions, served on a Brioche bun with a chipotle aioli.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'short-rib-sandwich',
			'name'         => 'Short Rib Sandwich',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 13.95 ) ),
			'description'  => 'Braised short ribs topped with melt blue cheese and Caramelized onion. Served on a Brioche bun dressed with garlic aioli.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'smoked-brisket-sandwich',
			'name'         => 'Smoked Brisket Sandwich',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 14.95 ) ),
			'description'  => 'Slow smoke Brisket topped with BBQ sauce on a Brioche bun.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => true,
			'image'        => 'brisket',
		),
		array(
			'slug'         => 'pulled-pork-sandwich',
			'name'         => 'Pulled Pork Sandwich',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 13.95 ) ),
			'description'  => 'Slow cook bone-in Pork Butt on a Brioche bun Topped with BBQ sauce.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'tri-tip-sandwich',
			'name'         => 'Tri-Tip Sandwich',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 14.95 ) ),
			'description'  => 'BBQ Tri-Tip on a Brioche bun topped with BBQ sauce.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'pulled-chicken-sandwich',
			'name'         => 'Pulled Chicken Sandwich',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 13.95 ) ),
			'description'  => 'Slow Smoked BBQ Chicken then pulled of the bone. Served on a Brioche bun topped with BBQ sauce.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'smoked-pork-belly-blt-a',
			'name'         => 'Smoked Pork Belly BLT-A',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 13.95 ) ),
			'description'  => 'Pork belly mix greens, sliced tomatoes, with an avocado aioli. Served on a Brioche bun.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'bbq-bacon-cheese-burger',
			'name'         => 'BBQ Bacon Cheese Burger',
			'section'      => 'sandwiches-burgers',
			'variants'     => array( array( 'label' => '', 'amount' => 13.95 ) ),
			'description'  => '1/3 of a LB Angus patty grilled to your liking. Served on a Brioche bun topped with crispy bacon, melted cheddar cheese and caramelized onions with our famous BBQ Sauce.',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => true,
			'image'        => '',
		),

		// --- Sides (10 items) ---
		array(
			'slug'         => 'chili-bowl',
			'name'         => 'Chili Bowl',
			'section'      => 'sides',
			'variants'     => array( array( 'label' => '', 'amount' => 12.95 ) ),
			'description'  => '',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'chili-cup',
			'name'         => 'Chili Cup',
			'section'      => 'sides',
			'variants'     => array( array( 'label' => '', 'amount' => 6.95 ) ),
			'description'  => '',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'bbq-beans',
			'name'         => 'BBQ Beans',
			'section'      => 'sides',
			'variants'     => array( array( 'label' => '', 'amount' => 2.50 ) ),
			'description'  => '',
			'availability' => $all,
			'dietary'      => array(),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'side-or-caesar-salad',
			'name'         => 'Side or Caesar Salad',
			'section'      => 'sides',
			'variants'     => array( array( 'label' => '', 'amount' => 5.95 ) ),
			'description'  => '',
			'availability' => $all,
			'dietary'      => array( 'vegetarian' ),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'french-fries',
			'name'         => 'French Fries',
			'section'      => 'sides',
			'variants'     => array( array( 'label' => '', 'amount' => 2.95 ) ),
			'description'  => '',
			'availability' => $all,
			'dietary'      => array( 'vegetarian' ),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'sweet-fries',
			'name'         => 'Sweet Fries',
			'section'      => 'sides',
			'variants'     => array( array( 'label' => '', 'amount' => 3.50 ) ),
			'description'  => '',
			'availability' => $all,
			'dietary'      => array( 'vegetarian' ),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'mac-and-cheese',
			'name'         => 'Mac & Cheese',
			'section'      => 'sides',
			'variants'     => array( array( 'label' => '', 'amount' => 2.95 ) ),
			'description'  => '',
			'availability' => $all,
			'dietary'      => array( 'vegetarian' ),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'coleslaw',
			'name'         => 'Coleslaw',
			'section'      => 'sides',
			'variants'     => array( array( 'label' => '', 'amount' => 2.75 ) ),
			'description'  => '',
			'availability' => $all,
			'dietary'      => array( 'vegetarian' ),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'corn-bread',
			'name'         => 'Corn Bread',
			'section'      => 'sides',
			'variants'     => array( array( 'label' => '', 'amount' => 2.50 ) ),
			'description'  => '',
			'availability' => $all,
			'dietary'      => array( 'vegetarian' ),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
		array(
			'slug'         => 'onion-rings',
			'name'         => 'Onion Rings',
			'section'      => 'sides',
			'variants'     => array( array( 'label' => '', 'amount' => 4.25 ) ),
			'description'  => '',
			'availability' => $all,
			'dietary'      => array( 'vegetarian' ),
			'spice'        => 'none',
			'is_available' => true,
			'featured'     => false,
			'image'        => '',
		),
	);
}

/**
 * Events (03-CONTENT-MODEL.md §6).
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
	$settings['short_description']      = 'Slow-smoked barbecue and fairway dining on Simi Hills Golf Course. Breakfast, lunch, and dinner, seven days a week.';
	$settings['form_recipient_email']   = 'hello@grillonthegreen.test';
	$settings['social_links']           = array(
		array( 'platform' => 'instagram', 'url' => 'https://www.instagram.com/grillonthegreen_simi/', 'handle' => 'grillonthegreen_simi' ),
	);
	$settings['seo_default_description'] = 'American classics and slow-smoked barbecue on Simi Hills Golf Course in Simi Valley, California. Open daily 6am to 9pm.';
	$settings['menu_disclaimer']        = '*The item is prepared using fresh raw meat, or may contain raw or undercooked ingredients. Consuming raw or undercooked meats, poultry, seafood, shellfish or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions. All menu items above cooked to order.';
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
				'type'        => 'instagram_feed',
				'heading'     => 'Fresh from the Pit',
				'subtitle'    => 'Follow along for barbecue features, fairway views, and weekend specials.',
				'handle'      => 'grillonthegreen_simi',
				'profile_url' => 'https://www.instagram.com/grillonthegreen_simi/',
				'count'       => 6,
				'posts'       => array(
					array(
						'permalink' => 'https://www.instagram.com/grillonthegreen_simi/p/DWE51CQgcSd/',
						'image_url' => '/media/instagram/post-1.jpg',
						'caption'   => 'Texas Smoked Brisket Sandwich with BBQ baked beans on the fairway',
						'is_reel'   => false,
					),
					array(
						'permalink' => 'https://www.instagram.com/grillonthegreen_simi/p/DWZLt-oDS59/',
						'image_url' => '/media/instagram/post-2.jpg',
						'caption'   => 'Juicy craft burger on the fairway patio with mountain views',
						'is_reel'   => false,
					),
					array(
						'permalink' => 'https://www.instagram.com/grillonthegreen_simi/p/DQu4NH4AXhf/',
						'image_url' => '/media/instagram/post-3.jpg',
						'caption'   => "Nathan's All Beef Hot Dog on the 18th hole fairway",
						'is_reel'   => false,
					),
					array(
						'permalink' => 'https://www.instagram.com/grillonthegreen_simi/p/DQsh5ZDDSgK/',
						'image_url' => '/media/instagram/post-4.jpg',
						'caption'   => 'Clubhouse Sandwich with roasted turkey, ham and crispy bacon',
						'is_reel'   => false,
					),
					array(
						'permalink' => 'https://www.instagram.com/grillonthegreen_simi/p/DRLi40uDQhe/',
						'image_url' => '/media/instagram/post-5.jpg',
						'caption'   => 'Crispy Southern Fried Chicken Sandwich with golden fries',
						'is_reel'   => false,
					),
					array(
						'permalink' => 'https://www.instagram.com/grillonthegreen_simi/reel/Ddy3uurB44x/',
						'image_url' => '/media/instagram/post-6.jpg',
						'caption'   => 'Watch the Reel — Live from the smoker on the 18th hole patio',
						'is_reel'   => true,
					),
				),
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
				'type'    => 'people',
				'heading' => "Who's here",
				'people'  => array(
					array(
						'name'  => 'Mark',
						'role'  => 'Co-owner',
						'bio'   => 'Plays the course most mornings before service. Runs the front of house and the golf side of the business.',
						'photo' => '',
					),
					array(
						'name'  => 'Marco',
						'role'  => 'Co-owner & pitmaster',
						'bio'   => 'Runs the smoker from four in the morning. Oak, salt, pepper, patience in that order.',
						'photo' => '',
					),
				),
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
		),
	);
}
