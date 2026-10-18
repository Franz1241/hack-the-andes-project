import { evaluateRouteReview } from "@hack-the-andes-project/business/route-review/evaluate";
import { ROUTE_REVIEW_PLACES } from "@hack-the-andes-project/business/route-review/places";

import { protectedProcedure } from "../index";
import {
	evaluatedRouteReviewSchema,
	routeReviewEvaluateInputSchema,
} from "../route-review-schemas";

export const routeReviewRouter = {
	evaluate: protectedProcedure
		.input(routeReviewEvaluateInputSchema)
		.output(evaluatedRouteReviewSchema)
		.handler(async ({ context, input }) => {
			const now = new Date();
			const review = await evaluateRouteReview({
				db: context.db,
				origin: ROUTE_REVIEW_PLACES[input.originPlaceId],
				destination: ROUTE_REVIEW_PLACES[input.destinationPlaceId],
				departureAt: input.departureAt,
				axleCount: input.vehicleAxleCount,
				osrmBaseUrl: context.osrmBaseUrl,
				now,
				log: context.log,
			});

			context.log.set({
				routeReview: {
					originPlaceId: input.originPlaceId,
					destinationPlaceId: input.destinationPlaceId,
					candidates: review.candidates.length,
					recommendedCandidateId: review.recommendedCandidateId,
				},
			});

			return {
				id: crypto.randomUUID(),
				originPlaceId: input.originPlaceId,
				destinationPlaceId: input.destinationPlaceId,
				vehicleAxleCount: input.vehicleAxleCount,
				departureAt: input.departureAt,
				...review,
				evaluatedAt: now,
			};
		}),
};
