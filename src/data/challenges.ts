import type { RoomId, Phase } from '@/types';

// =============================================================================
// Challenge Types
// =============================================================================

export interface Challenge {
  id: string;
  room: RoomId;
  phase: Phase;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  xpReward: number;

  // The scenario
  scenario: {
    title: string;
    description: string;
    symptom: string;
    context: string; // What the user would see in real CK
  };

  // What to show in the simulation
  simulation: {
    type: 'observe' | 'diagnose' | 'fix' | 'design';
    setup: string; // Description of what state to set up
  };

  // The puzzle
  question: {
    prompt: string;
    options: ChallengeOption[];
    correctAnswer: string; // option id
    explanation: string;
    codeExample?: string;
    ckFileReference?: string; // Real file in Calibrate Kindly
  };

  // Hints (cost XP to reveal)
  hints: ChallengeHint[];

  // Prerequisites
  prerequisites: string[]; // challenge IDs that must be completed first

  // Skills this teaches
  skillsTaught: string[];
}

export interface ChallengeOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string; // Shown when selected
}

export interface ChallengeHint {
  id: string;
  text: string;
  xpCost: number;
}

// =============================================================================
// Skills (for skill tree)
// =============================================================================

export interface Skill {
  id: string;
  name: string;
  description: string;
  room: RoomId;
  phase: Phase;
  icon: string;
  prerequisites: string[];
  challengesRequired: string[]; // Complete these to unlock
}

export const SKILLS: Skill[] = [
  // Tutorial Room Skills
  {
    id: 'tutorial-web-basics',
    name: 'Web App Basics',
    description: 'Understand what web applications are and how they work',
    room: 'tutorial',
    phase: 'operator',
    icon: '🌐',
    prerequisites: [],
    challengesRequired: ['tutorial-1-what-is-webapp'],
  },
  {
    id: 'tutorial-frontend-backend',
    name: 'Frontend & Backend',
    description: 'Know the difference between frontend and backend',
    room: 'tutorial',
    phase: 'operator',
    icon: '🎭',
    prerequisites: ['tutorial-web-basics'],
    challengesRequired: ['tutorial-2-frontend-backend'],
  },
  {
    id: 'tutorial-components',
    name: 'Components',
    description: 'Understand reusable UI building blocks',
    room: 'tutorial',
    phase: 'operator',
    icon: '🧩',
    prerequisites: ['tutorial-frontend-backend'],
    challengesRequired: ['tutorial-3-components'],
  },
  {
    id: 'tutorial-data-flow',
    name: 'Data Flow',
    description: 'Understand how data moves through an application',
    room: 'tutorial',
    phase: 'operator',
    icon: '🌊',
    prerequisites: ['tutorial-components'],
    challengesRequired: ['tutorial-4-data-flow'],
  },

  // Upload Room Skills
  {
    id: 'upload-basics',
    name: 'Data Ingestion',
    description: 'Understand how CSV/Excel files are parsed and validated',
    room: 'upload',
    phase: 'operator',
    icon: '📥',
    prerequisites: [],
    challengesRequired: ['upload-1-schema-mismatch'],
  },
  {
    id: 'upload-schema',
    name: 'Schema Validation',
    description: 'Know what column contracts are and why they matter',
    room: 'upload',
    phase: 'operator',
    icon: '📋',
    prerequisites: ['upload-basics'],
    challengesRequired: ['upload-2-missing-required', 'upload-3-type-mismatch'],
  },
  {
    id: 'upload-debugging',
    name: 'Upload Debugging',
    description: 'Diagnose and fix common upload failures',
    room: 'upload',
    phase: 'engineer',
    icon: '🔧',
    prerequisites: ['upload-schema'],
    challengesRequired: ['upload-4-partial-upload', 'upload-5-encoding-issue'],
  },

  // Clean Room Skills
  {
    id: 'clean-basics',
    name: 'Data Sanitisation',
    description: 'Understand the difference between raw and sanitised data',
    room: 'clean',
    phase: 'operator',
    icon: '🧹',
    prerequisites: [],
    challengesRequired: ['clean-1-pii-exposure'],
  },
  {
    id: 'clean-pii',
    name: 'PII Detection',
    description: 'Identify personally identifiable information in data',
    room: 'clean',
    phase: 'operator',
    icon: '🔍',
    prerequisites: ['clean-basics'],
    challengesRequired: ['clean-2-email-leak', 'clean-3-name-visible'],
  },
  {
    id: 'clean-anonymisation',
    name: 'Anonymisation Patterns',
    description: 'Apply correct anonymisation techniques',
    room: 'clean',
    phase: 'engineer',
    icon: '🎭',
    prerequisites: ['clean-pii'],
    challengesRequired: ['clean-4-inconsistent-anon', 'clean-5-reversible-hash'],
  },

  // Store Room Skills
  {
    id: 'store-basics',
    name: 'Database Tables',
    description: 'Understand the core tables and their relationships',
    room: 'store',
    phase: 'operator',
    icon: '🗄️',
    prerequisites: [],
    challengesRequired: ['store-1-table-structure'],
  },
  {
    id: 'store-rls',
    name: 'Row-Level Security',
    description: 'Know how RLS policies protect data',
    room: 'store',
    phase: 'operator',
    icon: '🔒',
    prerequisites: ['store-basics'],
    challengesRequired: ['store-2-rls-block', 'store-3-wrong-org'],
  },
  {
    id: 'store-caching',
    name: 'Cache Management',
    description: 'Understand cache invalidation and stale data',
    room: 'store',
    phase: 'engineer',
    icon: '⚡',
    prerequisites: ['store-rls'],
    challengesRequired: ['store-4-stale-cache', 'store-5-cache-miss'],
  },

  // Brain Room Skills
  {
    id: 'brain-basics',
    name: 'Edge Functions',
    description: 'Understand how serverless functions process data',
    room: 'brain',
    phase: 'operator',
    icon: '⚙️',
    prerequisites: [],
    challengesRequired: ['brain-1-function-overview'],
  },
  {
    id: 'brain-analysis',
    name: 'AI Analysis Pipeline',
    description: 'Know how reviews are sent to OpenAI and scored',
    room: 'brain',
    phase: 'operator',
    icon: '🤖',
    prerequisites: ['brain-basics'],
    challengesRequired: ['brain-2-mqi-scoring', 'brain-3-batch-processing'],
  },
  {
    id: 'brain-failures',
    name: 'Graceful Degradation',
    description: 'Handle API failures and partial success',
    room: 'brain',
    phase: 'engineer',
    icon: '🛡️',
    prerequisites: ['brain-analysis'],
    challengesRequired: ['brain-4-partial-failure', 'brain-5-quota-exceeded'],
  },

  // Screens Room Skills
  {
    id: 'screens-basics',
    name: 'React Components',
    description: 'Understand the page and component structure',
    room: 'screens',
    phase: 'operator',
    icon: '🖥️',
    prerequisites: [],
    challengesRequired: ['screens-1-component-overview'],
  },
  {
    id: 'screens-data',
    name: 'Data Flow',
    description: 'Know how data flows from context to components',
    room: 'screens',
    phase: 'operator',
    icon: '🔄',
    prerequisites: ['screens-basics'],
    challengesRequired: ['screens-2-context-loading', 'screens-3-data-dependency'],
  },
  {
    id: 'screens-debugging',
    name: 'Frontend Debugging',
    description: 'Diagnose blank panels and loading issues',
    room: 'screens',
    phase: 'engineer',
    icon: '🐛',
    prerequisites: ['screens-data'],
    challengesRequired: ['screens-4-blank-panel', 'screens-5-stale-context'],
  },
];

// =============================================================================
// Challenges Data
// =============================================================================

