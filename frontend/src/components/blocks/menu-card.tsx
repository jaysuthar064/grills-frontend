import type { ReactNode } from 'react';

import { Badge } from '@/components/primitives/badge';
import { Heading } from '@/components/primitives/heading';
import { Icon } from '@/components/primitives/icons/icon';
import { Image } from '@/components/primitives/image';
import { PriceList } from '@/components/primitives/price-list';
import { Text } from '@/components/primitives/text';
import { cn } from '@/lib/cn';
import type { DietaryColor, MenuItem, SpiceLevel } from '@/types/api';

/*
 * MenuCard — 06-COMPONENT-SPEC.md §MenuCard. One menu item in a section list.
 * Renders <article> with no interactive elements. Prices go through PriceList
 * (one or many variants). Every optional field degrades: no image collapses to
 * text-only, no description omits the node, no dietary tags omit the list.
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
  // Dynamic signature label tailored to the dish
  const signatureLabel = item.slug.includes('brisket')
    ? '🪵 14-Hour Oak Smoked'
    : item.slug.includes('chicken')
      ? '🔥 Crispy Buttermilk'
      : item.slug.includes('burger')
        ? "🍔 Golfer's Double Choice"
        : '★ Chef Signature';

  return (
    <article
      className={cn(
        'group flex flex-col justify-between gap-4 rounded-2xl border transition-all duration-300',
        variant === 'featured'
          ? 'border-border/80 bg-surface-raised p-5 shadow-md hover:shadow-2xl hover:border-brand-primary/60 hover:-translate-y-1'
          : 'border-border bg-surface p-4 hover:border-brand-primary/40 hover:shadow-md'
      )}
    >
      {/* Featured Variant: Full top banner image with smooth hover zoom */}
      {variant === 'featured' && Boolean(item.image?.src) && item.image ? (
        <div className="relative aspect-16-10 w-full overflow-hidden rounded-xl bg-surface-sunken shadow-sm">
          <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105">
            <Image
              image={item.image}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent backdrop-blur-md border border-accent/40 shadow-md">
              {signatureLabel}
            </span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink group-hover:text-brand-primary transition-colors">
                <Heading level={headingLevel} visualLevel="h4">
                  {item.name}
                </Heading>
              </span>
              {item.spiceLevel !== 'none' ? (
                <span className="text-accent inline-flex items-center">
                  <Icon
                    name="flame"
                    size={16}
                    title={SPICE_LABEL[item.spiceLevel]}
                  />
                </span>
              ) : null}
            </div>

            {/* Price badge with high visual polish */}
            <div className="rounded-full bg-brand-primary/10 px-3 py-0.5 font-display font-bold text-brand-primary text-body shrink-0 border border-brand-primary/20">
              <PriceList variants={item.priceVariants} />
            </div>
          </div>

          {item.description !== undefined && item.description !== '' ? (
            <div className="mt-2 leading-relaxed">
              <Text size="body-sm" tone="muted">
                {item.description}
              </Text>
            </div>
          ) : null}

          {item.dietaryTags.length > 0 ? (
            <ul aria-label="Dietary information" className="flex flex-wrap gap-2 pt-3">
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

        {variant === 'featured' ? (
          <div className="flex items-center justify-between pt-3 border-t border-border/50 text-caption font-medium text-ink-muted">
            <span className="inline-flex items-center gap-1.5 text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Smoked Fresh Daily
            </span>
            <span className="text-brand-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
              Order at Counter &rarr;
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
