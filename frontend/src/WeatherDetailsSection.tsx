import { isBefore2PM, type WeatherData, formatPrecipitationType, getWindDescription } from "./weatherService";
import TableDisplay, { type TableAttribute } from "./TableDisplay";

export function WeatherDetailsSection({ currentWeather, forecast4pm, currentTime }: { currentWeather: WeatherData | null, forecast4pm: WeatherData | null, currentTime: Date }) {
    const weatherAttributes: TableAttribute<WeatherData>[] = [
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
        <div className="weather-table-container">
            <h2>Seattle Weather Forecast</h2>
            <TableDisplay
                dataNow={currentWeather}
                dataLater={isBefore2PM(currentTime) ? forecast4pm : null}
                attributes={weatherAttributes}
                laterColumnHeader="4 PM"
            />
        </div>
    );
}
