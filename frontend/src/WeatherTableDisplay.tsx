import React from 'react';
import { formatPrecipitationType, getWindDescription, type WeatherData } from './weatherService';
import './WeatherTableDisplay.css';

interface WeatherTableDisplayProps {
    currentWeather: WeatherData | null;
    forecast4pm: WeatherData | null;
}

const WeatherTableDisplay: React.FC<WeatherTableDisplayProps> = ({ currentWeather, forecast4pm }) => {
    if (!currentWeather) {
        return <p>Loading weather data...</p>;
    }

    const weatherAttributes = [
        {
            label: 'Current temperature',
            render: (weather: WeatherData) => `${weather.temperature}°${weather.temperatureUnit}`,
        },
        {
            label: 'Forecast',
            render: (weather: WeatherData) => weather.shortForecast,
        },
        {
            label: 'Temperature range',
            render: (weather: WeatherData) =>
                weather.minTemperature !== undefined && weather.maxTemperature !== undefined
                    ? `${weather.minTemperature}°${weather.temperatureUnit} - ${weather.maxTemperature}°${weather.temperatureUnit}`
                    : 'N/A',
        },
        {
            label: 'Wind',
            render: (weather: WeatherData) => {
                if (weather.averageWindSpeed === undefined || weather.maxWindSpeed === undefined) return 'N/A';
                const description = getWindDescription(weather.maxWindSpeed);
                return `${description} (Avg ${weather.averageWindSpeed.toFixed(1)} mph / Max ${weather.maxWindSpeed.toFixed(1)} mph)`;
            },
        },
        {
            label: 'Precipitation',
            render: (weather: WeatherData) => {
                if (weather.probabilityOfPrecipitation === undefined || weather.probabilityOfPrecipitation <= 0) return 'None';

                const startText = (weather.precipitationStartTime && weather.precipitationStartTime < new Date()) ? 'started' : 'starts';
                const startTimeString = weather.precipitationStartTime ? ` (${startText} around ${weather.precipitationStartTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })})` : '';
                return `${formatPrecipitationType(weather.precipitationType)}: ${weather.probabilityOfPrecipitation}%${startTimeString}`;
            },
        },
    ];

    return (
        <table className="weather-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Now</th>
                    {forecast4pm && <th>4 PM</th>}
                </tr>
            </thead>
            <tbody>
                {weatherAttributes.map((attribute, index) => (
                    <tr key={index}>
                        <td><strong>{attribute.label}</strong></td>
                        <td>{currentWeather ? attribute.render(currentWeather) : 'N/A'}</td>
                        {forecast4pm && <td>{attribute.render(forecast4pm)}</td>}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default WeatherTableDisplay;
