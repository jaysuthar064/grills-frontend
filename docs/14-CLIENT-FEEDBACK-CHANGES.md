# Client Feedback & Comprehensive Change Specification

This document details the exact plan and requirements resulting from the client's design review. Changes are organized into modular, non-breaking execution steps to transform **Grill On the Green** into a food-and-video-forward experience inspired by `woodranch.com`.

---

## 1. Overall Brand & Media Strategy

### 1.1 Slogan & Text Cleanup
- **Remove "Smoke Your Birdie"**:
  - Remove tagline from WordPress site options, CMS settings, `gotg-local-api.php`, `gotg-core.php`, and frontend mocks/metadata.
  - **New Slogan / Tagline**: *"American Classics & Slow-Smoked Barbecue at Simi Hills Golf Course"*.

### 1.2 Information & Button Audit
- Audit all phone numbers (`805-842-2947`), address (`5031 Alamo Street, Simi Valley, CA 93063`), emails, hours, and button links across all pages and footers.

### 1.3 Media Strategy (Video & Imagery)
- **Hero Video Background**: Implement auto-playing, looping background video on the homepage showing smoker action and golf course views.
- **Food & Course Imagery**: Replace plain text blocks with rich food card grids, high-contrast imagery, and course photography.

---

## 2. Header Navigation & Sizing

### 2.1 Navigation Bar Updates
- **Typography & Scale**: Increase header link font size (from ~14px to 16px/18px bold), improving readability and prominence.
- **New Page Addition**: Add **Catering** (`/catering`) as a top-level nav link.
- **Updated Navigation Links**:
  1. `Menu` (`/menu`)
  2. `Catering` (`/catering`)
  3. `Events` (`/events`)
  4. `About` (`/about`)
  5. `Contact` (`/contact`)
  6. CTA: `Call 805-842-2947`

---

## 3. Homepage Redesign (Wood Ranch Style)

### 3.1 Hero Video Section
- Full-bleed background video with dark overlay.
- Large clear overlay text with primary CTAs (*"Explore Menu"*, *"Catering & Events"*).
- Mute/Unmute & Play/Pause controls.

### 3.2 Best Sellers & Food Showcases
- Featured Food Carousel / Grid featuring smoker best sellers (Brisket, Ribs, Mushroom Burger, Wings) with appetizing images and prices.
- Golf Course Experience Section connecting the dining experience with Simi Hills Golf Course scenery.

---

## 4. Catering Page (`/catering`)

### 4.1 Dedicated Catering Route
- Create `frontend/src/app/catering/page.tsx`.
- Include Catering Hero, Package Options (Buffet, Boxed Meals, Party Packs), Menus by headcount, and Inquiry Form.
- Update API endpoints to support catering details.

---

## 5. Menu Page Enhancements

### 5.1 Category Navigation Tabs
- Add sticky/scrollable category tab bar at the top of `/menu`:
  - `All` | `Breakfast` | `Appetizers` | `Entrees & BBQ` | `Sides` | `Cocktails & Drinks` | `Desserts`
- Smooth scroll or active tab state filtering.

### 5.2 Menu Card Styling
- Move from plain list view to authentic restaurant menu card design with defined borders, subtle drop shadows, typography hierarchy, price badges, and dietary indicators (GF, V, VG, Spicy).
- Add explicit sections for **Breakfast Menu** and **Cocktail / Beverage Menu**.

---

## 6. Events Page Month Calendar View

### 6.1 Interactive Month View
- Render a full 30-day / 31-day month grid at the top of `/events`.
- Highlight days with scheduled events (e.g., Summer Kickoff Cookout, Labor Day Pig Roast, Harvest Brunch).
- Clicking a calendar date filters or scrolls to the detailed event listing below.

### 6.2 Vertical Event List
- Maintain detailed vertical card list below the calendar with cover charge, ticket links, event descriptions, and og-images.

---

## 7. Footer Fixes

### 7.1 Logo Distortion Fix
- Fix squished footer logo by establishing strict aspect ratio, `object-fit: contain`, and proper wrapper dimensions.
- Update footer text, quick links (including Catering), and hours.

---

## 8. Execution Sequence (Step-by-Step)

| Step | Scope | Description |
|---|---|---|
| **Step 1** | **Header & Navigation** | Update header scale, font weight, and add standalone Catering link |
| **Step 2** | **Hero Video Section** | Build homepage video hero component with fallback poster & controls |
| **Step 3** | **Slogan & Meta Cleanup** | Remove "Smoke Your Birdie" across CMS, API, and frontend |
| **Step 4** | **Catering Page** | Create `/catering` page route, layout, and form |
| **Step 5** | **Menu Page Redesign** | Build category tabs, styled menu cards, breakfast & cocktail menus |
| **Step 6** | **Events Calendar View** | Build Month Calendar grid component on `/events` |
| **Step 7** | **Footer Logo & Links** | Repair footer logo aspect ratio & nav links |
| **Step 8** | **Full Verification** | TypeScript typecheck, build test, and visual inspection |
