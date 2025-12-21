import { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import type {
  GameState,
  GameAction,
  RoomId,
  Level,
  LogEntry,
  SystemHealth,
  Phase,
  ProgressionState,
  Achievement,
} from '@/types';
import { XP_LEVELS, DAILY_CHALLENGE_GOAL } from '@/types';

// =============================================================================
// LocalStorage Keys
// =============================================================================

const STORAGE_KEY = 'fix-it-factory-progression';

// =============================================================================
// Utility Functions
// =============================================================================

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function calculateLevel(xp: number): number {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i]) {
      return i + 1;
    }
  }
  return 1;
}

function loadProgressionFromStorage(): ProgressionState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load progression from storage:', e);
  }
  return null;
}

function saveProgressionToStorage(progression: ProgressionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progression));
  } catch (e) {
    console.warn('Failed to save progression to storage:', e);
  }
}

// =============================================================================
// Initial State
// =============================================================================

const initialProgression: ProgressionState = {
  xp: 0,
  level: 1,
  completedChallenges: [],
  unlockedSkills: [],
  challengeAttempts: {},
  streak: {
    current: 0,
    longest: 0,
    lastPracticeDate: '',
    freezesAvailable: 2,
    freezesUsed: 0,
  },
  dailyProgress: {
    date: getTodayDate(),
    challengesCompleted: 0,
    xpEarned: 0,
    timeSpent: 0,
    goalMet: false,
  },
  achievements: [],
};

const initialSystemHealth: SystemHealth = {
  overall: 'healthy',
  rooms: {
    tutorial: {
      status: 'healthy',
      activeIssues: [],
      metrics: { throughput: 100, errorRate: 0, latency: 0 },
    },
    upload: {
      status: 'healthy',
      activeIssues: [],
      metrics: { throughput: 100, errorRate: 0, latency: 50 },
    },
    clean: {
      status: 'healthy',
      activeIssues: [],
      metrics: { throughput: 100, errorRate: 0, latency: 30 },
    },
    store: {
      status: 'healthy',
      activeIssues: [],
      metrics: { throughput: 100, errorRate: 0, latency: 20 },
    },
    brain: {
      status: 'healthy',
      activeIssues: [],
      metrics: { throughput: 100, errorRate: 0, latency: 500 },
    },
    screens: {
      status: 'healthy',
      activeIssues: [],
      metrics: { throughput: 100, errorRate: 0, latency: 100 },
    },
  },
  lastChecked: Date.now(),
};

