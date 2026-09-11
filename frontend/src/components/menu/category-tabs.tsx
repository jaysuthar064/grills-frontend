'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CategoryTabsProps {
  categories: Array<{ slug: string; title: string }>;
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryTabsProps): ReactNode {
  return (
    <div className="sticky top-[80px] z-30 bg-surface/95 backdrop-blur-md py-4 border-b border-border shadow-xs my-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full px-2">
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={cn(
            'px-5 py-2.5 rounded-full text-body-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer',
            activeCategory === 'all'
              ? 'bg-brand-primary text-white shadow-sm scale-105'
              : 'bg-surface-raised text-ink-muted border border-border hover:border-brand-primary hover:text-brand-primary'
          )}
        >
          Full Menu
        </button>

        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={cn(
                'px-5 py-2.5 rounded-full text-body-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer',
                isActive
                  ? 'bg-brand-primary text-white shadow-sm scale-105'
                  : 'bg-surface-raised text-ink-muted border border-border hover:border-brand-primary hover:text-brand-primary'
              )}
            >
              {cat.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
