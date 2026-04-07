import { BasePageWithStates } from "@/Components/design-elements";
import { HeaderCreate } from "@/Components/common";
import { Dialog } from "@/Components/inputs";
import { EscalationPoliciesTable } from "./components/EscalationPoliciesTable";

import { useState } from "react";
import { useGet, useDelete } from "@/Hooks/UseApi";
import { useTranslation } from "react-i18next";
import type { EscalationPolicy } from "@/Types/EscalationPolicy";
import { useIsAdmin } from "@/Hooks/useIsAdmin";

const EscalationPoliciesPage = () => {
	const { t } = useTranslation();
	const isAdmin = useIsAdmin();

	const [selectedPolicy, setSelectedPolicy] = useState<EscalationPolicy | null>(null);
	const isDialogOpen = Boolean(selectedPolicy);

	const {
		data: escalationPolicies,
		isLoading,
		isValidating,
		error,
		refetch,
	} = useGet<EscalationPolicy[]>("/escalation-policies/team", {}, { keepPreviousData: true });

	const { deleteFn, loading: isDeleting } = useDelete();

	const handleConfirm = async () => {
		if (!selectedPolicy) return;
		await deleteFn(`/escalation-policies/${selectedPolicy.id}`);
		setSelectedPolicy(null);
		refetch();
	};

	const handleCancel = () => {
		setSelectedPolicy(null);
	};

	return (
		<BasePageWithStates
			page={t("pages.escalationPolicies.fallback.title")}
			bullets={
				t("pages.escalationPolicies.fallback.checks", {
					returnObjects: true,
				}) as string[]
			}
			loading={isLoading || isValidating}
			error={!!error}
			totalCount={escalationPolicies?.length ?? 0}
			actionButtonText={t("pages.escalationPolicies.fallback.actionButton")}
			actionLink="/escalation-policies/create"
		>
			<HeaderCreate
				path="/escalation-policies/create"
				isLoading={isLoading || isValidating}
				isAdmin={isAdmin}
			/>
			<EscalationPoliciesTable
				escalationPolicies={escalationPolicies ?? []}
				setSelectedPolicy={setSelectedPolicy}
			/>
			<Dialog
				open={isDialogOpen}
				title={t("common.dialogs.delete.title")}
				content={t("common.dialogs.delete.description")}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
				loading={isDeleting}
			/>
		</BasePageWithStates>
	);
};

export default EscalationPoliciesPage;
