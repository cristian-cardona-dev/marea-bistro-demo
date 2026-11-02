// src/components/MenuFilter.tsx
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
}

export default function MenuFilter({ categories }: Props) {
  const [active, setActive] = useState<string>('all');

  useEffect(() => {
    // Toggle visibility of menu sections based on active filter
    const sections = document.querySelectorAll('[data-category]');
    sections.forEach((section) => {
      const cat = section.getAttribute('data-category');
      if (active === 'all' || cat === active) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });
  }, [active]);

  return (
    <div className="flex flex-wrap gap-2 justify-center no-scrollbar overflow-x-auto pb-2">
      <button
        onClick={() => setActive('all')}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
          active === 'all'
            ? 'bg-accent text-ink shadow-lg'
            : 'bg-ground/60 text-muted hover:bg-ground/80 hover:text-ink border border-muted/30'
        }`}
        aria-pressed={active === 'all'}
      >
        Todo
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActive(cat.id)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            active === cat.id
              ? 'bg-accent text-ink shadow-lg'
              : 'bg-ground/60 text-muted hover:bg-ground/80 hover:text-ink border border-muted/30'
          }`}
          aria-pressed={active === cat.id}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
