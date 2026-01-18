import { useState, useCallback } from 'react';
import './App.css';
import WeatherCardDisplay from './WeatherCardDisplay';
import AlertSummaryCard from './AlertSummaryCard';
import AqiDisplay from './AqiDisplay';
import { fetchAndProcessAlerts } from './alertService';
import { type AlertModel } from './model';
import { usePolling } from './hooks/usePolling';
import { TransitAlertsSection } from './TransitAlertsSection';
import { getSeattleWeather, isBefore2PM, type WeatherData } from './weatherService';
import { WeatherDetailsSection } from './WeatherDetailsSection';
import { useShouldUseMockAQIData, useShouldUseMockTransitData, useShouldUseMockWeatherData } from './mockData';
import { MockDataToggle } from './MockDataToggle';

function App() {
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [shouldUseMockTransitData] = useShouldUseMockTransitData();
  const [shouldUseMockWeatherData] = useShouldUseMockWeatherData();

  const [seattleWeather, setSeattleWeather] = useState<WeatherData | null>(null);
  const [seattleWeather4pm, setSeattleWeather4pm] = useState<WeatherData | null>(null);

  const fetchSeattleWeather = useCallback(async () => {
    setSeattleWeather(await getSeattleWeather(shouldUseMockWeatherData));
    if (isBefore2PM()) {
      const fourPM = new Date();
      fourPM.setHours(16, 0, 0, 0); // 4 PM local time
      setSeattleWeather4pm(await getSeattleWeather(shouldUseMockWeatherData, fourPM));
    }
  }, [shouldUseMockWeatherData]);

  usePolling(fetchSeattleWeather, 300000); // Refresh every 5 minutes

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const alerts: AlertModel[] = await fetchAndProcessAlerts(shouldUseMockTransitData);
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
        <WeatherCardDisplay
          currentWeather={seattleWeather}
          forecast4pm={seattleWeather4pm}
        />
        <AqiDisplay />
      </div>
      <main>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <WeatherDetailsSection currentWeather={seattleWeather} forecast4pm={seattleWeather4pm} />
        <TransitAlertsSection loading={loading} alerts={alerts} />
      </main>
      <div className="mock-data-toggles">
        <MockDataToggle useHook={useShouldUseMockTransitData} label="Mock Transit Data" />
        <MockDataToggle useHook={useShouldUseMockWeatherData} label="Mock Weather Data" />
        <MockDataToggle useHook={useShouldUseMockAQIData} label="Mock AQI Data" />
      </div>
    </div>
  );
}

export default App;
