import { ActionsMenu, type ActionMenuItem } from "@/Components/actions-menu";
import Typography from "@mui/material/Typography";
import type { Header } from "@/Components/design-elements/Table";
import { Table } from "@/Components/design-elements";

import type { EscalationPolicy } from "@/Types/EscalationPolicy";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material";

interface EscalationPoliciesTableProps {
	escalationPolicies: EscalationPolicy[];
	setSelectedPolicy: Function;
}

export const EscalationPoliciesTable = ({
	escalationPolicies,
	setSelectedPolicy,
}: EscalationPoliciesTableProps) => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const theme = useTheme();

	const getActions = (policy: EscalationPolicy): ActionMenuItem[] => {
		return [
			{
				id: 1,
				label: t("pages.common.monitors.actions.configure"),
				action: () => {
					navigate(`/escalation-policies/configure/${policy.id}`);
				},
				closeMenu: true,
			},
			{
				id: 7,
				label: (
					<Typography color={theme.palette.error.main}>
						{t("pages.common.monitors.actions.delete")}
					</Typography>
				),
				action: async () => {
					setSelectedPolicy(policy);
				},
				closeMenu: true,
			},
		];
	};

	const getHeaders = () => {
		const headers: Header<EscalationPolicy>[] = [
			{
				id: "name",
				content: t("common.table.headers.name"),
				render: (row) => {
					return <Typography>{row?.name}</Typography>;
				},
			},
			{
				id: "steps",
				content: t("pages.escalationPolicies.table.headers.steps"),
				render: (row) => {
					return (
						<Typography>
							{row?.steps?.length ?? 0}{" "}
							{t("pages.escalationPolicies.table.headers.steps").toLowerCase()}
						</Typography>
					);
				},
			},
			{
				id: "actions",
				content: t("common.table.headers.actions"),
				render: (row) => {
					return <ActionsMenu items={getActions(row)} />;
				},
			},
		];
		return headers;
	};

	const headers = getHeaders();

	return (
		<Table
			headers={headers}
			data={escalationPolicies}
			onRowClick={(row) => {
				navigate(`/escalation-policies/configure/${row.id}`);
			}}
		/>
	);
};
