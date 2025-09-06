import React, { useEffect, useState } from 'react';
import type { AqiData } from './model';
import { getSeattleAqi } from './aqiService';
import './AqiDisplay.css';

interface AqiCardProps {
    locationName: string;
    aqiData: AqiData | null;
}

const AqiCard: React.FC<AqiCardProps> = ({ locationName, aqiData }) => {
    if (!aqiData) {
        return (
            <div className="aqi-card">
                <h3>{locationName}</h3>
                <p>Loading AQI data...</p>
            </div>
        );
    }

    return (
        <div className="aqi-card">
            <h3>{locationName}</h3>
            <div className="aqi-details-container">
                <div className={`aqi-circle aqi-circle-${aqiData.category.toLowerCase().replace(/\s/g, '-')}`}></div>
                <p className="aqi-value">{aqiData.aqi.toFixed(1)}</p>
                <p className="aqi-category">{aqiData.category}</p>
            </div>
        </div>
    );
};

const AqiDisplay: React.FC = () => {
    const [seattleAqi, setSeattleAqi] = useState<AqiData | null>(null);

    useEffect(() => {
        const fetchAqi = async () => {
            setSeattleAqi(await getSeattleAqi());
        };

        fetchAqi();
        const interval = setInterval(fetchAqi, 300000); // Refresh every 5 minutes

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="aqi-display-container">
            <AqiCard locationName="Seattle, WA" aqiData={seattleAqi} />
        </div>
    );
};

export default AqiDisplay;