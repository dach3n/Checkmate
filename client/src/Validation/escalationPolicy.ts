import { z } from "zod";

export const delayUnitOptions = [
	{ id: "minutes", name: "minutes", multiplier: 60000 },
	{ id: "hours", name: "hours", multiplier: 3600000 },
] as const;

export const escalationStepSchema = z.object({
	delayMs: z.number().int().min(1, "Delay must be at least 1 ms"),
	delayUnit: z.string(),
	notificationIds: z
		.array(z.string())
		.min(1, "At least one notification channel is required"),
});

export const escalationPolicySchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must be at most 100 characters"),
	steps: z.array(escalationStepSchema).min(1, "At least one step is required"),
});

export type EscalationPolicyFormData = z.infer<typeof escalationPolicySchema>;
