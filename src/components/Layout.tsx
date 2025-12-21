import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DiagnosticsPanel from './DiagnosticsPanel';
import TutorialOverlay from './TutorialOverlay';
import HelpPanel from './HelpPanel';
import styles from './Layout.module.css';

const TUTORIAL_COMPLETED_KEY = 'fix-it-factory-tutorial-completed';

export default function Layout() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if tutorial has been completed before
    const tutorialCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleTutorialComplete = () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    setShowTutorial(false);
  };

  return (
    <div className={styles.layout}>
      {/* Mobile hamburger button */}
      <button
        className={styles.menuButton}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <span className={`${styles.hamburger} ${sidebarOpen ? styles.open : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <Sidebar onHelpClick={() => setShowHelp(true)} />
      </div>

      <main className={styles.main}>
        <div className={styles.workspace}>
          <Outlet />
        </div>
        <DiagnosticsPanel />
      </main>

      <TutorialOverlay
        isVisible={showTutorial}
        onComplete={handleTutorialComplete}
      />

      <HelpPanel
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Floating Help Button */}
      <button
        className={styles.helpButton}
        onClick={() => setShowHelp(true)}
        title="Help & Guide"
      >
        ?
      </button>
    </div>
  );
}
