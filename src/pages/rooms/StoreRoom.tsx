import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import ChallengeList from '@/components/ChallengeList';
import styles from './Room.module.css';

interface TableNode {
  name: string;
  schema: string;
  rowCount: number;
  columns: { name: string; type: string; fk?: string }[];
  status: 'healthy' | 'warning' | 'error';
}

interface QueryResult {
  id: string;
  query: string;
  table: string;
  rowsReturned: number;
  duration: number;
  cached: boolean;
  blocked: boolean;
  blockedReason?: string;
  timestamp: number;
}

interface CacheEntry {
  key: string;
  table: string;
  age: number;
  hits: number;
  stale: boolean;
}

const TABLES: TableNode[] = [
  {
    name: 'users',
    schema: 'public',
    rowCount: 156,
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'email', type: 'text' },
      { name: 'role', type: 'user_role' },
      { name: 'organization_id', type: 'uuid' },
      { name: 'created_at', type: 'timestamptz' },
    ],
    status: 'healthy',
  },
  {
    name: 'datasets',
    schema: 'public',
    rowCount: 24,
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'name', type: 'text' },
      { name: 'organization_id', type: 'uuid', fk: 'users.organization_id' },
      { name: 'metadata', type: 'jsonb' },
      { name: 'status', type: 'dataset_status' },
      { name: 'created_at', type: 'timestamptz' },
    ],
    status: 'healthy',
  },
  {
    name: 'dataset_reviews',
    schema: 'public',
    rowCount: 4521,
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'dataset_id', type: 'uuid', fk: 'datasets.id' },
      { name: 'employee_id', type: 'text' },
      { name: 'raw_data', type: 'jsonb' },
      { name: 'sanitized_data', type: 'jsonb' },
      { name: 'mqi_score', type: 'numeric' },
      { name: 'analysis_status', type: 'analysis_status' },
    ],
    status: 'healthy',
  },
];

const RLS_POLICIES = [
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
    condition: 'EXISTS (SELECT 1 FROM datasets WHERE id = dataset_id AND organization_id = auth.organization_id())',
  },
  {
    name: 'datasets_admin_insert',
    table: 'datasets',
    operation: 'INSERT',
    roles: ['admin'],
    condition: 'organization_id = auth.organization_id()',
  },
];

