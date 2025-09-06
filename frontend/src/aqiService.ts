import { apiFetch } from './apiFetch';
import type { AqiData } from './model';

interface AqiApiResponse {
    sensor: string;
    sensor_index: number;
    pm_field: string;
    pm25: number;
    aqi: number;
    category: string;
    last_seen: number;
    fetched_at: number;
}

const getAqiIcon = (category: string): string => {
    switch (category.toLowerCase()) {
        case 'good':
            return 'https://api.weather.gov/icons/land/day/skc?size=medium'; // Clear sky
        case 'moderate':
            return 'https://api.weather.gov/icons/land/day/few?size=medium'; // Few clouds
        case 'unhealthy for sensitive groups':
            return 'https://api.weather.gov/icons/land/day/bkn?size=medium'; // Broken clouds
        case 'unhealthy':
            return 'https://api.weather.gov/icons/land/day/ovc?size=medium'; // Overcast
        case 'very unhealthy':
            return 'https://api.weather.gov/icons/land/day/fzra?size=medium'; // Freezing rain (as a severe warning)
        case 'hazardous':
            return 'https://api.weather.gov/icons/land/day/sn?size=medium'; // Snow (as a very severe warning)
        default:
            return 'https://api.weather.gov/icons/land/day/wind?size=medium'; // Default/unknown
    }
};

export const getSeattleAqi = async (): Promise<AqiData | null> => {
    try {
        const response = await apiFetch('aqi?sensor=102160');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AqiApiResponse = await response.json();

        return {
            locationName: "Seattle, WA",
            aqi: data.aqi,
            category: data.category,
            icon: getAqiIcon(data.category),
        };
    } catch (error) {
        console.error('Error fetching AQI data:', error);
        return null;
    }
};
