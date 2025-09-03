const NWS_API_BASE_URL = 'https://api.weather.gov';

interface PointResponse {
    properties: {
        forecastGridData: string;
        relativeLocation: {
            properties: {
                city: string;
                state: string;
            };
        };
    };
}

interface GridpointValue {
    validTime: string;
    value: number | null;
}

interface GridpointWeatherValue {
    validTime: string;
    value: Array<{
        coverage: string | null;
        weather: string | null;
        intensity: string | null;
        visibility: {
            unitCode: string;
            value: number | null;
        };
        attributes: string[];
    }>;
}

interface GridpointResponse {
    properties: {
        temperature: {
            uom: string;
            values: GridpointValue[];
        };
        maxTemperature: {
            uom: string;
            values: GridpointValue[];
        };
        minTemperature: {
            uom: string;
            values: GridpointValue[];
        };
        weather: {
            values: GridpointWeatherValue[];
        };
        skyCover: {
            uom: string;
            values: GridpointValue[];
        };
        // Add other properties if needed, but for now, these are sufficient
    };
}

export interface WeatherData {
    city: string;
    temperature: number;
    temperatureUnit: string;
    shortForecast: string;
    icon: string;
    minTemperature?: number;
    maxTemperature?: number;
}

const fetchWeatherData = async (latitude: number, longitude: number): Promise<WeatherData | null> => {
    try {
        // Step 1: Get forecast office and grid coordinates
        const pointResponse = await fetch(`${NWS_API_BASE_URL}/points/${latitude},${longitude}`,
            { headers: { 'Accept': 'application/json', 'User-Agent': 'notify-me (chrisbduck@github.com)' } });
        if (!pointResponse.ok) {
            throw new Error(`HTTP error! status: ${pointResponse.status}`);
        }
        const pointData: PointResponse = await pointResponse.json();
        const forecastGridUrl = pointData.properties.forecastGridData;
        const city = pointData.properties.relativeLocation.properties.city;

        // Step 2: Get the gridpoint forecast data
        const gridpointResponse = await fetch(forecastGridUrl,
            { headers: { 'Accept': 'application/json', 'User-Agent': 'notify-me (chrisbduck@github.com)' } });
        if (!gridpointResponse.ok) {
            throw new Error(`HTTP error! status: ${gridpointResponse.status}`);
        }
        const gridpointData: GridpointResponse = await gridpointResponse.json();

        const properties = gridpointData.properties;
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

        // Helper to find the current value for a given property
        const getCurrentValue = (values: GridpointValue[]): number | undefined => {
            for (const item of values) {
                const validTimeStart = new Date(item.validTime.split('/')[0]);
                const validTimeEnd = new Date(validTimeStart.getTime() + parseDuration(item.validTime.split('/')[1]));
                if (now >= validTimeStart && now < validTimeEnd) {
                    return item.value !== null ? convertCelsiusToFahrenheit(item.value) : undefined;
                }
            }
            return undefined;
        };

        // Helper to find min/max for today
        const getDailyMinMax = (values: GridpointValue[], type: 'min' | 'max'): number | undefined => {
            let dailyValue: number | undefined;
            for (const item of values) {
                const validTimeStart = new Date(item.validTime.split('/')[0]);
                if (validTimeStart.toISOString().startsWith(today)) {
                    const fahrenheitValue = item.value !== null ? convertCelsiusToFahrenheit(item.value) : undefined;
                    if (fahrenheitValue !== undefined) {
                        if (dailyValue === undefined) {
                            dailyValue = fahrenheitValue;
                        } else if (type === 'min') {
                            dailyValue = Math.min(dailyValue, fahrenheitValue);
                        } else { // type === 'max'
                            dailyValue = Math.max(dailyValue, fahrenheitValue);
                        }
                    }
                }
            }
            return dailyValue;
        };

        // Helper to parse ISO 8601 duration (e.g., PT1H, P7DT4H)
        const parseDuration = (duration: string): number => {
            let totalMilliseconds = 0;
            const regex = /P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
            const matches = duration.match(regex);

            if (matches) {
                const days = parseInt(matches[1] || '0', 10);
                const hours = parseInt(matches[2] || '0', 10);
                const minutes = parseInt(matches[3] || '0', 10);
                const seconds = parseInt(matches[4] || '0', 10);

                totalMilliseconds += days * 24 * 60 * 60 * 1000;
                totalMilliseconds += hours * 60 * 60 * 1000;
                totalMilliseconds += minutes * 60 * 1000;
                totalMilliseconds += seconds * 1000;
            }
            return totalMilliseconds;
        };

        // Convert Celsius to Fahrenheit
        const convertCelsiusToFahrenheit = (celsius: number): number => {
            return (celsius * 9 / 5) + 32;
        };

        const currentTemperature = getCurrentValue(properties.temperature.values);
        const minTemperature = getDailyMinMax(properties.minTemperature.values, 'min');
        const maxTemperature = getDailyMinMax(properties.maxTemperature.values, 'max');

        // Get short forecast and icon
        let shortForecast = 'N/A';
        let icon = ''; // Placeholder for now, as direct icon URLs are not in gridpoints

        const currentWeather = properties.weather.values.find(item => {
            const validTimeStart = new Date(item.validTime.split('/')[0]);
            const validTimeEnd = new Date(validTimeStart.getTime() + parseDuration(item.validTime.split('/')[1]));
            return now >= validTimeStart && now < validTimeEnd;
        });

        if (currentWeather && currentWeather.value.length > 0 && currentWeather.value[0].weather) {
            shortForecast = currentWeather.value[0].weather;
            // Simple icon mapping (can be expanded)
            if (shortForecast.toLowerCase().includes('sunny') || shortForecast.toLowerCase().includes('clear')) {
                icon = 'https://api.weather.gov/icons/land/day/skc?size=medium';
            } else if (shortForecast.toLowerCase().includes('cloud')) {
                icon = 'https://api.weather.gov/icons/land/day/few?size=medium';
            } else if (shortForecast.toLowerCase().includes('rain')) {
                icon = 'https://api.weather.gov/icons/land/day/ra?size=medium';
            } else if (shortForecast.toLowerCase().includes('showers')) {
                icon = 'https://api.weather.gov/icons/land/day/shra?size=medium';
            } else if (shortForecast.toLowerCase().includes('thunder')) {
                icon = 'https://api.weather.gov/icons/land/day/tsra?size=medium';
            } else {
                icon = 'https://api.weather.gov/icons/land/day/ovc?size=medium'; // Default cloudy
            }
        } else {
            // Fallback to skyCover if weather is not available or empty
            const currentSkyCover = getCurrentValue(properties.skyCover.values);
            if (currentSkyCover !== undefined) {
                if (currentSkyCover < 25) { // Mostly clear
                    icon = 'https://api.weather.gov/icons/land/day/skc?size=medium';
                    shortForecast = 'Clear';
                } else if (currentSkyCover < 50) { // Partly cloudy
                    icon = 'https://api.weather.gov/icons/land/day/few?size=medium';
                    shortForecast = 'Partly Cloudy';
                } else if (currentSkyCover < 75) { // Mostly cloudy
                    icon = 'https://api.weather.gov/icons/land/day/bkn?size=medium';
                    shortForecast = 'Mostly Cloudy';
                } else { // Overcast
                    icon = 'https://api.weather.gov/icons/land/day/ovc?size=medium';
                    shortForecast = 'Overcast';
                }
            }
        }


        return {
            city: city,
            temperature: currentTemperature !== undefined ? currentTemperature : 0, // Default to 0 if undefined
            temperatureUnit: 'F',
            shortForecast: shortForecast,
            icon: icon,
            minTemperature: minTemperature,
            maxTemperature: maxTemperature,
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
};

export const getKirklandWeather = () => fetchWeatherData(47.6763, -122.2063);
export const getSeattleWeather = () => fetchWeatherData(47.6062, -122.3321);