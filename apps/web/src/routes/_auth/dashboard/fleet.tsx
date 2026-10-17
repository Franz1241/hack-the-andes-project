import { DashboardComingSoon } from "@hack-the-andes-project/ui/components/dashboard-coming-soon";
import { TruckIcon } from "@hack-the-andes-project/ui/components/icons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard/fleet")({
	component: () => (
		<DashboardComingSoon
			title="Tu flota, conectada"
			description="Pronto podrás ver tus vehículos, planificar viajes y seguir cada ruta desde aquí."
			icon={TruckIcon}
		/>
	),
});
