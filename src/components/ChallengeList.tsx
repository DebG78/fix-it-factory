import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { SKILLS, getChallengesByRoom, getAvailableChallenges } from '@/data/challenges';
import type { RoomId } from '@/types';
import type { Challenge } from '@/data/challenges';
import ChallengePanel from './ChallengePanel';
import styles from './ChallengeList.module.css';

interface ChallengeListProps {
  room: RoomId;
}

export default function ChallengeList({ room }: ChallengeListProps) {
  const { state, completeChallenge, unlockSkill, addLog } = useGame();
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [showAll, setShowAll] = useState(false);

  const roomChallenges = getChallengesByRoom(room);
  const allAvailableChallenges = getAvailableChallenges(state.progression.completedChallenges);
  const availableChallenges = allAvailableChallenges.filter(c => c.room === room);

  const completedCount = roomChallenges.filter((c: Challenge) =>
    state.progression.completedChallenges.includes(c.id)
  ).length;

  const handleStartChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    addLog('info', room, `Started challenge: ${challenge.title}`);
  };

  const handleCompleteChallenge = (correct: boolean, xpEarned: number) => {
    if (!activeChallenge) return;

    const hintsUsed = state.progression.challengeAttempts[activeChallenge.id]?.hintsUsed || [];

    if (correct) {
      completeChallenge(activeChallenge.id, xpEarned, hintsUsed);
      addLog('info', room, `Completed challenge: ${activeChallenge.title} (+${xpEarned} XP)`);

      // Check if this unlocks any skills
      activeChallenge.skillsTaught.forEach((skillId: string) => {
        const skill = SKILLS.find((s) => s.id === skillId);
        if (skill) {
          // Check if all prerequisites are met
          const prereqsMet = skill.prerequisites.every((prereq: string) =>
            state.progression.completedChallenges.includes(prereq) ||
            activeChallenge.id === prereq
          );
          if (prereqsMet && !state.progression.unlockedSkills.includes(skillId)) {
            unlockSkill(skillId);
            addLog('info', 'system', `Skill unlocked: ${skill.name}`);
          }
        }
      });
    } else {
      addLog('warn', room, `Challenge not completed: ${activeChallenge.title}`);
    }

    setActiveChallenge(null);
  };

  const handleCloseChallenge = () => {
    setActiveChallenge(null);
  };

  const getChallengeStatus = (challenge: Challenge): 'completed' | 'available' | 'locked' => {
    if (state.progression.completedChallenges.includes(challenge.id)) {
      return 'completed';
    }
    if (availableChallenges.some(c => c.id === challenge.id)) {
      return 'available';
    }
    return 'locked';
  };

  const getDifficultyLabel = (difficulty: number): string => {
    const labels = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
    return labels[difficulty - 1] || 'Unknown';
  };

  const getPhaseIcon = (phase: string): string => {
    switch (phase) {
      case 'operator': return '👀';
      case 'engineer': return '🔧';
      case 'architect': return '🏗️';
      default: return '📋';
    }
  };

  const displayedChallenges: Challenge[] = showAll ? roomChallenges : roomChallenges.slice(0, 3);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Challenges</h3>
          <span className={styles.progress}>
            {completedCount}/{roomChallenges.length} completed
          </span>
        </div>

        <div className={styles.list}>
          {displayedChallenges.map(challenge => {
            const status = getChallengeStatus(challenge);
            const attempt = state.progression.challengeAttempts[challenge.id];

            return (
              <button
                key={challenge.id}
                className={`${styles.challenge} ${styles[status]}`}
                onClick={() => status !== 'locked' && handleStartChallenge(challenge)}
                disabled={status === 'locked'}
              >
                <div className={styles.challengeHeader}>
                  <span className={styles.phaseIcon}>{getPhaseIcon(challenge.phase)}</span>
                  <span className={styles.challengeTitle}>{challenge.title}</span>
                  {status === 'completed' && <span className={styles.checkmark}>✓</span>}
                  {status === 'locked' && <span className={styles.lock}>🔒</span>}
                </div>
                <div className={styles.challengeMeta}>
                  <span className={`${styles.difficulty} ${styles[`diff${challenge.difficulty}`]}`}>
                    {getDifficultyLabel(challenge.difficulty)}
                  </span>
                  <span className={styles.xp}>+{challenge.xpReward} XP</span>
                  {attempt && attempt.attempts > 0 && (
                    <span className={styles.attempts}>
                      {attempt.attempts} attempt{attempt.attempts !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className={styles.symptom}>{challenge.scenario.symptom}</p>
              </button>
            );
          })}
        </div>

        {roomChallenges.length > 3 && (
          <button
            className={styles.showMore}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${roomChallenges.length})`}
          </button>
        )}

        {availableChallenges.length === 0 && completedCount < roomChallenges.length && (
          <div className={styles.lockedMessage}>
            Complete challenges in earlier rooms to unlock more here.
          </div>
        )}
      </div>

      {activeChallenge && (
        <ChallengePanel
          challenge={activeChallenge}
          onComplete={handleCompleteChallenge}
          onClose={handleCloseChallenge}
        />
      )}
    </>
  );
}