const initialState: GameState = {
  currentRoom: 'tutorial',
  currentLevel: null,
  phase: 'operator',
  score: 0,
  completedLevels: [],
  systemHealth: initialSystemHealth,
  logs: [],

  tutorial: {
    currentTopic: null,
    completedTopics: [],
    conceptsLearned: [],
  },

  upload: {
    files: [],
    currentUpload: undefined,
    schemaValidation: null,
  },

  clean: {
    pipeline: {
      stages: [
        { id: 'pii', name: 'PII Detection', type: 'pii_detection', status: 'inactive', itemsProcessed: 0, itemsTotal: 0 },
        { id: 'anon', name: 'Anonymisation', type: 'anonymisation', status: 'inactive', itemsProcessed: 0, itemsTotal: 0 },
        { id: 'valid', name: 'Validation', type: 'validation', status: 'inactive', itemsProcessed: 0, itemsTotal: 0 },
        { id: 'transform', name: 'Transformation', type: 'transformation', status: 'inactive', itemsProcessed: 0, itemsTotal: 0 },
      ],
      status: 'inactive',
    },
    currentBatch: undefined,
    privacyReport: null,
  },

  store: {
    tables: [
      {
        name: 'users',
        schema: 'public',
        rowCount: 0,
        relationships: [
          { targetTable: 'datasets', type: 'one-to-many', foreignKey: 'organization_id' },
        ],
        status: 'healthy',
      },
      {
        name: 'datasets',
        schema: 'public',
        rowCount: 0,
        relationships: [
          { targetTable: 'dataset_reviews', type: 'one-to-many', foreignKey: 'dataset_id' },
        ],
        status: 'healthy',
      },
      {
        name: 'dataset_reviews',
        schema: 'public',
        rowCount: 0,
        relationships: [],
        status: 'healthy',
      },
    ],
    cache: {
      entries: [],
      hitRate: 0,
      size: 0,
      maxSize: 100,
    },
    queries: [],
    rls: {
      enabled: true,
      policies: [
        {
          name: 'users_org_isolation',
          table: 'users',
          operation: 'SELECT',
          roles: ['admin', 'td', 'manager', 'viewer'],
          condition: 'organization_id = auth.organization_id()',
        },
        {
          name: 'datasets_org_isolation',
          table: 'datasets',
          operation: 'SELECT',
          roles: ['admin', 'td', 'manager', 'viewer'],
          condition: 'organization_id = auth.organization_id()',
        },
        {
          name: 'dataset_reviews_read',
          table: 'dataset_reviews',
          operation: 'SELECT',
          roles: ['admin', 'td', 'manager'],
          condition: 'dataset_id IN (SELECT id FROM datasets WHERE organization_id = auth.organization_id())',
        },
      ],
      currentUser: null,
    },
  },

  brain: {
    functions: [
      {
        name: 'analyze-review',
        description: 'Analyzes a single review for MQI scoring',
        status: 'healthy',
        invocations: 0,
        avgLatency: 800,
        errorRate: 0,
        calibrateKindlyFunction: 'analyze-review',
      },
      {
        name: 'analyze-skills',
        description: 'Extracts skills from review text',
        status: 'healthy',
        invocations: 0,
        avgLatency: 600,
        errorRate: 0,
        calibrateKindlyFunction: 'analyze-skills',
      },
      {
        name: 'batch-analyze-reviews',
        description: 'Batch processes multiple reviews',
        status: 'healthy',
        invocations: 0,
        avgLatency: 5000,
        errorRate: 0,
        calibrateKindlyFunction: 'batch-analyze-reviews',
      },
      {
        name: 'generate-recommendations',
        description: 'Generates improvement recommendations',
        status: 'healthy',
        invocations: 0,
        avgLatency: 1200,
        errorRate: 0,
        calibrateKindlyFunction: 'generate-recommendations',
      },
      {
        name: 'check-quota',
        description: 'Checks API usage quota',
        status: 'healthy',
        invocations: 0,
        avgLatency: 50,
        errorRate: 0,
        calibrateKindlyFunction: 'check-quota',
      },
      {
        name: 'batch-analyze-skills',
        description: 'Batch processes skills extraction for multiple reviews',
        status: 'healthy',
        invocations: 0,
        avgLatency: 4500,
        errorRate: 0,
        calibrateKindlyFunction: 'analyze-skills-batch',
      },
      {
        name: 'individual-recommendations',
        description: 'Generates personalized recommendations for individuals',
        status: 'healthy',
        invocations: 0,
        avgLatency: 1500,
        errorRate: 0,
        calibrateKindlyFunction: 'individual-recommendations',
      },
      {
        name: 'risk-assessment',
        description: 'Assesses attrition and engagement risks',
        status: 'healthy',
        invocations: 0,
        avgLatency: 1800,
        errorRate: 0,
        calibrateKindlyFunction: 'risk-assessment',
      },
      {
        name: 'generate-executive-insights',
        description: 'Creates executive summary insights from data',
        status: 'healthy',
        invocations: 0,
        avgLatency: 2000,
        errorRate: 0,
        calibrateKindlyFunction: 'generate-executive-insights',
      },
      {
        name: 'generate-diagnostics',
        description: 'Generates diagnostic reports for troubleshooting',
        status: 'healthy',
        invocations: 0,
        avgLatency: 900,
        errorRate: 0,
        calibrateKindlyFunction: 'generate-diagnostics',
      },
      {
        name: 'analyze-manager-capabilities',
        description: 'Analyzes manager performance and capabilities',
        status: 'healthy',
        invocations: 0,
        avgLatency: 2200,
        errorRate: 0,
        calibrateKindlyFunction: 'analyze-manager-capabilities',
      },
    ],
    activeJobs: [],
    quota: {
      used: 0,
      limit: 10000,
      resetAt: Date.now() + 86400000,
      warningThreshold: 8000,
    },
    apiHealth: {
      openai: { status: 'healthy', latency: 200, lastCheck: Date.now() },
      supabase: { status: 'healthy', latency: 50, lastCheck: Date.now() },
    },
  },

  screens: {
    pages: [
      {
        name: 'Performance Reviews',
        path: '/reviews',
        status: 'healthy',
        loadTime: 0,
        dataSource: ['dataset_reviews', 'datasets'],
        calibrateKindlyPage: 'performance-reviews',
      },
      {
        name: 'Manager Capabilities',
        path: '/capabilities',
        status: 'healthy',
        loadTime: 0,
        dataSource: ['dataset_reviews', 'analysis'],
        calibrateKindlyPage: 'manager-capabilities',
      },
      {
        name: 'Engagement Analytics',
        path: '/engagement',
        status: 'healthy',
        loadTime: 0,
        dataSource: ['dataset_reviews', 'analysis'],
        calibrateKindlyPage: 'engagement-analytics',
      },
      {
        name: 'Admin Upload',
        path: '/admin/upload',
        status: 'healthy',
        loadTime: 0,
        dataSource: ['datasets'],
        calibrateKindlyPage: 'admin-upload',
      },
    ],
    components: [
      { name: 'DatasetSelector', type: 'filter', status: 'healthy', dataReady: false },
      { name: 'ReviewsTable', type: 'table', status: 'healthy', dataReady: false },
      { name: 'MQIChart', type: 'chart', status: 'healthy', dataReady: false },
      { name: 'SkillsBreakdown', type: 'chart', status: 'healthy', dataReady: false },
      { name: 'EngagementTrends', type: 'chart', status: 'healthy', dataReady: false },
    ],
    dataFlow: {
      context: {
        datasets: false,
        reviews: false,
        analysis: false,
        user: false,
      },
      activeDataset: null,
      loadingStates: {},
    },
  },

  progression: initialProgression,
};

