import { DashboardComingSoon } from "@hack-the-andes-project/ui/components/dashboard-coming-soon";
import { NewspaperIcon } from "@hack-the-andes-project/ui/components/icons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard/news")({
	component: () => (
		<DashboardComingSoon
			title="Actualidad en ruta"
			description="Las noticias relevantes para tu operación estarán disponibles aquí."
			icon={NewspaperIcon}
		/>
	),
});
