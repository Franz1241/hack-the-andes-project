import { DashboardComingSoon } from "@hack-the-andes-project/ui/components/dashboard-coming-soon";
import { BellIcon } from "@hack-the-andes-project/ui/components/icons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard/alerts")({
	component: () => (
		<DashboardComingSoon
			title="Anticípate a los riesgos"
			description="Pronto recibirás alertas cuando un incidente afecte el recorrido de tu flota."
			icon={BellIcon}
		/>
	),
});
