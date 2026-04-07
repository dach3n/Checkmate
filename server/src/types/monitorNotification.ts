// Define escalation configuration types for monitor-notification associations

interface MonitorNotificationEscalation {
    id: string;
    notificationId: string;
    rule: EscalationRule;
}

interface EscalationRule {
    id: string;
    criteria: string;
    actions: Array<string>;
}

interface MonitorNotificationConfig {
    id: string;
    escalation: MonitorNotificationEscalation;
    createdAt: Date;
    updatedAt: Date;
}