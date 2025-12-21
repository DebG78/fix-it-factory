import { useState, useEffect } from 'react';
import styles from './TutorialOverlay.module.css';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  highlight?: string; // CSS selector or area name
  position: 'center' | 'left' | 'right' | 'bottom';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Fix-It Factory',
    content: `This game teaches you how Calibrate Kindly works by simulating its real architecture.

Every room, every error, every fix maps directly to your production codebase.

By the end, you'll debug issues faster because you'll recognise the patterns.`,
    position: 'center',
  },
  {
    id: 'rooms-intro',
    title: 'The Five Rooms',
    content: `Data flows through 5 rooms, just like in Calibrate Kindly:

• UPLOAD → CSV/Excel ingestion (Admin upload page)
• CLEAN → PII detection & sanitisation
• STORE → PostgreSQL tables with RLS
• BRAIN → Edge Functions + OpenAI
• SCREENS → React components & dashboards

Each room can break independently. Your job is to understand WHY.`,
    highlight: 'sidebar',
    position: 'right',
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics Panel',
    content: `The bottom panel shows real-time system logs.

When something breaks, the logs tell you WHERE and WHAT happened.

Learn to read these logs — they mirror what you'd see in Supabase and browser dev tools.`,
    highlight: 'diagnostics',
    position: 'bottom',
  },
  {
    id: 'status-indicators',
    title: 'Status Indicators',
    content: `Each room has a health indicator:

🟢 Healthy — System working correctly
🟡 Warning — Degraded performance or minor issue
🔴 Error — Something is broken
🔵 Processing — Active operation in progress

Watch these to spot problems quickly.`,
    position: 'left',
  },
  {
    id: 'first-mission',
    title: 'Your First Mission',
    content: `Let's start with the UPLOAD room.

Click "Upload" in the sidebar to begin.

Your goal: Understand what happens when a dataset is uploaded, and what can go wrong.

Try both "Simulate Valid Upload" and "Simulate Schema Error" to see the difference.`,
    highlight: 'upload-room',
    position: 'center',
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
  isVisible: boolean;
}

export default function TutorialOverlay({ onComplete, isVisible }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.backdrop} ${step.highlight ? styles[`highlight-${step.highlight}`] : ''}`} />

      <div className={`${styles.dialog} ${styles[`position-${step.position}`]} ${isAnimating ? styles.animating : ''}`}>
        <div className={styles.header}>
          <span className={styles.stepIndicator}>
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </span>
          <button className={styles.skipBtn} onClick={handleSkip}>
            Skip Tutorial
          </button>
        </div>

        <h2 className={styles.title}>{step.title}</h2>

        <div className={styles.content}>
          {step.content.split('\n').map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>

        <div className={styles.actions}>
          {!isFirstStep && (
            <button className={styles.prevBtn} onClick={handlePrev}>
              ← Back
            </button>
          )}
          <button className={styles.nextBtn} onClick={handleNext}>
            {isLastStep ? "Let's Go!" : 'Next →'}
          </button>
        </div>

        <div className={styles.progress}>
          {TUTORIAL_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`${styles.progressDot} ${idx === currentStep ? styles.active : ''} ${idx < currentStep ? styles.completed : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
