import React, { useEffect, useState, useRef } from 'react';
import { getAqiDataForLocation, type AqiData } from './aqiService';
import AqiCard from './AqiCard';
import './AqiDisplay.css';

// Helper function to determine AQI category based on AQI value
const getAqiCategory = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
};

const AqiDisplay: React.FC = () => {
    const [northKirklandAqi, setNorthKirklandAqi] = useState<AqiData | null>(null);
    const [seattleDowntownAqi, setSeattleDowntownAqi] = useState<AqiData | null>(null);
    const [mountlakeTerraceAqi, setMountlakeTerraceAqi] = useState<AqiData | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
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

    const allAqiValues = [northKirklandAqi?.aqi, seattleDowntownAqi?.aqi, mountlakeTerraceAqi?.aqi].filter(
        (aqi): aqi is number => aqi !== null && aqi !== undefined
    );

    const averageAqi = allAqiValues.length > 0
        ? allAqiValues.reduce((sum, aqi) => sum + aqi, 0) / allAqiValues.length
        : null;

    const averageAqiCategory = averageAqi !== null ? getAqiCategory(averageAqi) : 'Loading';

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const combinedAqiContents = averageAqi !== null ? (
        <div className="aqi-details-container">
            <div className={`aqi-circle aqi-circle-${averageAqiCategory.toLowerCase().replace(/\s/g, '-')}`}></div>
            <p className="aqi-value">{averageAqi.toFixed(1)}</p>
            <p className="aqi-category">{averageAqiCategory}</p>
        </div>
    ) : <p>Loading AQI data...</p>;

    return (
        <div className="aqi-display-container">
            <button className="aqi-combined-card" onClick={toggleExpanded}>
                <div className="aqi-card-layout">
                    <div className="aqi-header-row">
                        <h3>Air Quality</h3>
                        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </span>
                    </div>
                    <div className="aqi-content-row">
                        <div className="aqi-header-left-spacer"></div> {/* Empty spacer */}
                        <div className="aqi-main-content">
                            {combinedAqiContents}
                        </div>
                        <div className="aqi-right-spacer"></div> {/* Empty spacer for symmetry */}
                    </div>
                </div>
            </button>
            {isExpanded && (
                <div className="aqi-expanded-details">
                    <AqiCard locationName="North Kirkland" aqiData={northKirklandAqi} />
                    <AqiCard locationName="Seattle Downtown" aqiData={seattleDowntownAqi} />
                    <AqiCard locationName="Mountlake Terrace" aqiData={mountlakeTerraceAqi} />
                </div>
            )}
        </div>
    );
};

export default AqiDisplay;