import React from 'react';
import { formatPrecipitationType, type WeatherData } from './weatherService';
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
            label: 'Icon',
            render: (weather: WeatherData) => <img src={weather.icon} alt={weather.shortForecast} className="weather-table-icon" />,
        },
        {
            label: 'Temperature',
            render: (weather: WeatherData) => `${weather.temperature}°${weather.temperatureUnit}`,
        },
        {
            label: 'Forecast',
            render: (weather: WeatherData) => weather.shortForecast,
        },
        {
            label: 'Min/Max Temp',
            render: (weather: WeatherData) =>
                weather.minTemperature !== undefined && weather.maxTemperature !== undefined
                    ? `${weather.minTemperature}°${weather.temperatureUnit} / ${weather.maxTemperature}°${weather.temperatureUnit}`
                    : 'N/A',
        },
        {
            label: 'Wind',
            render: (weather: WeatherData) =>
                weather.averageWindSpeed !== undefined && weather.maxWindSpeed !== undefined
                    ? `Avg ${weather.averageWindSpeed.toFixed(1)} mph / Max ${weather.maxWindSpeed.toFixed(1)} mph`
                    : 'N/A',
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