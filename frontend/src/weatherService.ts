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

const convertCelsiusToFahrenheit = (celsius: number): number => {
    return (celsius * 9 / 5) + 32;
};

const getWeatherDetailsAtTime = (
    properties: GridpointResponse['properties'],
    targetTime: Date
): { temperature?: number; shortForecast: string; icon: string } => {
    const getSpecificValue = (values: GridpointValue[]): number | undefined => {
        for (const item of values) {
            const validTimeStart = new Date(item.validTime.split('/')[0]);
            const validTimeEnd = new Date(validTimeStart.getTime() + parseDuration(item.validTime.split('/')[1]));
            if (targetTime >= validTimeStart && targetTime < validTimeEnd) {
                return item.value !== null ? convertCelsiusToFahrenheit(item.value) : undefined;
            }
        }
        return undefined;
    };

    let shortForecast = 'N/A';
    let icon = '';

    const weatherAtTime = properties.weather.values.find(item => {
        const validTimeStart = new Date(item.validTime.split('/')[0]);
        const validTimeEnd = new Date(validTimeStart.getTime() + parseDuration(item.validTime.split('/')[1]));
        return targetTime >= validTimeStart && targetTime < validTimeEnd;
    });

    if (weatherAtTime && weatherAtTime.value.length > 0 && weatherAtTime.value[0].weather) {
        shortForecast = weatherAtTime.value[0].weather;
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
            icon = 'https://api.weather.gov/icons/land/day/ovc?size=medium';
        }
    } else {
        const skyCoverAtTime = getSpecificValue(properties.skyCover.values);
        if (skyCoverAtTime !== undefined) {
            if (skyCoverAtTime < 25) {
                icon = 'https://api.weather.gov/icons/land/day/skc?size=medium';
                shortForecast = 'Clear';
            } else if (skyCoverAtTime < 50) {
                icon = 'https://api.weather.gov/icons/land/day/few?size=medium';
                shortForecast = 'Partly Cloudy';
            } else if (skyCoverAtTime < 75) {
                icon = 'https://api.weather.gov/icons/land/day/bkn?size=medium';
                shortForecast = 'Mostly Cloudy';
            } else {
                icon = 'https://api.weather.gov/icons/land/day/ovc?size=medium';
                shortForecast = 'Overcast';
            }
        }
    }

    return {
        temperature: getSpecificValue(properties.temperature.values),
        shortForecast: shortForecast,
        icon: icon,
    };
};

const fetchWeatherData = async (latitude: number, longitude: number, targetTime: Date = new Date()): Promise<WeatherData | null> => {
    try {
        const pointResponse = await fetch(`${NWS_API_BASE_URL}/points/${latitude},${longitude}`,
            { headers: { 'Accept': 'application/json', 'User-Agent': 'notify-me (chrisbduck@github.com)' } });
        if (!pointResponse.ok) {
            throw new Error(`HTTP error! status: ${pointResponse.status}`);
        }
        const pointData: PointResponse = await pointResponse.json();
        const forecastGridUrl = pointData.properties.forecastGridData;
        const city = pointData.properties.relativeLocation.properties.city;

        const gridpointResponse = await fetch(forecastGridUrl,
            { headers: { 'Accept': 'application/json', 'User-Agent': 'notify-me (chrisbduck@github.com)' } });
        if (!gridpointResponse.ok) {
            throw new Error(`HTTP error! status: ${gridpointResponse.status}`);
        }
        const gridpointData: GridpointResponse = await gridpointResponse.json();

        const properties = gridpointData.properties;
        const today = targetTime.toISOString().split('T')[0];

        const { temperature, shortForecast, icon } = getWeatherDetailsAtTime(properties, targetTime);

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
                        } else {
                            dailyValue = Math.max(dailyValue, fahrenheitValue);
                        }
                    }
                }
            }
            return dailyValue;
        };

        const minTemperature = getDailyMinMax(properties.minTemperature.values, 'min');
        const maxTemperature = getDailyMinMax(properties.maxTemperature.values, 'max');

        return {
            city: city,
            temperature: temperature !== undefined ? temperature : 0,
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

export const getKirklandWeather = (targetTime?: Date) => fetchWeatherData(47.6763, -122.2063, targetTime);
export const getSeattleWeather = (targetTime?: Date) => fetchWeatherData(47.6062, -122.3321, targetTime);