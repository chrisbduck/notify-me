import { isBefore2PM, type WeatherData } from "./weatherService";
import WeatherTableDisplay from "./WeatherTableDisplay";

export function WeatherDetailsSection({ currentWeather, forecast4pm, currentTime }: { currentWeather: WeatherData | null, forecast4pm: WeatherData | null, currentTime: Date }) {
    return (
        <div className="weather-table-container">
            <h2>Seattle Weather Forecast</h2>
            <WeatherTableDisplay
                currentWeather={currentWeather}
                forecast4pm={isBefore2PM(currentTime) ? forecast4pm : null}
            />
        </div>
    );
}
