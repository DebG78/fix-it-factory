import { SKILLS, isSkillUnlocked, getSkillsByRoom } from '@/data/challenges';
import type { RoomId } from '@/types';
import styles from './SkillTree.module.css';

interface SkillTreeProps {
  completedChallenges: string[];
  totalXP: number;
  onClose: () => void;
}

export default function SkillTree({ completedChallenges, totalXP, onClose }: SkillTreeProps) {
  const rooms: RoomId[] = ['upload', 'clean', 'store', 'brain', 'screens'];

  const unlockedCount = SKILLS.filter(s => isSkillUnlocked(s, completedChallenges)).length;
  const totalSkills = SKILLS.length;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Skill Tree</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{totalXP.toLocaleString()}</span>
              <span className={styles.statLabel}>Total XP</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{unlockedCount}/{totalSkills}</span>
              <span className={styles.statLabel}>Skills</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{completedChallenges.length}</span>
              <span className={styles.statLabel}>Challenges</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.tree}>
          {rooms.map(room => {
            const roomSkills = getSkillsByRoom(room);
            const unlockedInRoom = roomSkills.filter(s => isSkillUnlocked(s, completedChallenges)).length;

            return (
              <div key={room} className={styles.roomSection}>
                <div className={styles.roomHeader}>
                  <span className={styles.roomName}>{room.toUpperCase()}</span>
                  <span className={styles.roomProgress}>
                    {unlockedInRoom}/{roomSkills.length}
                  </span>
                </div>

                <div className={styles.skillsTrack}>
                  {roomSkills.map((skill, idx) => {
                    const unlocked = isSkillUnlocked(skill, completedChallenges);
                    const prereqsMet = skill.prerequisites.every(p =>
                      isSkillUnlocked(SKILLS.find(s => s.id === p)!, completedChallenges)
                    );

                    return (
                      <div key={skill.id} className={styles.skillNode}>
                        {idx > 0 && (
                          <div className={`${styles.connector} ${unlocked ? styles.unlocked : ''}`} />
                        )}
                        <div
                          className={`${styles.skillCard} ${
                            unlocked ? styles.unlocked : prereqsMet ? styles.available : styles.locked
                          }`}
                          title={skill.description}
                        >
                          <span className={styles.skillIcon}>{skill.icon}</span>
                          <span className={styles.skillName}>{skill.name}</span>
                          <span className={styles.skillPhase}>{skill.phase}</span>
                          {!unlocked && (
                            <div className={styles.lockOverlay}>
                              {prereqsMet ? '🔓' : '🔒'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendBox} ${styles.unlocked}`} />
            <span>Unlocked</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendBox} ${styles.available}`} />
            <span>Available</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendBox} ${styles.locked}`} />
            <span>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
