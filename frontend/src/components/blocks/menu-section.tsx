import type { CSSProperties, ReactNode } from 'react';

import { MenuCard } from '@/components/blocks/menu-card';
import { BrandAccent } from '@/components/brand/brand-decor';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { Text } from '@/components/primitives/text';
import type { Daypart, MenuSection as MenuSectionType } from '@/types/api';

/*
 * MenuSection — 06-COMPONENT-SPEC.md §MenuSection. Renders one section: heading,
 * optional intro and image, the item cards, then any child sections (max two
 * levels).
 *
 * Filtering: an item shows when activeDaypart is 'all' or the item is available
 * in that daypart. The full set is present in the initial HTML so the unfiltered
 * menu is indexable and works without JavaScript; DaypartFilter (Client) layers
 * on top later and passes a concrete daypart. This slice always renders 'all'.
 *
 * Card heading level is derived from depth (0 → h3, 1 → h4) so the outline never
 * skips a level under this section's own heading (h2 at depth 0, h3 at depth 1).
 */

export interface MenuSectionProps {
  section: MenuSectionType;
  activeDaypart: Daypart | 'all';
  depth?: 0 | 1;
}

export function MenuSection({
  section,
  activeDaypart,
  depth = 0,
}: MenuSectionProps): ReactNode {
  const headingId = `${section.slug}-heading`;
  const cardHeadingLevel = depth === 0 ? 3 : 4;

  const visibleItems =
    activeDaypart === 'all'
      ? section.items
      : section.items.filter((item) =>
          item.availability.includes(activeDaypart),
        );

  const sectionStyle: CSSProperties = {
    scrollMarginTop: 'calc(var(--header-height) + var(--space-4))',
  };

  const body =
    visibleItems.length === 0 && activeDaypart !== 'all' ? (
      <Text tone="muted">Not served at {activeDaypart}.</Text>
    ) : (
      <ul className="flex flex-col gap-4 lg:columns-2 lg:gap-8">
        {visibleItems.map((item, index) => (
          <li key={item.id} className="break-inside-avoid">
            <AnimatedReveal delay={Math.min(index * 0.1, 0.5)}>
              <MenuCard item={item} headingLevel={cardHeadingLevel} />
            </AnimatedReveal>
          </li>
        ))}
      </ul>
    );

  return (
    <section
      id={section.slug}
      aria-labelledby={headingId}
      style={sectionStyle}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        {/* The flag sits beside a top-level section title only — repeating it on
            every nested sub-section would turn an accent into wallpaper. */}
        <div className="flex items-center gap-3">
          {depth === 0 ? <BrandAccent size="sm" /> : null}
          <Heading level={depth === 0 ? 2 : 3} id={headingId}>
            {section.title}
          </Heading>
        </div>
        {section.intro !== undefined && section.intro !== '' ? (
          <Text size="body-lg" tone="muted">
            {section.intro}
          </Text>
        ) : null}
        {section.image ? (
          <Image
            image={section.image}
            fill
            aspectRatio="3/2"
            sizes="(min-width: 1024px) 640px, 100vw"
          />
        ) : null}
      </div>

      {body}

      {section.children.length > 0 ? (
        <div className="flex flex-col gap-8">
          {section.children.map((child) => (
            <MenuSection
              key={child.slug}
              section={child}
              activeDaypart={activeDaypart}
              depth={1}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
