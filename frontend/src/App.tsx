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

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchAlerts = async () => {
      try {
        const response = await fetch(getAlertsURL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const alerts: AlertModel[] = await response.json();
        const processedAlerts = processAlerts(alerts);
        setAlerts(processedAlerts);
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
              <AlertRow key={alert.header_text.translation[0]?.text || index} alert={alert} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
