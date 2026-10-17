import {
	Attachment,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentTitle,
} from "@hack-the-andes-project/ui/components/attachment";
import { Badge } from "@hack-the-andes-project/ui/components/badge";
import {
	Bubble,
	BubbleContent,
} from "@hack-the-andes-project/ui/components/bubble";
import { Button } from "@hack-the-andes-project/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@hack-the-andes-project/ui/components/card";
import { Checkbox } from "@hack-the-andes-project/ui/components/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hack-the-andes-project/ui/components/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@hack-the-andes-project/ui/components/empty";
import { Input } from "@hack-the-andes-project/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@hack-the-andes-project/ui/components/input-group";
import { Label } from "@hack-the-andes-project/ui/components/label";
import {
	Marker,
	MarkerContent,
} from "@hack-the-andes-project/ui/components/marker";
import {
	Message,
	MessageContent,
	MessageFooter,
	MessageHeader,
} from "@hack-the-andes-project/ui/components/message";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@hack-the-andes-project/ui/components/message-scroller";
import { Separator } from "@hack-the-andes-project/ui/components/separator";
import {
	Field,
	FieldGroup,
} from "@hack-the-andes-project/ui/components/showcase/field";
import {
	ArrowDownIcon,
	ArrowRightIcon,
	BellIcon,
	FileTextIcon,
	MapPinIcon,
	SearchIcon,
	Spinner,
} from "@hack-the-andes-project/ui/components/showcase/icons";
import { ShowcaseSection } from "@hack-the-andes-project/ui/components/showcase/section";
import {
	previewState,
	StateMatrix,
} from "@hack-the-andes-project/ui/components/showcase/state-matrix";
import { Skeleton } from "@hack-the-andes-project/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@hack-the-andes-project/ui/components/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@hack-the-andes-project/ui/components/tabs";
import { Textarea } from "@hack-the-andes-project/ui/components/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@hack-the-andes-project/ui/components/tooltip";
import type { ComponentProps } from "react";
import { toast } from "sonner";
import { m } from "@/paraglide/messages";

const BUTTON_VARIANTS: NonNullable<ComponentProps<typeof Button>["variant"]>[] =
	["default", "secondary", "outline", "ghost", "destructive", "link"];
const BUTTON_SIZES: NonNullable<ComponentProps<typeof Button>["size"]>[] = [
	"xs",
	"sm",
	"default",
	"lg",
];
const ICON_SIZES: NonNullable<ComponentProps<typeof Button>["size"]>[] = [
	"icon-xs",
	"icon-sm",
	"icon",
	"icon-lg",
];
interface BadgeExample {
	variant: NonNullable<ComponentProps<typeof Badge>["variant"]>;
	label: () => string;
}
const BADGE_EXAMPLES: BadgeExample[] = [
	{ variant: "default", label: m.ds_selected_route },
	{ variant: "secondary", label: m.ds_under_review },
	{ variant: "outline", label: m.ds_sample_route_code },
	{ variant: "ghost", label: m.ds_detail },
	{ variant: "destructive", label: m.ds_record_error },
	{ variant: "link", label: m.ds_view_source },
	{ variant: "low", label: m.risk_low },
	{ variant: "moderate", label: m.risk_moderate },
	{ variant: "high", label: m.risk_high },
	{ variant: "critical", label: m.risk_critical },
	{ variant: "info", label: m.ds_status_info },
	{ variant: "success", label: m.ds_saved },
];

