export const CONTOUR_DEFAULT_SEED = 17;
export const CONTOUR_WIDTH_PX = 1600;
export const CONTOUR_HEIGHT_PX = 900;
export const CONTOUR_STROKE_WIDTH_PX = 1;
export const CONTOUR_NOISE_GRID_SIZE = 64;
export const CONTOUR_RANDOM_MULTIPLIER = 1664525;
export const CONTOUR_RANDOM_INCREMENT = 1013904223;
export const CONTOUR_RANDOM_RANGE = 4294967296;
export const CONTOUR_SMOOTHSTEP_LINEAR = 3;
export const CONTOUR_SMOOTHSTEP_QUADRATIC = 2;
export const CONTOUR_NOISE_CENTER = 0.5;

export const TOPO_CELL_SIZE_PX = 16;
export const TOPO_LEVEL_COUNT = 14;
export const TOPO_LEVEL_MARGIN = 0.06;
export const TOPO_NOISE_SCALE_PX = 250;
export const TOPO_DETAIL_SCALE_PX = 100;
export const TOPO_DETAIL_WEIGHT = 0.28;
export const TOPO_WARP_SCALE_PX = 400;
export const TOPO_WARP_AMOUNT_PX = 160;
export const TOPO_WARP_OFFSET = 23;
export const TOPO_EDGE_ORIENTATION_COUNT = 2;
export const TOPO_SADDLE_EDGE_COUNT = 4;
export const TOPO_SEGMENT_ENDPOINT_COUNT = 2;
export const TOPO_CELL_EDGES = [
	{ startColumn: 0, startRow: 0, endColumn: 1, endRow: 0, orientation: 0 },
	{ startColumn: 1, startRow: 0, endColumn: 1, endRow: 1, orientation: 1 },
	{ startColumn: 0, startRow: 1, endColumn: 1, endRow: 1, orientation: 0 },
	{ startColumn: 0, startRow: 0, endColumn: 0, endRow: 1, orientation: 1 },
];

export const RIDGELINE_COUNT = 64;
export const RIDGELINE_SAMPLE_STEP_PX = 10;
export const RIDGELINE_BACK_BASELINE_PX = 580;
export const RIDGELINE_FRONT_BASELINE_PX = 860;
export const RIDGELINE_PERSPECTIVE_POWER = 1.2;
export const RIDGELINE_PEAK_HEIGHT_PX = 175;
export const RIDGELINE_PEAK_DRIFT = 0.025;
export const RIDGELINE_PEAK_DRIFT_SCALE = 3;
export const RIDGELINE_GAUSSIAN_POWER = 2;
export const RIDGELINE_NOISE_SCALE = 13;
export const RIDGELINE_DEPTH_SCALE = 2;
export const RIDGELINE_DETAIL_SCALE = 39;
export const RIDGELINE_DETAIL_DEPTH_SCALE = 4;
export const RIDGELINE_HEIGHT_FLOOR = 0.55;
export const RIDGELINE_NOISE_WEIGHT = 0.7;
export const RIDGELINE_DETAIL_WEIGHT = 0.18;
export const RIDGELINE_EDGE_TAPER_POWER = 2;
export const RIDGELINE_CLOSURE_MARGIN_PX = 20;
export const RIDGELINE_PEAKS = [
	{
		center: 0.385,
		width: 0.073,
		depthCenter: 0.27,
		depthWidth: 0.17,
		height: 0.66,
	},
	{
		center: 0.495,
		width: 0.065,
		depthCenter: 0.38,
		depthWidth: 0.21,
		height: 1,
	},
	{
		center: 0.605,
		width: 0.082,
		depthCenter: 0.51,
		depthWidth: 0.19,
		height: 0.78,
	},
];
export const RIDGELINE_GRADIENT_STOPS = [
	{ offset: "0%", color: "var(--brand-ember)" },
	{ offset: "50%", color: "var(--brand-flame)" },
	{ offset: "100%", color: "var(--brand-gold)" },
];
