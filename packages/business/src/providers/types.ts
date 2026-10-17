import type { ZodType } from "zod";

export const GPS_PROVIDERS = ["geotab", "samsara"] as const;

export type GpsProviderKind = (typeof GPS_PROVIDERS)[number];

export interface ProviderVehicle {
	externalId: string;
	name: string;
	plate: string | null;
}

export interface ProviderPosition {
	externalId: string;
	lat: number;
	lng: number;
	speedKmh: number | null;
	heading: number | null;
	recordedAt: Date;
}

export interface GpsProvider<Credentials> {
	kind: GpsProviderKind;
	credentialsSchema: ZodType<Credentials>;
	validateCredentials(
		credentials: Credentials,
		fetchImpl?: typeof fetch,
	): Promise<void>;
	listVehicles(
		credentials: Credentials,
		fetchImpl?: typeof fetch,
	): Promise<ProviderVehicle[]>;
	fetchLatestPositions(
		credentials: Credentials,
		fetchImpl?: typeof fetch,
	): Promise<ProviderPosition[]>;
}
