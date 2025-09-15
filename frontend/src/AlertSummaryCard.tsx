import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Severity, type AlertModel } from './model';
import './WeatherCardDisplay.css'; // Reusing the card styling

function AlertSummaryCard({ loading, alerts }: { loading: boolean, alerts: AlertModel[] }) {
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