import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import ChallengeList from '@/components/ChallengeList';
import styles from './Room.module.css';

interface PageState {
  name: string;
  path: string;
  status: 'loading' | 'ready' | 'error' | 'stale';
  loadTime: number;
  dataSource: string[];
  components: ComponentState[];
}

interface ComponentState {
  name: string;
  type: 'chart' | 'table' | 'filter' | 'card';
  status: 'loading' | 'ready' | 'error' | 'empty';
  dataReady: boolean;
  error?: string;
}

interface DataContext {
  datasets: boolean;
  reviews: boolean;
  analysis: boolean;
  user: boolean;
}

const INITIAL_PAGES: PageState[] = [
  {
    name: 'Performance Reviews',
    path: '/reviews',
    status: 'loading',
    loadTime: 0,
    dataSource: ['datasets', 'dataset_reviews'],
    components: [
      { name: 'DatasetSelector', type: 'filter', status: 'loading', dataReady: false },
      { name: 'ReviewsTable', type: 'table', status: 'loading', dataReady: false },
      { name: 'MQIChart', type: 'chart', status: 'loading', dataReady: false },
    ],
  },
  {
    name: 'Manager Capabilities',
    path: '/capabilities',
    status: 'loading',
    loadTime: 0,
    dataSource: ['dataset_reviews', 'analysis'],
    components: [
      { name: 'CapabilityRadar', type: 'chart', status: 'loading', dataReady: false },
      { name: 'SkillsBreakdown', type: 'chart', status: 'loading', dataReady: false },
      { name: 'ManagerList', type: 'table', status: 'loading', dataReady: false },
    ],
  },
  {
    name: 'Engagement Analytics',
    path: '/engagement',
    status: 'loading',
    loadTime: 0,
    dataSource: ['dataset_reviews', 'analysis'],
    components: [
      { name: 'EngagementTrends', type: 'chart', status: 'loading', dataReady: false },
      { name: 'SentimentAnalysis', type: 'chart', status: 'loading', dataReady: false },
      { name: 'TeamComparison', type: 'table', status: 'loading', dataReady: false },
    ],
  },
  {
    name: 'Admin Upload',
    path: '/admin/upload',
    status: 'loading',
    loadTime: 0,
    dataSource: ['datasets'],
    components: [
      { name: 'FileUploader', type: 'card', status: 'loading', dataReady: false },
      { name: 'DatasetList', type: 'table', status: 'loading', dataReady: false },
    ],
  },
];

