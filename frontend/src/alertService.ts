import type { AlertModel, FeedMessage } from './model';
import { Severity, sortBySeverity } from './model';
import mockAlertsData from './test/mockAlerts.json';

const ROUTE_ID = "100479"; // the 1 Line

const isLocalHost: boolean = window.location.href.includes('localhost');

// Control constant for enabling severity override for testing
const ENABLE_SEVERITY_OVERRIDE_FOR_TESTING = isLocalHost && false;

const overrideAlertSeveritiesForTesting = (alertsToModify: AlertModel[]): AlertModel[] => {
    const severityLevels = [Severity.INFO, Severity.WARNING, Severity.SEVERE, Severity.UNKNOWN_SEVERITY];
    return alertsToModify.map((alert, index) => ({
        ...alert,
        severity_level: severityLevels[index % severityLevels.length],
    }));
};

function processAlerts(alerts: AlertModel[]): AlertModel[] {
    const processedAlerts = ENABLE_SEVERITY_OVERRIDE_FOR_TESTING ? overrideAlertSeveritiesForTesting(alerts) : alerts;
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

        const informedEntities = alert.informed_entity || [];
        if (informedEntities.some((entity: { route_id?: string }) => entity.route_id === route_id)) {
            filtered_results.push(alert);
        }
    }
    return filtered_results;
}