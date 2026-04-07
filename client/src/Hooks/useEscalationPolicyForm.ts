import { useMemo } from "react";
import {
	escalationPolicySchema,
	delayUnitOptions,
	type EscalationPolicyFormData,
} from "@/Validation/escalationPolicy";
import type { EscalationPolicy } from "@/Types/EscalationPolicy";

interface UseEscalationPolicyFormOptions {
	data?: EscalationPolicy | null;
}

const getDelayUnit = (delayMs: number): string => {
	if (delayMs % delayUnitOptions[1].multiplier === 0) return "hours";
	return "minutes";
};

export const useEscalationPolicyForm = ({
	data = null,
}: UseEscalationPolicyFormOptions = {}) => {
	return useMemo(() => {
		let defaults: EscalationPolicyFormData;

		if (data) {
			defaults = {
				name: data.name,
				steps: data.steps.map((step) => ({
					delayMs: step.delayMs,
					delayUnit: getDelayUnit(step.delayMs),
					notificationIds: step.notificationIds,
				})),
			};
		} else {
			defaults = {
				name: "",
				steps: [{ delayMs: 300000, delayUnit: "minutes", notificationIds: [] }],
			};
		}

		return { schema: escalationPolicySchema, defaults };
	}, [data]);
};