export default function StoreRoom() {
  const { addLog } = useGame();
  const [tables] = useState<TableNode[]>(TABLES);
  const [queries, setQueries] = useState<QueryResult[]>([]);
  const [cache, setCache] = useState<CacheEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<{ role: string; org: string }>({
    role: 'admin',
    org: 'ORG_001',
  });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const executeQuery = async (table: string, userRole: string, forceBlock?: boolean) => {
    const query = `SELECT * FROM ${table} WHERE organization_id = 'ORG_001'`;

    addLog('info', 'store', `Executing query on ${table}`);

    // Check RLS
    const policy = RLS_POLICIES.find((p) => p.table === table && p.operation === 'SELECT');
    const isBlocked = forceBlock || (policy && !policy.roles.includes(userRole as any));

    await new Promise((r) => setTimeout(r, 300));

    const result: QueryResult = {
      id: crypto.randomUUID(),
      query,
      table,
      rowsReturned: isBlocked ? 0 : Math.floor(Math.random() * 100) + 10,
      duration: Math.floor(Math.random() * 50) + 10,
      cached: cache.some((c) => c.table === table && !c.stale),
      blocked: isBlocked ?? false,
      blockedReason: isBlocked ? `RLS policy '${policy?.name}' denied access for role '${userRole}'` : undefined,
      timestamp: Date.now(),
    };

    setQueries((prev) => [result, ...prev].slice(0, 10));

    if (isBlocked) {
      addLog('error', 'store', `Query blocked by RLS: ${result.blockedReason}`);
    } else {
      addLog('info', 'store', `Query returned ${result.rowsReturned} rows in ${result.duration}ms ${result.cached ? '(cached)' : ''}`);

      // Add to cache
      if (!result.cached) {
        setCache((prev) => [
          { key: `${table}_${Date.now()}`, table, age: 0, hits: 1, stale: false },
          ...prev,
        ].slice(0, 5));
      }
    }
  };

  const simulateCacheIssue = () => {
    addLog('warn', 'store', 'Simulating stale cache scenario...');
    setCache((prev) => prev.map((c) => ({ ...c, stale: true, age: 300 })));
    addLog('error', 'screens', 'Dashboard showing stale data - cache not invalidated');
    addLog('warn', 'store', 'Fix: Invalidate cache after dataset update');
  };

  const simulateRLSIssue = async () => {
    addLog('warn', 'store', 'Simulating RLS violation...');
    setCurrentUser({ role: 'viewer', org: 'ORG_001' });
    await executeQuery('dataset_reviews', 'viewer', true);
    addLog('error', 'store', 'Viewer role attempted to access dataset_reviews - blocked by RLS');
  };

  return (
    <div className={styles.room}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>STORE ROOM</h1>
          <span className={styles.subtitle}>
            Calibrate Kindly: PostgreSQL tables with Row-Level Security
          </span>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={simulateCacheIssue}>
            Simulate Stale Cache
          </button>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={simulateRLSIssue}>
            Simulate RLS Block
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* Database Schema Visualization */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Database Schema</h2>
          <div className={styles.schemaViz}>
            {tables.map((table, idx) => (
              <div key={table.name} className={styles.tableNode}>
                <div
                  className={`${styles.tableCard} ${selectedTable === table.name ? styles.selected : ''}`}
                  onClick={() => setSelectedTable(table.name)}
                >
                  <div className={styles.tableHeader}>
                    <span className={styles.tableName}>{table.name}</span>
                    <span className={styles.tableRows}>{table.rowCount} rows</span>
                  </div>
                  <div className={styles.tableColumns}>
                    {table.columns.map((col) => (
                      <div key={col.name} className={styles.columnRow}>
                        <span className={styles.colName}>{col.name}</span>
                        <span className={styles.colType}>{col.type}</span>
                        {col.fk && <span className={styles.fkBadge}>FK</span>}
                      </div>
                    ))}
                  </div>
                  <button
                    className={styles.queryBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      executeQuery(table.name, currentUser.role);
                    }}
                  >
                    Query
                  </button>
                </div>
                {idx < tables.length - 1 && (
                  <div className={styles.relationship}>
                    <svg viewBox="0 0 100 40">
                      <path d="M10 20 H90" stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="5,5" />
                      <circle cx="10" cy="20" r="4" fill="var(--accent-primary)" />
                      <path d="M85 15 L95 20 L85 25" fill="var(--accent-primary)" />
                    </svg>
                    <span className={styles.relLabel}>1:N</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* RLS Policies */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            Row-Level Security Policies
            <span className={styles.rlsStatus}>RLS Enabled</span>
          </h2>
          <div className={styles.policyList}>
            {RLS_POLICIES.map((policy) => (
              <div key={policy.name} className={styles.policyItem}>
                <div className={styles.policyHeader}>
                  <span className={styles.policyName}>{policy.name}</span>
                  <span className={styles.policyOp}>{policy.operation}</span>
                </div>
                <div className={styles.policyDetails}>
                  <span className={styles.policyTable}>Table: {policy.table}</span>
                  <span className={styles.policyRoles}>
                    Roles: {policy.roles.join(', ')}
                  </span>
                </div>
                <code className={styles.policyCondition}>{policy.condition}</code>
              </div>
            ))}
          </div>
        </section>

        {/* Query Log & Cache */}
        <div className={styles.splitPanel}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Query Log</h2>
            <div className={styles.currentUser}>
              Current User: <span className={styles.userRole}>{currentUser.role}</span> @ {currentUser.org}
              <select
                value={currentUser.role}
                onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                className={styles.roleSelect}
              >
                <option value="admin">Admin</option>
                <option value="td">TD</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            {queries.length === 0 ? (
              <div className={styles.emptyState}>No queries executed yet</div>
            ) : (
              <div className={styles.queryList}>
                {queries.map((q) => (
                  <div
                    key={q.id}
                    className={`${styles.queryItem} ${q.blocked ? styles.blocked : ''}`}
                  >
                    <div className={styles.queryHeader}>
                      <span className={styles.queryTable}>{q.table}</span>
                      {q.cached && <span className={styles.cacheBadge}>CACHED</span>}
                      {q.blocked && <span className={styles.blockedBadge}>BLOCKED</span>}
                    </div>
                    <code className={styles.queryText}>{q.query}</code>
                    {q.blocked ? (
                      <span className={styles.blockedReason}>{q.blockedReason}</span>
                    ) : (
                      <span className={styles.queryStats}>
                        {q.rowsReturned} rows • {q.duration}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Cache State</h2>
            {cache.length === 0 ? (
              <div className={styles.emptyState}>Cache empty</div>
            ) : (
              <div className={styles.cacheList}>
                {cache.map((entry) => (
                  <div
                    key={entry.key}
                    className={`${styles.cacheItem} ${entry.stale ? styles.stale : ''}`}
                  >
                    <span className={styles.cacheTable}>{entry.table}</span>
                    <span className={styles.cacheAge}>{entry.age}s old</span>
                    <span className={styles.cacheHits}>{entry.hits} hits</span>
                    {entry.stale && <span className={styles.staleBadge}>STALE</span>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Challenges */}
        <ChallengeList room="store" />
      </div>
    </div>
  );
}
