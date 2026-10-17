import { ShowcaseSection } from "@hack-the-andes-project/ui/components/showcase/section";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@hack-the-andes-project/ui/components/table";
import { useEffect, useRef, useState } from "react";
import { m } from "@/paraglide/messages";

const TYPE_SPECIMENS = [
	{ token: "type-display", use: m.ds_type_display_use, copy: m.ds_hero_title },
	{
		token: "type-title",
		use: m.ds_type_title_use,
		copy: m.ds_type_title_sample,
	},
	{
		token: "type-heading",
		use: m.ds_type_heading_use,
		copy: m.ds_carretera_central,
	},
	{
		token: "type-lead",
		use: m.ds_type_lead_use,
		copy: m.ds_type_lead_sample,
	},
	{
		token: "type-body",
		use: m.ds_type_body_use,
		copy: m.ds_type_body_sample,
	},
	{
		token: "type-label",
		use: m.ds_type_label_use,
		copy: m.ds_senamhi_orange_warning,
	},
	{
		token: "type-data",
		use: m.ds_type_data_use,
		copy: m.ds_type_data_sample,
	},
];

export function TypeSection() {
	const specimensRef = useRef<HTMLDivElement>(null);
	const [specifications, setSpecifications] = useState<Record<string, string>>(
		{},
	);
	useEffect(() => {
		const measure = () => {
			const nextSpecifications: Record<string, string> = {};
			for (const specimen of specimensRef.current?.querySelectorAll<HTMLElement>(
				"[data-type-specimen]",
			) ?? []) {
				const computed = getComputedStyle(specimen);
				nextSpecifications[specimen.dataset.typeSpecimen ?? ""] =
					`${computed.fontSize} / ${computed.lineHeight} / ${computed.fontWeight} / ${computed.letterSpacing}`;
			}
			setSpecifications(nextSpecifications);
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, []);
	return (
		<ShowcaseSection
			kicker={m.ds_section_kicker()}
			id="tipografia"
			number="02"
			title={m.ds_type_title()}
			description={m.ds_type_description()}
		>
			<div ref={specimensRef} className="min-w-0">
				<Table>
					<TableCaption>{m.ds_type_caption()}</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>{m.ds_type_token()}</TableHead>
							<TableHead>{m.ds_type_specification()}</TableHead>
							<TableHead>{m.ds_type_use()}</TableHead>
							<TableHead>{m.ds_type_specimen()}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{TYPE_SPECIMENS.map((specimen) => (
							<TableRow key={specimen.token}>
								<TableCell>
									<code>{specimen.token}</code>
								</TableCell>
								<TableCell>
									{specifications[specimen.token] ?? m.ds_measuring()}
								</TableCell>
								<TableCell>{specimen.use()}</TableCell>
								<TableCell>
									<div className="max-w-md overflow-hidden">
										<p
											data-type-specimen={specimen.token}
											className={`${specimen.token} truncate`}
										>
											{specimen.copy()}
										</p>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<p className="type-body mt-10 max-w-3xl">
				{m.ds_type_paragraph_start()}{" "}
				<a
					className="underline underline-offset-4 focus-visible:outline focus-visible:outline-ring"
					href="#riesgo"
				>
					{m.ds_type_paragraph_link()}
				</a>
				{m.ds_type_paragraph_middle()}{" "}
				<code className="border bg-muted px-1 text-foreground">
					{m.ds_sample_route_code()}
				</code>{" "}
				{m.ds_type_paragraph_end()}
			</p>
		</ShowcaseSection>
	);
}
