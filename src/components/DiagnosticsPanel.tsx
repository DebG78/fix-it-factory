import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import type { LogEntry } from '@/types';
import styles from './DiagnosticsPanel.module.css';

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').substring(0, 23);
}

function getLogLevelClass(level: LogEntry['level']): string {
  switch (level) {
    case 'error':
      return styles.logError;
    case 'warn':
      return styles.logWarn;
    case 'info':
      return styles.logInfo;
    case 'debug':
      return styles.logDebug;
    default:
      return '';
  }
}

function getSourceLabel(source: LogEntry['source']): string {
  switch (source) {
    case 'upload':
      return 'UPLOAD';
    case 'clean':
      return 'CLEAN';
    case 'store':
      return 'STORE';
    case 'brain':
      return 'BRAIN';
    case 'screens':
      return 'SCREENS';
    case 'system':
      return 'SYSTEM';
    default:
      return 'UNKNOWN';
  }
}

export default function DiagnosticsPanel() {
  const { state, addLog } = useGame();
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<LogEntry['level'] | 'all'>('all');
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [state.logs]);

  // Add initial system logs on mount
  useEffect(() => {
    addLog('info', 'system', 'Fix-It Factory initialized');
    addLog('info', 'system', 'Connected to Calibrate Kindly simulation');
    addLog('info', 'upload', 'Upload Room ready');
    addLog('info', 'clean', 'Clean Room ready');
    addLog('info', 'store', 'Store Room ready - PostgreSQL connected');
    addLog('info', 'brain', 'Brain Room ready - Edge Functions loaded');
    addLog('info', 'screens', 'Screens Room ready - React components mounted');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredLogs = filter === 'all'
    ? state.logs
    : state.logs.filter(log => log.level === filter);

  return (
    <div className={`${styles.panel} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>DIAGNOSTICS & LOGS</span>
          <span className={styles.logCount}>{state.logs.length} entries</span>
        </div>
        <div className={styles.headerRight}>
          {isExpanded && (
            <div className={styles.filters} onClick={e => e.stopPropagation()}>
              <button
                className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`${styles.filterBtn} ${filter === 'error' ? styles.active : ''} ${styles.filterError}`}
                onClick={() => setFilter('error')}
              >
                Errors
              </button>
              <button
                className={`${styles.filterBtn} ${filter === 'warn' ? styles.active : ''} ${styles.filterWarn}`}
                onClick={() => setFilter('warn')}
              >
                Warnings
              </button>
              <button
                className={`${styles.filterBtn} ${filter === 'info' ? styles.active : ''}`}
                onClick={() => setFilter('info')}
              >
                Info
              </button>
            </div>
          )}
          <button className={styles.expandBtn}>
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.content} ref={logContainerRef}>
          {filteredLogs.length === 0 ? (
            <div className={styles.emptyState}>No logs to display</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className={`${styles.logEntry} ${getLogLevelClass(log.level)}`}>
                <span className={styles.timestamp}>[{formatTimestamp(log.timestamp)}]</span>
                <span className={`${styles.level} ${getLogLevelClass(log.level)}`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className={styles.source}>[{getSourceLabel(log.source)}]:</span>
                <span className={styles.message}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
