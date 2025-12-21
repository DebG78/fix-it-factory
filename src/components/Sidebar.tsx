import { NavLink, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import type { RoomId, SystemStatus } from '@/types';
import { XP_LEVELS } from '@/types';
import styles from './Sidebar.module.css';

interface RoomNavItem {
  id: RoomId;
  path: string;
  name: string;
  icon: React.ReactNode;
  calibrateKindlyMapping: string;
}

const rooms: RoomNavItem[] = [
  {
    id: 'tutorial',
    path: '/tutorial',
    name: 'Tutorial',
    icon: <TutorialIcon />,
    calibrateKindlyMapping: 'Learn programming fundamentals',
  },
  {
    id: 'upload',
    path: '/upload',
    name: 'Upload',
    icon: <UploadIcon />,
    calibrateKindlyMapping: 'Dataset upload, CSV/Excel parsing',
  },
  {
    id: 'clean',
    path: '/clean',
    name: 'Clean',
    icon: <CleanIcon />,
    calibrateKindlyMapping: 'Data sanitisation, PII handling',
  },
  {
    id: 'store',
    path: '/store',
    name: 'Store',
    icon: <StoreIcon />,
    calibrateKindlyMapping: 'PostgreSQL tables, RLS',
  },
  {
    id: 'brain',
    path: '/brain',
    name: 'Brain',
    icon: <BrainIcon />,
    calibrateKindlyMapping: 'Edge Functions, OpenAI',
  },
  {
    id: 'screens',
    path: '/screens',
    name: 'Screens',
    icon: <ScreensIcon />,
    calibrateKindlyMapping: 'React pages, components',
  },
];

function getStatusClass(status: SystemStatus): string {
  switch (status) {
    case 'healthy':
      return styles.statusHealthy;
    case 'warning':
      return styles.statusWarning;
    case 'error':
      return styles.statusError;
    case 'processing':
      return styles.statusProcessing;
    default:
      return styles.statusInactive;
  }
}

interface SidebarProps {
  onHelpClick?: () => void;
}

export default function Sidebar({ onHelpClick: _onHelpClick }: SidebarProps) {
  const { state, setRoom } = useGame();
  const location = useLocation();

  const handleRoomClick = (roomId: RoomId) => {
    setRoom(roomId);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <NavLink to="/" className={styles.logo}>
          <FactoryIcon />
          <span className={styles.title}>FIX-IT FACTORY</span>
        </NavLink>
        <span className={styles.subtitle}>Calibrate Kindly Edition</span>
      </div>

      <nav className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${styles.navItem} ${styles.dashboard} ${isActive && location.pathname === '/' ? styles.active : ''}`
          }
        >
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>

        <div className={styles.roomsSection}>
          <span className={styles.sectionLabel}>ROOMS</span>
          {rooms.map((room) => {
            const roomHealth = state.systemHealth.rooms[room.id];
            return (
              <NavLink
                key={room.id}
                to={room.path}
                className={({ isActive }) =>
                  `${styles.navItem} ${styles.room} ${isActive ? styles.active : ''}`
                }
                onClick={() => handleRoomClick(room.id)}
                title={room.calibrateKindlyMapping}
              >
                <div className={styles.roomIcon}>{room.icon}</div>
                <span className={styles.roomName}>{room.name}</span>
                <div
                  className={`${styles.statusIndicator} ${getStatusClass(roomHealth.status)}`}
                />
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className={styles.footer}>
        {/* Progression Stats */}
        <div className={styles.progressSection}>
          <div className={styles.levelDisplay}>
            <span className={styles.levelBadge}>{state.progression.level}</span>
            <div className={styles.levelInfo}>
              <span className={styles.levelLabel}>Level {state.progression.level}</span>
              <div className={styles.xpBar}>
                <div
                  className={styles.xpFill}
                  style={{
                    width: `${Math.min(100, ((state.progression.xp - (XP_LEVELS[state.progression.level - 1] || 0)) / ((XP_LEVELS[state.progression.level] || XP_LEVELS[XP_LEVELS.length - 1]) - (XP_LEVELS[state.progression.level - 1] || 0))) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>🔥</span>
              <span className={styles.statVal}>{state.progression.streak.current}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>⚡</span>
              <span className={styles.statVal}>{state.progression.xp}</span>
            </div>
          </div>
        </div>

        <div className={styles.phase}>
          <span className={styles.phaseLabel}>Phase</span>
          <span className={styles.phaseValue}>{state.phase.toUpperCase()}</span>
        </div>
        <div className={styles.score}>
          <span className={styles.scoreLabel}>Score</span>
          <span className={styles.scoreValue}>{state.score}</span>
        </div>
      </div>
    </aside>
  );
}

// =============================================================================
// Icons
// =============================================================================

function FactoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CleanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54" />
    </svg>
  );
}

function ScreensIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function TutorialIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
