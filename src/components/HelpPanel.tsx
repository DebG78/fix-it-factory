import { useState } from 'react';
import styles from './HelpPanel.module.css';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'overview' | 'howtoplay' | 'rooms' | 'challenges' | 'mapping';

export default function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Fix-It Factory Guide</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'howtoplay' ? styles.active : ''}`}
            onClick={() => setActiveTab('howtoplay')}
          >
            How to Play
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'rooms' ? styles.active : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            Rooms
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'challenges' ? styles.active : ''}`}
            onClick={() => setActiveTab('challenges')}
          >
            Challenges
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'mapping' ? styles.active : ''}`}
            onClick={() => setActiveTab('mapping')}
          >
            CK Mapping
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'howtoplay' && <HowToPlayContent />}
          {activeTab === 'rooms' && <RoomsContent />}
          {activeTab === 'challenges' && <ChallengesContent />}
          {activeTab === 'mapping' && <MappingContent />}
        </div>
      </div>
    </div>
  );
}

function OverviewContent() {
  return (
    <div className={styles.section}>
      <h3>What is Fix-It Factory?</h3>
      <p>
        Fix-It Factory is a learning game that teaches you how Calibrate Kindly works
        by letting you interact with a simulation of its architecture. Complete challenges
        to earn XP, level up, and master the system.
      </p>

      <h3>Quick Start</h3>
      <ol>
        <li><strong>New to programming?</strong> — Start in the Tutorial room to learn the basics</li>
        <li><strong>Ready for the main game?</strong> — Go to the Upload Room</li>
        <li><strong>Scroll to Challenges</strong> — Find the Challenges section at the bottom</li>
        <li><strong>Start your first challenge</strong> — Read the scenario and pick the right answer</li>
        <li><strong>Earn XP and level up</strong> — Track your progress in the sidebar</li>
      </ol>

      <h3>The 6 Rooms</h3>
      <p>The game has 6 rooms to explore:</p>
      <ul>
        <li><strong>Tutorial</strong> — Learn programming fundamentals (start here if you're new!)</li>
        <li><strong>Upload</strong> — Dataset ingestion and CSV parsing</li>
        <li><strong>Clean</strong> — Data sanitisation and PII handling</li>
        <li><strong>Store</strong> — PostgreSQL database and security</li>
        <li><strong>Brain</strong> — AI analysis with Edge Functions</li>
        <li><strong>Screens</strong> — React frontend and dashboards</li>
      </ul>
      <p>
        Complete all 48 challenges (8 per room) to fully understand the system!
      </p>
    </div>
  );
}

function HowToPlayContent() {
  return (
    <div className={styles.section}>
      <h3>Getting Started</h3>
      <p>
        Start in the <strong>Upload Room</strong> — this is where data enters the system.
        Scroll down to find the <strong>Challenges</strong> section at the bottom of each room.
      </p>

      <h3>Challenges</h3>
      <p>
        Each room has <strong>8 challenges</strong> (40 total across all 5 rooms). Challenges are
        scenario-based questions that test your understanding of the system.
      </p>
      <ul>
        <li><strong>Read the scenario</strong> — understand what went wrong</li>
        <li><strong>Pick the right answer</strong> — identify the root cause or fix</li>
        <li><strong>Use hints if stuck</strong> — but they cost XP!</li>
      </ul>

      <h3>Earning XP & Leveling Up</h3>
      <p>Complete challenges to earn XP and level up:</p>
      <ul>
        <li><strong>Beginner challenges:</strong> 50 XP</li>
        <li><strong>Easy challenges:</strong> 75 XP</li>
        <li><strong>Medium challenges:</strong> 100 XP</li>
        <li><strong>Hard challenges:</strong> 150 XP</li>
        <li><strong>Expert challenges:</strong> 200 XP</li>
      </ul>
      <p>Using hints reduces your XP reward for that challenge.</p>

      <h3>Streaks</h3>
      <p>
        Complete at least one challenge per day to build a streak. Your streak count
        is shown in the sidebar with the fire icon. You have 2 streak freezes to
        protect your streak if you miss a day.
      </p>

      <h3>Skills & Progression</h3>
      <p>
        As you complete challenges, you unlock skills that show your mastery of
        different concepts. Challenges unlock progressively — complete earlier
        challenges to unlock harder ones.
      </p>

      <h3>Learning Phases</h3>
      <div className={styles.phases}>
        <div className={styles.phase}>
          <span className={styles.phaseName}>OPERATOR</span>
          <p>Understand what each room does. Navigate the system. Read logs.</p>
        </div>
        <div className={styles.phase}>
          <span className={styles.phaseName}>ENGINEER</span>
          <p>Fix failures. Understand root causes. Diagnose issues.</p>
        </div>
        <div className={styles.phase}>
          <span className={styles.phaseName}>ARCHITECT</span>
          <p>Make tradeoffs. Design solutions. Understand system-wide impact.</p>
        </div>
      </div>
    </div>
  );
}

function RoomsContent() {
  return (
    <div className={styles.section}>
      <div className={styles.roomGuide}>
        <h3>🔼 Upload Room</h3>
        <p><strong>Purpose:</strong> Handles dataset ingestion from CSV/Excel files</p>
        <p><strong>Try:</strong></p>
        <ul>
          <li>"Simulate Valid Upload" — Watch data flow through ingestion → validation → storage</li>
          <li>"Simulate Schema Error" — See what happens with wrong column names</li>
        </ul>
        <p><strong>Key Learning:</strong> Datasets must match expected schema. Column mapping is critical.</p>
      </div>

      <div className={styles.roomGuide}>
        <h3>🧹 Clean Room</h3>
        <p><strong>Purpose:</strong> Sanitises data by detecting and anonymising PII</p>
        <p><strong>Try:</strong></p>
        <ul>
          <li>"Run Sanitisation" — Watch PII detection and anonymisation pipeline</li>
          <li>"Simulate Violation" — See what happens when sanitisation is bypassed</li>
        </ul>
        <p><strong>Key Learning:</strong> Sanitisation must happen BEFORE data reaches users, not in the UI.</p>
      </div>

      <div className={styles.roomGuide}>
        <h3>🗄️ Store Room</h3>
        <p><strong>Purpose:</strong> PostgreSQL database with Row-Level Security</p>
        <p><strong>Try:</strong></p>
        <ul>
          <li>Change the user role dropdown and query different tables</li>
          <li>"Simulate Stale Cache" — See how caching can cause stale data</li>
          <li>"Simulate RLS Block" — See how security policies block unauthorised access</li>
        </ul>
        <p><strong>Key Learning:</strong> RLS protects data at the database level. Cache must be invalidated.</p>
      </div>

      <div className={styles.roomGuide}>
        <h3>🧠 Brain Room</h3>
        <p><strong>Purpose:</strong> Edge Functions that call OpenAI for analysis</p>
        <p><strong>Try:</strong></p>
        <ul>
          <li>"Run Batch Analysis" — Watch AI process reviews</li>
          <li>"Simulate Partial Failure" — See what happens when API times out mid-batch</li>
          <li>"Exhaust Quota" — See how quota limits affect processing</li>
        </ul>
        <p><strong>Key Learning:</strong> AI is optional and fallible. Handle partial success gracefully.</p>
      </div>

      <div className={styles.roomGuide}>
        <h3>🖥️ Screens Room</h3>
        <p><strong>Purpose:</strong> React frontend components and their data dependencies</p>
        <p><strong>Try:</strong></p>
        <ul>
          <li>Watch the Context states load one by one</li>
          <li>"Simulate Blank Panels" — See what happens when data isn't ready</li>
          <li>"Simulate Wrong Dataset" — See stale dataset context issues</li>
        </ul>
        <p><strong>Key Learning:</strong> Components must wait for data. Check context before rendering.</p>
      </div>
    </div>
  );
}

function ChallengesContent() {
  return (
    <div className={styles.section}>
      <h3>Starter Challenges</h3>
      <p>Try these scenarios to test your understanding:</p>

      <div className={styles.challenge}>
        <span className={styles.challengeRoom}>UPLOAD</span>
        <h4>The Missing Dashboard Data</h4>
        <p><strong>Symptom:</strong> Dataset uploads successfully but doesn't appear in dashboards.</p>
        <p><strong>Your task:</strong> Use "Simulate Schema Error" and watch the logs. What column is missing?</p>
      </div>

      <div className={styles.challenge}>
        <span className={styles.challengeRoom}>CLEAN</span>
        <h4>The Privacy Leak</h4>
        <p><strong>Symptom:</strong> A TD user can see employee names (they shouldn't).</p>
        <p><strong>Your task:</strong> Click "Simulate Violation". Where does the log say the problem is?</p>
      </div>

      <div className={styles.challenge}>
        <span className={styles.challengeRoom}>STORE</span>
        <h4>The Stale Dashboard</h4>
        <p><strong>Symptom:</strong> Dashboard shows old data even after new upload.</p>
        <p><strong>Your task:</strong> Click "Simulate Stale Cache". What needs to happen to fix it?</p>
      </div>

      <div className={styles.challenge}>
        <span className={styles.challengeRoom}>BRAIN</span>
        <h4>The Half-Scored Dataset</h4>
        <p><strong>Symptom:</strong> Only half the reviews have MQI scores.</p>
        <p><strong>Your task:</strong> Click "Simulate Partial Failure". Why did it stop halfway?</p>
      </div>

      <div className={styles.challenge}>
        <span className={styles.challengeRoom}>SCREENS</span>
        <h4>The Blank Chart</h4>
        <p><strong>Symptom:</strong> Page loads but charts are empty.</p>
        <p><strong>Your task:</strong> Click "Simulate Blank Panels". What's the root cause?</p>
      </div>
    </div>
  );
}

function MappingContent() {
  return (
    <div className={styles.section}>
      <h3>Calibrate Kindly Architecture Mapping</h3>
      <p>Every element in Fix-It Factory corresponds to real code:</p>

      <table className={styles.mappingTable}>
        <thead>
          <tr>
            <th>Game Element</th>
            <th>Calibrate Kindly</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Upload Room</td>
            <td><code>/admin/upload</code> page, CSV parsing logic</td>
          </tr>
          <tr>
            <td>Schema Validation</td>
            <td>Column contracts, <code>datasets</code> table metadata</td>
          </tr>
          <tr>
            <td>Clean Room</td>
            <td><code>raw_data</code> → <code>sanitized_data</code> in <code>dataset_reviews</code></td>
          </tr>
          <tr>
            <td>PII Detection</td>
            <td>Anonymisation functions before storage</td>
          </tr>
          <tr>
            <td>Store Room</td>
            <td>PostgreSQL: <code>users</code>, <code>datasets</code>, <code>dataset_reviews</code></td>
          </tr>
          <tr>
            <td>RLS Policies</td>
            <td>Supabase Row-Level Security policies</td>
          </tr>
          <tr>
            <td>Cache</td>
            <td>React Context + service layer caching</td>
          </tr>
          <tr>
            <td>Brain Room</td>
            <td>Supabase Edge Functions</td>
          </tr>
          <tr>
            <td>analyze-review</td>
            <td><code>supabase/functions/analyze-review</code></td>
          </tr>
          <tr>
            <td>batch-analyze</td>
            <td><code>supabase/functions/batch-analyze-reviews</code></td>
          </tr>
          <tr>
            <td>Quota</td>
            <td>OpenAI API usage limits</td>
          </tr>
          <tr>
            <td>Screens Room</td>
            <td>React pages and components</td>
          </tr>
          <tr>
            <td>DatasetSelector</td>
            <td>Dataset dropdown component</td>
          </tr>
          <tr>
            <td>ReviewsTable</td>
            <td>Performance reviews data table</td>
          </tr>
          <tr>
            <td>MQIChart</td>
            <td>Manager Quality Index chart component</td>
          </tr>
          <tr>
            <td>Context States</td>
            <td>React Context providers (DatasetsContext, etc.)</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
