import React, { useEffect, useState, useMemo } from 'react';
import { ListOrdered } from 'lucide-react';
import type { ChapterSection } from '../../../types/content';

interface TableOfContentsProps {
  sections: ChapterSection[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ sections }) => {
  const [activeId, setActiveId] = useState<string>('');

  const headings = useMemo(
    () =>
      sections
        .filter((s) => s.heading && s.heading.trim().length > 0)
        .map((s) => ({ id: s.id, title: s.heading! })),
    [sections]
  );

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Pick the topmost visible section
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 80; // height of fixed header + margin
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
    }
  };

  return (
    <nav
      aria-label="Table of Contents"
      style={{
        padding: '16px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        position: 'sticky',
        top: '84px',
        maxHeight: 'calc(100vh - 110px)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <ListOrdered size={16} color="var(--primary)" />
        <span>สารบัญในบทนี้</span>
      </div>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {headings.map(({ id, title }) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => scrollToSection(id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  lineHeight: 1.45,
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.12)' : 'none',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                }}
              >
                {title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

