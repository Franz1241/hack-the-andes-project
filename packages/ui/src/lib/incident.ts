import type { Geometry } from "geojson";

import type {
	INCIDENT_CATEGORY_LABELS,
	INCIDENT_SEVERITY_LABELS,
} from "./incident-constants";

export interface Incident {
	id: string;
	title: string;
	category: keyof typeof INCIDENT_CATEGORY_LABELS;
	severity: keyof typeof INCIDENT_SEVERITY_LABELS;
	lat: number | null;
	lng: number | null;
	geometry: Geometry | null;
	description: string | null;
	imageUrl: string | null;
	roadCode: string | null;
	roadName: string | null;
	roadKm: string | null;
	roadStatus: string | null;
	region: string | null;
	provincia: string | null;
	distrito: string | null;
	source: string;
	lastChangedAt: Date;
}

export interface IncidentTimePreset {
	value: string;
	label: string;
}

export interface IncidentSeverityCount {
	severity: Incident["severity"];
	count: number;
}
