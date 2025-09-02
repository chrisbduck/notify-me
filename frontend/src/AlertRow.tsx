import React from 'react';
import './AlertRow.css';
import { FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';
import { Severity, type AlertModel } from './model';

const AlertRow: React.FC<{ alert: AlertModel }> = ({ alert }) => {
  const renderSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case Severity.WARNING:
        return <FaExclamationTriangle className="alert-icon warning-icon" />;
      case Severity.INFO:
        return <FaInfoCircle className="alert-icon info-icon" />;
      case Severity.SEVERE:
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

export default AlertRow;
