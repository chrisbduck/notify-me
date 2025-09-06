import { useState, useEffect, useRef } from 'react';
import './App.css';
import AlertRow from './AlertRow';
import WeatherDisplay from './WeatherDisplay';
import AlertSummaryCard from './AlertSummaryCard';
import AqiDisplay from './AqiDisplay';
import { fetchAndProcessAlerts } from './alertService';
import { type AlertModel } from './model';

function App() {
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const lastFetchTimestamp = useRef<number>(0); // Store timestamp of last fetch
  const intervalIdRef = useRef<number | null>(null); // Store interval ID
  const refreshQueued = useRef<boolean>(false); // Track if a refresh is queued

  const getAlerts = async () => {
    // Prevent re-fetch within 60 seconds
    const now = Date.now();
    if (now - lastFetchTimestamp.current < 60000 && lastFetchTimestamp.current !== 0) return;

    setLoading(true);
    setError(null);
    try {
      const alerts: AlertModel[] = await fetchAndProcessAlerts();
      setAlerts(alerts);
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
    getAlerts(); // Initial fetch

    const startInterval = () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
      intervalIdRef.current = setInterval(getAlerts, 60000) as unknown as number;
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
          getAlerts();
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
      <div className="main-content-cards">
        <WeatherDisplay />
        <AqiDisplay />
        <AlertSummaryCard />
      </div>
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