export const CHALLENGES: Challenge[] = [
  // =========================================================================
  // TUTORIAL ROOM CHALLENGES
  // =========================================================================
  {
    id: 'tutorial-1-what-is-webapp',
    room: 'tutorial',
    phase: 'operator',
    title: 'What is a Web App?',
    difficulty: 1,
    xpReward: 50,
    scenario: {
      title: 'Understanding Web Applications',
      description: 'Before diving into Calibrate Kindly, let\'s understand what a web application actually is.',
      symptom: 'You want to understand how apps like Calibrate Kindly work.',
      context: 'Web applications run in browsers and consist of multiple parts working together.',
    },
    simulation: {
      type: 'observe',
      setup: 'Display diagram showing browser → server → database flow',
    },
    question: {
      prompt: 'What is the MAIN difference between a web app and a traditional desktop app?',
      options: [
        {
          id: 'a',
          text: 'Web apps are always free to use',
          isCorrect: false,
          feedback: 'Many web apps have paid tiers. The business model isn\'t what makes them "web" apps.',
        },
        {
          id: 'b',
          text: 'Web apps run in a browser and don\'t need to be installed',
          isCorrect: true,
          feedback: 'Correct! Web apps run in your browser (Chrome, Firefox, etc.) and are accessed via URLs. You don\'t download and install them like Microsoft Word.',
        },
        {
          id: 'c',
          text: 'Web apps are smaller in size',
          isCorrect: false,
          feedback: 'Web apps can be quite complex. Gmail and Google Docs are massive applications!',
        },
        {
          id: 'd',
          text: 'Web apps only work online',
          isCorrect: false,
          feedback: 'While traditionally true, many modern web apps work offline too (Progressive Web Apps).',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Web applications are accessed through a web browser using a URL. The code runs partly in your browser (frontend) and partly on remote servers (backend). Calibrate Kindly is a web app - users access it through their browser without installing anything.',
    },
    hints: [
      { id: 'h1', text: 'Think about how you access this application right now', xpCost: 10 },
    ],
    prerequisites: [],
    skillsTaught: ['tutorial-web-basics'],
  },
  {
    id: 'tutorial-2-frontend-backend',
    room: 'tutorial',
    phase: 'operator',
    title: 'Frontend vs Backend',
    difficulty: 1,
    xpReward: 50,
    scenario: {
      title: 'The Two Halves of Every Web App',
      description: 'Every web app has two main parts: what you see (frontend) and what happens behind the scenes (backend).',
      symptom: 'Understanding where different parts of the app live.',
      context: 'Calibrate Kindly uses React for frontend and Supabase for backend.',
    },
    simulation: {
      type: 'observe',
      setup: 'Show frontend (browser) and backend (server) components',
    },
    question: {
      prompt: 'When you click a "Load Data" button in Calibrate Kindly, where does the actual data come from?',
      options: [
        {
          id: 'a',
          text: 'The data is stored in your browser',
          isCorrect: false,
          feedback: 'Browsers can store small amounts of data locally, but main application data lives on servers.',
        },
        {
          id: 'b',
          text: 'The frontend creates the data on the fly',
          isCorrect: false,
          feedback: 'The frontend displays data, but doesn\'t generate business data. That comes from the backend.',
        },
        {
          id: 'c',
          text: 'The backend (server/database) stores and sends the data',
          isCorrect: true,
          feedback: 'Correct! When you click "Load Data", the frontend sends a request to the backend. The backend queries the database and sends the data back to be displayed.',
        },
        {
          id: 'd',
          text: 'The data comes from your computer\'s hard drive',
          isCorrect: false,
          feedback: 'Web apps typically store data on remote servers, not your local computer.',
        },
      ],
      correctAnswer: 'c',
      explanation: 'The frontend (React) is responsible for the user interface - buttons, forms, charts. The backend (Supabase) stores data in a PostgreSQL database and handles business logic. When you interact with the app, the frontend sends requests to the backend, which processes them and returns results.',
    },
    hints: [
      { id: 'h1', text: 'Think about where data needs to be so multiple users can access it', xpCost: 10 },
    ],
    prerequisites: ['tutorial-1-what-is-webapp'],
    skillsTaught: ['tutorial-frontend-backend'],
  },
  {
    id: 'tutorial-3-components',
    room: 'tutorial',
    phase: 'operator',
    title: 'Building with Components',
    difficulty: 1,
    xpReward: 50,
    scenario: {
      title: 'Reusable Building Blocks',
      description: 'Modern web apps are built from reusable pieces called "components". Understanding this helps you understand how the UI is organized.',
      symptom: 'The same button style appears in many places.',
      context: 'Calibrate Kindly uses React components like DatasetSelector, ReviewCard, and MQIChart.',
    },
    simulation: {
      type: 'observe',
      setup: 'Show multiple instances of the same component',
    },
    question: {
      prompt: 'Why do developers create reusable components instead of copying the same code everywhere?',
      options: [
        {
          id: 'a',
          text: 'It makes the code run faster',
          isCorrect: false,
          feedback: 'Component reuse is about code organization, not performance.',
        },
        {
          id: 'b',
          text: 'Fix once, update everywhere - and keep code organized',
          isCorrect: true,
          feedback: 'Correct! If you have a Button component used in 50 places, you only need to fix a bug once. Plus, code is easier to understand when organized into logical pieces.',
        },
        {
          id: 'c',
          text: 'It\'s required by web browsers',
          isCorrect: false,
          feedback: 'Browsers don\'t require components - it\'s a design choice developers make.',
        },
        {
          id: 'd',
          text: 'Components are only used for charts',
          isCorrect: false,
          feedback: 'Components can be anything: buttons, forms, cards, pages, or charts.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Components are reusable building blocks. The DatasetSelector component in Calibrate Kindly is used on multiple pages. If you need to change how it works, you change it once and the update appears everywhere. This makes apps easier to build and maintain.',
    },
    hints: [
      { id: 'h1', text: 'Think about what happens when you need to fix a bug in something used in 50 places', xpCost: 10 },
    ],
    prerequisites: ['tutorial-2-frontend-backend'],
    skillsTaught: ['tutorial-components'],
  },
  {
    id: 'tutorial-4-data-flow',
    room: 'tutorial',
    phase: 'operator',
    title: 'Following the Data',
    difficulty: 1,
    xpReward: 50,
    scenario: {
      title: 'Data Flow Through an App',
      description: 'Data flows through an application like water through pipes. Understanding this flow helps you debug problems.',
      symptom: 'Charts show "No Data" even though data was uploaded.',
      context: 'In Calibrate Kindly: Upload → Clean → Store → Brain → Screens',
    },
    simulation: {
      type: 'observe',
      setup: 'Show data flow diagram with the 5 rooms',
    },
    question: {
      prompt: 'If a chart shows "No Data" after uploading a file, where should you look FIRST?',
      options: [
        {
          id: 'a',
          text: 'The chart code must be broken',
          isCorrect: false,
          feedback: 'Starting at the end of the pipeline is inefficient. Start where data enters.',
        },
        {
          id: 'b',
          text: 'The upload step - did the data actually get into the system?',
          isCorrect: true,
          feedback: 'Correct! Always trace data from the beginning. If upload failed or data was invalid, nothing downstream will work. This is why the game starts you in the Upload Room!',
        },
        {
          id: 'c',
          text: 'Refresh the page repeatedly',
          isCorrect: false,
          feedback: 'Random refreshing isn\'t debugging. You need to systematically trace where data goes wrong.',
        },
        {
          id: 'd',
          text: 'Wait for it to appear eventually',
          isCorrect: false,
          feedback: 'If something is broken, waiting won\'t fix it. You need to investigate.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'When debugging, trace data from its source. In Calibrate Kindly: data enters via Upload, gets cleaned in Clean, stored in Store, analyzed in Brain, and displayed in Screens. If screens show nothing, work backwards: Is there data in Store? Did Clean process it? Did Upload succeed? This systematic approach is what you\'ll practice in this game.',
    },
    hints: [
      { id: 'h1', text: 'Think about where data starts its journey', xpCost: 10 },
    ],
    prerequisites: ['tutorial-3-components'],
    skillsTaught: ['tutorial-data-flow'],
  },
  {
    id: 'tutorial-5-api',
    room: 'tutorial',
    phase: 'operator',
    title: 'How Apps Talk to Each Other',
    difficulty: 2,
    xpReward: 75,
    scenario: {
      title: 'Understanding APIs',
      description: 'APIs are how different parts of an application communicate. The frontend talks to the backend through APIs.',
      symptom: 'You see "Error: Failed to fetch" in the console.',
      context: 'Calibrate Kindly\'s React frontend calls Supabase APIs to get data.',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show a failed API request',
    },
    question: {
      prompt: 'What is an API in the context of a web application?',
      options: [
        {
          id: 'a',
          text: 'A type of programming language',
          isCorrect: false,
          feedback: 'API stands for Application Programming Interface - it\'s not a language.',
        },
        {
          id: 'b',
          text: 'A defined way for different software to communicate',
          isCorrect: true,
          feedback: 'Correct! An API is like a waiter at a restaurant. The frontend (you) tells the waiter (API) what you want, and the waiter brings back what the kitchen (backend) prepared.',
        },
        {
          id: 'c',
          text: 'A database storage format',
          isCorrect: false,
          feedback: 'APIs are about communication, not storage. Databases store data, APIs help access it.',
        },
        {
          id: 'd',
          text: 'A visual design tool',
          isCorrect: false,
          feedback: 'APIs are for backend communication, not visual design.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'APIs define how software components talk to each other. When Calibrate Kindly needs to load reviews, React sends an HTTP request to a Supabase API endpoint. The API processes the request, queries the database, and returns JSON data. If the API fails, you see errors like "Failed to fetch".',
    },
    hints: [
      { id: 'h1', text: 'Think about how your browser gets data from a server', xpCost: 15 },
    ],
    prerequisites: ['tutorial-4-data-flow'],
    skillsTaught: ['tutorial-data-flow'],
  },
  {
    id: 'tutorial-6-database',
    room: 'tutorial',
    phase: 'operator',
    title: 'Where Data Lives',
    difficulty: 2,
    xpReward: 75,
    scenario: {
      title: 'Understanding Databases',
      description: 'Databases are organized storage for application data. Calibrate Kindly uses PostgreSQL.',
      symptom: 'You want to understand how user data persists.',
      context: 'Calibrate Kindly stores users, datasets, and reviews in database tables.',
    },
    simulation: {
      type: 'observe',
      setup: 'Show database tables relationship diagram',
    },
    question: {
      prompt: 'In Calibrate Kindly, the "datasets" table has a relationship to "dataset_reviews". What does this mean?',
      options: [
        {
          id: 'a',
          text: 'They are stored in the same file',
          isCorrect: false,
          feedback: 'Tables are logical structures, not files. They can reference each other.',
        },
        {
          id: 'b',
          text: 'Each dataset can have many reviews linked to it',
          isCorrect: true,
          feedback: 'Correct! This is a "one-to-many" relationship. One dataset contains many individual reviews. The reviews table has a "dataset_id" column that points back to which dataset each review belongs to.',
        },
        {
          id: 'c',
          text: 'Reviews automatically delete when you view them',
          isCorrect: false,
          feedback: 'Viewing data doesn\'t delete it. Databases persist data until explicitly deleted.',
        },
        {
          id: 'd',
          text: 'The tables are merged into one',
          isCorrect: false,
          feedback: 'Tables stay separate but reference each other. This allows flexibility.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Relational databases organize data into tables that can reference each other. In Calibrate Kindly: a dataset is uploaded once, but contains hundreds of reviews. Each review has a dataset_id linking it back to its parent dataset. This relationship is core to how the Store Room works.',
    },
    hints: [
      { id: 'h1', text: 'One upload creates one dataset but many reviews', xpCost: 15 },
    ],
    prerequisites: ['tutorial-5-api'],
    skillsTaught: ['tutorial-data-flow'],
  },
  {
    id: 'tutorial-7-authentication',
    room: 'tutorial',
    phase: 'operator',
    title: 'Who Can See What?',
    difficulty: 2,
    xpReward: 75,
    scenario: {
      title: 'Authentication & Authorization',
      description: 'Apps need to know who you are (authentication) and what you can do (authorization).',
      symptom: 'Different users see different data in Calibrate Kindly.',
      context: 'Admins see full data, TD users see only aggregate data.',
    },
    simulation: {
      type: 'observe',
      setup: 'Show different views for different user roles',
    },
    question: {
      prompt: 'What is the difference between authentication and authorization?',
      options: [
        {
          id: 'a',
          text: 'They are the same thing',
          isCorrect: false,
          feedback: 'They are related but distinct concepts. Both are needed for security.',
        },
        {
          id: 'b',
          text: 'Authentication only works for admins',
          isCorrect: false,
          feedback: 'All users authenticate. What differs is their authorization level.',
        },
        {
          id: 'c',
          text: 'Authentication = proving who you are, Authorization = what you can access',
          isCorrect: true,
          feedback: 'Correct! Authentication is like showing ID at a door (proving identity). Authorization is like a VIP pass (determining what you can access). In Calibrate Kindly, you log in (authenticate), then your role (admin, td, viewer) determines what data you can see (authorization).',
        },
        {
          id: 'd',
          text: 'Authorization happens before authentication',
          isCorrect: false,
          feedback: 'You need to prove who you are first (authenticate) before the system can decide what you can access (authorize).',
        },
      ],
      correctAnswer: 'c',
      explanation: 'Authentication verifies your identity (login). Authorization determines your permissions. Calibrate Kindly uses Row-Level Security (RLS) in the database to enforce authorization - even if someone bypasses the frontend, the database itself blocks unauthorized access. You\'ll explore this in the Store Room.',
    },
    hints: [
      { id: 'h1', text: 'Think about a nightclub: showing ID vs having VIP access', xpCost: 15 },
    ],
    prerequisites: ['tutorial-6-database'],
    skillsTaught: ['tutorial-data-flow'],
  },
  {
    id: 'tutorial-8-ck-overview',
    room: 'tutorial',
    phase: 'operator',
    title: 'Calibrate Kindly Architecture',
    difficulty: 2,
    xpReward: 100,
    scenario: {
      title: 'Putting It All Together',
      description: 'Now you understand the basics. Let\'s see how Calibrate Kindly uses all these concepts.',
      symptom: 'Ready to explore the 5 rooms.',
      context: 'Upload → Clean → Store → Brain → Screens represents the full data pipeline.',
    },
    simulation: {
      type: 'observe',
      setup: 'Show complete architecture diagram',
    },
    question: {
      prompt: 'In Calibrate Kindly\'s architecture, which room handles AI analysis of reviews?',
      options: [
        {
          id: 'a',
          text: 'Upload Room - AI validates files',
          isCorrect: false,
          feedback: 'Upload handles file parsing and schema validation, not AI analysis.',
        },
        {
          id: 'b',
          text: 'Store Room - AI is in the database',
          isCorrect: false,
          feedback: 'Store handles PostgreSQL database storage and RLS, not AI.',
        },
        {
          id: 'c',
          text: 'Brain Room - Edge Functions call OpenAI',
          isCorrect: true,
          feedback: 'Correct! The Brain Room represents Supabase Edge Functions that call OpenAI to analyze reviews, calculate MQI scores, and generate recommendations.',
        },
        {
          id: 'd',
          text: 'Screens Room - AI runs in the browser',
          isCorrect: false,
          feedback: 'AI analysis is too expensive to run in browsers. It runs on servers (Edge Functions) and results are displayed in Screens.',
        },
      ],
      correctAnswer: 'c',
      explanation: 'Calibrate Kindly\'s 5 rooms map to real architecture: Upload (data ingestion) → Clean (PII handling) → Store (PostgreSQL) → Brain (AI via Edge Functions) → Screens (React UI). The Brain Room uses 11 Edge Functions that call OpenAI for tasks like scoring review quality and extracting skills. Now you\'re ready to explore each room in depth!',
    },
    hints: [
      { id: 'h1', text: 'Which room has a name that suggests thinking or intelligence?', xpCost: 20 },
    ],
    prerequisites: ['tutorial-7-authentication'],
    skillsTaught: ['tutorial-data-flow'],
  },

  // =========================================================================
  // UPLOAD ROOM CHALLENGES
  // =========================================================================
  {
    id: 'upload-1-schema-mismatch',
    room: 'upload',
    phase: 'operator',
    title: 'The Vanishing Dataset',
    difficulty: 1,
    xpReward: 100,
    scenario: {
      title: 'Dataset Uploaded But Missing',
      description: 'A user reports that they successfully uploaded a CSV file, but the dataset doesn\'t appear in any dashboards.',
      symptom: 'Upload shows "Complete" but data is not visible anywhere in the app.',
      context: 'The admin uploaded performance_reviews.csv which had columns: "name", "feedback", "score", "date"',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show upload completing but with schema validation errors in logs',
    },
    question: {
      prompt: 'Looking at the logs, what is the most likely cause of this issue?',
      options: [
        {
          id: 'a',
          text: 'The file was too large and timed out',
          isCorrect: false,
          feedback: 'The upload completed successfully according to the logs. File size wasn\'t the issue.',
        },
        {
          id: 'b',
          text: 'Column names don\'t match the expected schema',
          isCorrect: true,
          feedback: 'Correct! The CSV has "name, feedback, score, date" but the system expects "reviewer_name, employee_name, review_text, rating, review_date". The schema validation failed.',
        },
        {
          id: 'c',
          text: 'The user doesn\'t have permission to upload',
          isCorrect: false,
          feedback: 'If they didn\'t have permission, the upload would have been blocked entirely, not shown as complete.',
        },
        {
          id: 'd',
          text: 'The database is full',
          isCorrect: false,
          feedback: 'A full database would cause a storage error, not a silent failure after "successful" upload.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'In Calibrate Kindly, datasets must match a specific column schema. The datasets table expects columns like reviewer_name, employee_name, review_text, etc. When column names don\'t match, the validation passes the file format check but fails the schema contract, resulting in no usable data.',
      codeExample: `// Expected columns in datasets table metadata
const EXPECTED_COLUMNS = [
  { name: 'reviewer_name', required: true },
  { name: 'employee_name', required: true },
  { name: 'review_text', required: true },
  { name: 'rating', required: true },
  { name: 'review_date', required: true },
];`,
      ckFileReference: 'src/services/uploadService.ts',
    },
    hints: [
      { id: 'h1', text: 'Look at what columns the system expects vs what the CSV has', xpCost: 20 },
      { id: 'h2', text: 'Check the schema validation logs for "column" or "mapping" errors', xpCost: 30 },
    ],
    prerequisites: [],
    skillsTaught: ['upload-basics', 'upload-schema'],
  },

  {
    id: 'upload-2-missing-required',
    room: 'upload',
    phase: 'operator',
    title: 'The Incomplete Upload',
    difficulty: 2,
    xpReward: 150,
    scenario: {
      title: 'Required Column Missing',
      description: 'Upload fails with a validation error. The CSV looks correct but one critical column is missing.',
      symptom: 'Error: "Required column missing: review_text"',
      context: 'The CSV has: reviewer_name, employee_name, rating, review_date (missing review_text)',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show validation failing on required column check',
    },
    question: {
      prompt: 'What should the user do to fix this upload?',
      options: [
        {
          id: 'a',
          text: 'Add an empty review_text column to the CSV',
          isCorrect: false,
          feedback: 'An empty column would pass validation but result in meaningless data. Reviews need actual text content.',
        },
        {
          id: 'b',
          text: 'Ask the data source to include the review text',
          isCorrect: true,
          feedback: 'Correct! The review_text column contains the actual performance review content. Without it, there\'s nothing to analyze. The data source needs to provide complete records.',
        },
        {
          id: 'c',
          text: 'Change the schema to make review_text optional',
          isCorrect: false,
          feedback: 'Changing the schema would break the analysis pipeline. MQI scoring requires review text.',
        },
        {
          id: 'd',
          text: 'Upload anyway and fix later',
          isCorrect: false,
          feedback: 'The validation exists to prevent bad data from entering the system. Bypassing it causes downstream failures.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Required columns are required for a reason. In CK, review_text is essential because the AI analysis (MQI scoring) needs actual review content to analyze. The validation protects against data that would be useless downstream.',
      ckFileReference: 'src/services/uploadService.ts',
    },
    hints: [
      { id: 'h1', text: 'Think about what happens after upload - what needs the review text?', xpCost: 25 },
    ],
    prerequisites: ['upload-1-schema-mismatch'],
    skillsTaught: ['upload-schema'],
  },

  {
    id: 'upload-3-type-mismatch',
    room: 'upload',
    phase: 'operator',
    title: 'The Wrong Type',
    difficulty: 2,
    xpReward: 150,
    scenario: {
      title: 'Data Type Validation Failure',
      description: 'Upload fails because a column has the wrong data type.',
      symptom: 'Error: "Column rating: expected number, got string"',
      context: 'The rating column contains values like "Excellent", "Good", "Poor" instead of numbers 1-5',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show type validation failing',
    },
    question: {
      prompt: 'The rating column has text values but the system expects numbers. What\'s the best solution?',
      options: [
        {
          id: 'a',
          text: 'Transform the data before upload: Excellent=5, Good=4, Poor=2, etc.',
          isCorrect: true,
          feedback: 'Correct! Data transformation before upload ensures consistency. Map text ratings to numeric values according to a defined scale.',
        },
        {
          id: 'b',
          text: 'Change the database to accept text ratings',
          isCorrect: false,
          feedback: 'This would break aggregations, charts, and comparisons that rely on numeric ratings.',
        },
        {
          id: 'c',
          text: 'Remove the rating column entirely',
          isCorrect: false,
          feedback: 'Rating is a required field and provides valuable quantitative data for analysis.',
        },
        {
          id: 'd',
          text: 'Upload as-is and let the AI interpret the text',
          isCorrect: false,
          feedback: 'The AI analyzes review text, not ratings. The rating column is used for structured analytics.',
        },
      ],
      correctAnswer: 'a',
      explanation: 'Data transformation is a common step in ETL (Extract, Transform, Load) processes. When source data doesn\'t match the target schema, you transform it to fit. This is typically done in a preprocessing step before upload.',
      ckFileReference: 'src/utils/dataTransformers.ts',
    },
    hints: [
      { id: 'h1', text: 'Think about where data transformation should happen', xpCost: 25 },
    ],
    prerequisites: ['upload-1-schema-mismatch'],
    skillsTaught: ['upload-schema'],
  },

  {
    id: 'upload-4-partial-upload',
    room: 'upload',
    phase: 'engineer',
    title: 'The Half-Loaded Dataset',
    difficulty: 3,
    xpReward: 200,
    scenario: {
      title: 'Partial Upload Success',
      description: 'A large dataset upload stopped halfway. 500 of 1000 rows were processed.',
      symptom: 'Upload shows 50% complete, then stops. No error message.',
      context: 'The upload started fine but the browser tab was closed accidentally.',
    },
    simulation: {
      type: 'fix',
      setup: 'Show partial data in database',
    },
    question: {
      prompt: 'How should the system handle this partial upload state?',
      options: [
        {
          id: 'a',
          text: 'Keep the 500 rows and mark dataset as partial',
          isCorrect: false,
          feedback: 'Partial datasets can cause misleading analytics - half the data isn\'t representative.',
        },
        {
          id: 'b',
          text: 'Roll back the entire upload and require re-upload',
          isCorrect: true,
          feedback: 'Correct! Database transactions should be atomic. Either the whole upload succeeds or it\'s rolled back entirely. This prevents partial/inconsistent data.',
        },
        {
          id: 'c',
          text: 'Automatically resume from row 501',
          isCorrect: false,
          feedback: 'Without proper checkpointing, you can\'t reliably know which rows succeeded. Some might be duplicated.',
        },
        {
          id: 'd',
          text: 'Delete the dataset and pretend nothing happened',
          isCorrect: false,
          feedback: 'Silent deletion loses audit trail. Users need to know what happened.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Database transactions ensure atomicity - all or nothing. In CK, uploads should be wrapped in a transaction so that any failure rolls back all changes. This prevents the database from ending up in an inconsistent state.',
      codeExample: `// Transactional upload pattern
const { error } = await supabase.rpc('upload_dataset', {
  rows: data,
  dataset_id: id
});
// If any row fails, entire upload is rolled back`,
      ckFileReference: 'supabase/functions/upload-dataset',
    },
    hints: [
      { id: 'h1', text: 'Think about database transactions and ACID properties', xpCost: 30 },
    ],
    prerequisites: ['upload-2-missing-required', 'upload-3-type-mismatch'],
    skillsTaught: ['upload-debugging'],
  },

  {
    id: 'upload-5-encoding-issue',
    room: 'upload',
    phase: 'engineer',
    title: 'The Garbled Text',
    difficulty: 3,
    xpReward: 200,
    scenario: {
      title: 'Character Encoding Problem',
      description: 'Reviews uploaded successfully but contain garbled characters like "donâ€™t" instead of "don\'t".',
      symptom: 'Text displays incorrectly with strange symbols replacing apostrophes and quotes.',
      context: 'The CSV was exported from Excel and contains smart quotes.',
    },
    simulation: {
      type: 'fix',
      setup: 'Show garbled text in review data',
    },
    question: {
      prompt: 'What caused the garbled text and how should it be fixed?',
      options: [
        {
          id: 'a',
          text: 'The database doesn\'t support unicode - upgrade it',
          isCorrect: false,
          feedback: 'PostgreSQL supports unicode fine. The issue is earlier in the pipeline.',
        },
        {
          id: 'b',
          text: 'File encoding mismatch - ensure UTF-8 encoding on upload',
          isCorrect: true,
          feedback: 'Correct! The file was likely saved as Windows-1252 but read as UTF-8. Always validate and convert to UTF-8 during parsing.',
        },
        {
          id: 'c',
          text: 'The AI corrupted the text during analysis',
          isCorrect: false,
          feedback: 'AI analysis happens after storage. The corruption is visible before analysis.',
        },
        {
          id: 'd',
          text: 'Replace all special characters with ASCII equivalents',
          isCorrect: false,
          feedback: 'This loses information. Names with accents, quotes, etc. should be preserved correctly.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Character encoding issues occur when a file is saved in one encoding (like Windows-1252) but read as another (UTF-8). The upload parser should detect encoding and convert to UTF-8, or require UTF-8 input.',
      codeExample: `// Detect and convert encoding
import { detect } from 'chardet';
const encoding = detect(buffer);
const text = iconv.decode(buffer, encoding || 'utf-8');`,
      ckFileReference: 'src/services/fileParser.ts',
    },
    hints: [
      { id: 'h1', text: 'Smart quotes (") are different from straight quotes (")', xpCost: 25 },
      { id: 'h2', text: 'Excel often saves files in Windows-1252 encoding', xpCost: 35 },
    ],
    prerequisites: ['upload-4-partial-upload'],
    skillsTaught: ['upload-debugging'],
  },

  // =========================================================================
  // CLEAN ROOM CHALLENGES
  // =========================================================================
  {
    id: 'clean-1-pii-exposure',
    room: 'clean',
    phase: 'operator',
    title: 'The Exposed Names',
    difficulty: 1,
    xpReward: 100,
    scenario: {
      title: 'PII Visible to Wrong Users',
      description: 'A TD (Talent Development) user reports they can see employee names in the review data. They should only see anonymised identifiers.',
      symptom: 'TD user sees "John Smith" instead of "EMP_A3F2B1"',
      context: 'The TD role should only access sanitized_data, not raw_data',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show raw_data being accessed instead of sanitized_data',
    },
    question: {
      prompt: 'Where is the bug that\'s causing PII exposure?',
      options: [
        {
          id: 'a',
          text: 'The RLS policy is wrong - it should block TD users entirely',
          isCorrect: false,
          feedback: 'TD users should access the data, just not the raw_data field. Blocking entirely would break their workflow.',
        },
        {
          id: 'b',
          text: 'The frontend is reading raw_data instead of sanitized_data for non-admin users',
          isCorrect: true,
          feedback: 'Correct! The query or component is fetching the wrong field. Non-admin users should only ever query sanitized_data.',
        },
        {
          id: 'c',
          text: 'The sanitisation pipeline didn\'t run',
          isCorrect: false,
          feedback: 'If sanitisation hadn\'t run, sanitized_data would be empty/null, not just unused.',
        },
        {
          id: 'd',
          text: 'The user hacked their role to admin',
          isCorrect: false,
          feedback: 'While possible, the simpler explanation is a code bug. Always check the obvious first.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'In CK, dataset_reviews has both raw_data and sanitized_data columns. The frontend must check user role and fetch the appropriate field. This is defense-in-depth - even if RLS is bypassed, the query shouldn\'t request raw data.',
      codeExample: `// Correct pattern
const dataField = user.role === 'admin'
  ? 'raw_data'
  : 'sanitized_data';

const { data } = await supabase
  .from('dataset_reviews')
  .select(\`id, \${dataField}\`);`,
      ckFileReference: 'src/services/reviewService.ts',
    },
    hints: [
      { id: 'h1', text: 'Look at what field is being queried based on user role', xpCost: 20 },
    ],
    prerequisites: [],
    skillsTaught: ['clean-basics'],
  },

  {
    id: 'clean-2-email-leak',
    room: 'clean',
    phase: 'operator',
    title: 'The Hidden Email',
    difficulty: 2,
    xpReward: 150,
    scenario: {
      title: 'Email Address in Review Text',
      description: 'A review contains "Contact sarah.jones@company.com for details" - the email wasn\'t redacted.',
      symptom: 'PII (email) visible in review text field',
      context: 'The sanitisation ran but missed embedded PII in free text',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show email visible in sanitized review text',
    },
    question: {
      prompt: 'Why did the email slip through sanitisation?',
      options: [
        {
          id: 'a',
          text: 'The email detection regex pattern is too strict',
          isCorrect: true,
          feedback: 'Correct! The regex might only catch obvious patterns. Email formats vary and need comprehensive detection.',
        },
        {
          id: 'b',
          text: 'Emails in review_text aren\'t supposed to be redacted',
          isCorrect: false,
          feedback: 'All PII should be redacted, regardless of which field it appears in.',
        },
        {
          id: 'c',
          text: 'The sanitisation only runs on dedicated PII columns',
          isCorrect: false,
          feedback: 'Free text fields are the most likely place for embedded PII and must be scanned.',
        },
        {
          id: 'd',
          text: 'It\'s the user\'s fault for including emails in reviews',
          isCorrect: false,
          feedback: 'Users will always include unexpected data. The system must handle it.',
        },
      ],
      correctAnswer: 'a',
      explanation: 'PII detection in free text requires robust pattern matching. Emails, phone numbers, and names can appear in many formats. The sanitisation pipeline needs comprehensive regex patterns and potentially NLP-based detection.',
      codeExample: `// Comprehensive email regex
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;

// Better: multiple patterns
const sanitizeText = (text: string) => {
  return text
    .replace(EMAIL_PATTERN, '[EMAIL_REDACTED]')
    .replace(PHONE_PATTERN, '[PHONE_REDACTED]');
};`,
      ckFileReference: 'src/utils/sanitisation.ts',
    },
    hints: [
      { id: 'h1', text: 'Think about all the places PII can hide in free text', xpCost: 25 },
    ],
    prerequisites: ['clean-1-pii-exposure'],
    skillsTaught: ['clean-pii'],
  },

  {
    id: 'clean-3-name-visible',
    room: 'clean',
    phase: 'operator',
    title: 'The Named Reference',
    difficulty: 2,
    xpReward: 150,
    scenario: {
      title: 'Name Mentioned in Review Text',
      description: 'Review text says "Great work by Sarah on the project" - the name wasn\'t caught by sanitisation.',
      symptom: 'Employee name visible in review text after sanitisation',
      context: 'Names are harder to detect than structured PII like emails',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show name visible in sanitized review text',
    },
    question: {
      prompt: 'How should the system detect and remove names from review text?',
      options: [
        {
          id: 'a',
          text: 'Maintain a list of all employee names and search for them',
          isCorrect: true,
          feedback: 'Correct! Cross-reference with the known employee list. Any name from the dataset\'s employees should be redacted from review text.',
        },
        {
          id: 'b',
          text: 'Use AI to detect all proper nouns',
          isCorrect: false,
          feedback: 'AI/NLP can help but has false positives (company names, product names). A known-list approach is more reliable.',
        },
        {
          id: 'c',
          text: 'Remove all capitalised words',
          isCorrect: false,
          feedback: 'This would destroy too much content - sentence starts, acronyms, etc.',
        },
        {
          id: 'd',
          text: 'Ask reviewers to avoid using names',
          isCorrect: false,
          feedback: 'Relying on user behavior for security never works. The system must handle it.',
        },
      ],
      correctAnswer: 'a',
      explanation: 'The most reliable way to catch names is to build a list from the dataset itself. Extract all employee_name and reviewer_name values, then search/replace in all text fields.',
      codeExample: `// Name-aware sanitisation
const employeeNames = dataset.reviews.map(r => r.employee_name);
const reviewerNames = dataset.reviews.map(r => r.reviewer_name);
const allNames = [...new Set([...employeeNames, ...reviewerNames])];

const sanitizeNames = (text: string) => {
  let result = text;
  for (const name of allNames) {
    const pattern = new RegExp(name, 'gi');
    result = result.replace(pattern, '[NAME_REDACTED]');
  }
  return result;
};`,
      ckFileReference: 'src/utils/sanitisation.ts',
    },
    hints: [
      { id: 'h1', text: 'You already have a list of names in the dataset...', xpCost: 20 },
    ],
    prerequisites: ['clean-2-email-leak'],
    skillsTaught: ['clean-pii'],
  },

  {
    id: 'clean-4-inconsistent-anon',
    room: 'clean',
    phase: 'engineer',
    title: 'The Inconsistent IDs',
    difficulty: 3,
    xpReward: 200,
    scenario: {
      title: 'Same Person, Different IDs',
      description: 'Employee "John Smith" appears as "EMP_A1B2" in some reviews and "EMP_X9Y8" in others.',
      symptom: 'Inconsistent anonymised IDs for the same person across the dataset',
      context: 'Analytics are wrong because one person is counted as two',
    },
    simulation: {
      type: 'fix',
      setup: 'Show same name with different anonymous IDs',
    },
    question: {
      prompt: 'What\'s causing inconsistent anonymised IDs?',
      options: [
        {
          id: 'a',
          text: 'The hash function is using a random salt each time',
          isCorrect: true,
          feedback: 'Correct! Hashing must use a consistent salt per dataset to ensure the same input always produces the same output.',
        },
        {
          id: 'b',
          text: 'There are actually two different John Smiths',
          isCorrect: false,
          feedback: 'The scenario states it\'s the same person. The anonymisation is the problem.',
        },
        {
          id: 'c',
          text: 'The IDs were assigned manually',
          isCorrect: false,
          feedback: 'Manual assignment wouldn\'t be random like this. It\'s algorithmic.',
        },
        {
          id: 'd',
          text: 'The database is corrupting the IDs',
          isCorrect: false,
          feedback: 'Database corruption would show different symptoms (errors, crashes).',
        },
      ],
      correctAnswer: 'a',
      explanation: 'Deterministic anonymisation requires consistent hashing. Use a dataset-specific salt that\'s stored and reused. This ensures "John Smith" always becomes "EMP_A1B2" within that dataset.',
      codeExample: `// Consistent hashing with dataset salt
const anonymise = (name: string, datasetSalt: string) => {
  const hash = crypto
    .createHash('sha256')
    .update(name + datasetSalt)
    .digest('hex')
    .substring(0, 8);
  return \`EMP_\${hash.toUpperCase()}\`;
};

// Salt is generated once per dataset and stored
const datasetSalt = dataset.metadata.anonymisation_salt;`,
      ckFileReference: 'src/utils/anonymisation.ts',
    },
    hints: [
      { id: 'h1', text: 'Hash functions need the same input to produce the same output', xpCost: 30 },
      { id: 'h2', text: 'A "salt" can make hashing more secure but must be consistent', xpCost: 40 },
    ],
    prerequisites: ['clean-2-email-leak', 'clean-3-name-visible'],
    skillsTaught: ['clean-anonymisation'],
  },

  {
    id: 'clean-5-reversible-hash',
    room: 'clean',
    phase: 'engineer',
    title: 'The Reversible Anonymisation',
    difficulty: 4,
    xpReward: 250,
    scenario: {
      title: 'Anonymisation Can Be Reversed',
      description: 'Security audit reveals that anonymous IDs can be reversed to find the original name.',
      symptom: 'Given "EMP_A1B2", an attacker can determine the original name',
      context: 'The anonymisation used a predictable pattern',
    },
    simulation: {
      type: 'design',
      setup: 'Show how the weak anonymisation can be reversed',
    },
    question: {
      prompt: 'What makes the current anonymisation reversible?',
      options: [
        {
          id: 'a',
          text: 'Using a simple encoding (Base64) instead of hashing',
          isCorrect: true,
          feedback: 'Correct! Base64 is encoding, not hashing. It\'s completely reversible. Always use one-way cryptographic hashes for anonymisation.',
        },
        {
          id: 'b',
          text: 'The hash is too short',
          isCorrect: false,
          feedback: 'Hash length affects collision probability, not reversibility. Even short hashes are one-way.',
        },
        {
          id: 'c',
          text: 'The salt was leaked',
          isCorrect: false,
          feedback: 'A leaked salt doesn\'t make hashing reversible - you\'d still need to brute force.',
        },
        {
          id: 'd',
          text: 'The database stores both raw and anonymised',
          isCorrect: false,
          feedback: 'Storing both is normal for admin access. The issue is the algorithm itself.',
        },
      ],
      correctAnswer: 'a',
      explanation: 'Encoding (Base64, URL encoding) is reversible by design. Hashing (SHA-256, bcrypt) is one-way. For anonymisation, always use cryptographic hashes. The only way to "reverse" them is rainbow tables or brute force.',
      codeExample: `// WRONG - Reversible!
const anonymise = (name) => btoa(name); // Base64 encoding
// atob('Sm9obiBTbWl0aA==') = 'John Smith'

// CORRECT - One-way hash
const anonymise = (name, salt) => {
  return crypto
    .createHash('sha256')
    .update(name + salt)
    .digest('hex');
};`,
      ckFileReference: 'src/utils/anonymisation.ts',
    },
    hints: [
      { id: 'h1', text: 'What\'s the difference between encoding and hashing?', xpCost: 30 },
    ],
    prerequisites: ['clean-4-inconsistent-anon'],
    skillsTaught: ['clean-anonymisation'],
  },

  // =========================================================================
  // STORE ROOM CHALLENGES
  // =========================================================================
  {
    id: 'store-1-table-structure',
    room: 'store',
    phase: 'operator',
    title: 'The Table Map',
    difficulty: 1,
    xpReward: 100,
    scenario: {
      title: 'Understanding the Schema',
      description: 'You need to understand how data is organized in Calibrate Kindly.',
      symptom: 'N/A - This is a learning challenge',
      context: 'The core tables are: users, datasets, dataset_reviews',
    },
    simulation: {
      type: 'observe',
      setup: 'Show the database schema visualization',
    },
    question: {
      prompt: 'Which table stores the actual performance review content?',
      options: [
        {
          id: 'a',
          text: 'users',
          isCorrect: false,
          feedback: 'users stores user accounts and roles, not review content.',
        },
        {
          id: 'b',
          text: 'datasets',
          isCorrect: false,
          feedback: 'datasets stores metadata about uploaded files, not the individual reviews.',
        },
        {
          id: 'c',
          text: 'dataset_reviews',
          isCorrect: true,
          feedback: 'Correct! dataset_reviews contains the individual review records with raw_data and sanitized_data columns.',
        },
        {
          id: 'd',
          text: 'reviews',
          isCorrect: false,
          feedback: 'There is no "reviews" table. The table is called "dataset_reviews".',
        },
      ],
      correctAnswer: 'c',
      explanation: 'The three core tables have distinct purposes: users (authentication & roles), datasets (upload metadata), dataset_reviews (the actual review content and analysis results).',
      ckFileReference: 'supabase/migrations/',
    },
    hints: [
      { id: 'h1', text: 'Look at the table names in the Store Room visualization', xpCost: 10 },
    ],
    prerequisites: [],
    skillsTaught: ['store-basics'],
  },

  {
    id: 'store-2-rls-block',
    room: 'store',
    phase: 'operator',
    title: 'The Blocked Query',
    difficulty: 2,
    xpReward: 150,
    scenario: {
      title: 'RLS Denying Access',
      description: 'A manager tries to view reviews but gets an empty result set.',
      symptom: 'Query returns 0 rows, but admin sees 100 rows in the same table',
      context: 'RLS policy is filtering based on organization_id',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show RLS blocking query with different user roles',
    },
    question: {
      prompt: 'Why does the manager see 0 rows while admin sees 100?',
      options: [
        {
          id: 'a',
          text: 'The manager\'s account is broken',
          isCorrect: false,
          feedback: 'The account works - it\'s just filtered differently.',
        },
        {
          id: 'b',
          text: 'RLS policies filter rows by organization_id automatically',
          isCorrect: true,
          feedback: 'Correct! RLS ensures users only see data from their organization. The manager might be in a different org, or the data hasn\'t been associated with their org.',
        },
        {
          id: 'c',
          text: 'Managers don\'t have SELECT permission',
          isCorrect: false,
          feedback: 'If they had no SELECT permission, they\'d get an error, not an empty result.',
        },
        {
          id: 'd',
          text: 'The table is actually empty',
          isCorrect: false,
          feedback: 'Admin sees 100 rows, so the table isn\'t empty.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Row-Level Security in Supabase filters results automatically based on policies. A common policy is organization isolation: users only see rows where organization_id matches their own. This happens at the database level, invisible to the application.',
      codeExample: `-- RLS Policy example
CREATE POLICY "Users see own org data"
ON dataset_reviews
FOR SELECT
USING (
  organization_id = auth.jwt() ->> 'organization_id'
);`,
      ckFileReference: 'supabase/migrations/rls_policies.sql',
    },
    hints: [
      { id: 'h1', text: 'Check what organization each user belongs to', xpCost: 25 },
    ],
    prerequisites: ['store-1-table-structure'],
    skillsTaught: ['store-rls'],
  },

  {
    id: 'store-3-wrong-org',
    room: 'store',
    phase: 'operator',
    title: 'The Cross-Org Leak',
    difficulty: 2,
    xpReward: 150,
    scenario: {
      title: 'Data From Wrong Organization',
      description: 'User from Company A sees reviews from Company B.',
      symptom: 'Cross-organization data leak',
      context: 'This is a critical security issue',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show data leak scenario',
    },
    question: {
      prompt: 'What could cause cross-organization data to leak?',
      options: [
        {
          id: 'a',
          text: 'RLS policy has a bug in the organization check',
          isCorrect: true,
          feedback: 'Correct! If the RLS policy doesn\'t correctly check organization_id, data can leak. This could be a typo, wrong column reference, or missing policy.',
        },
        {
          id: 'b',
          text: 'The user guessed the other organization\'s ID',
          isCorrect: false,
          feedback: 'Even if they knew the ID, RLS should prevent access. The policy is the issue.',
        },
        {
          id: 'c',
          text: 'The frontend is fetching all data',
          isCorrect: false,
          feedback: 'The frontend can try to fetch anything - RLS should block it at the database level.',
        },
        {
          id: 'd',
          text: 'The two companies share a database',
          isCorrect: false,
          feedback: 'Multi-tenant databases are normal. RLS is specifically designed for this.',
        },
      ],
      correctAnswer: 'a',
      explanation: 'RLS policies are the last line of defense for data isolation. A bug in the policy (wrong column, missing condition, disabled policy) can cause catastrophic data leaks. Always test RLS with multiple users/orgs.',
      codeExample: `-- Buggy policy (missing WHERE)
CREATE POLICY "broken" ON dataset_reviews
FOR SELECT USING (true); -- Allows ALL rows!

-- Correct policy
CREATE POLICY "org_isolation" ON dataset_reviews
FOR SELECT USING (
  organization_id = auth.jwt() ->> 'organization_id'
);`,
      ckFileReference: 'supabase/migrations/rls_policies.sql',
    },
    hints: [
      { id: 'h1', text: 'RLS policies can have bugs just like application code', xpCost: 25 },
    ],
    prerequisites: ['store-2-rls-block'],
    skillsTaught: ['store-rls'],
  },

  {
    id: 'store-4-stale-cache',
    room: 'store',
    phase: 'engineer',
    title: 'The Stale Dashboard',
    difficulty: 3,
    xpReward: 200,
    scenario: {
      title: 'Dashboard Shows Old Data',
      description: 'User uploads new dataset but dashboard still shows yesterday\'s numbers.',
      symptom: 'Data in UI doesn\'t match database',
      context: 'The frontend caches query results for performance',
    },
    simulation: {
      type: 'fix',
      setup: 'Show stale cache vs fresh database data',
    },
    question: {
      prompt: 'The dashboard shows old data after a new upload. What\'s the fix?',
      options: [
        {
          id: 'a',
          text: 'Tell users to hard refresh the page',
          isCorrect: false,
          feedback: 'This is a workaround, not a fix. Users shouldn\'t need to do this.',
        },
        {
          id: 'b',
          text: 'Disable caching entirely',
          isCorrect: false,
          feedback: 'This would hurt performance. Caching is good, just needs proper invalidation.',
        },
        {
          id: 'c',
          text: 'Invalidate relevant cache entries when data changes',
          isCorrect: true,
          feedback: 'Correct! When a dataset is uploaded, the cache for that dataset\'s queries should be invalidated. This triggers a fresh fetch.',
        },
        {
          id: 'd',
          text: 'Set cache timeout to 1 second',
          isCorrect: false,
          feedback: 'Very short TTL defeats the purpose of caching. Invalidation is better.',
        },
      ],
      correctAnswer: 'c',
      explanation: 'Cache invalidation is "one of the two hard problems in computer science." When data changes, you must identify and invalidate all cached queries that depend on that data. In CK, uploading a dataset should invalidate dashboard caches.',
      codeExample: `// After successful upload
await uploadDataset(file);

// Invalidate related caches
queryClient.invalidateQueries(['datasets']);
queryClient.invalidateQueries(['reviews', datasetId]);
queryClient.invalidateQueries(['analytics', datasetId]);`,
      ckFileReference: 'src/services/cacheService.ts',
    },
    hints: [
      { id: 'h1', text: 'What happens to cached data when source data changes?', xpCost: 30 },
    ],
    prerequisites: ['store-2-rls-block', 'store-3-wrong-org'],
    skillsTaught: ['store-caching'],
  },

  {
    id: 'store-5-cache-miss',
    room: 'store',
    phase: 'engineer',
    title: 'The Slow Dashboard',
    difficulty: 3,
    xpReward: 200,
    scenario: {
      title: 'Dashboard Loads Slowly',
      description: 'Every page load takes 3+ seconds, even when viewing the same data.',
      symptom: 'Cache never hits, always fetches fresh data',
      context: 'The cache key is wrong so lookups always miss',
    },
    simulation: {
      type: 'fix',
      setup: 'Show cache misses in logs',
    },
    question: {
      prompt: 'The cache shows 0% hit rate. What\'s likely wrong?',
      options: [
        {
          id: 'a',
          text: 'The cache is too small',
          isCorrect: false,
          feedback: 'Size would cause evictions, not 0% hits. The keys are the issue.',
        },
        {
          id: 'b',
          text: 'Cache keys include timestamps, so they\'re always unique',
          isCorrect: true,
          feedback: 'Correct! If the cache key includes Date.now() or similar, every request has a unique key and will never hit existing cache.',
        },
        {
          id: 'c',
          text: 'The cache server is down',
          isCorrect: false,
          feedback: 'If the server was down, you\'d see errors, not misses.',
        },
        {
          id: 'd',
          text: 'Users are all requesting different data',
          isCorrect: false,
          feedback: 'Same user, same data, same page - should hit cache.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Cache keys must be deterministic and based only on the query parameters that affect the result. Including timestamps, random IDs, or other varying data guarantees cache misses.',
      codeExample: `// WRONG - Key changes every time
const cacheKey = \`reviews-\${datasetId}-\${Date.now()}\`;

// CORRECT - Deterministic key
const cacheKey = \`reviews-\${datasetId}\`;

// If you need freshness, use cache invalidation instead`,
      ckFileReference: 'src/services/cacheService.ts',
    },
    hints: [
      { id: 'h1', text: 'What makes a good cache key?', xpCost: 25 },
      { id: 'h2', text: 'Check if the key includes anything that changes per request', xpCost: 35 },
    ],
    prerequisites: ['store-4-stale-cache'],
    skillsTaught: ['store-caching'],
  },

  // =========================================================================
  // BRAIN ROOM CHALLENGES
  // =========================================================================
  {
    id: 'brain-1-function-overview',
    room: 'brain',
    phase: 'operator',
    title: 'The Edge Function Map',
    difficulty: 1,
    xpReward: 100,
    scenario: {
      title: 'Understanding Edge Functions',
      description: 'Learn what each Edge Function does in the analysis pipeline.',
      symptom: 'N/A - Learning challenge',
      context: 'Edge Functions are serverless functions that run on Supabase infrastructure',
    },
    simulation: {
      type: 'observe',
      setup: 'Show the Edge Functions in the Brain Room',
    },
    question: {
      prompt: 'Which Edge Function is responsible for calculating MQI scores?',
      options: [
        {
          id: 'a',
          text: 'check-quota',
          isCorrect: false,
          feedback: 'check-quota monitors API usage limits, not scoring.',
        },
        {
          id: 'b',
          text: 'analyze-review',
          isCorrect: true,
          feedback: 'Correct! analyze-review sends review text to OpenAI and receives the MQI (Manager Quality Index) score back.',
        },
        {
          id: 'c',
          text: 'generate-recommendations',
          isCorrect: false,
          feedback: 'generate-recommendations uses the scores to create improvement suggestions.',
        },
        {
          id: 'd',
          text: 'batch-analyze-reviews',
          isCorrect: false,
          feedback: 'batch-analyze-reviews calls analyze-review multiple times, but the actual scoring is in analyze-review.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'The analyze-review function takes a single review, sends it to OpenAI with a scoring prompt, and returns the MQI score. batch-analyze-reviews orchestrates calling this for multiple reviews.',
      ckFileReference: 'supabase/functions/analyze-review',
    },
    hints: [
      { id: 'h1', text: 'Look at the function names and descriptions', xpCost: 10 },
    ],
    prerequisites: [],
    skillsTaught: ['brain-basics'],
  },

  {
    id: 'brain-2-mqi-scoring',
    room: 'brain',
    phase: 'operator',
    title: 'The Missing Scores',
    difficulty: 2,
    xpReward: 150,
    scenario: {
      title: 'MQI Scores Not Appearing',
      description: 'Reviews are uploaded and sanitised but MQI scores are all null.',
      symptom: 'mqi_score column is null for all reviews',
      context: 'The analysis pipeline needs to be triggered after upload',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show reviews with null mqi_score',
    },
    question: {
      prompt: 'Why are MQI scores null after upload?',
      options: [
        {
          id: 'a',
          text: 'OpenAI is down',
          isCorrect: false,
          feedback: 'If OpenAI was down, you\'d see errors, not null scores.',
        },
        {
          id: 'b',
          text: 'The analysis pipeline wasn\'t triggered',
          isCorrect: true,
          feedback: 'Correct! Upload and analysis are separate steps. After upload, the batch-analyze-reviews function must be called to process the reviews.',
        },
        {
          id: 'c',
          text: 'The reviews have no text content',
          isCorrect: false,
          feedback: 'Missing text would cause analysis errors, not null scores.',
        },
        {
          id: 'd',
          text: 'The score column doesn\'t exist',
          isCorrect: false,
          feedback: 'The column exists (it\'s in the schema), it\'s just null.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Upload and analysis are decoupled by design. This allows: 1) Uploads without waiting for AI, 2) Re-analysis without re-upload, 3) Cost control over AI usage. Admin must explicitly trigger analysis.',
      codeExample: `// After upload completes
await uploadDataset(file);

// Trigger analysis separately
await supabase.functions.invoke('batch-analyze-reviews', {
  body: { dataset_id: datasetId }
});`,
      ckFileReference: 'src/pages/AdminUpload.tsx',
    },
    hints: [
      { id: 'h1', text: 'Upload and analysis are two different operations', xpCost: 25 },
    ],
    prerequisites: ['brain-1-function-overview'],
    skillsTaught: ['brain-analysis'],
  },

  {
    id: 'brain-3-batch-processing',
    room: 'brain',
    phase: 'operator',
    title: 'The Slow Analysis',
    difficulty: 2,
    xpReward: 150,
    scenario: {
      title: 'Analysis Taking Too Long',
      description: 'Analyzing 1000 reviews takes over an hour.',
      symptom: 'Very slow batch processing',
      context: 'Each review requires an API call to OpenAI',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show slow sequential processing',
    },
    question: {
      prompt: 'Why is analyzing 1000 reviews so slow?',
      options: [
        {
          id: 'a',
          text: 'OpenAI is rate limiting our requests',
          isCorrect: false,
          feedback: 'Rate limiting would cause errors/retries, not just slowness.',
        },
        {
          id: 'b',
          text: 'Reviews are being processed sequentially, one at a time',
          isCorrect: true,
          feedback: 'Correct! If each review waits for the previous to complete, 1000 reviews × 1 second = 1000+ seconds. Batch processing with concurrency is needed.',
        },
        {
          id: 'c',
          text: 'The database is slow',
          isCorrect: false,
          feedback: 'Database writes are fast. The AI API call is the bottleneck.',
        },
        {
          id: 'd',
          text: 'The reviews are too long',
          isCorrect: false,
          feedback: 'Review length affects per-call time but not the overall pattern.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Sequential processing (one after another) is simple but slow. Batch processing with controlled concurrency (e.g., 10 parallel requests) dramatically improves throughput while respecting API limits.',
      codeExample: `// Sequential (slow)
for (const review of reviews) {
  await analyzeReview(review); // 1 sec each = 1000 sec total
}

// Parallel batches (faster)
const BATCH_SIZE = 10;
for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
  const batch = reviews.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(analyzeReview));
  // 10 concurrent = ~100 sec total
}`,
      ckFileReference: 'supabase/functions/batch-analyze-reviews',
    },
    hints: [
      { id: 'h1', text: 'How many API calls can run at the same time?', xpCost: 25 },
    ],
    prerequisites: ['brain-2-mqi-scoring'],
    skillsTaught: ['brain-analysis'],
  },

  {
    id: 'brain-4-partial-failure',
    room: 'brain',
    phase: 'engineer',
    title: 'The Half-Scored Dataset',
    difficulty: 3,
    xpReward: 200,
    scenario: {
      title: 'Partial Analysis Completion',
      description: 'Batch analysis stopped at 60%. 400 of 1000 reviews have scores.',
      symptom: 'analysis_status shows "partial", some reviews scored, some not',
      context: 'The OpenAI API timed out mid-batch',
    },
    simulation: {
      type: 'fix',
      setup: 'Show partial scoring state',
    },
    question: {
      prompt: 'How should the system handle partial analysis completion?',
      options: [
        {
          id: 'a',
          text: 'Delete all scores and start over',
          isCorrect: false,
          feedback: 'This wastes the successful analysis and costs more API calls.',
        },
        {
          id: 'b',
          text: 'Mark dataset as failed and block usage',
          isCorrect: false,
          feedback: 'The 400 scored reviews are still valuable. Don\'t block them.',
        },
        {
          id: 'c',
          text: 'Track progress and allow retry of only failed/pending reviews',
          isCorrect: true,
          feedback: 'Correct! Mark each review\'s analysis_status. On retry, only process reviews where status is "pending" or "failed". This is resumable processing.',
        },
        {
          id: 'd',
          text: 'Show scores for completed reviews, ignore the rest',
          isCorrect: false,
          feedback: 'Users need all reviews scored for accurate analytics. Partial data is misleading.',
        },
      ],
      correctAnswer: 'c',
      explanation: 'Resumable batch processing tracks status per-item. Each review has analysis_status: pending → processing → completed/failed. Retry only processes pending/failed items, preserving successful work.',
      codeExample: `// Resumable batch processing
const pendingReviews = await supabase
  .from('dataset_reviews')
  .select('*')
  .eq('dataset_id', datasetId)
  .in('analysis_status', ['pending', 'failed']);

for (const review of pendingReviews) {
  try {
    await analyzeReview(review);
    await updateStatus(review.id, 'completed');
  } catch (error) {
    await updateStatus(review.id, 'failed');
  }
}`,
      ckFileReference: 'supabase/functions/batch-analyze-reviews',
    },
    hints: [
      { id: 'h1', text: 'How do you know which reviews still need processing?', xpCost: 30 },
    ],
    prerequisites: ['brain-2-mqi-scoring', 'brain-3-batch-processing'],
    skillsTaught: ['brain-failures'],
  },

  {
    id: 'brain-5-quota-exceeded',
    room: 'brain',
    phase: 'engineer',
    title: 'The Quota Wall',
    difficulty: 4,
    xpReward: 250,
    scenario: {
      title: 'API Quota Exceeded',
      description: 'Analysis stops with "Quota exceeded" error. 50% of reviews unscored.',
      symptom: 'OpenAI returns 429 errors, batch stops',
      context: 'Monthly API budget has been exhausted',
    },
    simulation: {
      type: 'design',
      setup: 'Show quota exceeded state',
    },
    question: {
      prompt: 'What\'s the best strategy for handling quota exhaustion?',
      options: [
        {
          id: 'a',
          text: 'Automatically increase the API budget',
          isCorrect: false,
          feedback: 'Automatic budget increases can lead to runaway costs. Needs human approval.',
        },
        {
          id: 'b',
          text: 'Queue remaining reviews and process when quota resets',
          isCorrect: true,
          feedback: 'Correct! Mark reviews as "queued", notify admin, and automatically resume when quota resets (usually monthly). This handles the constraint gracefully.',
        },
        {
          id: 'c',
          text: 'Skip AI analysis and use a fallback scoring algorithm',
          isCorrect: false,
          feedback: 'Fallback scoring would give inconsistent/unreliable results.',
        },
        {
          id: 'd',
          text: 'Delete the dataset since it can\'t be fully analyzed',
          isCorrect: false,
          feedback: 'The upload and partial analysis are still valuable. Don\'t discard work.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Quota management is a business constraint, not a technical failure. Track quota usage, warn before exhaustion, queue work when exceeded, and resume automatically. Admins should be notified to approve budget increases.',
      codeExample: `// Check quota before processing
const quota = await checkQuota();
if (quota.remaining < estimatedCost) {
  await queueForLater(reviews);
  await notifyAdmin('Quota exceeded', {
    remaining: quota.remaining,
    needed: estimatedCost,
    resetDate: quota.resetDate
  });
  return { status: 'queued', reason: 'quota_exceeded' };
}`,
      ckFileReference: 'supabase/functions/check-quota',
    },
    hints: [
      { id: 'h1', text: 'Think about this as a business constraint, not a bug', xpCost: 30 },
      { id: 'h2', text: 'When does the quota reset? Can you wait?', xpCost: 40 },
    ],
    prerequisites: ['brain-4-partial-failure'],
    skillsTaught: ['brain-failures'],
  },

  // =========================================================================
  // SCREENS ROOM CHALLENGES
  // =========================================================================
  {
    id: 'screens-1-component-overview',
    room: 'screens',
    phase: 'operator',
    title: 'The Component Map',
    difficulty: 1,
    xpReward: 100,
    scenario: {
      title: 'Understanding the Frontend',
      description: 'Learn how pages and components are structured in Calibrate Kindly.',
      symptom: 'N/A - Learning challenge',
      context: 'The app has pages (routes) that contain reusable components',
    },
    simulation: {
      type: 'observe',
      setup: 'Show the Screens Room component visualization',
    },
    question: {
      prompt: 'Which component is responsible for letting users choose which dataset to view?',
      options: [
        {
          id: 'a',
          text: 'ReviewsTable',
          isCorrect: false,
          feedback: 'ReviewsTable displays review data, it doesn\'t select datasets.',
        },
        {
          id: 'b',
          text: 'MQIChart',
          isCorrect: false,
          feedback: 'MQIChart visualizes scores, it doesn\'t handle dataset selection.',
        },
        {
          id: 'c',
          text: 'DatasetSelector',
          isCorrect: true,
          feedback: 'Correct! DatasetSelector is the dropdown that lets users pick which dataset to analyze.',
        },
        {
          id: 'd',
          text: 'FileUploader',
          isCorrect: false,
          feedback: 'FileUploader handles uploads, not viewing existing datasets.',
        },
      ],
      correctAnswer: 'c',
      explanation: 'The DatasetSelector component appears on analysis pages and controls which dataset\'s data is displayed. When selection changes, it updates the DatasetsContext, which triggers other components to re-fetch.',
      ckFileReference: 'src/components/DatasetSelector.tsx',
    },
    hints: [
      { id: 'h1', text: 'Look at the component names - which sounds like it selects?', xpCost: 10 },
    ],
    prerequisites: [],
    skillsTaught: ['screens-basics'],
  },

  {
    id: 'screens-2-context-loading',
    room: 'screens',
    phase: 'operator',
    title: 'The Loading State',
    difficulty: 2,
    xpReward: 150,
    scenario: {
      title: 'Understanding Data Loading',
      description: 'Learn how React contexts load and provide data to components.',
      symptom: 'N/A - Learning challenge',
      context: 'Data flows: API → Context → Components',
    },
    simulation: {
      type: 'observe',
      setup: 'Show contexts loading in sequence',
    },
    question: {
      prompt: 'Why do contexts load in a specific order (User → Datasets → Reviews)?',
      options: [
        {
          id: 'a',
          text: 'It\'s random, just how React works',
          isCorrect: false,
          feedback: 'The order is intentional and based on data dependencies.',
        },
        {
          id: 'b',
          text: 'Later contexts depend on data from earlier contexts',
          isCorrect: true,
          feedback: 'Correct! Datasets need user\'s org_id to filter. Reviews need dataset_id to fetch. Each context depends on the previous.',
        },
        {
          id: 'c',
          text: 'Alphabetical order',
          isCorrect: false,
          feedback: 'U-D-R isn\'t alphabetical. The order is based on dependencies.',
        },
        {
          id: 'd',
          text: 'Smallest data first for performance',
          isCorrect: false,
          feedback: 'Data size doesn\'t determine the order. Dependencies do.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Data loading follows dependency chains: 1) User context loads to get org_id, 2) Datasets context uses org_id to fetch datasets, 3) Reviews context uses selected dataset_id to fetch reviews. Each step needs the previous.',
      codeExample: `// Nested providers enforce order
<UserProvider>        {/* Loads first */}
  <DatasetsProvider>  {/* Waits for user */}
    <ReviewsProvider> {/* Waits for dataset */}
      <App />
    </ReviewsProvider>
  </DatasetsProvider>
</UserProvider>`,
      ckFileReference: 'src/App.tsx',
    },
    hints: [
      { id: 'h1', text: 'What information does each context need to fetch its data?', xpCost: 20 },
    ],
    prerequisites: ['screens-1-component-overview'],
    skillsTaught: ['screens-data'],
  },

  {
    id: 'screens-3-data-dependency',
    room: 'screens',
    phase: 'operator',
    title: 'The Missing Dependency',
    difficulty: 2,
    xpReward: 150,
    scenario: {
      title: 'Component Won\'t Render',
      description: 'MQIChart stays in loading state even though data exists.',
      symptom: 'Infinite loading spinner on chart',
      context: 'The chart is waiting for data that\'s available',
    },
    simulation: {
      type: 'diagnose',
      setup: 'Show chart waiting for wrong data source',
    },
    question: {
      prompt: 'MQIChart shows loading forever. What\'s likely wrong?',
      options: [
        {
          id: 'a',
          text: 'The chart library is broken',
          isCorrect: false,
          feedback: 'If the library was broken, you\'d see errors, not loading.',
        },
        {
          id: 'b',
          text: 'The component is waiting for data from the wrong context',
          isCorrect: true,
          feedback: 'Correct! It might be waiting for ReviewsContext when it should use AnalysisContext, or vice versa. Check which context provides the data this component needs.',
        },
        {
          id: 'c',
          text: 'The API is slow',
          isCorrect: false,
          feedback: 'The data exists (scenario says so), so it\'s not an API issue.',
        },
        {
          id: 'd',
          text: 'React is in development mode',
          isCorrect: false,
          feedback: 'Development mode doesn\'t cause infinite loading.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Components must consume the correct context. If MQIChart expects data from AnalysisContext but the page only provides ReviewsContext, it will wait forever. Check the component\'s useContext calls.',
      codeExample: `// Component expects AnalysisContext
const MQIChart = () => {
  const { scores, loading } = useAnalysis(); // Wrong context?

  if (loading) return <Spinner />;
  return <Chart data={scores} />;
};

// Fix: Use correct context or ensure it's provided
const MQIChart = () => {
  const { reviews } = useReviews(); // Correct context
  const scores = reviews.map(r => r.mqi_score);
  // ...
};`,
      ckFileReference: 'src/components/MQIChart.tsx',
    },
    hints: [
      { id: 'h1', text: 'Which context is the component trying to use?', xpCost: 25 },
    ],
    prerequisites: ['screens-2-context-loading'],
    skillsTaught: ['screens-data'],
  },

  {
    id: 'screens-4-blank-panel',
    room: 'screens',
    phase: 'engineer',
    title: 'The Blank Chart',
    difficulty: 3,
    xpReward: 200,
    scenario: {
      title: 'Chart Renders But Is Empty',
      description: 'MQIChart renders (no loading, no error) but shows nothing.',
      symptom: 'Empty chart where data should be',
      context: 'Component rendered before data was ready',
    },
    simulation: {
      type: 'fix',
      setup: 'Show blank chart with available data',
    },
    question: {
      prompt: 'The chart renders but is empty. Data exists. What\'s the bug?',
      options: [
        {
          id: 'a',
          text: 'Component rendered before context finished loading',
          isCorrect: true,
          feedback: 'Correct! The component rendered with initial empty state, then data arrived but didn\'t trigger re-render. Missing dependency in useEffect or not properly reading loading state.',
        },
        {
          id: 'b',
          text: 'The chart doesn\'t support the data format',
          isCorrect: false,
          feedback: 'Format issues would cause errors, not empty renders.',
        },
        {
          id: 'c',
          text: 'CSS is hiding the chart',
          isCorrect: false,
          feedback: 'CSS hiding would hide the whole component, not make it empty.',
        },
        {
          id: 'd',
          text: 'The data is filtered to 0 results',
          isCorrect: false,
          feedback: 'Scenario says data exists. It\'s a timing/rendering issue.',
        },
      ],
      correctAnswer: 'a',
      explanation: 'React renders immediately with whatever data is available. If the component doesn\'t wait for loading to complete, it renders with empty data. Always check loading state before rendering data-dependent UI.',
      codeExample: `// BUG: Renders immediately with empty data
const MQIChart = () => {
  const { reviews } = useReviews();
  return <Chart data={reviews} />; // reviews might be []
};

// FIX: Wait for loading
const MQIChart = () => {
  const { reviews, loading } = useReviews();

  if (loading) return <Skeleton />;
  if (reviews.length === 0) return <EmptyState />;

  return <Chart data={reviews} />;
};`,
      ckFileReference: 'src/components/MQIChart.tsx',
    },
    hints: [
      { id: 'h1', text: 'When does React render? When does data arrive?', xpCost: 30 },
    ],
    prerequisites: ['screens-2-context-loading', 'screens-3-data-dependency'],
    skillsTaught: ['screens-debugging'],
  },

  {
    id: 'screens-5-stale-context',
    room: 'screens',
    phase: 'engineer',
    title: 'The Wrong Dataset',
    difficulty: 3,
    xpReward: 200,
    scenario: {
      title: 'Chart Shows Wrong Data',
      description: 'User selects "2024 Q4" dataset but chart shows "2024 Q3" data.',
      symptom: 'Data mismatch after dataset selection',
      context: 'Context has stale dataset_id',
    },
    simulation: {
      type: 'fix',
      setup: 'Show stale context state',
    },
    question: {
      prompt: 'User selects new dataset but sees old data. What\'s the cause?',
      options: [
        {
          id: 'a',
          text: 'The database query is cached',
          isCorrect: false,
          feedback: 'Even with caching, new dataset_id should fetch new data.',
        },
        {
          id: 'b',
          text: 'Context didn\'t update, or component didn\'t react to update',
          isCorrect: true,
          feedback: 'Correct! Either: 1) setSelectedDataset wasn\'t called, 2) useEffect doesn\'t have dataset_id in deps, or 3) Component doesn\'t consume context correctly.',
        },
        {
          id: 'c',
          text: 'Both datasets have the same data',
          isCorrect: false,
          feedback: 'Scenario says different quarters, so data is different.',
        },
        {
          id: 'd',
          text: 'The selector is broken',
          isCorrect: false,
          feedback: 'The selection happened (user clicked), so selector works.',
        },
      ],
      correctAnswer: 'b',
      explanation: 'Context updates must propagate correctly. Common bugs: 1) Selection handler doesn\'t call setter, 2) useEffect fetches data but dataset_id not in dependency array, 3) Memoization preventing re-render.',
      codeExample: `// BUG: Missing dependency
useEffect(() => {
  fetchReviews(datasetId);
}, []); // datasetId not in deps!

// FIX: Include dependency
useEffect(() => {
  if (datasetId) {
    fetchReviews(datasetId);
  }
}, [datasetId]); // Re-fetches when dataset changes`,
      ckFileReference: 'src/context/ReviewsContext.tsx',
    },
    hints: [
      { id: 'h1', text: 'Check useEffect dependency arrays', xpCost: 30 },
      { id: 'h2', text: 'Is the context setter being called on selection?', xpCost: 35 },
    ],
    prerequisites: ['screens-4-blank-panel'],
    skillsTaught: ['screens-debugging'],
  },
];

// =============================================================================
// Helper Functions
// =============================================================================

export function getChallengesByRoom(room: RoomId): Challenge[] {
  return CHALLENGES.filter(c => c.room === room);
}

export function getChallengesByPhase(phase: Phase): Challenge[] {
  return CHALLENGES.filter(c => c.phase === phase);
}

export function getAvailableChallenges(completedIds: string[]): Challenge[] {
  return CHALLENGES.filter(c =>
    c.prerequisites.every(prereq => completedIds.includes(prereq))
  );
}

export function getSkillsByRoom(room: RoomId): Skill[] {
  return SKILLS.filter(s => s.room === room);
}

export function isSkillUnlocked(skill: Skill, completedChallenges: string[]): boolean {
  return skill.challengesRequired.every(cId => completedChallenges.includes(cId));
}

export function calculateXP(completedChallenges: string[]): number {
  return CHALLENGES
    .filter(c => completedChallenges.includes(c.id))
    .reduce((sum, c) => sum + c.xpReward, 0);
}

export function getPhaseForXP(xp: number): Phase {
  if (xp >= 2000) return 'architect';
  if (xp >= 800) return 'engineer';
  return 'operator';
}
