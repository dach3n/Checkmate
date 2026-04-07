import { Request, Response, NextFunction } from "express";
import {
	createEscalationPolicyBodyValidation,
	editEscalationPolicyBodyValidation,
	escalationPolicyIdParamValidation,
} from "@/validation/escalationPolicyValidation.js";
import { requireTeamId } from "@/controllers/controllerUtils.js";
import type { IEscalationPoliciesRepository } from "@/repositories/index.js";

export interface IEscalationPolicyController {
	createPolicy(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
	getPoliciesByTeamId(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
	getPolicyById(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
	updatePolicy(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
	deletePolicy(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}

class EscalationPolicyController implements IEscalationPolicyController {
	private escalationPoliciesRepository: IEscalationPoliciesRepository;

	constructor(escalationPoliciesRepository: IEscalationPoliciesRepository) {
		this.escalationPoliciesRepository = escalationPoliciesRepository;
	}

	createPolicy = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedBody = createEscalationPolicyBodyValidation.parse(req.body);
			const teamId = requireTeamId(req.user?.teamId);

			const policy = await this.escalationPoliciesRepository.create({ ...validatedBody, teamId });

			return res.status(200).json({
				success: true,
				msg: "Escalation policy created successfully",
				data: policy,
			});
		} catch (error) {
			next(error);
		}
	};

	getPoliciesByTeamId = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const teamId = requireTeamId(req.user?.teamId);

			const policies = await this.escalationPoliciesRepository.findByTeamId(teamId);

			return res.status(200).json({
				success: true,
				msg: "Escalation policies fetched successfully",
				data: policies,
			});
		} catch (error) {
			next(error);
		}
	};

	getPolicyById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedParams = escalationPolicyIdParamValidation.parse(req.params);
			const teamId = requireTeamId(req.user?.teamId);

			const policy = await this.escalationPoliciesRepository.findById(validatedParams.id, teamId);

			return res.status(200).json({
				success: true,
				msg: "Escalation policy fetched successfully",
				data: policy,
			});
		} catch (error) {
			next(error);
		}
	};

	updatePolicy = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedParams = escalationPolicyIdParamValidation.parse(req.params);
			const validatedBody = editEscalationPolicyBodyValidation.parse(req.body);
			const teamId = requireTeamId(req.user?.teamId);

			const policy = await this.escalationPoliciesRepository.updateById(validatedParams.id, teamId, validatedBody);

			return res.status(200).json({
				success: true,
				msg: "Escalation policy updated successfully",
				data: policy,
			});
		} catch (error) {
			next(error);
		}
	};

	deletePolicy = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedParams = escalationPolicyIdParamValidation.parse(req.params);
			const teamId = requireTeamId(req.user?.teamId);

			await this.escalationPoliciesRepository.deleteById(validatedParams.id, teamId);

			return res.status(200).json({
				success: true,
				msg: "Escalation policy deleted successfully",
			});
		} catch (error) {
			next(error);
		}
	};
}

export default EscalationPolicyController;
