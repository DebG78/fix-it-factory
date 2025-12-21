import { useGame } from '@/context/GameContext';
import { CHALLENGES } from '@/data/challenges';
import { XP_LEVELS } from '@/types';
import type { RoomId, SystemStatus, GameState } from '@/types';
import styles from './Dashboard.module.css';

const ROOM_ORDER: RoomId[] = ['tutorial', 'upload', 'clean', 'store', 'brain', 'screens'];

const ROOM_ICONS: Record<RoomId, string> = {
  tutorial: '📚',
  upload: '📤',
  clean: '🧹',
  store: '🗄️',
  brain: '🧠',
  screens: '🖥️',
};

const roomInfo: Record<RoomId, { description: string; mapping: string }> = {
  tutorial: {
    description: 'Learn programming fundamentals and concepts',
    mapping: 'Web apps, components, state, APIs, databases',
  },
  upload: {
    description: 'Dataset ingestion and CSV/Excel parsing',
    mapping: 'Admin upload page → datasets table',
  },
  clean: {
    description: 'Data sanitisation and PII handling',
    mapping: 'raw_data → sanitized_data transformation',
  },
  store: {
    description: 'PostgreSQL tables and Row-Level Security',
    mapping: 'users, datasets, dataset_reviews tables',
  },
  brain: {
    description: 'Supabase Edge Functions and OpenAI analysis',
    mapping: 'analyze-review, batch-analyze, generate-recommendations',
  },
  screens: {
    description: 'React pages, components, and dashboards',
    mapping: 'Performance Reviews, Manager Capabilities, Engagement Analytics',
  },
};

function getStatusColor(status: SystemStatus): string {
  switch (status) {
    case 'healthy':
      return 'var(--status-healthy)';
    case 'warning':
      return 'var(--status-warning)';
    case 'error':
      return 'var(--status-error)';
    case 'processing':
      return 'var(--status-info)';
    default:
      return 'var(--status-inactive)';
  }
}

