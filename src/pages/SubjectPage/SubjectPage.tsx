import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Clock, ChevronRight, Search, PlayCircle, Box } from 'lucide-react';
import { getSubjectById, getChaptersBySubjectId } from '../../content/registry';
import { useProgress } from '../../hooks/useProgress';
import { Breadcrumb } from '../../components/navigation/Breadcrumb/Breadcrumb';
import { Badge } from '../../components/common/Badge/Badge';

export const SubjectPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [filterQuery, setFilterQuery] = useState('');

  const subject = subjectId ? getSubjectById(subjectId) : undefined;
  const chapters = subjectId ? getChaptersBySubjectId(subjectId) : [];
  const { getSubjectProgress, getChapterStatus } = useProgress();

  if (!subject) {
    return <Navigate to="/404" replace />;
  }

  const { completed, total, percent } = getSubjectProgress(subject.id, subject.chapterIds);

  const filteredChapters = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(filterQuery.toLowerCase())) ||
      c.sections.some((s) => s.heading && s.heading.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const getStatusBadge = (status: 'not-started' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">อ่านจบแล้ว</Badge>;
      case 'in-progress':
        return <Badge variant="warning">กำลังอ่าน</Badge>;
      case 'not-started':
      default:
        return <Badge variant="neutral">ยังไม่อ่าน</Badge>;
    }
  };

  return (
    <div style={{ maxWidth: 'var(--container-max-width)', margin: '0 auto', padding: '32px 16px' }}>
      <Breadcrumb items={[{ label: subject.title }]} />

      {/* Subject Header Banner */}
      <div
        style={{
          background: subject.bgGradient,
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          color: '#ffffff',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)',
            fontWeight: 600,
          }}
        >
          {subject.shortTitle}
        </span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: '#ffffff', margin: '12px 0 8px' }}>
          {subject.title}
        </h1>
        <p style={{ maxWidth: '750px', fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6 }}>
          {subject.description}
        </p>

        {/* Progress Card */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(8px)',
            maxWidth: '450px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
            <span>ความคืบหน้าการอ่านในวิชานี้</span>
            <span style={{ fontWeight: 700 }}>
              {completed} จาก {total} บท ({percent}%)
            </span>
          </div>
          <div
            style={{
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percent}%`,
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-full)',
                transition: 'width var(--transition-base)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Chapters list section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            รายชื่อบทเรียน ({chapters.length} บท)
          </h2>

          {/* Search filter input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              width: '100%',
              maxWidth: '300px',
            }}
          >
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="ค้นหาบทในวิชานี้..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Chapters Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredChapters.map((chapter) => {
            const status = getChapterStatus(chapter.id);
            const hasSim = chapter.simulationIds && chapter.simulationIds.length > 0;
            const hasLegacyHtml = chapter.sections.some((s) => s.type === 'legacy-html');

            return (
              <Link
                key={chapter.id}
                to={`/chapter/${subject.id}/${chapter.id}`}
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  transition: 'all var(--transition-base)',
                  gap: '16px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      บทที่ {chapter.order}
                    </span>
                    {getStatusBadge(status)}
                    {hasSim && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          color: '#0ea5e9',
                          fontWeight: 600,
                        }}
                      >
                        <Box size={14} />
                        มีแบบจำลอง 3D
                      </span>
                    )}
                    {hasLegacyHtml && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          color: 'var(--primary)',
                          fontWeight: 600,
                        }}
                      >
                        <PlayCircle size={14} />
                        มีห้องทดลอง Interactive
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {chapter.title}
                  </h3>
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {chapter.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      <span>{chapter.estimatedReadingMinutes} นาที</span>
                    </div>
                    <div>{chapter.sections.length} หัวข้อย่อย</div>
                  </div>

                  {/* Section Headings Preview Chips */}
                  {chapter.sections.filter((s) => s.heading).length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {chapter.sections
                        .filter((s) => s.heading)
                        .slice(0, 5)
                        .map((s, idx) => (
                          <span
                            key={s.id || idx}
                            style={{
                              fontSize: '0.78rem',
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-subtle)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-color)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
                            {s.heading}
                          </span>
                        ))}
                      {chapter.sections.filter((s) => s.heading).length > 5 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                          +{chapter.sections.filter((s) => s.heading).length - 5} หัวข้อเพิ่มเติม
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    flexShrink: 0,
                  }}
                >
                  <ChevronRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;
