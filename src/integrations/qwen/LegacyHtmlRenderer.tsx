import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ExternalLink, ShieldCheck, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import type { QwenPostMessagePayload } from './types';

interface LegacyHtmlRendererProps {
  modulePath: string; // e.g. "/qwen-modules/biology/cell-structure/index.html"
  title: string;
  description?: string;
  initialHeight?: number;
}

export const LegacyHtmlRenderer: React.FC<LegacyHtmlRendererProps> = ({
  modulePath,
  title,
  description,
  initialHeight = 460,
}) => {
  const [iframeHeight, setIframeHeight] = useState<number>(initialHeight);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Normalize module path to respect BASE_URL
  const cleanPath = modulePath.startsWith('/') ? modulePath.slice(1) : modulePath;
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const resolvedPath = `${baseUrl}${cleanPath}`;

  // Listen for secure postMessage from within sandboxed iframe
  const handleMessage = useCallback((event: MessageEvent) => {
    // Only accept messages from same origin
    if (event.origin !== window.location.origin && event.origin !== 'null' && event.origin !== '') {
      return;
    }

    try {
      const data = event.data as QwenPostMessagePayload;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'QWEN_MODULE_RESIZE' && typeof data.height === 'number') {
        // Clamp height between 250px and 1400px for stability
        const clampedHeight = Math.max(250, Math.min(data.height, 1400));
        setIframeHeight(clampedHeight);
      }
    } catch {
      // Ignore malformed messages
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Lock body scroll and handle ESC key when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsFullscreen(false);
          try {
            if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
              document.exitFullscreen().catch(() => {});
            }
          } catch {
            // ignore
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isFullscreen]);

  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
    setReloadKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      const container = containerRef.current;
      if (next) {
        try {
          if (container && typeof container.requestFullscreen === 'function') {
            container.requestFullscreen().catch(() => {});
          }
        } catch {
          // ignore on iPad / iOS Safari
        }
      } else {
        try {
          if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        inset: isFullscreen ? 0 : undefined,
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100dvh' : 'auto',
        zIndex: isFullscreen ? 99999 : undefined,
        border: isFullscreen ? 'none' : '1px solid var(--border-color)',
        borderRadius: isFullscreen ? 0 : 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface)',
        boxShadow: isFullscreen ? 'none' : 'var(--shadow-md)',
        overflow: 'hidden',
        margin: isFullscreen ? 0 : '24px 0',
        display: isFullscreen ? 'flex' : 'block',
        flexDirection: 'column',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-subtle)',
          flexWrap: 'wrap',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '0.975rem', color: 'var(--text-primary)' }}>{title}</h4>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--info-bg)',
                  color: 'var(--info)',
                  border: '1px solid var(--info-border)',
                  fontWeight: 600,
                }}
              >
                Sandboxed HTML Module
              </span>
            </div>
            {description && (
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'ออกจากโหมดเต็มจอ (Esc)' : 'ขยายเต็มจอทั้งหน้า (iPad/PC/Mobile Fullscreen)'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: isFullscreen ? '8px 14px' : '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: isFullscreen ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--primary-border)',
              backgroundColor: isFullscreen ? 'rgba(239, 68, 68, 0.12)' : 'var(--primary-light)',
              color: isFullscreen ? '#ef4444' : 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullscreen ? 'ออกจากเต็มจอ (Esc)' : 'ขยายเต็มจอ'}
          </button>

          <button
            type="button"
            onClick={handleReload}
            title="รีโหลดโมดูล"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
            รีโหลด
          </button>

          <a
            href={resolvedPath}
            target="_blank"
            rel="noopener noreferrer"
            title="เปิดโมดูลในแท็บใหม่"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            <ExternalLink size={14} />
            เปิดแท็บใหม่
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          flex: isFullscreen ? 1 : undefined,
          minHeight: isFullscreen ? 0 : `${iframeHeight}px`,
          height: isFullscreen ? 'calc(100dvh - 56px)' : undefined,
        }}
      >
        {hasError ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--danger)',
              backgroundColor: 'var(--danger-bg)',
            }}
          >
            <AlertCircle size={32} style={{ marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 8px', color: 'var(--danger)' }}>ไม่สามารถโหลดโมดูล HTML ได้</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              ไม่พบไฟล์หรือเกิดข้อผิดพลาดที่ตำแหน่ง: <code>{resolvedPath}</code>
            </p>
            <button
              type="button"
              onClick={handleReload}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : (
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src={resolvedPath}
            title={title}
            // Strict sandbox attributes to isolate styles and prevent global state pollution
            sandbox="allow-scripts allow-same-origin allow-forms"
            onLoad={() => {
              setIsLoading(false);
              // Send handshake or trigger postMessage resize from inside
              try {
                iframeRef.current?.contentWindow?.postMessage({ type: 'PARENT_READY' }, '*');
              } catch {
                // Ignore cross-origin error if any
              }
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            style={{
              width: '100%',
              height: isFullscreen ? '100%' : `${iframeHeight}px`,
              border: 'none',
              display: 'block',
              transition: 'height 200ms ease',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LegacyHtmlRenderer;
