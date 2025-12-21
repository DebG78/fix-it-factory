import { useState } from 'react';
import type { Challenge, ChallengeHint } from '@/data/challenges';
import styles from './ChallengePanel.module.css';

interface ChallengePanelProps {
  challenge: Challenge;
  onComplete: (correct: boolean, xpEarned: number) => void;
  onClose: () => void;
}

export default function ChallengePanel({ challenge, onComplete, onClose }: ChallengePanelProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [xpPenalty, setXpPenalty] = useState(0);

  const isCorrect = selectedOption === challenge.question.correctAnswer;
  const selectedOptionData = challenge.question.options.find(o => o.id === selectedOption);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
  };

  const handleRevealHint = (hint: ChallengeHint) => {
    if (revealedHints.includes(hint.id)) return;
    setRevealedHints([...revealedHints, hint.id]);
    setXpPenalty(prev => prev + hint.xpCost);
  };

  const handleComplete = () => {
    const xpEarned = isCorrect ? Math.max(0, challenge.xpReward - xpPenalty) : 0;
    onComplete(isCorrect, xpEarned);
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.roomBadge}>{challenge.room.toUpperCase()}</span>
            <span className={styles.phaseBadge}>{challenge.phase}</span>
            <DifficultyStars difficulty={challenge.difficulty} />
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Title & Scenario */}
        <h2 className={styles.title}>{challenge.title}</h2>

        <div className={styles.scenario}>
          <div className={styles.scenarioHeader}>
            <span className={styles.scenarioIcon}>🔍</span>
            <span className={styles.scenarioTitle}>{challenge.scenario.title}</span>
          </div>
          <p className={styles.scenarioDescription}>{challenge.scenario.description}</p>
          <div className={styles.symptom}>
            <span className={styles.symptomLabel}>Symptom:</span>
            <span className={styles.symptomText}>{challenge.scenario.symptom}</span>
          </div>
          <div className={styles.context}>
            <span className={styles.contextLabel}>Context:</span>
            <span className={styles.contextText}>{challenge.scenario.context}</span>
          </div>
        </div>

        {/* Question */}
        <div className={styles.question}>
          <h3 className={styles.questionPrompt}>{challenge.question.prompt}</h3>

          <div className={styles.options}>
            {challenge.question.options.map((option) => (
              <button
                key={option.id}
                className={`${styles.option} ${
                  selectedOption === option.id ? styles.selected : ''
                } ${
                  isSubmitted && option.id === challenge.question.correctAnswer
                    ? styles.correct
                    : ''
                } ${
                  isSubmitted && selectedOption === option.id && !option.isCorrect
                    ? styles.incorrect
                    : ''
                }`}
                onClick={() => !isSubmitted && setSelectedOption(option.id)}
                disabled={isSubmitted}
              >
                <span className={styles.optionLetter}>{option.id.toUpperCase()}</span>
                <span className={styles.optionText}>{option.text}</span>
                {isSubmitted && option.id === challenge.question.correctAnswer && (
                  <span className={styles.correctIcon}>✓</span>
                )}
                {isSubmitted && selectedOption === option.id && !option.isCorrect && (
                  <span className={styles.incorrectIcon}>✗</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback after submission */}
        {isSubmitted && selectedOptionData && (
          <div className={`${styles.feedback} ${isCorrect ? styles.correctFeedback : styles.incorrectFeedback}`}>
            <div className={styles.feedbackHeader}>
              {isCorrect ? (
                <>
                  <span className={styles.feedbackIcon}>🎉</span>
                  <span className={styles.feedbackTitle}>Correct!</span>
                </>
              ) : (
                <>
                  <span className={styles.feedbackIcon}>❌</span>
                  <span className={styles.feedbackTitle}>Not quite...</span>
                </>
              )}
            </div>
            <p className={styles.feedbackText}>{selectedOptionData.feedback}</p>

            {isCorrect && (
              <>
                <div className={styles.explanation}>
                  <h4>Why this matters:</h4>
                  <p>{challenge.question.explanation}</p>
                </div>

                {challenge.question.codeExample && (
                  <div className={styles.codeExample}>
                    <h4>Code Example:</h4>
                    <pre>{challenge.question.codeExample}</pre>
                  </div>
                )}

                {challenge.question.ckFileReference && (
                  <div className={styles.fileRef}>
                    <span className={styles.fileRefLabel}>📁 CK File:</span>
                    <code>{challenge.question.ckFileReference}</code>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Hints */}
        {!isSubmitted && challenge.hints.length > 0 && (
          <div className={styles.hints}>
            <h4 className={styles.hintsTitle}>Need a hint?</h4>
            {challenge.hints.map((hint) => (
              <div key={hint.id} className={styles.hint}>
                {revealedHints.includes(hint.id) ? (
                  <p className={styles.hintText}>{hint.text}</p>
                ) : (
                  <button
                    className={styles.hintBtn}
                    onClick={() => handleRevealHint(hint)}
                  >
                    Reveal hint (-{hint.xpCost} XP)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* XP Display */}
        <div className={styles.xpDisplay}>
          <span className={styles.xpLabel}>Reward:</span>
          <span className={styles.xpValue}>
            {challenge.xpReward}
            {xpPenalty > 0 && (
              <span className={styles.xpPenalty}> - {xpPenalty} (hints)</span>
            )}
            {' '}XP
          </span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {!isSubmitted ? (
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!selectedOption}
            >
              Submit Answer
            </button>
          ) : isCorrect ? (
            <button className={styles.completeBtn} onClick={handleComplete}>
              Claim {Math.max(0, challenge.xpReward - xpPenalty)} XP →
            </button>
          ) : (
            <div className={styles.failActions}>
              <button className={styles.tryAgainBtn} onClick={handleTryAgain}>
                Try Again
              </button>
              <button className={styles.skipBtn} onClick={() => onComplete(false, 0)}>
                Skip Challenge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <div className={styles.difficulty}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= difficulty ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </div>
  );
}
