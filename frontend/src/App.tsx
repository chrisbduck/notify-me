import { useState } from 'react';
import './App.css';
import WeatherDisplay from './WeatherDisplay';
import AlertSummaryCard from './AlertSummaryCard';
import AqiDisplay from './AqiDisplay';
import { fetchAndProcessAlerts } from './alertService';
import { type AlertModel } from './model';
import { usePolling } from './hooks/usePolling';
import { TransitAlertsSection } from './TransitAlertsSection';

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
        <h1>Alerts for Chris</h1>
        {loading ? <p>Loading alerts...</p> : lastFetched && <p>Last updated: {lastFetched}</p>}
      </header>
      <div className="main-content-cards">
        <AlertSummaryCard loading={loading} alerts={alerts} />
        <WeatherDisplay />
        <AqiDisplay />
      </div>
      <main>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <TransitAlertsSection loading={loading} alerts={alerts} />
      </main>
    </div>
  );
}

export default App;
