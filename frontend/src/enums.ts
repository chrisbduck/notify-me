export const Severity = {
    UNKNOWN_SEVERITY: "UNKNOWN_SEVERITY",
    INFO: "INFO",
    WARNING: "WARNING",
    SEVERE: "SEVERE",
} as const;

export type Severity = (typeof Severity)[keyof typeof Severity];

const severityOrder: Record<Severity, number> = {
    [Severity.SEVERE]: 1,
    [Severity.WARNING]: 2,
    [Severity.INFO]: 3,
    [Severity.UNKNOWN_SEVERITY]: 4,
};

export function lessThan(a?: Severity, b?: Severity): number {
    const severityA = a || Severity.UNKNOWN_SEVERITY;
    const severityB = b || Severity.UNKNOWN_SEVERITY;
    return severityOrder[severityA] - severityOrder[severityB];
}
