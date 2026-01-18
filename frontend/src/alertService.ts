import type { AlertModel, FeedMessage, InformedEntity } from './model';
import { downgradeSeverity, Severity, sortBySeverity } from './model';
import mockAlertsData from './test/mockAlerts.json';

const ROUTE_ID = "100479"; // the 1 Line

const isLocalHost: boolean = window.location.href.includes('localhost');

// Control constant for enabling severity override for testing
const ENABLE_SEVERITY_OVERRIDE_FOR_TESTING = isLocalHost && false;

const _overrideAlertSeveritiesForTesting = (alertsToModify: AlertModel[]): AlertModel[] => {
    const severityLevels = [Severity.INFO, Severity.WARNING, Severity.SEVERE, Severity.UNKNOWN_SEVERITY];
    return alertsToModify.map((alert, index) => ({
        ...alert,
        severity_level: severityLevels[index % severityLevels.length],
    }));
};

function _hasEffectDetail(alert: AlertModel, detailText: string): boolean {
    return alert.effect_detail?.translation.some((translation) => translation.text === detailText) || false;
}

function _adjustAlertSeverities(alerts: AlertModel[]): AlertModel[] {
    return alerts.map((alert) => {
        // Most severities are too high, so we generally want to downgrade
        let downgrade = false;

        // If there is an "OTHER_EFFECT" with detail "ANNOUNCEMENT", downgrade the severity - the warnings generally
        // aren't important
        if (alert.effect === "OTHER_EFFECT" && _hasEffectDetail(alert, "ANNOUNCEMENT")) downgrade = true;

        const adjustedSeverity = downgrade ? downgradeSeverity(alert.severity_level) : alert.severity_level;
        return { ...alert, severity_level: adjustedSeverity };
    });
}

function processAlerts(alerts: AlertModel[]): AlertModel[] {
    const processedAlerts = ENABLE_SEVERITY_OVERRIDE_FOR_TESTING ? _overrideAlertSeveritiesForTesting(alerts)
        : _adjustAlertSeverities(alerts);
    return sortBySeverity(processedAlerts);
}

export async function fetchAndProcessAlerts(useMockData: boolean): Promise<AlertModel[]> {
    if (useMockData) {
        console.log("Using mock alert data");
        const feedMessage = mockAlertsData as unknown as FeedMessage;
        const filteredAlerts = _getFilteredAlerts(feedMessage, ROUTE_ID);
        return processAlerts(filteredAlerts);
    }

    const alerts_url = "https://s3.amazonaws.com/st-service-alerts-prod/alerts_pb.json";

    try {
        const response = await fetch(alerts_url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const feedMessage: FeedMessage = await response.json();
        const filteredAlerts = _getFilteredAlerts(feedMessage, ROUTE_ID);
        return processAlerts(filteredAlerts);
    } catch (error) {
        console.error("Error fetching alerts:", error);
        return [];
    }
}

function _includesImportantRoute(entities: InformedEntity[], route_id: string): boolean {
    return entities.some((entity: { route_id?: string }) => entity.route_id === route_id);
}

function _getFilteredAlerts(feedMessage: FeedMessage, route_id: string): AlertModel[] {
    const entities = feedMessage.entity || [];
    const filtered_results: AlertModel[] = [];
    for (const entity of entities) {
        const alert: AlertModel | undefined = entity.alert;
        if (!alert) continue;

        // Ignore accessibility issues like elevator issues
        const effect = alert.effect;
        if (effect === "ACCESSIBILITY_ISSUE") continue;

        // Ignore special events and scheduled maintenance
        const causeDetailText = alert.cause_detail?.translation?.[0]?.text;
        if (causeDetailText === "SPECIAL_EVENT" || causeDetailText === "SCHEDULED_MAINTENANCE") continue;

        // Ignore unimportant routes
        const informedEntities = alert.informed_entity || [];
        if (!_includesImportantRoute(informedEntities, route_id)) continue;

        // Include it
        filtered_results.push(alert);
    }
    return filtered_results;
}
