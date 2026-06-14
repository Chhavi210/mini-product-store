import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { getCategories } from '@/api/products'
import type { Category } from '@/types'

interface CategoryFilterProps {
  selected: string
  onSelect: (category: string) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    getCategories(controller.signal)
      .then(setCategories)
      .catch(() => {/* silently fail */})
    return () => controller.abort()
  }, [])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      role="listbox"
      aria-label="Filter by category"
    >
      <button
        role="option"
        aria-selected={selected === ''}
        onClick={() => onSelect('')}
        className={clsx(
          'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          selected === ''
            ? 'bg-primary-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600',
        )}
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat.slug}
          role="option"
          aria-selected={selected === cat.slug}
          onClick={() => onSelect(cat.slug)}
          className={clsx(
            'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            selected === cat.slug
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600',
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
