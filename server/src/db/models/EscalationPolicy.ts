import { Schema, model, type Types } from "mongoose";
import type { EscalationPolicy, EscalationStep } from "@/types/escalation.js";

type EscalationStepDocument = Omit<EscalationStep, "notificationIds"> & {
	notificationIds: Types.ObjectId[];
};

interface EscalationPolicyDocument extends Omit<EscalationPolicy, "id" | "teamId" | "steps" | "createdAt" | "updatedAt"> {
	_id: Types.ObjectId;
	teamId: Types.ObjectId;
	steps: EscalationStepDocument[];
	createdAt: Date;
	updatedAt: Date;
}

const EscalationStepSchema = new Schema<EscalationStepDocument>(
	{
		delayMs: {
			type: Number,
			required: true,
		},
		notificationIds: [
			{
				type: Schema.Types.ObjectId,
				ref: "Notification",
			},
		],
	},
	{ _id: false }
);

const EscalationPolicySchema = new Schema<EscalationPolicyDocument>(
	{
		teamId: {
			type: Schema.Types.ObjectId,
			ref: "Team",
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		steps: {
			type: [EscalationStepSchema],
			default: [],
		},
	},
	{ timestamps: true }
);

const EscalationPolicyModel = model<EscalationPolicyDocument>("EscalationPolicy", EscalationPolicySchema);

export type { EscalationPolicyDocument, EscalationStepDocument };
export { EscalationPolicyModel };
export default EscalationPolicyModel;
