import { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import ChallengeList from '@/components/ChallengeList';
import styles from './Room.module.css';

interface Concept {
  id: string;
  title: string;
  icon: string;
  description: string;
  analogy: string;
  howItWorks: string[];
  inCalibrateKindly: string;
  challengeId: string; // Maps to the challenge that proves this concept is learned
  example?: {
    title: string;
    code?: string;
    explanation: string;
  };
}

const CONCEPTS: Concept[] = [
  {
    id: 'web-app',
    title: 'What is a Web App?',
    icon: '🌐',
    challengeId: 'tutorial-1-what-is-webapp',
    description: 'A web application is software that runs in your browser. Unlike apps you install, web apps live on the internet and you access them through URLs.',
    analogy: 'Think of it like a restaurant. The menu (website) shows you options, you place an order (request), the kitchen (server) prepares it, and the waiter brings your food (response). You don\'t need to own the kitchen - you just visit!',
    howItWorks: [
      'You type a URL in your browser (like calibrate-kindly.com)',
      'Your browser sends a request to a server',
      'The server sends back HTML, CSS, and JavaScript files',
      'Your browser renders these into the page you see',
    ],
    inCalibrateKindly: 'Calibrate Kindly is a web app built with React. Users access it through their browser to analyze performance reviews.',
  },
  {
    id: 'frontend-backend',
    title: 'Frontend vs Backend',
    icon: '🎭',
    challengeId: 'tutorial-2-frontend-backend',
    description: 'The frontend is what users see and interact with (buttons, forms, charts). The backend is the hidden machinery that stores data, processes requests, and enforces rules.',
    analogy: 'Frontend is like a bank\'s lobby - the counters, forms, and friendly tellers. Backend is the vault, the computers processing transactions, and the security systems. Customers interact with the lobby, but the real work happens behind the scenes.',
    howItWorks: [
      'Frontend: React components render the UI in the browser',
      'Backend: Supabase handles database, authentication, and Edge Functions',
      'They communicate via API calls (HTTP requests)',
      'Frontend asks for data, Backend provides it (or denies if unauthorized)',
    ],
    inCalibrateKindly: 'React runs in your browser (frontend). Supabase PostgreSQL stores all the review data (backend). Edge Functions analyze reviews using AI (backend).',
    example: {
      title: 'A Simple Request Flow',
      explanation: 'When you click "Load Reviews", the frontend sends a request to the backend, which queries the database and returns the data.',
    },
  },
  {
    id: 'components',
    title: 'Components',
    icon: '🧩',
    challengeId: 'tutorial-3-components',
    description: 'Components are reusable building blocks of a user interface. Instead of writing the same code for every button, you create a Button component and reuse it.',
    analogy: 'Components are like LEGO bricks. Each brick (component) has a specific shape and purpose. You combine them to build complex structures. Need another window in your LEGO house? Just grab another window brick!',
    howItWorks: [
      'A component is a JavaScript function that returns UI elements',
      'Components can contain other components (nesting)',
      'Components accept "props" - data passed from parent to child',
      'Components can have their own internal "state" - data that changes',
    ],
    inCalibrateKindly: 'DatasetSelector is a component used on multiple pages. ReviewCard displays a single review. Charts are components that visualize data.',
    example: {
      title: 'Component Example',
      code: `function Button({ label, onClick }) {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
}`,
      explanation: 'This Button component can be reused anywhere. Pass different labels and click handlers to customize it.',
    },
  },
  {
    id: 'state',
    title: 'State',
    icon: '🔄',
    challengeId: 'tutorial-4-data-flow',
    description: 'State is data that can change over time. When state changes, the UI automatically updates to reflect the new data. This is what makes apps feel "alive".',
    analogy: 'State is like a scoreboard at a sports game. When a team scores, the scoreboard updates immediately. Everyone watching sees the change. The scoreboard "reacts" to events.',
    howItWorks: [
      'State is declared using useState() in React',
      'When state changes, React re-renders the component',
      'State is local to a component, or shared via Context',
      'Examples: current user, selected dataset, loading status',
    ],
    inCalibrateKindly: 'DatasetContext stores the currently selected dataset. AuthContext stores who is logged in. When you switch datasets, all charts update automatically.',
    example: {
      title: 'State Example',
      code: `const [count, setCount] = useState(0);

// When button clicked:
setCount(count + 1);
// UI automatically shows new count`,
      explanation: 'The count is "state". Calling setCount changes it, and React updates the display.',
    },
  },
  {
    id: 'api',
    title: 'APIs',
    icon: '🔌',
    challengeId: 'tutorial-5-api',
    description: 'An API (Application Programming Interface) is how different software systems talk to each other. It defines what requests you can make and what responses you\'ll get.',
    analogy: 'An API is like a waiter at a restaurant. You (the frontend) don\'t go into the kitchen (database) yourself. You tell the waiter (API) what you want, and they bring it to you. The menu is the API documentation - it tells you what\'s available.',
    howItWorks: [
      'APIs use HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)',
      'You send a request to a URL endpoint (like /api/reviews)',
      'The server processes the request and returns JSON data',
      'APIs can require authentication (prove who you are)',
    ],
    inCalibrateKindly: 'Supabase provides APIs for querying tables. Edge Functions expose APIs for AI analysis. The frontend calls these APIs to get and save data.',
    example: {
      title: 'API Request Example',
      code: `// Fetch reviews from the API
const response = await fetch('/api/reviews');
const reviews = await response.json();
// reviews is now an array of data`,
      explanation: 'This fetches review data from the server. The API returns JSON that we can use in our app.',
    },
  },
  {
    id: 'database',
    title: 'Databases',
    icon: '🗄️',
    challengeId: 'tutorial-6-database',
    description: 'A database is organized storage for data. It\'s like a giant spreadsheet with superpowers - it can store millions of rows, search instantly, and maintain relationships between data.',
    analogy: 'A database is like a library. Books (records) are organized in sections (tables). The catalog system (indexes) helps you find books quickly. The librarian (database engine) enforces rules - you can\'t take restricted books without permission.',
    howItWorks: [
      'Data is stored in tables with rows and columns',
      'SQL is the language used to query databases',
      'Tables can relate to each other (users → datasets → reviews)',
      'Indexes speed up searching common queries',
    ],
    inCalibrateKindly: 'PostgreSQL stores users, datasets, and dataset_reviews tables. Each review belongs to a dataset. Each dataset belongs to an organization.',
    example: {
      title: 'Database Query',
      code: `SELECT * FROM dataset_reviews
WHERE dataset_id = 'abc123'
AND mqi_score < 50;`,
      explanation: 'This SQL query finds all low-scoring reviews in a specific dataset.',
    },
  },
  {
    id: 'authentication',
    title: 'Authentication & Authorization',
    icon: '🔐',
    challengeId: 'tutorial-7-authentication',
    description: 'Authentication proves WHO you are (login). Authorization determines WHAT you can do (permissions). Together they protect your data.',
    analogy: 'Authentication is showing your ID at a nightclub door (proving who you are). Authorization is the VIP section - even if you\'re in the club, you might not have access to every area.',
    howItWorks: [
      'Authentication: Login with email/password or Google OAuth',
      'The server creates a session token (JWT) proving you logged in',
      'Authorization: Your role (admin, viewer) determines access',
      'Row-Level Security (RLS) enforces rules at the database level',
    ],
    inCalibrateKindly: 'Google OAuth for login. User roles control access: admins see everything, TD users see aggregate data only, viewers see anonymized data. RLS policies enforce this in the database.',
  },
  {
    id: 'data-flow',
    title: 'Data Flow',
    icon: '🌊',
    challengeId: 'tutorial-8-ck-overview',
    description: 'Data flows through an application like water through pipes. Understanding this flow helps you debug issues and build new features.',
    analogy: 'Imagine a factory assembly line. Raw materials (user input) enter, get processed at different stations (components, backend), and finished products (UI updates) come out. If something breaks, you trace back along the line to find the problem.',
    howItWorks: [
      'User Action → Component handles the event',
      'Component calls API → Request goes to backend',
      'Backend queries database → Gets data',
      'Data returns → Component updates state → UI re-renders',
    ],
    inCalibrateKindly: 'Upload CSV → Parse file → Validate schema → Store in database → Trigger AI analysis → Update UI with results. Each room in this game represents a step in this pipeline.',
    example: {
      title: 'Full Data Flow',
      explanation: 'When an admin uploads reviews: Upload Room (parse file) → Clean Room (remove PII) → Store Room (save to database) → Brain Room (AI analysis) → Screens Room (display charts)',
    },
  },
];

export default function TutorialRoom() {
  const { state, addLog } = useGame();
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  // Derive completed concepts from completed challenges
  const completedConcepts = useMemo(() => {
    return CONCEPTS
      .filter(concept => state.progression.completedChallenges.includes(concept.challengeId))
      .map(concept => concept.id);
  }, [state.progression.completedChallenges]);

  const handleConceptClick = (concept: Concept) => {
    setSelectedConcept(concept);
    addLog('info', 'tutorial', `Exploring concept: ${concept.title}`);
  };

  const progress = Math.round((completedConcepts.length / CONCEPTS.length) * 100);

  return (
    <div className={styles.room}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span className={styles.icon}>📚</span>
            Tutorial: Foundations
          </h1>
          <p className={styles.subtitle}>
            Learn the fundamental concepts of web applications before exploring Calibrate Kindly
          </p>
        </div>
        <div className={styles.headerMeta}>
          <div className={styles.progressBadge}>
            {completedConcepts.length}/{CONCEPTS.length} Concepts
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <div className={styles.columns}>
        {/* Concepts Grid */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Core Concepts</h2>
          <p className={styles.panelDescription}>
            Click on a concept to learn about it. Understanding these foundations will help you
            understand how Calibrate Kindly works.
          </p>
          <div className={styles.conceptGrid}>
            {CONCEPTS.map((concept) => {
              const isCompleted = completedConcepts.includes(concept.id);
              return (
                <button
                  key={concept.id}
                  className={`${styles.conceptCard} ${selectedConcept?.id === concept.id ? styles.selected : ''} ${isCompleted ? styles.completed : ''}`}
                  onClick={() => handleConceptClick(concept)}
                >
                  <span className={styles.conceptIcon}>{concept.icon}</span>
                  <span className={styles.conceptTitle}>{concept.title}</span>
                  {isCompleted && <span className={styles.checkmark}>✓</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* Concept Detail */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {selectedConcept ? selectedConcept.title : 'Select a Concept'}
          </h2>
          {selectedConcept ? (
            <div className={styles.conceptDetail}>
              <div className={styles.conceptSection}>
                <h3>What is it?</h3>
                <p>{selectedConcept.description}</p>
              </div>

              <div className={styles.conceptSection}>
                <h3>Analogy</h3>
                <p className={styles.analogy}>{selectedConcept.analogy}</p>
              </div>

              <div className={styles.conceptSection}>
                <h3>How it Works</h3>
                <ol className={styles.stepsList}>
                  {selectedConcept.howItWorks.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className={styles.conceptSection}>
                <h3>In Calibrate Kindly</h3>
                <p className={styles.ckExample}>{selectedConcept.inCalibrateKindly}</p>
              </div>

              {selectedConcept.example && (
                <div className={styles.conceptSection}>
                  <h3>{selectedConcept.example.title}</h3>
                  {selectedConcept.example.code && (
                    <pre className={styles.codeBlock}>{selectedConcept.example.code}</pre>
                  )}
                  <p>{selectedConcept.example.explanation}</p>
                </div>
              )}

              {completedConcepts.includes(selectedConcept.id) ? (
                <div className={styles.learnedBtn + ' ' + styles.alreadyLearned}>
                  ✓ Mastered via Challenge
                </div>
              ) : (
                <div className={styles.challengeHint}>
                  Complete the related challenge below to master this concept
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Select a concept from the list to learn about fundamental programming concepts.</p>
              <p className={styles.hint}>Start with "What is a Web App?" if you're new to programming.</p>
            </div>
          )}
        </section>
      </div>

      {/* Learning Path */}
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Learning Path</h2>
        <div className={styles.learningPath}>
          <div className={styles.pathStep}>
            <span className={styles.pathNumber}>1</span>
            <div className={styles.pathContent}>
              <strong>Start Here</strong>
              <p>Learn concepts above to understand how web apps work</p>
            </div>
          </div>
          <div className={styles.pathArrow}>→</div>
          <div className={styles.pathStep}>
            <span className={styles.pathNumber}>2</span>
            <div className={styles.pathContent}>
              <strong>Upload Room</strong>
              <p>See how data enters the system</p>
            </div>
          </div>
          <div className={styles.pathArrow}>→</div>
          <div className={styles.pathStep}>
            <span className={styles.pathNumber}>3</span>
            <div className={styles.pathContent}>
              <strong>Clean → Store → Brain → Screens</strong>
              <p>Follow the data through the pipeline</p>
            </div>
          </div>
          <div className={styles.pathArrow}>→</div>
          <div className={styles.pathStep}>
            <span className={styles.pathNumber}>4</span>
            <div className={styles.pathContent}>
              <strong>Complete Challenges</strong>
              <p>Test your understanding in each room</p>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <ChallengeList room="tutorial" />
    </div>
  );
}
