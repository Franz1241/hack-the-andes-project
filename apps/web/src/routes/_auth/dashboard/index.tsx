import {
	NavigationControl,
	Map as PeruMap,
} from "@hack-the-andes-project/ui/components/map";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard/")({
	component: () => (
		<PeruMap>
			<NavigationControl position="top-right" />
		</PeruMap>
	),
});
