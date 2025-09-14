import React, { useState, useCallback } from 'react';
import { getSeattleWeather, type WeatherData } from './weatherService';
import './WeatherDisplay.css';
import { usePolling } from './hooks/usePolling';

const isBefore2PM = (date: Date): boolean => {
    const twoPM = new Date(date);
    twoPM.setHours(14, 0, 0, 0); // 2 PM local time
    return date.getTime() < twoPM.getTime();
};

interface WeatherDetailsProps {
    icon: string;
    temperature: number;
    temperatureUnit: string;
    shortForecast: string;
}

const WeatherDetails: React.FC<WeatherDetailsProps> = ({ icon, temperature, temperatureUnit, shortForecast }) => (
    <div className="weather-details">
        <img src={icon} alt={shortForecast} className="weather-icon" />
        <p>{temperature}°{temperatureUnit}</p>
        <p>{shortForecast}</p>
    </div>
);

interface WeatherCardProps {
    city: string;
    currentWeather: WeatherData | null;
    forecast4pm: WeatherData | null;
    show4pmForecast: boolean;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ city, currentWeather, forecast4pm, show4pmForecast }) => {
    if (!currentWeather) {
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
            <div className="weather-details-container">
                <div className="weather-details-column">
                    <h4>Now</h4>
                    <WeatherDetails
                        icon={currentWeather.icon}
                        temperature={currentWeather.temperature}
                        temperatureUnit={currentWeather.temperatureUnit}
                        shortForecast={currentWeather.shortForecast}
                    />
                </div>
                {show4pmForecast && forecast4pm && (
                    <div className="weather-details-column">
                        <h4>4 PM</h4>
                        <WeatherDetails
                            icon={forecast4pm.icon}
                            temperature={forecast4pm.temperature}
                            temperatureUnit={forecast4pm.temperatureUnit}
                            shortForecast={forecast4pm.shortForecast}
                        />
                    </div>
                )}
            </div>
            {currentWeather.minTemperature !== undefined && currentWeather.maxTemperature !== undefined && (
                <p>Min/Max: {currentWeather.minTemperature}°{currentWeather.temperatureUnit} / {currentWeather.maxTemperature}°{currentWeather.temperatureUnit}</p>
            )}
        </div>
    );
};

const WeatherDisplay: React.FC = () => {
    const [seattleWeather, setSeattleWeather] = useState<WeatherData | null>(null);
    const [seattleWeather4pm, setSeattleWeather4pm] = useState<WeatherData | null>(null);
    const currentTime = new Date();

    const fetchSeattleWeather = useCallback(async () => {
        setSeattleWeather(await getSeattleWeather());
        const fourPM = new Date();
        fourPM.setHours(16, 0, 0, 0); // 4 PM local time
        setSeattleWeather4pm(await getSeattleWeather(fourPM));
    }, []);

    usePolling(fetchSeattleWeather, 300000); // Refresh every 5 minutes

    return (
        <div className="weather-display-container">
            <WeatherCard
                city="Seattle, WA"
                currentWeather={seattleWeather}
                forecast4pm={seattleWeather4pm}
                show4pmForecast={isBefore2PM(currentTime)}
            />
        </div>
    );
};

export default WeatherDisplay;