import React, { useEffect, useState, useRef } from 'react';
import { getAqiDataForLocation, type AqiData } from './aqiService';
import './AqiDisplay.css';

interface AqiCardProps {
    locationName: string;
    aqiData: AqiData | null;
}

const AqiCard: React.FC<AqiCardProps> = ({ locationName, aqiData }) => {
    const contents = aqiData ? (
        <div className="aqi-details-container">
            <div className={`aqi-circle aqi-circle-${aqiData.category.toLowerCase().replace(/\s/g, '-')}`}></div>
            <p className="aqi-value">{aqiData.aqi.toFixed(1)}</p>
            <p className="aqi-category">{aqiData.category}</p>
        </div>
    ) : <p>Loading AQI data...</p>;

    return (
        <div className="aqi-card">
            <h3>{locationName}</h3>
            {contents}
        </div>
    );
};

const AqiDisplay: React.FC = () => {
    const [northKirklandAqi, setNorthKirklandAqi] = useState<AqiData | null>(null);
    const [seattleDowntownAqi, setSeattleDowntownAqi] = useState<AqiData | null>(null);
    const [mountlakeTerraceAqi, setMountlakeTerraceAqi] = useState<AqiData | null>(null);
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current) return;
        const fetchAqiData = async () => {
            const [northKirklandAqiData, seattleDowntownAqiData, mountlakeTerraceAqiData] = await Promise.all([
                getAqiDataForLocation("north-kirkland"),
                getAqiDataForLocation("seattle-downtown"),
                getAqiDataForLocation("mountlake-terrace")
            ]);
            setNorthKirklandAqi(northKirklandAqiData);
            setSeattleDowntownAqi(seattleDowntownAqiData);
            setMountlakeTerraceAqi(mountlakeTerraceAqiData);
        };

        fetchAqiData();
        const interval = setInterval(fetchAqiData, 300000); // Refresh every 5 minutes
        effectRan.current = true;

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="aqi-display-container">
            <AqiCard locationName="North Kirkland" aqiData={northKirklandAqi} />
            <AqiCard locationName="Seattle Downtown" aqiData={seattleDowntownAqi} />
            <AqiCard locationName="Mountlake Terrace" aqiData={mountlakeTerraceAqi} />
        </div>
    );
};

export default AqiDisplay;