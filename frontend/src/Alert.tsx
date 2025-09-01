import React from 'react';
import './Alert.css';
import { FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

interface Translation {
  text: string;
  language: string;
}

interface LocalizedText {
  translation: Translation[];
}

interface ActivePeriod {
  start: number;
  end?: number;
}

interface InformedEntity {
  agency_id: string;
  route_type: number;
  route_id?: string;
  stop_id?: string;
}

export interface Alert {
  effect: string;
  effect_detail: LocalizedText;
  cause: string;
  cause_detail: LocalizedText;
  header_text: LocalizedText;
  description_text: LocalizedText;
  severity_level: string;
  url: LocalizedText;
  active_period: ActivePeriod[];
  informed_entity: InformedEntity[];
}

interface AlertProps {
  alert: Alert;
}

const AlertComponent: React.FC<AlertProps> = ({ alert }) => {
  const renderSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'WARNING':
        return <FaExclamationTriangle className="alert-icon warning-icon" />;
      case 'INFO':
        return <FaInfoCircle className="alert-icon info-icon" />;
      case 'SEVERE':
        return <FaTimesCircle className="alert-icon severe-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="alert-item">
      <div className="alert-header-row">
        {renderSeverityIcon(alert.severity_level)}
        <h2>{alert.header_text.translation[0]?.text}</h2>
      </div>
      <div className="alert-description-row">
        <p>{alert.description_text.translation[0]?.text}</p>
      </div>
      <div className="alert-footer-row">
        <p><strong>Effect:</strong> {alert.effect} ({alert.effect_detail.translation[0]?.text})</p>
        <p><strong>Cause:</strong> {alert.cause} ({alert.cause_detail.translation[0]?.text})</p>
        <p><strong>Severity:</strong> {alert.severity_level}</p>
        {alert.url?.translation[0]?.text && (
          <p>
            <a href={alert.url.translation[0].text} target="_blank" rel="noopener noreferrer">
              More Info
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default AlertComponent;