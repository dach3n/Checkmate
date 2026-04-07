import mongoose from "mongoose";
import { EscalationPolicyModel, type EscalationPolicyDocument } from "@/db/models/index.js";
import type { IEscalationPoliciesRepository } from "./IEscalationPoliciesRepository.js";
import type { EscalationPolicy, EscalationStep } from "@/types/escalation.js";
import { AppError } from "@/utils/AppError.js";

class MongoEscalationPoliciesRepository implements IEscalationPoliciesRepository {
	private toStringId = (value: mongoose.Types.ObjectId | string): string => {
		return value instanceof mongoose.Types.ObjectId ? value.toString() : value;
	};

	private toDateString = (value: Date | string): string => {
		return value instanceof Date ? value.toISOString() : value;
	};

	private toEntity = (doc: EscalationPolicyDocument): EscalationPolicy => {
		return {
			id: this.toStringId(doc._id),
			teamId: this.toStringId(doc.teamId),
			name: doc.name,
			steps: doc.steps.map(
				(step): EscalationStep => ({
					delayMs: step.delayMs,
					notificationIds: step.notificationIds.map((id) => this.toStringId(id)),
				})
			),
			createdAt: this.toDateString(doc.createdAt),
			updatedAt: this.toDateString(doc.updatedAt),
		};
	};

	private mapDocuments = (documents: EscalationPolicyDocument[]): EscalationPolicy[] => {
		if (!documents?.length) {
			return [];
		}
		return documents.map((doc) => this.toEntity(doc));
	};

	create = async (data: Partial<EscalationPolicy>): Promise<EscalationPolicy> => {
		const docData = {
			...data,
			steps: (data.steps ?? []).map((step) => ({
				delayMs: step.delayMs,
				notificationIds: step.notificationIds.map((id) => new mongoose.Types.ObjectId(id)),
			})),
		};
		const policy = await EscalationPolicyModel.create(docData);
		if (!policy) {
			throw new AppError({ message: "Failed to create escalation policy", status: 500 });
		}
		return this.toEntity(policy);
	};

	findById = async (id: string, teamId: string): Promise<EscalationPolicy> => {
		const policy = await EscalationPolicyModel.findOne({
			_id: new mongoose.Types.ObjectId(id),
			teamId: new mongoose.Types.ObjectId(teamId),
		});
		if (!policy) {
			throw new AppError({ message: "Escalation policy not found", status: 404 });
		}
		return this.toEntity(policy);
	};

	findByTeamId = async (teamId: string): Promise<EscalationPolicy[]> => {
		const documents = await EscalationPolicyModel.find({
			teamId: new mongoose.Types.ObjectId(teamId),
		});
		return this.mapDocuments(documents);
	};

	updateById = async (id: string, teamId: string, updateData: Partial<EscalationPolicy>): Promise<EscalationPolicy> => {
		const setData: Record<string, unknown> = { ...updateData };
		if (updateData.steps) {
			setData.steps = updateData.steps.map((step) => ({
				delayMs: step.delayMs,
				notificationIds: step.notificationIds.map((nid) => new mongoose.Types.ObjectId(nid)),
			}));
		}
		const policy = await EscalationPolicyModel.findOneAndUpdate(
			{
				_id: new mongoose.Types.ObjectId(id),
				teamId: new mongoose.Types.ObjectId(teamId),
			},
			{ $set: setData },
			{ new: true, runValidators: true }
		);
		if (!policy) {
			throw new AppError({ message: "Escalation policy not found or could not be updated", status: 404 });
		}
		return this.toEntity(policy);
	};

	deleteById = async (id: string, teamId: string): Promise<EscalationPolicy> => {
		const deleted = await EscalationPolicyModel.findOneAndDelete({
			_id: new mongoose.Types.ObjectId(id),
			teamId: new mongoose.Types.ObjectId(teamId),
		});
		if (!deleted) {
			throw new AppError({ message: "Escalation policy not found or could not be deleted", status: 404 });
		}
		return this.toEntity(deleted);
	};
}

export default MongoEscalationPoliciesRepository;
