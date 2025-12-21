// =============================================================================
// Fix-It Factory Type Definitions
// Mapped directly to Calibrate Kindly architecture
// =============================================================================

// -----------------------------------------------------------------------------
// Room Types (Tutorial + 5 Core Rooms)
// -----------------------------------------------------------------------------

export type RoomId = 'tutorial' | 'upload' | 'clean' | 'store' | 'brain' | 'screens';

export interface Room {
  id: RoomId;
  name: string;
  description: string;
  calibrateKindlyMapping: string;
  status: SystemStatus;
  icon: string;
}

// -----------------------------------------------------------------------------
// System Status Types
// -----------------------------------------------------------------------------

export type SystemStatus = 'healthy' | 'warning' | 'error' | 'inactive' | 'processing';

export interface SystemHealth {
  overall: SystemStatus;
  rooms: Record<RoomId, RoomHealth>;
  lastChecked: number;
}

export interface RoomHealth {
  status: SystemStatus;
  activeIssues: Issue[];
  metrics: RoomMetrics;
}

export interface RoomMetrics {
  throughput: number;
  errorRate: number;
  latency: number;
}

// -----------------------------------------------------------------------------
// Data Models (Mapped to Calibrate Kindly's PostgreSQL tables)
// -----------------------------------------------------------------------------

// Maps to: datasets table
export interface Dataset {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
  metadata: DatasetMetadata;
  status: 'pending' | 'processing' | 'ready' | 'error';
  row_count: number;
}

export interface DatasetMetadata {
  columns: ColumnDefinition[];
  source_file: string;
  upload_timestamp: string;
  has_pii: boolean;
}

export interface ColumnDefinition {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  mapped_to?: string; // Which standard field this maps to
}

// Maps to: dataset_reviews table
export interface DatasetReview {
  id: string;
  dataset_id: string;
  employee_id: string;
  raw_data: ReviewRawData;
  sanitized_data: ReviewSanitizedData;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  mqi_score?: number;
  created_at: string;
}

export interface ReviewRawData {
  reviewer_name: string;
  employee_name: string;
  review_text: string;
  rating: number;
  review_date: string;
}

export interface ReviewSanitizedData {
  reviewer_id: string; // Anonymized
  employee_id: string; // Anonymized
  review_text: string; // PII removed
  rating: number;
  review_date: string;
}

// Maps to: users table
export interface User {
  id: string;
  email: string;
  role: UserRole;
  organization_id: string;
  created_at: string;
}

export type UserRole = 'admin' | 'td' | 'manager' | 'viewer';

// -----------------------------------------------------------------------------
// Upload Room Types (Data Ingestion)
// -----------------------------------------------------------------------------

export interface UploadState {
  files: UploadFile[];
  currentUpload?: ActiveUpload;
  schemaValidation: SchemaValidationResult | null;
}

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: 'csv' | 'xlsx';
  status: 'pending' | 'validating' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
}

export interface ActiveUpload {
  fileId: string;
  stage: 'parsing' | 'validating' | 'transforming' | 'storing';
  progress: number;
  rowsProcessed: number;
  totalRows: number;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaError[];
  warnings: SchemaWarning[];
  columnMappings: ColumnMapping[];
}

export interface SchemaError {
  column: string;
  message: string;
  row?: number;
}

export interface SchemaWarning {
  column: string;
  message: string;
  suggestion?: string;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  confidence: number;
  requiresTransform: boolean;
}

// -----------------------------------------------------------------------------
// Clean Room Types (Sanitisation & Privacy)
// -----------------------------------------------------------------------------

export interface CleanState {
  pipeline: SanitisationPipeline;
  currentBatch?: BatchProcess;
  privacyReport: PrivacyReport | null;
}

export interface SanitisationPipeline {
  stages: SanitisationStage[];
  status: SystemStatus;
}

export interface SanitisationStage {
  id: string;
  name: string;
  type: 'pii_detection' | 'anonymisation' | 'validation' | 'transformation';
  status: SystemStatus;
  itemsProcessed: number;
  itemsTotal: number;
}

export interface BatchProcess {
  id: string;
  datasetId: string;
  stage: string;
  progress: number;
  startedAt: number;
}

export interface PrivacyReport {
  piiDetected: PIIDetection[];
  anonymisationApplied: AnonymisationRecord[];
  complianceStatus: 'compliant' | 'review_required' | 'violation';
}

