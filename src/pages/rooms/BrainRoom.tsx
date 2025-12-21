import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import ChallengeList from '@/components/ChallengeList';
import styles from './Room.module.css';

interface EdgeFunction {
  name: string;
  description: string;
  status: 'healthy' | 'degraded' | 'error' | 'processing';
  invocations: number;
  avgLatency: number;
  errorRate: number;
}

interface AnalysisJob {
  id: string;
  functionName: string;
  datasetId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial';
  progress: number;
  itemsProcessed: number;
  itemsTotal: number;
  itemsFailed: number;
  startedAt: number;
  error?: string;
}

interface QuotaState {
  used: number;
  limit: number;
  resetAt: number;
}

const INITIAL_FUNCTIONS: EdgeFunction[] = [
  {
    name: 'analyze-review',
    description: 'Analyzes single review for MQI scoring via OpenAI',
    status: 'healthy',
    invocations: 0,
    avgLatency: 800,
    errorRate: 0,
  },
  {
    name: 'analyze-skills',
    description: 'Extracts skills from review text',
    status: 'healthy',
    invocations: 0,
    avgLatency: 600,
    errorRate: 0,
  },
  {
    name: 'batch-analyze-reviews',
    description: 'Batch processes multiple reviews',
    status: 'healthy',
    invocations: 0,
    avgLatency: 5000,
    errorRate: 0,
  },
  {
    name: 'batch-analyze-skills',
    description: 'Batch extracts skills from multiple reviews',
    status: 'healthy',
    invocations: 0,
    avgLatency: 4500,
    errorRate: 0,
  },
  {
    name: 'generate-recommendations',
    description: 'Generates team improvement recommendations',
    status: 'healthy',
    invocations: 0,
    avgLatency: 1200,
    errorRate: 0,
  },
  {
    name: 'individual-recommendations',
    description: 'Generates personalized individual recommendations',
    status: 'healthy',
    invocations: 0,
    avgLatency: 1500,
    errorRate: 0,
  },
  {
    name: 'risk-assessment',
    description: 'Assesses attrition and engagement risks',
    status: 'healthy',
    invocations: 0,
    avgLatency: 1800,
    errorRate: 0,
  },
  {
    name: 'generate-executive-insights',
    description: 'Creates executive summary insights',
    status: 'healthy',
    invocations: 0,
    avgLatency: 2000,
    errorRate: 0,
  },
  {
    name: 'generate-diagnostics',
    description: 'Generates diagnostic reports',
    status: 'healthy',
    invocations: 0,
    avgLatency: 900,
    errorRate: 0,
  },
  {
    name: 'analyze-manager-capabilities',
    description: 'Analyzes manager performance capabilities',
    status: 'healthy',
    invocations: 0,
    avgLatency: 2200,
    errorRate: 0,
  },
  {
    name: 'check-quota',
    description: 'Checks OpenAI API usage quota',
    status: 'healthy',
    invocations: 0,
    avgLatency: 50,
    errorRate: 0,
  },
];

