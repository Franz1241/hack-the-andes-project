import type { Geometry } from "geojson";
import { z } from "zod";

import {
	GEOJSON_GEOMETRY_COLLECTION,
	GEOJSON_LINE_STRING,
	GEOJSON_MULTI_LINE_STRING,
	GEOJSON_MULTI_POINT,
	GEOJSON_MULTI_POLYGON,
	GEOJSON_POINT,
	GEOJSON_POLYGON,
	GEOJSON_TYPE_PROPERTY,
	INVALID_BOUNDING_BOX_MESSAGE,
	MAX_LATITUDE_DEG,
	MAX_LONGITUDE_DEG,
	MIN_LATITUDE_DEG,
	MIN_LONGITUDE_DEG,
} from "./constants";

const latitudeSchema = z.number().min(MIN_LATITUDE_DEG).max(MAX_LATITUDE_DEG);
const longitudeSchema = z
	.number()
	.min(MIN_LONGITUDE_DEG)
	.max(MAX_LONGITUDE_DEG);

export const boundingBoxSchema = z
	.object({
		west: longitudeSchema,
		south: latitudeSchema,
		east: longitudeSchema,
		north: latitudeSchema,
	})
	.refine(
		(boundingBox) =>
			boundingBox.west <= boundingBox.east &&
			boundingBox.south <= boundingBox.north,
		{ message: INVALID_BOUNDING_BOX_MESSAGE },
	);

const positionSchema = z.array(z.number());
const geometryBaseSchema = z.object({
	bbox: z
		.union([
			z.tuple([z.number(), z.number(), z.number(), z.number()]),
			z.tuple([
				z.number(),
				z.number(),
				z.number(),
				z.number(),
				z.number(),
				z.number(),
			]),
		])
		.optional(),
});

export const geometrySchema: z.ZodType<Geometry> = z.lazy(() =>
	z.discriminatedUnion(GEOJSON_TYPE_PROPERTY, [
		geometryBaseSchema.extend({
			type: z.literal(GEOJSON_POINT),
			coordinates: positionSchema,
		}),
		geometryBaseSchema.extend({
			type: z.literal(GEOJSON_MULTI_POINT),
			coordinates: z.array(positionSchema),
		}),
		geometryBaseSchema.extend({
			type: z.literal(GEOJSON_LINE_STRING),
			coordinates: z.array(positionSchema),
		}),
		geometryBaseSchema.extend({
			type: z.literal(GEOJSON_MULTI_LINE_STRING),
			coordinates: z.array(z.array(positionSchema)),
		}),
		geometryBaseSchema.extend({
			type: z.literal(GEOJSON_POLYGON),
			coordinates: z.array(z.array(positionSchema)),
		}),
		geometryBaseSchema.extend({
			type: z.literal(GEOJSON_MULTI_POLYGON),
			coordinates: z.array(z.array(z.array(positionSchema))),
		}),
		geometryBaseSchema.extend({
			type: z.literal(GEOJSON_GEOMETRY_COLLECTION),
			geometries: z.array(geometrySchema),
		}),
	]),
);
