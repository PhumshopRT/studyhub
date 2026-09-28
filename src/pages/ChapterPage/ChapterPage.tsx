import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Bookmark,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
  Maximize2,
  Minimize2,
  ListOrdered,
  X,
} from 'lucide-react';
import { getSubjectById, getChapterById, getNextAndPrevChapter } from '../../content/registry';
import { useProgress } from '../../hooks/useProgress';
import { useBookmarks } from '../../hooks/useBookmarks';
import { Breadcrumb } from '../../components/navigation/Breadcrumb/Breadcrumb';
import { TableOfContents } from '../../components/navigation/TableOfContents/TableOfContents';
import { ReadingProgressBar } from '../../components/reader/ReadingProgressBar';
import { ChapterRenderer } from '../../components/reader/ChapterRenderer';

export const ChapterPage: React.FC = () => {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>();
  const [scrollPercent, setScrollPercent] = useState<number>(0);
  const [isFullWidth, setIsFullWidth] = useState<boolean>(() => {
    const stored = localStorage.getItem('study_reader_fullwidth');
    return stored === null ? true : stored === 'true';
  });
  const [isMobileTocOpen, setIsMobileTocOpen] = useState<boolean>(false);
  const lastPercentRef = useRef<number>(0);

  const subject = subjectId ? getSubjectById(subjectId) : undefined;
  const chapter = chapterId ? getChapterById(chapterId) : undefined;

  const { recordVisit, updateScrollProgress, markCompleted, getChapterStatus } = useProgress();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Scroll to top ONLY when navigating to a new chapter/subject
  useEffect(() => {
    window.scrollTo(0, 0);
    lastPercentRef.current = 0;
    setScrollPercent(0);
  }, [chapterId, subjectId]);

  // Record visit only when chapter or subject route changes
  useEffect(() => {
    if (chapterId && subjectId && subject && chapter) {
      recordVisit(chapterId, subjectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, subjectId]);

  // Track scroll position smoothly without triggering scroll-to-top re-renders
  const handleScroll = useCallback(() => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const currentScroll = window.scrollY;
    const percent = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));

    // Only update progress state if changed by at least 3% or reached boundaries
    if (Math.abs(percent - lastPercentRef.current) >= 3 || percent === 100 || percent === 0) {
      lastPercentRef.current = percent;
      setScrollPercent(percent);

      if (chapterId && subjectId) {
        updateScrollProgress(chapterId, subjectId, percent);
      }
    }
  }, [chapterId, subjectId, updateScrollProgress]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Redirect to 404 if subject or chapter does not exist
  if (!subject || !chapter || chapter.subjectId !== subject.id) {
    return <Navigate to="/404" replace />;
  }

  const { prev, next } = getNextAndPrevChapter(subject.id, chapter.id);
  const status = getChapterStatus(chapter.id);
  const bookmarked = isBookmarked(chapter.id);

  const handleToggleBookmark = () => {
    toggleBookmark({
      chapterId: chapter.id,
      subjectId: subject.id,
      chapterTitle: chapter.title,
      subjectTitle: subject.title,
    });
  };

  const handleMarkCompleted = () => {
    markCompleted(chapter.id, subject.id);
  };

  const handleToggleFullWidth = () => {
    const nextVal = !isFullWidth;
    setIsFullWidth(nextVal);
    localStorage.setItem('study_reader_fullwidth', String(nextVal));
  };

  return (
    <div>
      {/* Top Fixed Reading Progress Bar */}
      <ReadingProgressBar progressPercent={scrollPercent} />

      <div
        style={{
          maxWidth: isFullWidth ? '100%' : 'var(--container-max-width)',
          margin: '0 auto',
          padding: isFullWidth ? '20px 24px 64px' : '24px 16px 64px',
          transition: 'max-width 0.2s ease, padding 0.2s ease',
        }}
      >
        <Breadcrumb
          items={[
            { label: subject.title, path: `/subject/${subject.id}` },
            { label: chapter.title },
          ]}
        />

        {/* Chapter Header Card */}
        <header
          style={{
            padding: '24px 28px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                border: '1px solid var(--primary-border)',
              }}
            >
              บทที่ {chapter.order} • {subject.shortTitle}
            </span>

            {/* Actions: Full Width, Bookmark & Read status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleToggleFullWidth}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isFullWidth ? '1px solid var(--primary-border)' : '1px solid var(--border-color)',
                  backgroundColor: isFullWidth ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  color: isFullWidth ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all var(--transition-fast)',
                }}
                title={isFullWidth ? 'เปลี่ยนเป็นมุมมองคอลัมน์แคบ (Standard Column)' : 'ขยายเต็มความกว้างหน้าจอ (Full Width Reading Mode)'}
              >
                {isFullWidth ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                <span>{isFullWidth ? 'มุมมองแคบ' : 'เต็มหน้าจอ'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: bookmarked ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  color: bookmarked ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                <span>{bookmarked ? 'บันทึกแล้ว' : 'บุ๊กมาร์ก'}</span>
              </button>

              <button
                type="button"
                onClick={handleMarkCompleted}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: status === 'completed' ? 'var(--success-bg)' : 'var(--bg-subtle)',
                  color: status === 'completed' ? 'var(--success)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {status === 'completed' ? <Check size={16} /> : <CheckCircle2 size={16} />}
                <span>{status === 'completed' ? 'อ่านจบแล้ว' : 'ทำเครื่องหมายว่าอ่านจบ'}</span>
              </button>
            </div>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)',
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              marginBottom: '12px',
            }}
          >
            {chapter.title}
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}
          >
            {chapter.description}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} />
              <span>ใช้เวลาอ่านประมาณ {chapter.estimatedReadingMinutes} นาที</span>
            </div>
            <div>
              แท็ก:{' '}
              {chapter.tags.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-subtle)',
                    marginRight: '6px',
                    fontSize: '0.8rem',
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Objectives Box */}
          {chapter.objectives && chapter.objectives.length > 0 && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                borderLeft: '4px solid var(--primary)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                เป้าหมายการเรียนรู้ในบทนี้:
              </div>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {chapter.objectives.map((obj, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* Content Layout: Main Reading + Sticky Sidebar TOC */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isFullWidth ? '1fr' : 'minmax(0, 1fr) 280px',
            gap: isFullWidth ? '0' : '36px',
            alignItems: 'start',
          }}
          className="reader-grid"
        >
          {/* Main Content Column */}
          <main style={{ maxWidth: isFullWidth ? '100%' : 'var(--reader-max-width)', width: '100%' }}>
            <ChapterRenderer
              sections={chapter.sections}
              subjectId={subject.id}
              chapterId={chapter.id}
            />

            {/* Bottom Chapter Navigation & Complete action */}
            <nav
              aria-label="Chapter Navigation"
              style={{
                marginTop: '48px',
                paddingTop: '24px',
                borderTop: '2px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              {prev ? (
                <Link
                  to={`/chapter/${subject.id}/${prev.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    minWidth: '220px',
                    flex: '1 1 240px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <ChevronLeft size={20} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>บทก่อนหน้า</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{prev.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link
                  to={`/chapter/${subject.id}/${next.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    padding: '14px 20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    textAlign: 'right',
                    minWidth: '220px',
                    flex: '1 1 240px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>บทถัดไป</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{next.title}</div>
                  </div>
                  <ChevronRight size={20} color="var(--primary)" />
                </Link>
              ) : (
                <Link
                  to={`/subject/${subject.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 20px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    color: 'var(--success)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    minWidth: '220px',
                    flex: '1 1 240px',
                  }}
                >
                  <Check size={18} />
                  <span>จบบทเรียนวิชานี้แล้ว กลับหน้าวิชา</span>
                </Link>
              )}
            </nav>
          </main>

          {/* Sticky Sidebar: TOC (Visible in standard mode on wide screens) */}
          {!isFullWidth && (
            <aside className="toc-sidebar">
              <TableOfContents sections={chapter.sections} />
            </aside>
          )}
        </div>
      </div>

      {/* Mobile, Tablet & Full-width Floating TOC button */}
      <button
        type="button"
        onClick={() => setIsMobileTocOpen(true)}
        className="mobile-toc-fab"
        style={{ display: isFullWidth ? 'flex' : undefined }}
        aria-label="เปิดสารบัญบทเรียน"
      >
        <ListOrdered size={18} />
        <span>สารบัญ</span>
      </button>

      {/* Mobile / Tablet TOC Drawer Modal */}
      {isMobileTocOpen && (
        <div className="mobile-toc-backdrop" onClick={() => setIsMobileTocOpen(false)}>
          <div className="mobile-toc-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-toc-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListOrdered size={18} color="var(--primary)" />
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>สารบัญบทเรียน</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileTocOpen(false)}
                className="mobile-toc-close"
                aria-label="ปิดสารบัญ"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mobile-toc-content" onClick={() => setIsMobileTocOpen(false)}>
              <TableOfContents sections={chapter.sections} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterPage;
