import React, { useEffect, useState } from 'react';
import { getKirklandWeather, getSeattleWeather, type WeatherData } from './weatherService';
import './WeatherDisplay.css'; // We'll create this CSS file next

const WeatherCard: React.FC<{ city: string; weather: WeatherData | null }> = ({ city, weather }) => {
    if (!weather) {
        return (
            <div className="weather-card">
                <h3>{city}</h3>
                <p>Loading weather...</p>
            </div>
        );
    }

    return (
        <div className="weather-card">
            <h3>{city}</h3>
            <img src={weather.icon} alt={weather.shortForecast} className="weather-icon" />
            <p>Current: {weather.temperature}°{weather.temperatureUnit}</p>
            {weather.minTemperature !== undefined && weather.maxTemperature !== undefined && (
                <p>Min/Max: {weather.minTemperature}°{weather.temperatureUnit} / {weather.maxTemperature}°{weather.temperatureUnit}</p>
            )}
            <p>{weather.shortForecast}</p>
        </div>
    );
};

const WeatherDisplay: React.FC = () => {
    const [kirklandWeather, setKirklandWeather] = useState<WeatherData | null>(null);
    const [seattleWeather, setSeattleWeather] = useState<WeatherData | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            setKirklandWeather(await getKirklandWeather());
            setSeattleWeather(await getSeattleWeather());
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 300000); // Refresh every 5 minutes

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="weather-display-container">
            <WeatherCard city="Kirkland, WA" weather={kirklandWeather} />
            <WeatherCard city="Seattle, WA" weather={seattleWeather} />
        </div>
    );
};

export default WeatherDisplay;