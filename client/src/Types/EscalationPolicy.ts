export interface EscalationStep {
	delayMs: number;
	notificationIds: string[];
}

export interface EscalationPolicy {
	id: string;
	teamId: string;
	name: string;
	steps: EscalationStep[];
	createdAt: string;
	updatedAt: string;
}
