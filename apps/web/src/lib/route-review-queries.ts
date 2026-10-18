import type { RouteReviewInput } from "@hack-the-andes-project/api/route-review-schemas";
import { type QueryClient, queryOptions } from "@tanstack/react-query";

import { routeReviewFixtureClient } from "@/fixtures/route-review/client";
import { client } from "@/utils/orpc";

// Revisar ruta is evaluated by the API; vehicles and planned trips stay on the
// fixture client until they have endpoints of their own.
export const routeReviewClient = {
	...routeReviewFixtureClient,
	routeReview: {
		evaluate: async ({ vehicleId, ...input }: RouteReviewInput) => {
			const review = await client.routeReview.evaluate({
				...input,
				vehicleAxleCount:
					routeReviewFixtureClient.routeReview.vehicleAxleCount(vehicleId),
			});
			return routeReviewFixtureClient.routeReview.register({
				...review,
				vehicleId,
			});
		},
	},
};

const ROUTE_REVIEW_QUERY_KEY = ["route-review"] as const;

export const routeReviewQueries = {
	vehicles: queryOptions({
		queryKey: [...ROUTE_REVIEW_QUERY_KEY, "vehicles"],
		queryFn: () => routeReviewClient.vehicles.list(),
	}),
	plannedTrips: queryOptions({
		queryKey: [...ROUTE_REVIEW_QUERY_KEY, "planned-trips"],
		queryFn: () => routeReviewClient.trips.listPlanned(),
	}),
	plannedTrip: (id: string) =>
		queryOptions({
			queryKey: [...ROUTE_REVIEW_QUERY_KEY, "planned-trips", id],
			queryFn: () => routeReviewClient.trips.get({ id }),
		}),
};

export async function invalidateRouteReviewQueries(queryClient: QueryClient) {
	await queryClient.invalidateQueries({ queryKey: ROUTE_REVIEW_QUERY_KEY });
}
