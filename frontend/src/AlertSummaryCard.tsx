import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { fetchAndProcessAlerts } from './alertService';
import { Severity, type AlertModel } from './model';
import './WeatherDisplay.css'; // Reusing the card styling

const AlertSummaryCard: React.FC = () => {
    const [alerts, setAlerts] = useState<AlertModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const getAlerts = async () => {
            setLoading(true);
            const fetchedAlerts = await fetchAndProcessAlerts();
            setAlerts(fetchedAlerts);
            setLoading(false);
        };

        getAlerts();
        const interval = setInterval(getAlerts, 60000); // Refresh every minute

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="weather-card"> {/* Reusing weather-card styling */}
                <h3>Transit Alerts</h3>
                <p>Loading alerts...</p>
            </div>
        );
    }

    const severeAlert = alerts.find(alert => alert.severity_level === Severity.SEVERE);

    return (
        <div className="weather-card"> {/* Reusing weather-card styling */}
            <h3>Transit Alerts</h3>
            <div className="alert-summary-content">
                {severeAlert ? (
                    <>
                        <FaExclamationTriangle className="alert-summary-icon severe-icon" />
                        <p>{severeAlert.effect_detail?.translation[0]?.text || severeAlert.effect}</p>
                    </>
                ) : (
                    <>
                        <FaCheckCircle className="alert-summary-icon success-icon" />
                        <p>No major problems</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AlertSummaryCard;