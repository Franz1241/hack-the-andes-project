import { DashboardComingSoon } from "@hack-the-andes-project/ui/components/dashboard-coming-soon";
import { SettingsIcon } from "@hack-the-andes-project/ui/components/icons";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard/settings")({
	component: () => (
		<DashboardComingSoon
			title="Conecta tu operación"
			description="Pronto podrás administrar tus proveedores GPS y las preferencias de tu organización."
			icon={SettingsIcon}
		/>
	),
});
