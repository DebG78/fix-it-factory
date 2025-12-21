import { useGame } from '@/context/GameContext';
import { CHALLENGES, calculatePhase, isRoomUnlocked, getUnlockedRoomCount } from '@/data/challenges';
import { XP_LEVELS } from '@/types';
import type { RoomId, SystemStatus, GameState, Phase } from '@/types';

const PHASE_ICONS: Record<Phase, string> = {
  operator: '👀',
  engineer: '🔧',
  architect: '🏗️',
};

const PHASE_NAMES: Record<Phase, string> = {
  operator: 'Operator',
  engineer: 'Engineer',
  architect: 'Architect',
};
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

  // Calculate phase from completion status
  const currentPhase = calculatePhase(progression.completedChallenges);

  // Calculate rooms unlocked
  const roomsUnlocked = getUnlockedRoomCount(progression.completedChallenges);

  // Calculate progress per phase
  const phaseProgress = (['operator', 'engineer', 'architect'] as Phase[]).map((phase) => {
    const phaseChallenges = CHALLENGES.filter((c) => c.phase === phase);
    const completedInPhase = phaseChallenges.filter((c) =>
      progression.completedChallenges.includes(c.id)
    ).length;
    return {
      phase,
      total: phaseChallenges.length,
      completed: completedInPhase,
      percent: phaseChallenges.length > 0 ? Math.round((completedInPhase / phaseChallenges.length) * 100) : 0,
    };
  });

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
              <div className={`${styles.statBox} ${styles.phaseStatBox}`}>
                <span className={styles.statValue}>
                  {PHASE_ICONS[currentPhase]} {PHASE_NAMES[currentPhase]}
                </span>
                <span className={styles.statLabel}>Phase</span>
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

            {/* Phase Progress */}
            <div className={styles.phaseProgressSection}>
              <h3 className={styles.sectionSubtitle}>Phase Progress ({roomsUnlocked}/6 rooms unlocked)</h3>
              <div className={styles.phaseProgressGrid}>
                {phaseProgress.map(({ phase, total, completed, percent }) => {
                  const isLocked = (phase === 'engineer' && currentPhase === 'operator') ||
                                   (phase === 'architect' && currentPhase !== 'architect');
                  return (
                    <div
                      key={phase}
                      className={`${styles.phaseProgressCard} ${phase === currentPhase ? styles.currentPhase : ''} ${completed === total && total > 0 ? styles.phaseComplete : ''}`}
                    >
                      <div className={styles.phaseProgressHeader}>
                        <span className={styles.phaseProgressIcon}>{PHASE_ICONS[phase]}</span>
                        <span className={styles.phaseProgressName}>{PHASE_NAMES[phase]}</span>
                        <span className={styles.phaseProgressCount}>
                          {isLocked ? '🔒' : `${completed}/${total}`}
                        </span>
                      </div>
                      <div className={styles.phaseProgressBar}>
                        <div
                          className={styles.phaseProgressFill}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className={styles.phaseXpRange}>
                        {phase === 'operator' && 'Understand the system'}
                        {phase === 'engineer' && 'Debug the system'}
                        {phase === 'architect' && 'Design the system'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Progress */}
            <div className={styles.roomProgressSection}>
              <h3 className={styles.sectionSubtitle}>Room Completion</h3>
              <div className={styles.roomProgressGrid}>
                {roomProgress.map(({ roomId, total, completed, percent }) => {
                  const unlocked = isRoomUnlocked(roomId, progression.completedChallenges);
                  return (
                    <div
                      key={roomId}
                      className={`${styles.roomProgressCard} ${completed === total && total > 0 ? styles.roomComplete : ''} ${!unlocked ? styles.roomLocked : ''}`}
                    >
                      <div className={styles.roomProgressHeader}>
                        <span className={styles.roomProgressIcon}>{ROOM_ICONS[roomId]}</span>
                        <span className={styles.roomProgressName}>{roomId.charAt(0).toUpperCase() + roomId.slice(1)}</span>
                        <span className={styles.roomProgressCount}>
                          {unlocked ? `${completed}/${total}` : '🔒'}
                        </span>
                      </div>
                      <div className={styles.roomProgressBar}>
                        <div
                          className={styles.roomProgressFill}
                          style={{ width: unlocked ? `${percent}%` : '0%' }}
                        />
                      </div>
                    </div>
                  );
                })}
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
