import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import ChallengeList from '@/components/ChallengeList';
import styles from './Room.module.css';

interface PIIItem {
  id: string;
  field: string;
  type: 'name' | 'email' | 'phone' | 'id_number';
  value: string;
  action: 'redact' | 'hash' | 'generalize';
  processed: boolean;
}

interface SanitisationStage {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  itemsProcessed: number;
  itemsTotal: number;
}

const SAMPLE_RAW_DATA = [
  { reviewer_name: 'John Smith', employee_name: 'Sarah Johnson', review_text: 'Sarah has shown excellent leadership...', rating: 4 },
  { reviewer_name: 'Emily Davis', employee_name: 'Michael Brown', review_text: 'Michael needs improvement in communication...', rating: 3 },
  { reviewer_name: 'David Wilson', employee_name: 'Jennifer Lee', review_text: 'Contact Jennifer at jennifer.lee@company.com for details...', rating: 5 },
];

export default function CleanRoom() {
  const { addLog } = useGame();
  const [stages, setStages] = useState<SanitisationStage[]>([
    { id: 'pii', name: 'PII Detection', status: 'pending', itemsProcessed: 0, itemsTotal: 0 },
    { id: 'anon', name: 'Anonymisation', status: 'pending', itemsProcessed: 0, itemsTotal: 0 },
    { id: 'valid', name: 'Validation', status: 'pending', itemsProcessed: 0, itemsTotal: 0 },
    { id: 'transform', name: 'Transformation', status: 'pending', itemsProcessed: 0, itemsTotal: 0 },
  ]);
  const [piiItems, setPiiItems] = useState<PIIItem[]>([]);
  const [rawData] = useState(SAMPLE_RAW_DATA);
  const [sanitizedData, setSanitizedData] = useState<typeof SAMPLE_RAW_DATA>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [violationAlert, setViolationAlert] = useState<string[] | null>(null);

  const runSanitisation = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPiiItems([]);
    setSanitizedData([]);

    addLog('info', 'clean', 'Starting sanitisation pipeline');

    // Stage 1: PII Detection
    setStages((prev) =>
      prev.map((s) => (s.id === 'pii' ? { ...s, status: 'processing', itemsTotal: rawData.length } : s))
    );

    const detectedPII: PIIItem[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];

      // Detect names
      if (row.reviewer_name) {
        detectedPII.push({
          id: crypto.randomUUID(),
          field: 'reviewer_name',
          type: 'name',
          value: row.reviewer_name,
          action: 'hash',
          processed: false,
        });
      }
      if (row.employee_name) {
        detectedPII.push({
          id: crypto.randomUUID(),
          field: 'employee_name',
          type: 'name',
          value: row.employee_name,
          action: 'hash',
          processed: false,
        });
      }

      // Detect emails in review text
      const emailMatch = row.review_text.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        detectedPII.push({
          id: crypto.randomUUID(),
          field: 'review_text',
          type: 'email',
          value: emailMatch[0],
          action: 'redact',
          processed: false,
        });
        addLog('warn', 'clean', `PII detected: Email in review_text row ${i + 1}`);
      }

      setPiiItems([...detectedPII]);
      setStages((prev) =>
        prev.map((s) => (s.id === 'pii' ? { ...s, itemsProcessed: i + 1 } : s))
      );

      await new Promise((r) => setTimeout(r, 200));
    }

    addLog('info', 'clean', `PII detection complete: ${detectedPII.length} items found`);
    setStages((prev) =>
      prev.map((s) => (s.id === 'pii' ? { ...s, status: 'complete' } : s))
    );

    // Stage 2: Anonymisation
    setStages((prev) =>
      prev.map((s) =>
        s.id === 'anon' ? { ...s, status: 'processing', itemsTotal: detectedPII.length } : s
      )
    );

    for (let i = 0; i < detectedPII.length; i++) {
      const item = detectedPII[i];
      item.processed = true;
      setPiiItems([...detectedPII]);
      setStages((prev) =>
        prev.map((s) => (s.id === 'anon' ? { ...s, itemsProcessed: i + 1 } : s))
      );

      addLog('info', 'clean', `Anonymising ${item.type}: ${item.action} applied`);
      await new Promise((r) => setTimeout(r, 150));
    }

    setStages((prev) =>
      prev.map((s) => (s.id === 'anon' ? { ...s, status: 'complete' } : s))
    );

    // Stage 3: Validation
    setStages((prev) =>
      prev.map((s) =>
        s.id === 'valid' ? { ...s, status: 'processing', itemsTotal: rawData.length } : s
      )
    );

    for (let i = 0; i < rawData.length; i++) {
      setStages((prev) =>
        prev.map((s) => (s.id === 'valid' ? { ...s, itemsProcessed: i + 1 } : s))
      );
      await new Promise((r) => setTimeout(r, 100));
    }

    addLog('info', 'clean', 'Validation complete: All records sanitised');
    setStages((prev) =>
      prev.map((s) => (s.id === 'valid' ? { ...s, status: 'complete' } : s))
    );

    // Stage 4: Transformation (raw_data → sanitized_data)
    setStages((prev) =>
      prev.map((s) =>
        s.id === 'transform' ? { ...s, status: 'processing', itemsTotal: rawData.length } : s
      )
    );

    const sanitized = rawData.map((row) => ({
      reviewer_name: `REVIEWER_${hashString(row.reviewer_name).substring(0, 8)}`,
      employee_name: `EMP_${hashString(row.employee_name).substring(0, 8)}`,
      review_text: row.review_text.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL_REDACTED]'),
      rating: row.rating,
    }));

    for (let i = 0; i < sanitized.length; i++) {
      setSanitizedData(sanitized.slice(0, i + 1));
      setStages((prev) =>
        prev.map((s) => (s.id === 'transform' ? { ...s, itemsProcessed: i + 1 } : s))
      );
      await new Promise((r) => setTimeout(r, 150));
    }

    addLog('info', 'clean', 'Transformation complete: raw_data → sanitized_data');
    addLog('info', 'store', 'Sanitized data ready for dataset_reviews table');

    setStages((prev) =>
      prev.map((s) => (s.id === 'transform' ? { ...s, status: 'complete' } : s))
    );

    setIsProcessing(false);
  };

  const simulatePrivacyViolation = async () => {
    const violations = [
      'TD user accessed raw_data field - VIOLATION',
      'Sanitisation bypassed: UI masking instead of data transformation',
      'Fix required: Move sanitisation to Clean Room, not Screens Room',
    ];

    setViolationAlert(violations);
    addLog('warn', 'clean', 'Simulating privacy violation scenario...');
    addLog('error', 'screens', violations[0]);
    addLog('error', 'clean', violations[1]);
    addLog('warn', 'clean', violations[2]);
  };

  const dismissViolationAlert = () => {
    setViolationAlert(null);
  };

  return (
    <div className={styles.room}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>CLEAN ROOM</h1>
          <span className={styles.subtitle}>
            Calibrate Kindly: raw_data → sanitized_data in dataset_reviews
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={runSanitisation} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Run Sanitisation'}
          </button>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={simulatePrivacyViolation}>
            Simulate Violation
          </button>
        </div>
      </header>

      {/* Violation Alert */}
      {violationAlert && (
        <div className={styles.violationAlert}>
          <div className={styles.violationHeader}>
            <span className={styles.violationIcon}>⚠️</span>
            <span className={styles.violationTitle}>Privacy Violation Detected!</span>
            <button className={styles.violationDismiss} onClick={dismissViolationAlert}>×</button>
          </div>
          <ul className={styles.violationList}>
            {violationAlert.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
          <p className={styles.violationHint}>
            This demonstrates what happens when sanitisation is bypassed. In Calibrate Kindly,
            all PII must be removed in the Clean Room before data reaches any user-facing screen.
          </p>
        </div>
      )}

      <div className={styles.content}>
        {/* Sanitisation Pipeline */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Sanitisation Pipeline</h2>
          <div className={styles.pipelineVertical}>
            {stages.map((stage, idx) => (
              <div key={stage.id} className={styles.stageRow}>
                <div
                  className={`${styles.stageNode} ${
                    stage.status === 'processing' ? styles.processing : ''
                  } ${stage.status === 'complete' ? styles.complete : ''}`}
                >
                  {stage.status === 'complete' ? (
                    <CheckIcon />
                  ) : stage.status === 'processing' ? (
                    <span className={styles.spinner} />
                  ) : (
                    <span className={styles.stageDot} />
                  )}
                </div>
                <div className={styles.stageInfo}>
                  <span className={styles.stageName}>{stage.name}</span>
                  {stage.status !== 'pending' && (
                    <span className={styles.stageProgress}>
                      {stage.itemsProcessed} / {stage.itemsTotal}
                    </span>
                  )}
                </div>
                {idx < stages.length - 1 && <div className={styles.stageLine} />}
              </div>
            ))}
          </div>
        </section>

        {/* PII Detection Results */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>PII Detection</h2>
          {piiItems.length === 0 ? (
            <div className={styles.emptyState}>Run sanitisation to detect PII</div>
          ) : (
            <div className={styles.piiGrid}>
              {piiItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.piiItem} ${item.processed ? styles.processed : ''}`}
                >
                  <span className={styles.piiType}>{item.type.toUpperCase()}</span>
                  <span className={styles.piiField}>{item.field}</span>
                  <span className={styles.piiValue}>{item.value}</span>
                  <span className={`${styles.piiAction} ${styles[item.action]}`}>
                    {item.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Data Comparison */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Data Transformation</h2>
          <div className={styles.dataComparison}>
            <div className={styles.dataColumn}>
              <h3 className={styles.subTitle}>raw_data (Before)</h3>
              <div className={styles.dataTable}>
                {rawData.map((row, idx) => (
                  <div key={idx} className={styles.dataRow}>
                    <span className={styles.dataCell}>{row.reviewer_name}</span>
                    <span className={styles.dataCell}>{row.employee_name}</span>
                    <span className={`${styles.dataCell} ${styles.reviewText}`}>
                      {row.review_text.substring(0, 40)}...
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.transformArrow}>→</div>
            <div className={styles.dataColumn}>
              <h3 className={styles.subTitle}>sanitized_data (After)</h3>
              <div className={styles.dataTable}>
                {sanitizedData.length === 0 ? (
                  <div className={styles.emptyState}>Awaiting transformation</div>
                ) : (
                  sanitizedData.map((row, idx) => (
                    <div key={idx} className={`${styles.dataRow} ${styles.sanitized}`}>
                      <span className={styles.dataCell}>{row.reviewer_name}</span>
                      <span className={styles.dataCell}>{row.employee_name}</span>
                      <span className={`${styles.dataCell} ${styles.reviewText}`}>
                        {row.review_text.substring(0, 40)}...
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Challenges */}
        <ChallengeList room="clean" />
      </div>
    </div>
  );
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

function CheckIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
