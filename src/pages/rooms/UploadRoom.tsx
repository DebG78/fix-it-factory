import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import ChallengeList from '@/components/ChallengeList';
import styles from './Room.module.css';

interface SimulatedFile {
  id: string;
  name: string;
  size: number;
  rows: number;
  columns: string[];
  status: 'pending' | 'validating' | 'processing' | 'complete' | 'error';
  progress: number;
  errors: string[];
}

interface ValidationResult {
  column: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
  mappedTo?: string;
}

const EXPECTED_COLUMNS = [
  { name: 'reviewer_name', required: true, type: 'string' },
  { name: 'employee_name', required: true, type: 'string' },
  { name: 'review_text', required: true, type: 'string' },
  { name: 'rating', required: true, type: 'number' },
  { name: 'review_date', required: true, type: 'date' },
  { name: 'department', required: false, type: 'string' },
  { name: 'manager_name', required: false, type: 'string' },
];

export default function UploadRoom() {
  const { addLog } = useGame();
  const [files, setFiles] = useState<SimulatedFile[]>([]);
  const [activeFile, setActiveFile] = useState<SimulatedFile | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [pipelineStage, setPipelineStage] = useState<'idle' | 'ingestion' | 'validation' | 'storage'>('idle');

  // Simulate file upload
  const simulateUpload = () => {
    const newFile: SimulatedFile = {
      id: crypto.randomUUID(),
      name: 'performance_reviews_2024.csv',
      size: 245678,
      rows: 1247,
      columns: ['reviewer_name', 'employee_name', 'review_text', 'rating', 'review_date', 'department'],
      status: 'pending',
      progress: 0,
      errors: [],
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFile(newFile);
    addLog('info', 'upload', `File queued: ${newFile.name} (${newFile.rows} rows)`);
    processFile(newFile);
  };

  const simulateUploadWithErrors = () => {
    const newFile: SimulatedFile = {
      id: crypto.randomUUID(),
      name: 'reviews_bad_schema.csv',
      size: 189432,
      rows: 856,
      columns: ['name', 'feedback', 'score', 'date'], // Wrong column names
      status: 'pending',
      progress: 0,
      errors: [],
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFile(newFile);
    addLog('info', 'upload', `File queued: ${newFile.name} (${newFile.rows} rows)`);
    processFile(newFile);
  };

  const processFile = async (file: SimulatedFile) => {
    // Stage 1: Ingestion
    setPipelineStage('ingestion');
    addLog('info', 'upload', `Starting ingestion: ${file.name}`);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 100));
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, progress: i * 0.3, status: 'validating' } : f))
      );
    }

    // Stage 2: Validation
    setPipelineStage('validation');
    addLog('info', 'upload', `Validating schema: ${file.name}`);

    const results: ValidationResult[] = [];
    for (const expected of EXPECTED_COLUMNS) {
      const found = file.columns.find(
        (c) => c.toLowerCase() === expected.name.toLowerCase()
      );

      if (found) {
        results.push({
          column: expected.name,
          status: 'valid',
          message: 'Column matched',
          mappedTo: found,
        });
        addLog('info', 'upload', `Column validated: ${expected.name}`);
      } else {
        // Try fuzzy matching
        const similar = file.columns.find((c) =>
          c.toLowerCase().includes(expected.name.split('_')[0])
        );

        if (similar && !expected.required) {
          results.push({
            column: expected.name,
            status: 'warning',
            message: `Possible match: "${similar}"`,
            mappedTo: similar,
          });
          addLog('warn', 'upload', `Column fuzzy match: ${expected.name} → ${similar}`);
        } else if (expected.required) {
          results.push({
            column: expected.name,
            status: 'error',
            message: 'Required column missing',
          });
          addLog('error', 'upload', `Missing required column: ${expected.name}`);
        } else {
          results.push({
            column: expected.name,
            status: 'warning',
            message: 'Optional column not found',
          });
        }
      }

      await new Promise((r) => setTimeout(r, 150));
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, progress: 30 + (results.length / EXPECTED_COLUMNS.length) * 40 } : f
        )
      );
    }

    setValidationResults(results);

    const hasErrors = results.some((r) => r.status === 'error');

    if (hasErrors) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                status: 'error',
                progress: 70,
                errors: results.filter((r) => r.status === 'error').map((r) => r.message),
              }
            : f
        )
      );
      addLog('error', 'upload', `Validation failed: ${file.name} - Schema mismatch`);
      setPipelineStage('idle');
      return;
    }

    // Stage 3: Storage
    setPipelineStage('storage');
    addLog('info', 'upload', `Storing dataset: ${file.name}`);

    for (let i = 70; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 100));
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, progress: i } : f))
      );
    }

    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, status: 'complete', progress: 100 } : f))
    );

    addLog('info', 'upload', `Upload complete: ${file.name} → datasets table`);
    addLog('info', 'store', `New dataset record created: ${file.id}`);
    setPipelineStage('idle');
  };

  return (
    <div className={styles.room}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>UPLOAD ROOM</h1>
          <span className={styles.subtitle}>
            Calibrate Kindly: Admin upload page → datasets table
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={simulateUpload}>
            Simulate Valid Upload
          </button>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={simulateUploadWithErrors}>
            Simulate Schema Error
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* Pipeline Visualization */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Data Ingestion Pipeline</h2>
          <div className={styles.pipeline}>
            <PipelineStage
              name="INGESTION"
              description="CSV/Excel parsing"
              active={pipelineStage === 'ingestion'}
              complete={['validation', 'storage'].includes(pipelineStage)}
            />
            <PipelineConnector active={pipelineStage !== 'idle'} />
            <PipelineStage
              name="VALIDATION"
              description="Schema verification"
              active={pipelineStage === 'validation'}
              complete={pipelineStage === 'storage'}
              error={activeFile?.status === 'error'}
            />
            <PipelineConnector active={pipelineStage === 'storage' || (activeFile?.status === 'complete')} />
            <PipelineStage
              name="STORAGE"
              description="PostgreSQL insert"
              active={pipelineStage === 'storage'}
              complete={activeFile?.status === 'complete'}
            />
          </div>
        </section>

        {/* Schema Validation */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Schema Validation</h2>
          <div className={styles.schemaGrid}>
            <div className={styles.expectedSchema}>
              <h3 className={styles.subTitle}>Expected Schema (datasets table)</h3>
              <div className={styles.columnList}>
                {EXPECTED_COLUMNS.map((col) => (
                  <div key={col.name} className={styles.columnItem}>
                    <span className={styles.columnName}>{col.name}</span>
                    <span className={styles.columnType}>{col.type}</span>
                    <span className={col.required ? styles.required : styles.optional}>
                      {col.required ? 'required' : 'optional'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.validationResults}>
              <h3 className={styles.subTitle}>Validation Results</h3>
              {validationResults.length === 0 ? (
                <div className={styles.emptyState}>Upload a file to see validation results</div>
              ) : (
                <div className={styles.resultList}>
                  {validationResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`${styles.resultItem} ${styles[result.status]}`}
                    >
                      <StatusIcon status={result.status} />
                      <span className={styles.resultColumn}>{result.column}</span>
                      <span className={styles.resultMessage}>{result.message}</span>
                      {result.mappedTo && (
                        <span className={styles.mappedTo}>→ {result.mappedTo}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* File Queue */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Upload Queue</h2>
          {files.length === 0 ? (
            <div className={styles.emptyState}>No files in queue. Click "Simulate Upload" to begin.</div>
          ) : (
            <div className={styles.fileList}>
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`${styles.fileItem} ${file.status === 'error' ? styles.error : ''} ${
                    file.status === 'complete' ? styles.complete : ''
                  }`}
                >
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileMeta}>
                      {file.rows} rows • {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className={styles.fileProgress}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${file.progress}%`,
                          backgroundColor:
                            file.status === 'error'
                              ? 'var(--status-error)'
                              : file.status === 'complete'
                              ? 'var(--status-healthy)'
                              : 'var(--status-info)',
                        }}
                      />
                    </div>
                    <span className={styles.progressText}>{Math.round(file.progress)}%</span>
                  </div>
                  <span className={`${styles.fileStatus} ${styles[file.status]}`}>
                    {file.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Challenges */}
        <ChallengeList room="upload" />
      </div>
    </div>
  );
}

function PipelineStage({
  name,
  description,
  active,
  complete,
  error,
}: {
  name: string;
  description: string;
  active: boolean;
  complete: boolean;
  error?: boolean;
}) {
  return (
    <div
      className={`${styles.pipelineStage} ${active ? styles.active : ''} ${
        complete ? styles.complete : ''
      } ${error ? styles.error : ''}`}
    >
      <div className={styles.stageBox}>
        {complete && !error && <CheckIcon />}
        {error && <ErrorIcon />}
        {!complete && !error && <span className={styles.stageDot} />}
      </div>
      <span className={styles.stageName}>{name}</span>
      <span className={styles.stageDesc}>{description}</span>
    </div>
  );
}

function PipelineConnector({ active }: { active: boolean }) {
  return (
    <div className={`${styles.pipelineConnector} ${active ? styles.active : ''}`}>
      <svg viewBox="0 0 60 24" fill="none">
        <path
          d="M0 12h50M50 12l-8-8M50 12l-8 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function StatusIcon({ status }: { status: 'valid' | 'warning' | 'error' }) {
  if (status === 'valid') return <CheckIcon />;
  if (status === 'error') return <ErrorIcon />;
  return <WarningIcon />;
}

function CheckIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
