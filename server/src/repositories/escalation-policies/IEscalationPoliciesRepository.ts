import type { EscalationPolicy } from "@/types/escalation.js";

export interface IEscalationPoliciesRepository {
	// create
	create(data: Partial<EscalationPolicy>): Promise<EscalationPolicy>;
	// fetch
	findById(id: string, teamId: string): Promise<EscalationPolicy>;
	findByTeamId(teamId: string): Promise<EscalationPolicy[]>;
	// update
	updateById(id: string, teamId: string, updateData: Partial<EscalationPolicy>): Promise<EscalationPolicy>;
	// delete
	deleteById(id: string, teamId: string): Promise<EscalationPolicy>;
}
