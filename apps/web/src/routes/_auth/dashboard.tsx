import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { m } from "@/paraglide/messages";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	const privateData = useQuery(orpc.privateData.queryOptions());

	return (
		<div>
			<h1>{m.dashboard_title()}</h1>
			<p>{m.dashboard_welcome({ name: session.data?.user.name ?? "" })}</p>
			<p>{m.dashboard_api({ message: privateData.data?.message ?? "" })}</p>
		</div>
	);
}
