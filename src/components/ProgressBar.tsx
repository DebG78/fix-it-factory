import { useGame } from '@/context/GameContext';
import { XP_LEVELS, DAILY_CHALLENGE_GOAL } from '@/types';
import styles from './ProgressBar.module.css';

export default function ProgressBar() {
  const { state } = useGame();
  const { progression } = state;

  const currentLevelXP = XP_LEVELS[progression.level - 1] || 0;
  const nextLevelXP = XP_LEVELS[progression.level] || XP_LEVELS[XP_LEVELS.length - 1];
  const xpProgress = progression.xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min(100, (xpProgress / xpNeeded) * 100);

  const dailyProgress = Math.min(
    100,
    (progression.dailyProgress.challengesCompleted / DAILY_CHALLENGE_GOAL) * 100
  );

  return (
    <div className={styles.container}>
      <div className={styles.levelSection}>
        <div className={styles.levelBadge}>
          <span className={styles.levelNumber}>{progression.level}</span>
        </div>
        <div className={styles.xpInfo}>
          <div className={styles.xpBar}>
            <div
              className={styles.xpFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={styles.xpText}>
            {progression.xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statIcon}>🔥</span>
          <span className={styles.statValue}>{progression.streak.current}</span>
          <span className={styles.statLabel}>streak</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statIcon}>📚</span>
          <span className={styles.statValue}>{progression.completedChallenges.length}</span>
          <span className={styles.statLabel}>challenges</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statIcon}>⚡</span>
          <span className={styles.statValue}>{progression.unlockedSkills.length}</span>
          <span className={styles.statLabel}>skills</span>
        </div>
      </div>

      <div className={styles.dailySection}>
        <div className={styles.dailyHeader}>
          <span className={styles.dailyLabel}>Daily Goal</span>
          <span className={styles.dailyCount}>
            {progression.dailyProgress.challengesCompleted}/{DAILY_CHALLENGE_GOAL}
          </span>
        </div>
        <div className={styles.dailyBar}>
          <div
            className={`${styles.dailyFill} ${progression.dailyProgress.goalMet ? styles.goalMet : ''}`}
            style={{ width: `${dailyProgress}%` }}
          />
        </div>
        {progression.dailyProgress.goalMet && (
          <span className={styles.goalComplete}>Daily goal complete! 🎉</span>
        )}
      </div>
    </div>
  );
}
