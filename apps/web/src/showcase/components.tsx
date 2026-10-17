import { Separator } from "@hack-the-andes-project/ui/components/separator";
import { ShowcaseSection } from "@hack-the-andes-project/ui/components/showcase/section";
import { m } from "@/paraglide/messages";
import { ActionsShowcase } from "./components/actions";
import { ConversationShowcase } from "./components/conversation";
import { DataDisplayShowcase } from "./components/data-display";
import { FeedbackShowcase } from "./components/feedback";
import { InputsShowcase } from "./components/inputs";
import { NavigationShowcase } from "./components/navigation";
import { OverlaysShowcase } from "./components/overlays";
export function ComponentsSection() {
	return (
		<ShowcaseSection
			id="componentes"
			number="04"
			kicker={m.ds_section_kicker()}
			title={m.ds_components_title()}
			description={m.ds_components_description()}
		>
			<div className="flex min-w-0 flex-col gap-12">
				<ActionsShowcase />
				<Separator />
				<InputsShowcase />
				<Separator />
				<NavigationShowcase />
				<Separator />
				<DataDisplayShowcase />
				<Separator />
				<FeedbackShowcase />
				<Separator />
				<OverlaysShowcase />
				<Separator />
				<ConversationShowcase />
			</div>
		</ShowcaseSection>
	);
}
