import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import { logger } from "@/Utils/logger";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { SPACING, LAYOUT } from "@/Utils/Theme/constants";
import { BasePage, ConfigBox } from "@/Components/design-elements";
import { TextField, Select, Button, Autocomplete } from "@/Components/inputs";

import { useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { EscalationPolicy } from "@/Types/EscalationPolicy";
import type { EscalationPolicyFormData } from "@/Validation/escalationPolicy";
import { delayUnitOptions } from "@/Validation/escalationPolicy";
import { useEscalationPolicyForm } from "@/Hooks/useEscalationPolicyForm";
import { useGet, usePost, usePatch } from "@/Hooks/UseApi";
import { useParams, useNavigate } from "react-router-dom";
import type { Notification } from "@/Types/Notification";
import { useForm, Controller, useFieldArray, type FieldErrors } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { Trash2, Plus } from "lucide-react";

const CreateEscalationPolicyPage = () => {
	const theme = useTheme();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { escalationPolicyId } = useParams<{ escalationPolicyId: string }>();
	const isEditMode = Boolean(escalationPolicyId);

	const { data: existingPolicy } = useGet<EscalationPolicy>(
		isEditMode ? `/escalation-policies/${escalationPolicyId}` : null,
		{},
		{ keepPreviousData: false }
	);

	const { data: notifications } = useGet<Notification[]>("/notifications/team");

	const { post, loading: isPosting } = usePost();
	const { patch, loading: isPatching } = usePatch();

	const { schema, defaults } = useEscalationPolicyForm({ data: existingPolicy });

	const form = useForm<EscalationPolicyFormData>({
		resolver: zodResolver(schema),
		defaultValues: defaults,
	});

	const { control, handleSubmit } = form;

	const { fields, append, remove } = useFieldArray({
		control,
		name: "steps",
	});

	useEffect(() => {
		if (existingPolicy) {
			form.reset(defaults);
		}
	}, [existingPolicy, defaults, form]);

	const onSubmit = async (data: EscalationPolicyFormData) => {
		const payload = {
			name: data.name,
			steps: data.steps.map(({ delayMs, notificationIds }) => ({
				delayMs,
				notificationIds,
			})),
		};

		let result;
		if (isEditMode && escalationPolicyId) {
			result = await patch(`/escalation-policies/${escalationPolicyId}`, payload);
		} else {
			result = await post("/escalation-policies", payload);
		}

		if (result?.success) {
			navigate("/escalation-policies");
		}
	};

	const isLoading = isPosting || isPatching;

	const onError = (errors: FieldErrors<EscalationPolicyFormData>) => {
		logger.error("Escalation policy form submission failed", undefined, { errors });
	};

	return (
		<BasePage
			component={"form"}
			onSubmit={handleSubmit(onSubmit, onError)}
		>
			<ConfigBox
				title={t("pages.escalationPolicies.form.name.title")}
				subtitle={t("pages.escalationPolicies.form.name.description")}
				rightContent={
					<Controller
						name="name"
						control={control}
						defaultValue={defaults.name}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								type="text"
								fieldLabel={t("pages.escalationPolicies.form.name.option.label")}
								placeholder={t("pages.escalationPolicies.form.name.option.placeholder")}
								fullWidth
								error={!!fieldState.error}
								helperText={fieldState.error?.message ?? ""}
							/>
						)}
					/>
				}
			/>

			<ConfigBox
				title={t("pages.escalationPolicies.form.steps.title")}
				subtitle={t("pages.escalationPolicies.form.steps.description")}
				rightContent={
					<Stack spacing={theme.spacing(LAYOUT.MD)}>
						{fields.map((stepField, index) => (
							<Stack
								key={stepField.id}
								spacing={theme.spacing(LAYOUT.SM)}
							>
								<Stack
									direction="row"
									alignItems="flex-start"
									spacing={theme.spacing(LAYOUT.MD)}
								>
									<Controller
										name={`steps.${index}.delayMs`}
										control={control}
										render={({ field, fieldState }) => {
											const unitId = form.watch(`steps.${index}.delayUnit`) ?? "minutes";
											const unit = delayUnitOptions.find((o) => o.id === unitId);
											const multiplier = unit?.multiplier ?? 60000;
											const displayValue =
												field.value > 0 ? field.value / multiplier : "";

											return (
												<TextField
													type="number"
													fieldLabel={t(
														"pages.escalationPolicies.form.steps.option.delay.label"
													)}
													value={displayValue}
													onChange={(e) => {
														const val = e.target.value;
														field.onChange(val === "" ? 0 : Number(val) * multiplier);
													}}
													error={!!fieldState.error}
													helperText={fieldState.error?.message ?? ""}
													sx={{ width: 140 }}
												/>
											);
										}}
									/>
									<Controller
										name={`steps.${index}.delayUnit`}
										control={control}
										render={({ field }) => (
											<Select
												fieldLabel={t(
													"pages.escalationPolicies.form.steps.option.unit.label"
												)}
												value={field.value ?? "minutes"}
												onChange={field.onChange}
												sx={{ minWidth: 120 }}
											>
												{delayUnitOptions.map((option) => (
													<MenuItem
														key={option.id}
														value={option.id}
													>
														<Typography>{option.name}</Typography>
													</MenuItem>
												))}
											</Select>
										)}
									/>
									<IconButton
										size="small"
										onClick={() => remove(index)}
										disabled={fields.length <= 1}
										aria-label="Remove step"
										sx={{ mt: theme.spacing(LAYOUT.LG) }}
									>
										<Trash2 size={16} />
									</IconButton>
								</Stack>
								<Controller
									name={`steps.${index}.notificationIds`}
									control={control}
									render={({ field }) => {
										const notificationOptions = (notifications ?? []).map((n) => ({
											...n,
											name: n.notificationName,
										}));
										const selectedNotifications = notificationOptions.filter((n) =>
											(field.value ?? []).includes(n.id)
										);
										return (
											<Autocomplete
												multiple
												options={notificationOptions}
												value={selectedNotifications}
												getOptionLabel={(option) => option.name}
												onChange={(_: unknown, newValue: typeof notificationOptions) => {
													field.onChange(newValue.map((n) => n.id));
												}}
												isOptionEqualToValue={(option, value) => option.id === value.id}
												fieldLabel={t(
													"pages.escalationPolicies.form.steps.option.notifications.label"
												)}
											/>
										);
									}}
								/>
							</Stack>
						))}
						<Stack
							direction="row"
							justifyContent="flex-start"
						>
							<Button
								type="button"
								variant="outlined"
								onClick={() =>
									append({ delayMs: 300000, delayUnit: "minutes", notificationIds: [] })
								}
								startIcon={<Plus size={16} />}
							>
								{t("pages.escalationPolicies.form.steps.option.addStep")}
							</Button>
						</Stack>
					</Stack>
				}
			/>

			<Stack
				direction="row"
				justifyContent="flex-end"
				spacing={theme.spacing(SPACING.LG)}
			>
				<Button
					loading={isLoading}
					type="submit"
					variant="contained"
					color="primary"
				>
					{t("common.buttons.save")}
				</Button>
			</Stack>
		</BasePage>
	);
};

export default CreateEscalationPolicyPage;
