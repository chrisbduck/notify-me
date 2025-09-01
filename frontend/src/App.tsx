import { useState, useEffect } from 'react';
import './App.css';
import AlertComponent, { type Alert } from './Alert';
import { lessThan } from './enums';

const isLocalHost: boolean = window.location.href.includes('localhost');
const localHostApiRootURL = 'http://localhost:7071';
const apiRootURL = `${isLocalHost ? localHostApiRootURL : ''}/api`;
const getAlertsURL = `${apiRootURL}/getAlerts`;

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(getAlertsURL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const sortedAlerts = data.sort((a: Alert, b: Alert) => lessThan(a.severity_level, b.severity_level));
        setAlerts(sortedAlerts);
      } catch (err) {
        setError("Failed to fetch alerts.");
        console.error("Error fetching alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sound Transit Alerts</h1>
      </header>
      <main>
        {loading && <p>Loading alerts...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && alerts.length === 0 && (
          <p>No active alerts.</p>
        )}
        {!loading && !error && alerts.length > 0 && (
          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <AlertComponent key={alert.header_text.translation[0]?.text || index} alert={alert} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
