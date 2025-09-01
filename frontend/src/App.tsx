import { useState, useEffect } from 'react';
import './App.css';
import AlertComponent, { type Alert } from './Alert';

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`http://localhost:7071/api/GetAlerts`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAlerts(data);
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