export default function ScreensRoom() {
  const { addLog } = useGame();
  const [pages, setPages] = useState<PageState[]>(INITIAL_PAGES);
  const [dataContext, setDataContext] = useState<DataContext>({
    datasets: false,
    reviews: false,
    analysis: false,
    user: false,
  });
  const [activeDataset, setActiveDataset] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>('Performance Reviews');

  const simulatePageLoad = async () => {
    addLog('info', 'screens', 'Loading React components...');

    // Reset all pages
    setPages(INITIAL_PAGES);

    // Simulate context loading
    await new Promise((r) => setTimeout(r, 300));
    setDataContext((prev) => ({ ...prev, user: true }));
    addLog('info', 'screens', 'UserContext loaded');

    await new Promise((r) => setTimeout(r, 200));
    setDataContext((prev) => ({ ...prev, datasets: true }));
    addLog('info', 'screens', 'DatasetsContext loaded');

    // Load each page
    for (const page of INITIAL_PAGES) {
      const startTime = Date.now();

      // Check data dependencies
      const hasAllData = page.dataSource.every((source) => {
        if (source === 'datasets') return dataContext.datasets;
        if (source === 'dataset_reviews') return dataContext.reviews;
        if (source === 'analysis') return dataContext.analysis;
        return true;
      });

      // Update page status
      setPages((prev) =>
        prev.map((p) =>
          p.name === page.name
            ? {
                ...p,
                status: hasAllData ? 'ready' : 'loading',
                loadTime: Date.now() - startTime,
                components: p.components.map((c) => ({
                  ...c,
                  status: hasAllData ? 'ready' : 'loading',
                  dataReady: hasAllData,
                })),
              }
            : p
        )
      );

      await new Promise((r) => setTimeout(r, 150));
    }

    // Load reviews data
    await new Promise((r) => setTimeout(r, 400));
    setDataContext((prev) => ({ ...prev, reviews: true }));
    addLog('info', 'screens', 'ReviewsContext loaded');

    // Update pages that depend on reviews
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        status: 'ready',
        components: p.components.map((c) => ({ ...c, status: 'ready', dataReady: true })),
      }))
    );

    // Load analysis data
    await new Promise((r) => setTimeout(r, 500));
    setDataContext((prev) => ({ ...prev, analysis: true }));
    addLog('info', 'screens', 'AnalysisContext loaded - All components ready');
  };

  const simulateBlankPanels = async () => {
    addLog('warn', 'screens', 'Simulating blank panels scenario...');

    // Set one page to have blank panels
    setPages((prev) =>
      prev.map((p) =>
        p.name === 'Performance Reviews'
          ? {
              ...p,
              status: 'error',
              components: p.components.map((c) => ({
                ...c,
                status: 'empty',
                dataReady: false,
                error: 'No data available',
              })),
            }
          : p
      )
    );

    addLog('error', 'screens', 'ReviewsTable rendered before data ready');
    addLog('error', 'screens', 'MQIChart shows blank - activeDataset is null');
    addLog('warn', 'screens', 'Fix: Check DatasetContext before rendering components');
  };

  const simulateWrongDataset = async () => {
    addLog('warn', 'screens', 'Simulating wrong dataset context...');

    setActiveDataset('dataset_OLD');
    addLog('error', 'screens', 'DatasetSelector showing stale dataset');
    addLog('error', 'store', 'Cache returned old dataset_id');
    addLog('warn', 'screens', 'Fix: Invalidate cache when switching datasets');
  };

  const selectDataset = (datasetId: string) => {
    setActiveDataset(datasetId);
    addLog('info', 'screens', `Dataset selected: ${datasetId}`);

    // Simulate component updates
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        components: p.components.map((c) => ({
          ...c,
          status: 'ready',
          dataReady: true,
        })),
      }))
    );
  };

  useEffect(() => {
    simulatePageLoad();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentPage = pages.find((p) => p.name === selectedPage);

  return (
    <div className={styles.room}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>SCREENS ROOM</h1>
          <span className={styles.subtitle}>
            Calibrate Kindly: React pages, components, and dashboards
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={simulatePageLoad}>
            Reload All Pages
          </button>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={simulateBlankPanels}>
            Simulate Blank Panels
          </button>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={simulateWrongDataset}>
            Simulate Wrong Dataset
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* Data Context Status */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>React Context State</h2>
          <div className={styles.contextGrid}>
            <div className={`${styles.contextItem} ${dataContext.user ? styles.ready : styles.loading}`}>
              <span className={styles.contextIndicator} />
              <span className={styles.contextName}>UserContext</span>
              <span className={styles.contextStatus}>{dataContext.user ? 'Ready' : 'Loading'}</span>
            </div>
            <div className={`${styles.contextItem} ${dataContext.datasets ? styles.ready : styles.loading}`}>
              <span className={styles.contextIndicator} />
              <span className={styles.contextName}>DatasetsContext</span>
              <span className={styles.contextStatus}>{dataContext.datasets ? 'Ready' : 'Loading'}</span>
            </div>
            <div className={`${styles.contextItem} ${dataContext.reviews ? styles.ready : styles.loading}`}>
              <span className={styles.contextIndicator} />
              <span className={styles.contextName}>ReviewsContext</span>
              <span className={styles.contextStatus}>{dataContext.reviews ? 'Ready' : 'Loading'}</span>
            </div>
            <div className={`${styles.contextItem} ${dataContext.analysis ? styles.ready : styles.loading}`}>
              <span className={styles.contextIndicator} />
              <span className={styles.contextName}>AnalysisContext</span>
              <span className={styles.contextStatus}>{dataContext.analysis ? 'Ready' : 'Loading'}</span>
            </div>
          </div>
          <div className={styles.datasetSelector}>
            <span className={styles.selectorLabel}>Active Dataset:</span>
            <select
              value={activeDataset || ''}
              onChange={(e) => selectDataset(e.target.value)}
              className={styles.datasetSelect}
            >
              <option value="">Select a dataset</option>
              <option value="dataset_2024_Q4">Performance Reviews 2024 Q4</option>
              <option value="dataset_2024_Q3">Performance Reviews 2024 Q3</option>
              <option value="dataset_OLD">Old Dataset (Stale)</option>
            </select>
          </div>
        </section>

        {/* Pages Overview */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Pages</h2>
          <div className={styles.pagesGrid}>
            {pages.map((page) => (
              <div
                key={page.name}
                className={`${styles.pageCard} ${selectedPage === page.name ? styles.selected : ''} ${
                  styles[page.status]
                }`}
                onClick={() => setSelectedPage(page.name)}
              >
                <div className={styles.pageHeader}>
                  <span className={`${styles.pageIndicator} ${styles[page.status]}`} />
                  <span className={styles.pageName}>{page.name}</span>
                </div>
                <span className={styles.pagePath}>{page.path}</span>
                <div className={styles.pageDataSources}>
                  {page.dataSource.map((ds) => (
                    <span key={ds} className={styles.dataSourceBadge}>
                      {ds}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Component Detail */}
        {currentPage && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{currentPage.name} - Components</h2>
            <div className={styles.componentsGrid}>
              {currentPage.components.map((comp) => (
                <div key={comp.name} className={`${styles.componentCard} ${styles[comp.status]}`}>
                  <div className={styles.componentHeader}>
                    <span className={`${styles.componentIndicator} ${styles[comp.status]}`} />
                    <span className={styles.componentName}>{comp.name}</span>
                    <span className={styles.componentType}>{comp.type}</span>
                  </div>
                  <div className={styles.componentStatus}>
                    <span>Data Ready: {comp.dataReady ? 'Yes' : 'No'}</span>
                    <span>Status: {comp.status}</span>
                  </div>
                  {comp.error && <span className={styles.componentError}>{comp.error}</span>}
                  <div className={styles.componentPreview}>
                    {comp.status === 'loading' && <LoadingPreview />}
                    {comp.status === 'ready' && <ReadyPreview type={comp.type} />}
                    {comp.status === 'empty' && <EmptyPreview />}
                    {comp.status === 'error' && <ErrorPreview />}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Render Lifecycle */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Component Render Lifecycle</h2>
          <div className={styles.lifecycle}>
            <div className={styles.lifecycleStep}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepName}>Mount</span>
              <span className={styles.stepDesc}>Component renders with loading state</span>
            </div>
            <div className={styles.lifecycleArrow}>→</div>
            <div className={styles.lifecycleStep}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepName}>useEffect</span>
              <span className={styles.stepDesc}>Fetch data from context/API</span>
            </div>
            <div className={styles.lifecycleArrow}>→</div>
            <div className={styles.lifecycleStep}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepName}>Check Data</span>
              <span className={styles.stepDesc}>Verify data exists before render</span>
            </div>
            <div className={styles.lifecycleArrow}>→</div>
            <div className={styles.lifecycleStep}>
              <span className={styles.stepNumber}>4</span>
              <span className={styles.stepName}>Render</span>
              <span className={styles.stepDesc}>Display data or error state</span>
            </div>
          </div>
        </section>

        {/* Challenges */}
        <ChallengeList room="screens" />
      </div>
    </div>
  );
}

function LoadingPreview() {
  return (
    <div className={styles.previewLoading}>
      <div className={styles.skeleton} />
      <div className={styles.skeleton} style={{ width: '60%' }} />
      <div className={styles.skeleton} style={{ width: '80%' }} />
    </div>
  );
}

function ReadyPreview({ type }: { type: string }) {
  if (type === 'chart') {
    return (
      <div className={styles.previewChart}>
        <div className={styles.chartBar} style={{ height: '60%' }} />
        <div className={styles.chartBar} style={{ height: '80%' }} />
        <div className={styles.chartBar} style={{ height: '45%' }} />
        <div className={styles.chartBar} style={{ height: '90%' }} />
        <div className={styles.chartBar} style={{ height: '70%' }} />
      </div>
    );
  }
  if (type === 'table') {
    return (
      <div className={styles.previewTable}>
        <div className={styles.tableRow} />
        <div className={styles.tableRow} />
        <div className={styles.tableRow} />
      </div>
    );
  }
  return (
    <div className={styles.previewCard}>
      <div className={styles.cardIcon}>✓</div>
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className={styles.previewEmpty}>
      <span>No Data</span>
    </div>
  );
}

function ErrorPreview() {
  return (
    <div className={styles.previewError}>
      <span>Error</span>
    </div>
  );
}