export default function BrainRoom() {
  const { addLog } = useGame();
  const [functions, setFunctions] = useState<EdgeFunction[]>(INITIAL_FUNCTIONS);
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [quota, setQuota] = useState<QuotaState>({ used: 2500, limit: 10000, resetAt: Date.now() + 86400000 });
  const [apiStatus, setApiStatus] = useState<{ openai: 'healthy' | 'degraded' | 'error'; supabase: 'healthy' | 'error' }>({
    openai: 'healthy',
    supabase: 'healthy',
  });

  const runAnalysis = async (functionName: string, itemCount: number = 50, simulatePartialFailure: boolean = false) => {
    const job: AnalysisJob = {
      id: crypto.randomUUID(),
      functionName,
      datasetId: 'dataset_001',
      status: 'queued',
      progress: 0,
      itemsProcessed: 0,
      itemsTotal: itemCount,
      itemsFailed: 0,
      startedAt: Date.now(),
    };

    setJobs((prev) => [job, ...prev]);
    addLog('info', 'brain', `Job queued: ${functionName} for ${itemCount} items`);

    // Update function status
    setFunctions((prev) =>
      prev.map((f) => (f.name === functionName ? { ...f, status: 'processing' } : f))
    );

    await new Promise((r) => setTimeout(r, 500));

    // Start processing
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: 'processing' } : j))
    );

    addLog('info', 'brain', `Starting ${functionName} execution`);

    let failurePoint = simulatePartialFailure ? Math.floor(itemCount * 0.6) : -1;
    let quotaExceeded = false;

    for (let i = 0; i < itemCount; i++) {
      // Check quota
      if (quota.used + 10 > quota.limit) {
        quotaExceeded = true;
        addLog('error', 'brain', 'API quota exceeded - halting job');
        break;
      }

      // Simulate partial failure
      if (simulatePartialFailure && i === failurePoint) {
        addLog('error', 'brain', `OpenAI API timeout at item ${i}`);
        setApiStatus((prev) => ({ ...prev, openai: 'degraded' }));
        await new Promise((r) => setTimeout(r, 300));
      }

      const failed = simulatePartialFailure && i >= failurePoint;

      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? {
                ...j,
                progress: ((i + 1) / itemCount) * 100,
                itemsProcessed: i + 1,
                itemsFailed: failed ? j.itemsFailed + 1 : j.itemsFailed,
              }
            : j
        )
      );

      // Update quota
      setQuota((prev) => ({ ...prev, used: prev.used + 10 }));

      await new Promise((r) => setTimeout(r, 100));
    }

    // Final status
    const finalStatus = quotaExceeded
      ? 'failed'
      : simulatePartialFailure
      ? 'partial'
      : 'completed';

    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id
          ? {
              ...j,
              status: finalStatus,
              error: quotaExceeded
                ? 'Quota exceeded'
                : simulatePartialFailure
                ? 'Partial completion due to API timeouts'
                : undefined,
            }
          : j
      )
    );

    // Update function stats
    setFunctions((prev) =>
      prev.map((f) =>
        f.name === functionName
          ? {
              ...f,
              status: simulatePartialFailure ? 'degraded' : 'healthy',
              invocations: f.invocations + 1,
              errorRate: simulatePartialFailure ? 40 : f.errorRate,
            }
          : f
      )
    );

    addLog(
      finalStatus === 'completed' ? 'info' : 'warn',
      'brain',
      `Job ${finalStatus}: ${functionName} - ${job.itemsProcessed}/${itemCount} processed`
    );

    if (finalStatus === 'completed') {
      addLog('info', 'store', `MQI scores updated in dataset_reviews for ${itemCount} records`);
    }
  };

  const simulateQuotaExhaustion = () => {
    setQuota((prev) => ({ ...prev, used: prev.limit - 50 }));
    addLog('warn', 'brain', 'Quota near exhaustion - 50 tokens remaining');
  };

  const resetQuota = () => {
    setQuota((prev) => ({ ...prev, used: 0 }));
    setApiStatus({ openai: 'healthy', supabase: 'healthy' });
    addLog('info', 'brain', 'Quota reset - API services restored');
  };

  return (
    <div className={styles.room}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>BRAIN ROOM</h1>
          <span className={styles.subtitle}>
            Calibrate Kindly: Supabase Edge Functions + OpenAI Analysis
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => runAnalysis('batch-analyze-reviews', 30)}>
            Run Batch Analysis
          </button>
          <button
            className={`${styles.actionBtn} ${styles.secondary}`}
            onClick={() => runAnalysis('batch-analyze-reviews', 50, true)}
          >
            Simulate Partial Failure
          </button>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={simulateQuotaExhaustion}>
            Exhaust Quota
          </button>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={resetQuota}>
            Reset
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* API Health & Quota */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>API Health & Quota</h2>
          <div className={styles.apiHealth}>
            <div className={styles.apiService}>
              <div className={`${styles.apiIndicator} ${styles[apiStatus.openai]}`} />
              <span className={styles.apiName}>OpenAI</span>
              <span className={styles.apiStatusText}>{apiStatus.openai}</span>
            </div>
            <div className={styles.apiService}>
              <div className={`${styles.apiIndicator} ${styles[apiStatus.supabase]}`} />
              <span className={styles.apiName}>Supabase</span>
              <span className={styles.apiStatusText}>{apiStatus.supabase}</span>
            </div>
            <div className={styles.quotaDisplay}>
              <div className={styles.quotaHeader}>
                <span className={styles.quotaLabel}>API Quota</span>
                <span className={styles.quotaValue}>
                  {quota.used.toLocaleString()} / {quota.limit.toLocaleString()}
                </span>
              </div>
              <div className={styles.quotaBar}>
                <div
                  className={`${styles.quotaFill} ${
                    quota.used / quota.limit > 0.8 ? styles.quotaWarning : ''
                  } ${quota.used / quota.limit > 0.95 ? styles.quotaDanger : ''}`}
                  style={{ width: `${(quota.used / quota.limit) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Edge Functions */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Edge Functions</h2>
          <div className={styles.functionsGrid}>
            {functions.map((fn) => (
              <div key={fn.name} className={`${styles.functionCard} ${styles[fn.status]}`}>
                <div className={styles.functionHeader}>
                  <span className={`${styles.functionIndicator} ${styles[fn.status]}`} />
                  <span className={styles.functionName}>{fn.name}</span>
                </div>
                <p className={styles.functionDesc}>{fn.description}</p>
                <div className={styles.functionStats}>
                  <span>Invocations: {fn.invocations}</span>
                  <span>Avg Latency: {fn.avgLatency}ms</span>
                  <span>Error Rate: {fn.errorRate}%</span>
                </div>
                <button
                  className={styles.invokeBtn}
                  onClick={() => runAnalysis(fn.name, 10)}
                  disabled={fn.status === 'processing'}
                >
                  {fn.status === 'processing' ? 'Running...' : 'Invoke'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Active Jobs */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Analysis Jobs</h2>
          {jobs.length === 0 ? (
            <div className={styles.emptyState}>No jobs running. Click "Run Batch Analysis" to start.</div>
          ) : (
            <div className={styles.jobsList}>
              {jobs.map((job) => (
                <div key={job.id} className={`${styles.jobItem} ${styles[job.status]}`}>
                  <div className={styles.jobHeader}>
                    <span className={styles.jobFunction}>{job.functionName}</span>
                    <span className={`${styles.jobStatus} ${styles[job.status]}`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.jobProgress}>
                    <div className={styles.jobProgressBar}>
                      <div
                        className={`${styles.jobProgressFill} ${
                          job.status === 'failed' ? styles.failed : ''
                        } ${job.status === 'partial' ? styles.partial : ''}`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <span className={styles.jobProgressText}>
                      {job.itemsProcessed}/{job.itemsTotal}
                      {job.itemsFailed > 0 && (
                        <span className={styles.failedCount}> ({job.itemsFailed} failed)</span>
                      )}
                    </span>
                  </div>
                  {job.error && <span className={styles.jobError}>{job.error}</span>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Data Flow Diagram */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Analysis Data Flow</h2>
          <div className={styles.dataFlowDiagram}>
            <div className={styles.flowNode}>
              <div className={styles.flowBox}>dataset_reviews</div>
              <span className={styles.flowLabel}>Source</span>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowNode}>
              <div className={styles.flowBox}>Edge Function</div>
              <span className={styles.flowLabel}>analyze-review</span>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowNode}>
              <div className={styles.flowBox}>OpenAI API</div>
              <span className={styles.flowLabel}>GPT-4</span>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowNode}>
              <div className={styles.flowBox}>MQI Score</div>
              <span className={styles.flowLabel}>Result</span>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowNode}>
              <div className={styles.flowBox}>dataset_reviews</div>
              <span className={styles.flowLabel}>Update</span>
            </div>
          </div>
        </section>

        {/* Challenges */}
        <ChallengeList room="brain" />
      </div>
    </div>
  );
}
