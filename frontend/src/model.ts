// Types

export const Severity = {
  UNKNOWN_SEVERITY: "UNKNOWN_SEVERITY",
  INFO: "INFO",
  WARNING: "WARNING",
  SEVERE: "SEVERE",
} as const;

export type Severity = (typeof Severity)[keyof typeof Severity];

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

export interface AlertModel {
  effect: string;
  effect_detail: LocalizedText;
  cause: string;
  cause_detail: LocalizedText;
  header_text: LocalizedText;
  description_text: LocalizedText;
  severity_level: Severity;
  url: LocalizedText;
  active_period: ActivePeriod[];
  informed_entity: InformedEntity[];
}

// Data

const severityOrder: Record<Severity, number> = {
  [Severity.SEVERE]: 1,
  [Severity.WARNING]: 2,
  [Severity.INFO]: 3,
  [Severity.UNKNOWN_SEVERITY]: 4,
};

// Functions

export function lessThan(a?: Severity, b?: Severity): number {
  const severityA = a || Severity.UNKNOWN_SEVERITY;
  const severityB = b || Severity.UNKNOWN_SEVERITY;
  return severityOrder[severityA] - severityOrder[severityB];
}

export function sortBySeverity(alerts: AlertModel[]): AlertModel[] {
  return alerts.slice().sort((a: AlertModel, b: AlertModel) => lessThan(a.severity_level, b.severity_level));
}
