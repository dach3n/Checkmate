import { z } from "zod";

export const escalationStepBodyValidation = z.object({
	delayMs: z.number().int().positive(),
	notificationIds: z.array(z.string()).min(1),
});

export const createEscalationPolicyBodyValidation = z.object({
	name: z.string().min(1).max(100),
	steps: z.array(escalationStepBodyValidation).min(1),
});

export const editEscalationPolicyBodyValidation = createEscalationPolicyBodyValidation.partial();

export const escalationPolicyIdParamValidation = z.object({
	id: z.string(),
});
