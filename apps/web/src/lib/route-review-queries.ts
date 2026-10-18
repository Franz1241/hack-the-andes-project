import { type QueryClient, queryOptions } from "@tanstack/react-query";

import { routeReviewFixtureClient } from "@/fixtures/route-review/client";

export const routeReviewClient = routeReviewFixtureClient;

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
