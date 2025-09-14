import { useState } from 'react';
import './App.css';
import AlertRow from './AlertRow';
import WeatherDisplay from './WeatherDisplay';
import AlertSummaryCard from './AlertSummaryCard';
import AqiDisplay from './AqiDisplay';
import { fetchAndProcessAlerts } from './alertService';
import { type AlertModel } from './model';
import { usePolling } from './hooks/usePolling';

function App() {
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const alerts: AlertModel[] = await fetchAndProcessAlerts();
      setAlerts(alerts);
      setLastFetched(new Date().toLocaleTimeString());
    } catch (err) {
      setError("Failed to fetch alerts.");
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  usePolling(fetchAlerts, 60000);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sound Transit Alerts</h1>
        {loading ? <p>Loading alerts...</p> : lastFetched && <p>Last updated: {lastFetched}</p>}
      </header>
      <div className="main-content-cards">
        <AlertSummaryCard />
        <WeatherDisplay />
        <AqiDisplay />
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