export function ComponentsSection() {
	const stateLabels = {
		default: m.ds_state_default(),
		hover: m.ds_state_hover(),
		focus: m.ds_state_focus(),
		active: m.ds_state_active(),
		disabled: m.ds_state_disabled(),
		invalid: m.ds_state_invalid(),
	};
	return (
		<ShowcaseSection
			kicker={m.ds_section_kicker()}
			id="componentes"
			number="04"
			title={m.ds_components_title()}
			description={m.ds_components_description()}
		>
			<div className="flex min-w-0 flex-col gap-12">
				<div className="flex min-w-0 flex-col gap-6">
					<div>
						<h3 className="type-heading">{m.ds_buttons_title()}</h3>
						<p className="mt-2 text-muted-foreground text-sm">
							{m.ds_buttons_description()}
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button>
							{m.ds_evaluate_route()}
							<ArrowRightIcon data-icon="inline-end" />
						</Button>
						<Button variant="outline">{m.ds_view_sources()}</Button>
					</div>
					<StateMatrix
						variantLabel={m.ds_variant()}
						stateLabels={stateLabels}
						rows={BUTTON_VARIANTS}
						render={(variant, state) => (
							<Button variant={variant} {...previewState(state)}>
								{variant === "destructive"
									? m.ds_delete_alert()
									: m.ds_evaluate_route()}
							</Button>
						)}
					/>
					<div className="grid gap-8 lg:grid-cols-2">
						<div className="flex flex-col gap-4">
							<p className="type-label text-muted-foreground">{m.ds_sizes()}</p>
							<div className="flex flex-wrap items-end gap-4">
								{BUTTON_SIZES.map((size) => (
									<div key={size} className="flex flex-col items-start gap-2">
										<code className="text-muted-foreground text-xs">
											{size}
										</code>
										<Button size={size}>{m.recommendation_continue()}</Button>
									</div>
								))}
							</div>
						</div>
						<div className="flex flex-col gap-4">
							<p className="type-label text-muted-foreground">
								{m.ds_icon_buttons()}
							</p>
							<div className="flex flex-wrap items-end gap-4">
								{ICON_SIZES.map((size) => (
									<div key={size} className="flex flex-col items-start gap-2">
										<code className="text-muted-foreground text-xs">
											{size}
										</code>
										<Button
											size={size}
											variant="outline"
											aria-label={m.ds_search_route()}
										>
											<SearchIcon />
										</Button>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-4">
						<Button disabled aria-busy="true">
							<Spinner data-icon="inline-start" />
							{m.ds_evaluating_route()}
						</Button>
						<Button variant="outline">
							<BellIcon data-icon="inline-start" />
							{m.recommendation_monitor()}
						</Button>
						<Button variant="secondary" className="max-w-full">
							<span className="truncate">{m.ds_monitor_long_route()}</span>
						</Button>
					</div>
				</div>
				<Separator />
				<div className="flex min-w-0 flex-col gap-6">
					<div>
						<h3 className="type-heading">{m.ds_fields_title()}</h3>
						<p className="mt-2 text-muted-foreground text-sm">
							{m.ds_fields_description()}
						</p>
					</div>
					<FieldGroup className="grid gap-6 md:grid-cols-2">
						<Field>
							<Label htmlFor="route-search">{m.ds_search_route()}</Label>
							<InputGroup>
								<InputGroupAddon>
									<SearchIcon />
								</InputGroupAddon>
								<InputGroupInput
									id="route-search"
									placeholder={m.ds_carretera_central()}
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupText>{m.ds_country_code()}</InputGroupText>
								</InputGroupAddon>
							</InputGroup>
							<p className="text-muted-foreground text-xs">
								{m.ds_search_route_hint()}
							</p>
						</Field>
						<Field data-invalid>
							<Label htmlFor="invalid-location">
								{m.ds_incident_kilometer()}
							</Label>
							<Input
								id="invalid-location"
								defaultValue={m.ds_la_oroya()}
								aria-invalid="true"
								aria-describedby="location-error"
								required
							/>
							<p id="location-error" className="text-destructive text-xs">
								{m.ds_incident_kilometer_error()}
							</p>
						</Field>
						<Field>
							<Label htmlFor="route-notes">{m.ds_operator_notes()}</Label>
							<Textarea
								id="route-notes"
								defaultValue={m.ds_operator_notes_sample()}
							/>
						</Field>
						<Field data-disabled>
							<Label htmlFor="disabled-source">{m.ds_reference_source()}</Label>
							<Input
								id="disabled-source"
								defaultValue={m.ds_confirmed_source()}
								disabled
							/>
							<p className="text-muted-foreground text-xs">
								{m.ds_reference_source_hint()}
							</p>
						</Field>
					</FieldGroup>
					<StateMatrix
						variantLabel={m.ds_variant()}
						stateLabels={stateLabels}
						rows={["Input", "Textarea", "Checkbox"]}
						states={["default", "hover", "focus", "disabled", "invalid"]}
						render={(control, state) => {
							const fieldId = `preview-${control}-${state}`;
							return (
								<Field
									data-invalid={state === "invalid" || undefined}
									data-disabled={state === "disabled" || undefined}
									className="min-w-40"
								>
									<Label htmlFor={fieldId}>
										{control === "Checkbox"
											? m.ds_receive_alerts()
											: m.ds_route_label()}
									</Label>
									{control === "Input" ? (
										<Input
											id={fieldId}
											defaultValue={m.ds_sample_route_code()}
											aria-invalid={state === "invalid" || undefined}
											{...previewState(state)}
										/>
									) : control === "Textarea" ? (
										<Textarea
											id={fieldId}
											defaultValue={m.ds_check_segment()}
											aria-invalid={state === "invalid" || undefined}
											{...previewState(state)}
										/>
									) : (
										<Checkbox
											id={fieldId}
											defaultChecked
											aria-invalid={state === "invalid" || undefined}
											{...previewState(state)}
										/>
									)}
								</Field>
							);
						}}
					/>
				</div>
				<Separator />
				<div className="flex flex-col gap-6">
					<h3 className="type-heading">{m.ds_badges_title()}</h3>
					<div className="flex flex-wrap gap-3">
						{BADGE_EXAMPLES.map((badge) => (
							<div key={badge.variant} className="flex flex-col gap-2">
								<code className="text-muted-foreground text-xs">
									{badge.variant}
								</code>
								<Badge variant={badge.variant}>{badge.label()}</Badge>
							</div>
						))}
					</div>
					<div className="max-w-full">
						<Badge variant="outline" className="max-w-full">
							<span className="truncate">{m.ds_long_badge()}</span>
						</Badge>
						<p className="mt-2 text-muted-foreground text-xs">
							{m.ds_long_badge_hint()}
						</p>
					</div>
				</div>
				<div className="grid min-w-0 gap-6 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>{m.ds_carretera_central()}</CardTitle>
							<CardDescription>{m.ds_route_card_description()}</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-4">
							<Badge variant="critical">{m.risk_critical()}</Badge>
							<p>{m.ds_route_card_alert()}</p>
						</CardContent>
						<CardFooter className="flex-wrap gap-2">
							<Button onClick={() => toast.info(m.ds_toast_reroute_opened())}>
								{m.ds_evaluate_reroute()}
							</Button>
							<Button
								variant="outline"
								onClick={() => toast.info(m.ds_toast_source_opened())}
							>
								{m.ds_view_source()}
							</Button>
						</CardFooter>
					</Card>
					<div className="flex min-w-0 flex-col gap-4 border p-5">
						<h3 className="type-heading">{m.ds_tabs_title()}</h3>
						<Tabs defaultValue="now">
							<TabsList aria-label={m.ds_alert_horizon()}>
								<TabsTrigger value="now">{m.horizon_now()}</TabsTrigger>
								<TabsTrigger value="forecast">
									{m.ds_forecast_window()}
								</TabsTrigger>
								<TabsTrigger value="history" disabled>
									{m.ds_history()}
								</TabsTrigger>
							</TabsList>
							<TabsContent value="now">
								<Table>
									<TableCaption>
										{m.ds_confirmed_incidents_caption()}
									</TableCaption>
									<TableHeader>
										<TableRow>
											<TableHead>{m.ds_route_label()}</TableHead>
											<TableHead>{m.ds_status_label()}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										<TableRow>
											<TableCell>{m.ds_central_kilometer()}</TableCell>
											<TableCell>
												<Badge variant="critical">{m.risk_critical()}</Badge>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>{m.ds_panamericana_sur()}</TableCell>
											<TableCell>
												<Badge variant="low">{m.risk_low()}</Badge>
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TabsContent>
							<TabsContent value="forecast">
								<p className="py-4">{m.ds_forecast_tab_description()}</p>
							</TabsContent>
						</Tabs>
					</div>
				</div>
				<Separator />
				<div className="grid gap-8 md:grid-cols-2">
					<div className="flex flex-col gap-5">
						<h3 className="type-heading">{m.ds_overlays_title()}</h3>
						<div className="flex flex-wrap gap-3">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger render={<Button variant="outline" />}>
										{m.ds_forecast_tooltip_trigger()}
									</TooltipTrigger>
									<TooltipContent>{m.ds_forecast_tooltip()}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<DropdownMenu>
								<DropdownMenuTrigger render={<Button variant="outline" />}>
									{m.ds_route_actions()}
									<ArrowDownIcon data-icon="inline-end" />
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuGroup>
										<DropdownMenuLabel>
											{m.ds_carretera_central()}
										</DropdownMenuLabel>
										<DropdownMenuItem
											onClick={() =>
												toast.success(m.ds_toast_monitor_enabled())
											}
										>
											{m.ds_monitor_route()}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												toast.info(m.ds_toast_reroute_recommendation())
											}
										>
											{m.ds_view_recommendation()}
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											variant="destructive"
											onClick={() => toast.info(m.ds_toast_alert_archived())}
										>
											{m.ds_archive_alert()}
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<div className="flex flex-col gap-5">
						<h3 className="type-heading">{m.ds_notifications_title()}</h3>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								onClick={() =>
									toast.success(m.ds_toast_route_saved(), {
										description: m.ds_toast_route_saved_description(),
									})
								}
							>
								{m.ds_status_success()}
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									toast.info(m.ds_toast_alert_updated(), {
										description: m.ds_toast_alert_updated_description(),
									})
								}
							>
								{m.ds_status_info()}
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									toast.warning(m.ds_senamhi_orange_warning(), {
										description: m.ds_heavy_rain_forecast(),
									})
								}
							>
								{m.ds_warning()}
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									toast.error(m.ds_toast_save_failed(), {
										description: m.ds_toast_save_failed_description(),
									})
								}
							>
								{m.ds_error()}
							</Button>
						</div>
					</div>
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					<div
						className="flex flex-col gap-5 border p-6"
						role="status"
						aria-label={m.ds_loading_route_summary()}
					>
						<h3 className="type-heading">{m.ds_skeleton_title()}</h3>
						<Skeleton className="h-5 w-2/3" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-4/5" />
						<Skeleton className="h-24 w-full" />
						<p className="text-muted-foreground text-xs">
							{m.ds_loading_route_status()}
						</p>
					</div>
					<Empty className="border">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<MapPinIcon />
							</EmptyMedia>
							<EmptyTitle>{m.ds_empty_title()}</EmptyTitle>
							<EmptyDescription>{m.ds_empty_description()}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => toast.success(m.ds_toast_route_added())}>
								{m.ds_add_route()}
							</Button>
						</EmptyContent>
					</Empty>
				</div>
				<Separator />
				<div className="flex min-w-0 flex-col gap-6">
					<h3 className="type-heading">{m.ds_conversation_title()}</h3>
					<p className="type-body text-muted-foreground">
						{m.ds_conversation_description()}
					</p>
					<div className="h-96 min-w-0 border bg-card p-4">
						<MessageScrollerProvider>
							<MessageScroller>
								<MessageScrollerViewport>
									<MessageScrollerContent>
										<MessageScrollerItem messageId="context">
											<Marker variant="separator">
												<MarkerContent>
													{m.ds_conversation_date()}
												</MarkerContent>
											</Marker>
										</MessageScrollerItem>
										<MessageScrollerItem messageId="operator" scrollAnchor>
											<Message align="end">
												<MessageContent>
													<MessageHeader>{m.ds_operations()}</MessageHeader>
													<Bubble align="end">
														<BubbleContent>
															{m.ds_operator_message()}
														</BubbleContent>
													</Bubble>
													<MessageFooter>08:12</MessageFooter>
												</MessageContent>
											</Message>
										</MessageScrollerItem>
										<MessageScrollerItem messageId="assistant">
											<Message>
												<MessageContent>
													<MessageHeader>{m.ds_assistant_name()}</MessageHeader>
													<Bubble variant="secondary">
														<BubbleContent>
															{m.ds_assistant_message()}
														</BubbleContent>
													</Bubble>
													<Attachment state="done">
														<AttachmentMedia variant="icon">
															<FileTextIcon />
														</AttachmentMedia>
														<AttachmentContent>
															<AttachmentTitle>
																{m.ds_closure_attachment_name()}
															</AttachmentTitle>
															<AttachmentDescription>
																{m.ds_attachment_reference()}
															</AttachmentDescription>
														</AttachmentContent>
													</Attachment>
													<MessageFooter>
														{m.ds_assistant_timestamp()}
													</MessageFooter>
												</MessageContent>
											</Message>
										</MessageScrollerItem>
										<MessageScrollerItem messageId="attachment-error">
											<Message>
												<MessageContent>
													<Attachment state="error">
														<AttachmentMedia variant="icon">
															<FileTextIcon />
														</AttachmentMedia>
														<AttachmentContent>
															<AttachmentTitle>
																{m.ds_field_attachment_name()}
															</AttachmentTitle>
															<AttachmentDescription>
																{m.ds_attachment_error()}
															</AttachmentDescription>
														</AttachmentContent>
													</Attachment>
												</MessageContent>
											</Message>
										</MessageScrollerItem>
									</MessageScrollerContent>
								</MessageScrollerViewport>
								<MessageScrollerButton aria-label={m.ds_scroll_latest()}>
									<ArrowDownIcon />
								</MessageScrollerButton>
							</MessageScroller>
						</MessageScrollerProvider>
					</div>
				</div>
			</div>
		</ShowcaseSection>
	);
}
