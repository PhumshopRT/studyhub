import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Bookmark, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useBookmarks } from '../../../hooks/useBookmarks';
import styles from './Header.module.css';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { bookmarks } = useBookmarks();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left: Brand logo & Navigation */}
        <div className={styles.leftSection}>
          <Link to="/" className={styles.brand}>
            <div className={styles.brandLogo}>
              <BookOpen size={18} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ศูนย์รวมสรุปบทเรียน</span>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
                }}
              >
                JEV AI
              </span>
            </div>
          </Link>

          <nav className={styles.navLinks} aria-label="Main Navigation">
            <Link to="/" className={styles.navLink}>
              หน้าแรก
            </Link>
            <Link
              to="/subject/pathology"
              className={styles.navLink}
              style={{
                color: '#be123c',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>พยาธิวิทยา</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: 'rgba(190, 18, 60, 0.15)',
                  color: '#be123c',
                }}
              >
                NEW
              </span>
            </Link>
            <Link to="/subject/physiology" className={styles.navLink}>
              สรีรวิทยา
            </Link>
            <Link to="/bookmarks" className={styles.navLink}>
              บุ๊กมาร์ก ({bookmarks.length})
            </Link>
          </nav>
        </div>

        {/* Right: Search, Bookmarks, Theme Toggle */}
        <div className={styles.rightSection}>
          <button
            type="button"
            onClick={onOpenSearch}
            className={styles.searchTrigger}
            aria-label="ค้นหาบทเรียน"
          >
            <Search size={16} />
            <span>ค้นหาบทเรียน...</span>
            <kbd className={styles.kbd}>Ctrl K</kbd>
          </button>

          <Link
            to="/bookmarks"
            className={styles.iconBtn}
            title={`รายการบุ๊กมาร์ก (${bookmarks.length})`}
            aria-label="ดูรายการที่บันทึกไว้"
          >
            <Bookmark size={18} />
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className={styles.iconBtn}
            title={resolvedTheme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
            aria-label="สลับธีมสี"
          >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
