import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { ChapterSection } from '../../types/content';
import { FormulaSection } from './sections/FormulaSection';
import { CalloutSection } from './sections/CalloutSection';
import { TableSection } from './sections/TableSection';
import { ExampleSection } from './sections/ExampleSection';
import { KeyPointsSection } from './sections/KeyPointsSection';
import { QuizSection } from './sections/QuizSection';
import { QwenReactRenderer } from '../../integrations/qwen/QwenReactRenderer';
import { LegacyHtmlRenderer } from '../../integrations/qwen/LegacyHtmlRenderer';

interface ChapterRendererProps {
  sections: ChapterSection[];
  subjectId: string;
  chapterId: string;
}

export const ChapterRenderer: React.FC<ChapterRendererProps> = ({
  sections,
  subjectId,
  chapterId,
}) => {
  const renderSectionContent = (section: ChapterSection) => {
    switch (section.type) {
      case 'paragraph':
        return (
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              margin: '16px 0',
            }}
          >
            {typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
          </p>
        );

      case 'heading':
        return (
          <h3
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '32px 0 16px',
            }}
          >
            {typeof section.content === 'string' ? section.content : ''}
          </h3>
        );

      case 'bullet-list': {
        const items = Array.isArray(section.content) ? section.content : [];
        return (
          <ul style={{ margin: '16px 0', paddingLeft: '24px', listStyleType: 'disc' }}>
            {items.map((item, idx) => (
              <li key={idx} style={{ margin: '8px 0', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {item}
              </li>
            ))}
          </ul>
        );
      }

      case 'numbered-list': {
        const numItems = Array.isArray(section.content) ? section.content : [];
        return (
          <ol style={{ margin: '16px 0', paddingLeft: '24px', listStyleType: 'decimal' }}>
            {numItems.map((item, idx) => (
              <li key={idx} style={{ margin: '8px 0', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {item}
              </li>
            ))}
          </ol>
        );
      }

      case 'formula':
        return <FormulaSection content={section.content as any} />;

      case 'callout':
        return <CalloutSection content={section.content as any} />;

      case 'table':
        return <TableSection content={section.content as any} />;

      case 'example':
        return <ExampleSection content={section.content as any} />;

      case 'key-points':
        return <KeyPointsSection content={section.content as any} />;

      case 'quiz':
        return <QuizSection content={section.content as any} chapterId={chapterId} subjectId={subjectId} />;

      case 'simulation': {
        const simContent = section.content as {
          simulationId: string;
          title?: string;
          initialParams?: Record<string, unknown>;
        };
        return (
          <QwenReactRenderer
            simulationId={simContent.simulationId}
            subjectId={subjectId}
            chapterId={chapterId}
            title={simContent.title}
            initialParams={simContent.initialParams}
          />
        );
      }

      case 'legacy-html': {
        const htmlContent = section.content as {
          modulePath: string;
          title: string;
          description?: string;
          initialHeight?: number;
        };
        return (
          <LegacyHtmlRenderer
            modulePath={htmlContent.modulePath}
            title={htmlContent.title}
            description={htmlContent.description}
            initialHeight={htmlContent.initialHeight}
          />
        );
      }

      case 'quote': {
        const quoteContent = section.content as { quote: string; author?: string; source?: string };
        return (
          <blockquote
            style={{
              margin: '24px 0',
              padding: '16px 20px',
              borderLeft: '4px solid var(--primary)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              fontStyle: 'italic',
            }}
          >
            <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              &ldquo;{quoteContent.quote}&rdquo;
            </p>
            {quoteContent.author && (
              <footer style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                — {quoteContent.author} {quoteContent.source && `(${quoteContent.source})`}
              </footer>
            )}
          </blockquote>
        );
      }

      default:
        return (
          <div
            role="alert"
            style={{
              margin: '16px 0',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--warning-border)',
              backgroundColor: 'var(--warning-bg)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--text-primary)',
            }}
          >
            <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--warning)' }}>
                ไม่รองรับประเภทเนื้อหา &quot;{section.type}&quot;
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                ระบบตรวจพบ Section ที่ไม่มี Renderer เฉพาะ แต่ส่วนอื่นของบทเรียนยังทำงานได้ปกติ
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          style={{ scrollMarginTop: '80px', marginBottom: '24px' }}
        >
          {section.heading && (
            <div
              style={{
                margin: '40px 0 24px',
                padding: '20px 24px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)',
                border: '1px solid var(--border-color-strong)',
                borderLeft: '6px solid var(--primary)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary-border)',
                  }}
                >
                  หัวข้อบทเรียน
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  #{section.id}
                </span>
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.4rem, 2.6vw, 1.8rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.35,
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {section.heading}
              </h2>
            </div>
          )}
          {renderSectionContent(section)}
        </section>
      ))}
    </div>
  );
};

export default ChapterRenderer;