export interface PIIDetection {
  field: string;
  type: 'name' | 'email' | 'phone' | 'address' | 'id_number';
  count: number;
  action: 'redact' | 'hash' | 'generalize';
}

export interface AnonymisationRecord {
  field: string;
  method: string;
  recordsAffected: number;
}

// -----------------------------------------------------------------------------
// Store Room Types (Database & Retrieval)
// -----------------------------------------------------------------------------

export interface StoreState {
  tables: TableVisualization[];
  cache: CacheState;
  queries: QueryLog[];
  rls: RLSState;
}

export interface TableVisualization {
  name: string;
  schema: string;
  rowCount: number;
  relationships: TableRelationship[];
  status: SystemStatus;
}

export interface TableRelationship {
  targetTable: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  foreignKey: string;
}

export interface CacheState {
  entries: CacheEntry[];
  hitRate: number;
  size: number;
  maxSize: number;
}

export interface CacheEntry {
  key: string;
  table: string;
  age: number;
  hits: number;
  stale: boolean;
}

export interface QueryLog {
  id: string;
  query: string;
  table: string;
  duration: number;
  rowsReturned: number;
  cached: boolean;
  timestamp: number;
  blocked?: boolean;
  blockedReason?: string;
}

export interface RLSState {
  enabled: boolean;
  policies: RLSPolicy[];
  currentUser: User | null;
}

export interface RLSPolicy {
  name: string;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  roles: UserRole[];
  condition: string;
}

// -----------------------------------------------------------------------------
// Brain Room Types (Edge Functions & AI)
// -----------------------------------------------------------------------------

export interface BrainState {
  functions: EdgeFunction[];
  activeJobs: AnalysisJob[];
  quota: QuotaState;
  apiHealth: APIHealthState;
}

export interface EdgeFunction {
  name: string;
  description: string;
  status: SystemStatus;
  invocations: number;
  avgLatency: number;
  errorRate: number;
  // Maps to actual Calibrate Kindly functions
  calibrateKindlyFunction:
    | 'analyze-review'
    | 'analyze-skills'
    | 'batch-analyze-reviews'
    | 'batch-analyze-skills'
    | 'generate-recommendations'
    | 'check-quota';
}

export interface AnalysisJob {
  id: string;
  functionName: string;
  datasetId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial';
  progress: number;
  itemsProcessed: number;
  itemsTotal: number;
  itemsFailed: number;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

export interface QuotaState {
  used: number;
  limit: number;
  resetAt: number;
  warningThreshold: number;
}

export interface APIHealthState {
  openai: ServiceHealth;
  supabase: ServiceHealth;
}

export interface ServiceHealth {
  status: SystemStatus;
  latency: number;
  lastCheck: number;
  errorMessage?: string;
}

// -----------------------------------------------------------------------------
// Screens Room Types (Frontend & Visualization)
// -----------------------------------------------------------------------------

export interface ScreensState {
  pages: PageState[];
  components: ComponentState[];
  dataFlow: DataFlowState;
}

export interface PageState {
  name: string;
  path: string;
  status: SystemStatus;
  loadTime: number;
  dataSource: string[];
  // Maps to actual Calibrate Kindly pages
  calibrateKindlyPage:
    | 'performance-reviews'
    | 'manager-capabilities'
    | 'engagement-analytics'
    | 'admin-upload'
    | 'settings';
}

export interface ComponentState {
  name: string;
  type: 'chart' | 'table' | 'filter' | 'card' | 'form';
  status: SystemStatus;
  dataReady: boolean;
  error?: string;
}

export interface DataFlowState {
  context: ContextState;
  activeDataset: string | null;
  loadingStates: Record<string, boolean>;
}

export interface ContextState {
  datasets: boolean;
  reviews: boolean;
  analysis: boolean;
  user: boolean;
}

// -----------------------------------------------------------------------------
// Level & Challenge Types
// -----------------------------------------------------------------------------

export interface Level {
  id: string;
  room: RoomId;
  phase: Phase;
  title: string;
  description: string;
  scenario: Scenario;
  objectives: Objective[];
  hints: Hint[];
  solution: Solution;
}

export type Phase = 'operator' | 'engineer' | 'architect';

export interface Scenario {
  description: string;
  symptom: string;
  underlyingCauses: string[];
  affectedSystems: RoomId[];
  initialState: Partial<GameState>;
}

export interface Objective {
  id: string;
  description: string;
  completed: boolean;
  validator: string; // Function name to validate completion
}

export interface Hint {
  id: string;
  text: string;
  cost: number; // Points deducted for using hint
  unlocked: boolean;
}

export interface Solution {
  explanation: string;
  steps: string[];
  codeSnippet?: string;
  calibrateKindlyFile?: string; // Reference to actual file in CK codebase
}

// -----------------------------------------------------------------------------
// Issue & Log Types
// -----------------------------------------------------------------------------

export interface Issue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  room: RoomId;
  title: string;
  description: string;
  timestamp: number;
  resolved: boolean;
  resolution?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: RoomId | 'system';
  message: string;
  details?: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Tutorial Room Types (Foundations & Concepts)
// -----------------------------------------------------------------------------

export interface TutorialState {
  currentTopic: TutorialTopic | null;
  completedTopics: string[];
  conceptsLearned: string[];
}

export type TutorialTopic =
  | 'what-is-web-app'
  | 'frontend-backend'
  | 'components'
  | 'state'
  | 'api'
  | 'database'
  | 'authentication'
  | 'data-flow';

export interface TutorialConcept {
  id: string;
  name: string;
  description: string;
  analogy: string;
  calibrateKindlyExample: string;
}

// -----------------------------------------------------------------------------
// Game State
// -----------------------------------------------------------------------------

export interface GameState {
  currentRoom: RoomId;
  currentLevel: Level | null;
  phase: Phase;
  score: number;
  completedLevels: string[];
  systemHealth: SystemHealth;
  logs: LogEntry[];

