// monitorNotification.ts

export type MonitorNotificationType = {
    id: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    context?: Record<string, any>;
};

export const monitorNotifications: MonitorNotificationType[] = [];
