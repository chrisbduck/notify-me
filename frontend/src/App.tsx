import { useState, useEffect, useRef } from 'react';
import './App.css';
import AlertRow from './AlertRow';
import { type AlertModel, Severity, sortBySeverity } from './model';

const isLocalHost: boolean = window.location.href.includes('localhost');
const localHostApiRootURL = 'http://localhost:7071';
const apiRootURL = `${isLocalHost ? localHostApiRootURL : ''}/api`;
const getAlertsURL = `${apiRootURL}/getAlerts`;

// Control constant for enabling severity override for testing
const ENABLE_SEVERITY_OVERRIDE_FOR_TESTING = isLocalHost && false;

const overrideAlertSeveritiesForTesting = (alertsToModify: AlertModel[]): AlertModel[] => {
  const severityLevels = [Severity.INFO, Severity.WARNING, Severity.SEVERE, Severity.UNKNOWN_SEVERITY];
  return alertsToModify.map((alert, index) => ({
    ...alert,
    severity_level: severityLevels[index % severityLevels.length],
  }));
};

function processAlerts(alerts: AlertModel[]): AlertModel[] {
  const processedAlerts = ENABLE_SEVERITY_OVERRIDE_FOR_TESTING ? overrideAlertSeveritiesForTesting(alerts) : alerts;
  return sortBySeverity(processedAlerts);
}

function App() {
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const lastFetchTimestamp = useRef<number>(0); // Store timestamp of last fetch
  const intervalIdRef = useRef<number | null>(null); // Store interval ID
  const refreshQueued = useRef<boolean>(false); // Track if a refresh is queued

  const fetchAlerts = async () => {
    // Prevent re-fetch within 60 seconds
    const now = Date.now();
    if (now - lastFetchTimestamp.current < 60000 && lastFetchTimestamp.current !== 0) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getAlertsURL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const alerts: AlertModel[] = await response.json();
      const processedAlerts = processAlerts(alerts);
      setAlerts(processedAlerts);
      setLastFetched(new Date().toLocaleTimeString());
      lastFetchTimestamp.current = now;
    } catch (err) {
      setError("Failed to fetch alerts.");
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(); // Initial fetch

    const startInterval = () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
      intervalIdRef.current = setInterval(fetchAlerts, 60000) as unknown as number;
    };

    const stopInterval = () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startInterval();
        if (refreshQueued.current) {
          fetchAlerts();
          refreshQueued.current = false;
        }
      } else {
        stopInterval();
        refreshQueued.current = true; // Queue a refresh for when the tab becomes visible
      }
    };

    startInterval(); // Start interval on mount

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sound Transit Alerts</h1>
        {loading ? <p>Loading alerts...</p> : lastFetched && <p>Last updated: {lastFetched}</p>}
      </header>
      <main>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && alerts.length === 0 && (
          <p>No active alerts.</p>
        )}
        {alerts.length > 0 && (
          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <AlertRow key={alert.header_text.translation[0]?.text || index} alert={alert} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
