# Wood Ranch Reference Site Analysis (woodranch.com)

This document provides a comprehensive structural, aesthetic, and functional analysis of [Wood Ranch BBQ & Grill](https://www.woodranch.com/), the benchmark reference site requested by the client for the **Grill On the Green** redesign.

---

## 1. Executive Summary & Core Design Philosophy

Wood Ranch (`woodranch.com`) establishes a premium-casual American BBQ aesthetic built on three core pillars: **Wood. Smoke. Fire.** The design prioritizes **food-forward visual storytelling** with large, high-resolution videography and photography, warm organic color tones, bold typography, and intuitive navigation.

| Aspect | Reference Implementation (`woodranch.com`) | GOTG Target Adaptation |
|---|---|---|
| **Primary Focus** | Immersive hero video + rich food imagery | Video hero featuring smoker action & golf course views |
| **Typography** | Heavy sans-serif headings, uppercase navigation, high contrast | Bold, readable navigation (16-18px), clear hierarchy |
| **Color Palette** | Deep charcoal/black (`#111111`), warm mahogany, crisp white | Warm charcoal (`#1C1917`), ember orange, golf green accents |
| **Header Nav** | Prominent top bar, sticky desktop menu, clear CTAs | Larger font scale, sticky bar, standalone "Catering" link |
| **Menu Presentation** | Categorized sections, clean pricing, dietary tags, visual accents | Tabbed category navigation, breakfast & cocktail menus |
| **Catering** | Dedicated top-level page with party size options & direct contact | Dedicated Catering route with request form & menus |

---

## 2. Hero Section & Video Implementation

### 2.1 Video Architecture
- **Continuous Looping Background**: Silent, auto-playing video element set behind a dark gradient overlay (`rgba(0, 0, 0, 0.45)`) to maintain text legibility.
- **Aspect Ratio & Container**: Full-width viewport hero (`min-height: 80vh` or `100vh` on desktop), dynamically responsive.
- **Controls & Accessibility**: Optional play/pause toggle for user control, respecting reduced motion preferences (`prefers-reduced-motion`).
- **Mobile Fallback**: Optimized MP4 / WebM with poster frame fallback for low-bandwidth mobile connections.

### 2.2 Content Overlaid on Video
- **Brand Headline**: Bold, high-contrast headline (e.g., *"Smoke, Fire, & Simi Valley Golf"*).
- **Subheading**: Short tagline highlighting key offerings (e.g., *"Slow-smoked barbecue and American classics at Simi Hills Golf Course"*).
- **Primary CTAs**: High-contrast pill/rounded buttons — *"View Menu"* and *"Reserve / Call Us"*.

---

## 3. Header Navigation & Branding

### 3.1 Layout & Sizing
- **Height & Spacing**: Generous vertical padding (`80px - 96px` height), giving the logo and links breathing room.
- **Typography**: Bold font weight (600-700), uppercase or clean title case, size `16px - 18px` with `0.05em` letter-spacing.
- **Sticky / Glassmorphic Header**: Semi-transparent dark backdrop on scroll (`backdrop-filter: blur(12px)`), ensuring content remains readable over media sections.

### 3.2 Navigation Items Structure
1. **Menu** (`/menu`)
2. **Catering** (`/catering`) — *Standalone Page*
3. **Events** (`/events`)
4. **About** (`/about`)
5. **Contact** (`/contact`)
6. **Header CTA Button**: Phone call / Table Reservation link.

---

## 4. Menu Presentation & Layout System

### 4.1 Category Filter Navigation (Top Bar)
- **Category Tabs**: Horizontal scrollable/sticky sub-navigation for quick jumping between sections:
  - *Appetizers*
  - *Entrees / BBQ Platters*
  - *Breakfast*
  - *Sides & Extras*
  - *Cocktails & Beverages*
  - *Desserts*
- **Active State**: Highlighted background pill or underline indicator in ember orange/gold.

### 4.2 Menu Item Card Design
- **Grid Layout**: 2-column layout on desktop, 1-column on mobile.
- **Item Hierarchy**:
  - Item Title (Bold, 18px)
  - Price & Variants (e.g., Single / Plate / Combo)
  - Description (Muted text, line-height 1.5)
  - Dietary Tags (GF, V, VG, Spicy indicator)
  - Featured Food Badges (e.g., *"House Favorite"*, *"Smoker Special"*)

---

## 5. Catering Page Architecture

### 5.1 Content Layout
- **Hero Banner**: High-impact imagery of catering platters, brisket carving, and buffet setups.
- **Package Tiers**: Clear options for small gatherings (10-30 guests) to large events (100+ guests).
- **Inquiry Form / Contact**: Direct action section with party size dropdown, preferred date, and event type.

---

## 6. Events Page & Month Calendar View

### 6.1 Interactive Month View
- **Calendar Grid**: Full 7-day monthly grid displaying event dots/badges on dates with scheduled events.
- **Event List Section**: Vertical chronological card list positioned below or alongside the month view for detailed event information (tickets, cover charge, description).

---

## 7. Footer & Brand Assets

### 7.1 Logo & Alignment Fixes
- **Aspect Ratio Locking**: SVG / Next.js Image component with explicit `width`, `height`, and `object-fit: contain` to prevent vertical/horizontal squishing.
- **Footer Columns**:
  - Logo & Tagline (Corrected text: *"American classics & slow-smoked barbecue"*)
  - Quick Links (Menu, Catering, Events, About, Contact)
  - Hours & Location (Simi Hills Golf Course details)
  - Social & Contact CTA

---

## 8. Summary of Principles for GOTG

1. **Food & Golf Media First**: Replace static placeholder shapes with rich photography and looping video clips.
2. **Never Break Contracts**: Maintain strict REST API response shapes (`gotg/v1`) while enhancing visual presentation.
3. **Clean Accessibility & Performance**: Optimize video size, load times, and WCAG AA contrast standards.
