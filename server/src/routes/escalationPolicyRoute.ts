import { IEscalationPolicyController } from "@/controllers/escalationPolicyController.js";
import { Router } from "express";

class EscalationPolicyRoutes {
	private router: Router;
	private epController: IEscalationPolicyController;

	constructor(escalationPolicyController: IEscalationPolicyController) {
		this.router = Router();
		this.epController = escalationPolicyController;
		this.initRoutes();
	}

	initRoutes() {
		this.router.post("/", this.epController.createPolicy);
		this.router.get("/team", this.epController.getPoliciesByTeamId);
		this.router.get("/:id", this.epController.getPolicyById);
		this.router.patch("/:id", this.epController.updatePolicy);
		this.router.delete("/:id", this.epController.deletePolicy);
	}

	getRouter() {
		return this.router;
	}
}

export default EscalationPolicyRoutes;
