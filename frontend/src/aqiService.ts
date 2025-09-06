import { apiFetch } from './apiFetch';

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

export interface AqiData {
    aqi: number;
    category: string;
}

export const getAqiDataForLocation = async (locationKey: string): Promise<AqiData | null> => {
    try {
        const response = await apiFetch(`aqi?sensor=${locationKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AqiApiResponse = await response.json();

        return {
            aqi: data.aqi,
            category: data.category,
        };
    } catch (error) {
        console.error(`Error fetching AQI data for ${locationKey}:`, error);
        return null;
    }
};
