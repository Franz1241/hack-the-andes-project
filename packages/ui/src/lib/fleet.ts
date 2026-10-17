import type { GpsCredentialsInput } from "@hack-the-andes-project/business/providers/index";
import type { Geometry, LineString } from "geojson";

import type { SeverityProps } from "../components/severity";

export interface FleetConnection {
	id: string;
	provider: GpsCredentialsInput["provider"];
	label: string;
	status: "active" | "error";
	lastSyncAt: Date | null;
	lastError: string | null;
	vehicleCount: number;
}

export interface FleetVehicle {
	id: string;
	name: string;
	plate: string | null;
	lastLat: number | null;
	lastLng: number | null;
	lastHeading: number | null;
	lastSpeedKmh: number | null;
	lastPositionAt: Date | null;
	activeTrip: {
		id: string;
		name: string;
		destinationName: string;
		etaAt: Date | null;
	} | null;
}

export interface FleetTrip {
	id: string;
	vehicleId: string;
	vehicleName: string | null;
	name: string;
	destinationName: string;
	routeGeometry: LineString;
	routeDistanceM: number;
	routeDurationS: number;
	status: "active" | "completed" | "cancelled";
	etaAt: Date | null;
	openAlertCount: number;
}

export interface FleetDestination {
	lat: number;
	lng: number;
}

export interface FleetTripInput {
	vehicleId: string;
	name: string;
	destination: FleetDestination;
	destinationName?: string;
}

export interface FleetConnectionInput {
	label: string;
	credentials: GpsCredentialsInput;
}

export interface FleetAlert {
	id: string;
	tripId: string;
	vehicleName: string | null;
	tripName: string | null;
	severity: SeverityProps["severity"];
	title: string;
	message: string;
	distanceAheadM: number;
	etaToHazardAt: Date | null;
	status: "open" | "acknowledged" | "resolved";
	alternativeRoute: {
		geometry: LineString;
		distanceM: number;
		durationS: number;
	} | null;
	incident: {
		geometry: Geometry | null;
		lat: number | null;
		lng: number | null;
	} | null;
}