// =============================================================================
// Reducer
// =============================================================================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_ROOM':
      return { ...state, currentRoom: action.room };

    case 'START_LEVEL':
      return {
        ...state,
        currentLevel: action.level,
        ...(action.level.scenario.initialState || {}),
      };

    case 'COMPLETE_OBJECTIVE':
      if (!state.currentLevel) return state;
      return {
        ...state,
        currentLevel: {
          ...state.currentLevel,
          objectives: state.currentLevel.objectives.map((obj) =>
            obj.id === action.objectiveId ? { ...obj, completed: true } : obj
          ),
        },
      };

    case 'COMPLETE_LEVEL':
      return {
        ...state,
        completedLevels: [...state.completedLevels, action.levelId],
        score: state.score + action.score,
        currentLevel: null,
      };

    case 'ADD_LOG': {
      const newLog: LogEntry = {
        ...action.entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      return {
        ...state,
        logs: [newLog, ...state.logs].slice(0, 500), // Keep last 500 logs
      };
    }

    case 'UPDATE_HEALTH':
      return {
        ...state,
        systemHealth: { ...state.systemHealth, ...action.health },
      };

    case 'UPDATE_ROOM_STATE': {
      const roomKey = action.room as keyof Pick<GameState, 'upload' | 'clean' | 'store' | 'brain' | 'screens'>;
      return {
        ...state,
        [roomKey]: { ...state[roomKey], ...(action.state as object) },
      };
    }

    case 'RESOLVE_ISSUE': {
      const updatedRooms = { ...state.systemHealth.rooms };
      for (const roomId of Object.keys(updatedRooms) as RoomId[]) {
        updatedRooms[roomId] = {
          ...updatedRooms[roomId],
          activeIssues: updatedRooms[roomId].activeIssues.map((issue) =>
            issue.id === action.issueId
              ? { ...issue, resolved: true, resolution: action.resolution }
              : issue
          ),
        };
      }
      return {
        ...state,
        systemHealth: { ...state.systemHealth, rooms: updatedRooms },
      };
    }

    case 'USE_HINT':
      if (!state.currentLevel) return state;
      return {
        ...state,
        currentLevel: {
          ...state.currentLevel,
          hints: state.currentLevel.hints.map((hint) =>
            hint.id === action.hintId ? { ...hint, unlocked: true } : hint
          ),
        },
        score: Math.max(
          0,
          state.score -
            (state.currentLevel.hints.find((h) => h.id === action.hintId)?.cost || 0)
        ),
      };

    case 'RESET_GAME':
      return initialState;

    case 'COMPLETE_CHALLENGE': {
      const { challengeId, xpEarned, hintsUsed } = action;
      const today = getTodayDate();
      const newXp = state.progression.xp + xpEarned;
      const newLevel = calculateLevel(newXp);

      // Update daily progress
      let dailyProgress = state.progression.dailyProgress;
      if (dailyProgress.date !== today) {
        // New day, reset daily progress
        dailyProgress = {
          date: today,
          challengesCompleted: 1,
          xpEarned: xpEarned,
          timeSpent: 0,
          goalMet: 1 >= DAILY_CHALLENGE_GOAL,
        };
      } else {
        dailyProgress = {
          ...dailyProgress,
          challengesCompleted: dailyProgress.challengesCompleted + 1,
          xpEarned: dailyProgress.xpEarned + xpEarned,
          goalMet: dailyProgress.challengesCompleted + 1 >= DAILY_CHALLENGE_GOAL,
        };
      }

      // Update streak
      let streak = state.progression.streak;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (streak.lastPracticeDate === today) {
        // Already practiced today, no streak change
      } else if (streak.lastPracticeDate === yesterdayStr) {
        // Continuing streak from yesterday
        streak = {
          ...streak,
          current: streak.current + 1,
          longest: Math.max(streak.longest, streak.current + 1),
          lastPracticeDate: today,
        };
      } else if (streak.lastPracticeDate === '') {
        // First ever practice
        streak = {
          ...streak,
          current: 1,
          longest: 1,
          lastPracticeDate: today,
        };
      } else {
        // Streak broken, start fresh
        streak = {
          ...streak,
          current: 1,
          lastPracticeDate: today,
        };
      }

      // Update challenge attempt
      const existingAttempt = state.progression.challengeAttempts[challengeId];
      const newAttempt = {
        challengeId,
        attempts: (existingAttempt?.attempts || 0) + 1,
        bestScore: Math.max(existingAttempt?.bestScore || 0, xpEarned),
        completed: true,
        lastAttempt: Date.now(),
        hintsUsed: [...new Set([...(existingAttempt?.hintsUsed || []), ...hintsUsed])],
      };

      return {
        ...state,
        score: state.score + xpEarned,
        progression: {
          ...state.progression,
          xp: newXp,
          level: newLevel,
          completedChallenges: state.progression.completedChallenges.includes(challengeId)
            ? state.progression.completedChallenges
            : [...state.progression.completedChallenges, challengeId],
          challengeAttempts: {
            ...state.progression.challengeAttempts,
            [challengeId]: newAttempt,
          },
          streak,
          dailyProgress,
        },
      };
    }

    case 'UNLOCK_SKILL': {
      if (state.progression.unlockedSkills.includes(action.skillId)) {
        return state;
      }
      return {
        ...state,
        progression: {
          ...state.progression,
          unlockedSkills: [...state.progression.unlockedSkills, action.skillId],
        },
      };
    }

    case 'UPDATE_STREAK': {
      const today = getTodayDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let streak = state.progression.streak;

      // Check if streak should be reset (missed a day)
      if (streak.lastPracticeDate !== today && streak.lastPracticeDate !== yesterdayStr && streak.lastPracticeDate !== '') {
        // Check if we can use a freeze
        if (streak.freezesAvailable > 0 && streak.current > 0) {
          // Auto-use freeze to maintain streak
          streak = {
            ...streak,
            freezesAvailable: streak.freezesAvailable - 1,
            freezesUsed: streak.freezesUsed + 1,
          };
        } else {
          // Reset streak
          streak = {
            ...streak,
            current: 0,
          };
        }
      }

      // Reset daily progress if it's a new day
      let dailyProgress = state.progression.dailyProgress;
      if (dailyProgress.date !== today) {
        dailyProgress = {
          date: today,
          challengesCompleted: 0,
          xpEarned: 0,
          timeSpent: 0,
          goalMet: false,
        };
      }

      return {
        ...state,
        progression: {
          ...state.progression,
          streak,
          dailyProgress,
        },
      };
    }

    case 'USE_STREAK_FREEZE': {
      if (state.progression.streak.freezesAvailable <= 0) {
        return state;
      }
      return {
        ...state,
        progression: {
          ...state.progression,
          streak: {
            ...state.progression.streak,
            freezesAvailable: state.progression.streak.freezesAvailable - 1,
            freezesUsed: state.progression.streak.freezesUsed + 1,
          },
        },
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      if (state.progression.achievements.some(a => a.id === action.achievement.id)) {
        return state;
      }
      return {
        ...state,
        progression: {
          ...state.progression,
          achievements: [...state.progression.achievements, action.achievement],
        },
      };
    }

    case 'SET_PHASE':
      return {
        ...state,
        phase: action.phase,
      };

    case 'LOAD_PROGRESSION':
      return {
        ...state,
        progression: action.progression,
      };

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Convenience actions
  setRoom: (room: RoomId) => void;
  addLog: (level: LogEntry['level'], source: LogEntry['source'], message: string, details?: Record<string, unknown>) => void;
  startLevel: (level: Level) => void;
  completeObjective: (objectiveId: string) => void;
  completeLevel: (levelId: string, score: number) => void;
  updateRoomState: (room: RoomId, state: unknown) => void;
  setPhase: (phase: Phase) => void;
  // Progression actions
  completeChallenge: (challengeId: string, xpEarned: number, hintsUsed: string[]) => void;
  unlockSkill: (skillId: string) => void;
  updateStreak: () => void;
  unlockAchievement: (achievement: Achievement) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load progression from localStorage on mount
  useEffect(() => {
    const savedProgression = loadProgressionFromStorage();
    if (savedProgression) {
      dispatch({ type: 'LOAD_PROGRESSION', progression: savedProgression });
    }
    // Check and update streak on mount
    dispatch({ type: 'UPDATE_STREAK' });
  }, []);

  // Save progression to localStorage whenever it changes
  useEffect(() => {
    saveProgressionToStorage(state.progression);
  }, [state.progression]);

  const setRoom = useCallback((room: RoomId) => {
    dispatch({ type: 'SET_ROOM', room });
  }, []);

  const addLog = useCallback(
    (
      level: LogEntry['level'],
      source: LogEntry['source'],
      message: string,
      details?: Record<string, unknown>
    ) => {
      dispatch({ type: 'ADD_LOG', entry: { level, source, message, details } });
    },
    []
  );

  const startLevel = useCallback((level: Level) => {
    dispatch({ type: 'START_LEVEL', level });
  }, []);

  const completeObjective = useCallback((objectiveId: string) => {
    dispatch({ type: 'COMPLETE_OBJECTIVE', objectiveId });
  }, []);

  const completeLevel = useCallback((levelId: string, score: number) => {
    dispatch({ type: 'COMPLETE_LEVEL', levelId, score });
  }, []);

  const updateRoomState = useCallback((room: RoomId, roomState: unknown) => {
    dispatch({ type: 'UPDATE_ROOM_STATE', room, state: roomState });
  }, []);

  const setPhase = useCallback((phase: Phase) => {
    dispatch({ type: 'SET_PHASE', phase });
  }, []);

  const completeChallenge = useCallback((challengeId: string, xpEarned: number, hintsUsed: string[]) => {
    dispatch({ type: 'COMPLETE_CHALLENGE', challengeId, xpEarned, hintsUsed });
  }, []);

  const unlockSkill = useCallback((skillId: string) => {
    dispatch({ type: 'UNLOCK_SKILL', skillId });
  }, []);

  const updateStreak = useCallback(() => {
    dispatch({ type: 'UPDATE_STREAK' });
  }, []);

  const unlockAchievement = useCallback((achievement: Achievement) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievement });
  }, []);

  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        setRoom,
        addLog,
        startLevel,
        completeObjective,
        completeLevel,
        updateRoomState,
        setPhase,
        completeChallenge,
        unlockSkill,
        updateStreak,
        unlockAchievement,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