  // Room-specific states
  tutorial: TutorialState;
  upload: UploadState;
  clean: CleanState;
  store: StoreState;
  brain: BrainState;
  screens: ScreensState;

  // Progression state
  progression: ProgressionState;
}

// -----------------------------------------------------------------------------
// Progression & Challenge Types
// -----------------------------------------------------------------------------

export interface ProgressionState {
  xp: number;
  level: number;
  completedChallenges: string[];
  unlockedSkills: string[];
  challengeAttempts: Record<string, ChallengeAttempt>;
  streak: StreakData;
  dailyProgress: DailyProgress;
  achievements: Achievement[];
}

export interface ChallengeAttempt {
  challengeId: string;
  attempts: number;
  bestScore: number;
  completed: boolean;
  lastAttempt: number;
  hintsUsed: string[];
}

export interface StreakData {
  current: number;
  longest: number;
  lastPracticeDate: string; // ISO date string YYYY-MM-DD
  freezesAvailable: number;
  freezesUsed: number;
}

export interface DailyProgress {
  date: string; // ISO date string YYYY-MM-DD
  challengesCompleted: number;
  xpEarned: number;
  timeSpent: number; // in seconds
  goalMet: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
  category: 'streak' | 'mastery' | 'exploration' | 'speed' | 'perfect';
}

// XP thresholds for each level
export const XP_LEVELS: number[] = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  850,    // Level 5
  1300,   // Level 6
  1900,   // Level 7
  2650,   // Level 8
  3550,   // Level 9
  4600,   // Level 10
  5800,   // Level 11
  7200,   // Level 12
  8800,   // Level 13
  10600,  // Level 14
  12600,  // Level 15
];

// Daily challenge goal
export const DAILY_CHALLENGE_GOAL = 3;

// -----------------------------------------------------------------------------
// Action Types (for state management)
// -----------------------------------------------------------------------------

export type GameAction =
  | { type: 'SET_ROOM'; room: RoomId }
  | { type: 'START_LEVEL'; level: Level }
  | { type: 'COMPLETE_OBJECTIVE'; objectiveId: string }
  | { type: 'COMPLETE_LEVEL'; levelId: string; score: number }
  | { type: 'ADD_LOG'; entry: Omit<LogEntry, 'id' | 'timestamp'> }
  | { type: 'UPDATE_HEALTH'; health: Partial<SystemHealth> }
  | { type: 'UPDATE_ROOM_STATE'; room: RoomId; state: unknown }
  | { type: 'RESOLVE_ISSUE'; issueId: string; resolution: string }
  | { type: 'USE_HINT'; hintId: string }
  | { type: 'RESET_GAME' }
  | { type: 'COMPLETE_CHALLENGE'; challengeId: string; xpEarned: number; hintsUsed: string[] }
  | { type: 'UNLOCK_SKILL'; skillId: string }
  | { type: 'UPDATE_STREAK' }
  | { type: 'USE_STREAK_FREEZE' }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievement: Achievement }
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'LOAD_PROGRESSION'; progression: ProgressionState };
