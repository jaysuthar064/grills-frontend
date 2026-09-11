import type { ReactNode } from 'react';

import { Badge } from '@/components/primitives/badge';
import { Heading } from '@/components/primitives/heading';
import { Icon } from '@/components/primitives/icons/icon';
import { PriceList } from '@/components/primitives/price-list';
import { Text } from '@/components/primitives/text';
import { cn } from '@/lib/cn';
import type { DietaryColor, MenuItem, SpiceLevel } from '@/types/api';

/*
 * MenuCard — 06-COMPONENT-SPEC.md §MenuCard. One menu item in a section list.
 * Renders <article> with no interactive elements. Prices go through PriceList
 * (one or many variants). Every optional field degrades: no image collapses to
 * text-only, no description omits the node, no dietary tags omit the list.
 *
 * The image is full-width at 3/2 on mobile and a 96px square (1/1) leading
 * thumbnail at md, per spec — expressed with the aspect-ratio token utilities
 * (aspect-3-2 md:aspect-square, 05-DESIGN-SYSTEM.md §4.4). The wrapper owns the
 * ratio and the sunken degrade box; Image fills it.
 */

export interface MenuCardProps {
  item: MenuItem;
  variant?: 'default' | 'featured';
  headingLevel?: 3 | 4;
}

const SPICE_LABEL = {
  mild: 'Mild',
  medium: 'Medium',
  hot: 'Hot',
} as const satisfies Record<Exclude<SpiceLevel, 'none'>, string>;

const DIETARY_TONE = {
  neutral: 'neutral',
  green: 'green',
  amber: 'amber',
  red: 'red',
} as const satisfies Record<
  DietaryColor,
  'neutral' | 'green' | 'amber' | 'red'
>;

export function MenuCard({
  item,
  variant = 'default',
  headingLevel = 4,
}: MenuCardProps): ReactNode {
  return (
    <article
      className={cn(
        'group flex flex-col justify-between gap-2 rounded-xl border p-4 transition-all duration-300',
        variant === 'featured'
          ? 'border-brand-primary bg-brand-primary-subtle/20 shadow-md hover:shadow-lg'
          : 'border-border bg-surface hover:border-brand-primary/30 hover:shadow-sm'
      )}
    >
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="font-bold text-ink group-hover:text-brand-primary transition-colors">
                <Heading level={headingLevel} visualLevel="h4">
                  {item.name}
                </Heading>
              </span>
              {item.spiceLevel !== 'none' ? (
                <span className="text-accent">
                  <Icon
                    name="flame"
                    size={16}
                    title={SPICE_LABEL[item.spiceLevel]}
                  />
                </span>
              ) : null}
            </span>

            {/* Menu pricing dotted leader style */}
            <div className="flex-1 border-b border-dotted border-border/80 mx-2 hidden sm:block" />

            <div className="font-bold text-brand-primary text-body">
              <PriceList variants={item.priceVariants} />
            </div>
          </div>

          {item.description !== undefined && item.description !== '' ? (
            <div className="mt-1.5 leading-relaxed">
              <Text size="body-sm" tone="muted">
                {item.description}
              </Text>
            </div>
          ) : null}
        </div>

        {item.dietaryTags.length > 0 ? (
          <ul aria-label="Dietary information" className="flex flex-wrap gap-2 pt-1">
            {item.dietaryTags.map((tag) => (
              <li key={tag.slug}>
                <Badge tone={DIETARY_TONE[tag.color]} title={tag.description}>
                  {tag.abbreviation}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