export default function Dashboard() {
  const { state, resetGame } = useGame();
  const { systemHealth, progression } = state;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetGame();
    }
  };

  // Calculate progress per room
  const roomProgress = ROOM_ORDER.map((roomId) => {
    const roomChallenges = CHALLENGES.filter((c) => c.room === roomId);
    const completedInRoom = roomChallenges.filter((c) =>
      progression.completedChallenges.includes(c.id)
    ).length;
    return {
      roomId,
      total: roomChallenges.length,
      completed: completedInRoom,
      percent: roomChallenges.length > 0 ? Math.round((completedInRoom / roomChallenges.length) * 100) : 0,
    };
  });

  const totalChallenges = CHALLENGES.length;
  const totalCompleted = progression.completedChallenges.length;
  const overallPercent = totalChallenges > 0 ? Math.round((totalCompleted / totalChallenges) * 100) : 0;

  // Calculate XP to next level
  const currentLevelXP = XP_LEVELS[progression.level - 1] || 0;
  const nextLevelXP = XP_LEVELS[progression.level] || XP_LEVELS[XP_LEVELS.length - 1];
  const xpProgress = progression.xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const xpPercent = xpNeeded > 0 ? Math.round((xpProgress / xpNeeded) * 100) : 100;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>SYSTEM STATUS</h1>
          <span className={styles.subtitle}>Calibrate Kindly Architecture Overview</span>
        </div>
        <button className={styles.resetBtn} onClick={handleReset}>
          Reset
        </button>
      </header>

      <div className={styles.grid}>
        {/* Your Progress Panel - NEW */}
        <section className={`${styles.panel} ${styles.progressPanel}`}>
          <h2 className={styles.panelTitle}>Your Progress</h2>
          <div className={styles.progressContent}>
            {/* Overall Stats */}
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{progression.level}</span>
                <span className={styles.statLabel}>Level</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{progression.xp}</span>
                <span className={styles.statLabel}>Total XP</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{totalCompleted}/{totalChallenges}</span>
                <span className={styles.statLabel}>Challenges</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{progression.unlockedSkills.length}</span>
                <span className={styles.statLabel}>Skills</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{progression.streak.current}</span>
                <span className={styles.statLabel}>Streak</span>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className={styles.xpSection}>
              <div className={styles.xpHeader}>
                <span>Level {progression.level}</span>
                <span>{xpProgress} / {xpNeeded} XP to Level {progression.level + 1}</span>
              </div>
              <div className={styles.xpBar}>
                <div className={styles.xpFill} style={{ width: `${xpPercent}%` }} />
              </div>
            </div>

            {/* Room Progress */}
            <div className={styles.roomProgressSection}>
              <h3 className={styles.sectionSubtitle}>Room Completion</h3>
              <div className={styles.roomProgressGrid}>
                {roomProgress.map(({ roomId, total, completed, percent }) => (
                  <div
                    key={roomId}
                    className={`${styles.roomProgressCard} ${completed === total && total > 0 ? styles.roomComplete : ''}`}
                  >
                    <div className={styles.roomProgressHeader}>
                      <span className={styles.roomProgressIcon}>{ROOM_ICONS[roomId]}</span>
                      <span className={styles.roomProgressName}>{roomId.charAt(0).toUpperCase() + roomId.slice(1)}</span>
                      <span className={styles.roomProgressCount}>{completed}/{total}</span>
                    </div>
                    <div className={styles.roomProgressBar}>
                      <div
                        className={styles.roomProgressFill}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Completion */}
            <div className={styles.overallSection}>
              <div className={styles.overallHeader}>
                <span>Overall Game Completion</span>
                <span className={styles.overallPercent}>{overallPercent}%</span>
              </div>
              <div className={styles.overallBar}>
                <div className={styles.overallFill} style={{ width: `${overallPercent}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* System Overview Panel */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <span className={styles.indicator} style={{ backgroundColor: getStatusColor(systemHealth.overall) }} />
            Data Flow Pipeline
          </h2>
          <div className={styles.overviewContent}>
            <div className={styles.dataFlow}>
              <DataFlowDiagram systemHealth={systemHealth} completedRooms={roomProgress} />
            </div>
          </div>
        </section>

        {/* Recent Activity Panel */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Recent Activity</h2>
          <div className={styles.activityContent}>
            {state.logs.length === 0 ? (
              <p className={styles.emptyState}>No activity yet. Head to the Tutorial room to start learning!</p>
            ) : (
              <div className={styles.activityList}>
                {state.logs.slice(0, 8).map((log) => (
                  <div key={log.id} className={`${styles.activityItem} ${styles[log.level]}`}>
                    <span className={styles.activityTime}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={styles.activitySource}>[{log.source}]</span>
                    <span className={styles.activityMessage}>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Info Panel */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Calibrate Kindly Architecture</h2>
          <div className={styles.infoContent}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Frontend</span>
              <span className={styles.infoValue}>React + TypeScript</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Backend</span>
              <span className={styles.infoValue}>Supabase (PostgreSQL)</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>AI Provider</span>
              <span className={styles.infoValue}>OpenAI GPT-4</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Auth</span>
              <span className={styles.infoValue}>Supabase Auth + RLS</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Edge Functions</span>
              <span className={styles.infoValue}>Deno Runtime</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Data Flow Diagram Component
interface RoomProgressData {
  roomId: RoomId;
  total: number;
  completed: number;
  percent: number;
}

function DataFlowDiagram({
  systemHealth,
  completedRooms,
}: {
  systemHealth: GameState['systemHealth'];
  completedRooms: RoomProgressData[];
}) {
  const rooms: RoomId[] = ['upload', 'clean', 'store', 'brain', 'screens'];

  return (
    <div className={styles.flowDiagram}>
      {rooms.map((roomId, index) => {
        const room = systemHealth.rooms[roomId];
        const progress = completedRooms.find((r) => r.roomId === roomId);
        const isComplete = progress && progress.completed === progress.total && progress.total > 0;
        const hasProgress = progress && progress.completed > 0;

        return (
          <div key={roomId} className={styles.flowNode}>
            <div
              className={`${styles.flowBox} ${isComplete ? styles.flowComplete : ''} ${hasProgress && !isComplete ? styles.flowInProgress : ''}`}
              style={{
                borderColor: isComplete ? 'var(--status-healthy)' : hasProgress ? 'var(--accent-primary)' : getStatusColor(room.status),
                boxShadow: isComplete ? '0 0 10px var(--status-healthy)40' : undefined,
              }}
            >
              <span className={styles.flowIcon}>{ROOM_ICONS[roomId]}</span>
              <span className={styles.flowLabel}>{roomId.toUpperCase()}</span>
              {progress && (
                <span className={styles.flowProgress}>{progress.completed}/{progress.total}</span>
              )}
              {isComplete && <span className={styles.flowCheck}>✓</span>}
            </div>
            {index < rooms.length - 1 && (
              <div className={styles.flowArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
