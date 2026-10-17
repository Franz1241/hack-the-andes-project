import {
	ROUTE_SEGMENTS,
	ROUTE_STROKE_WIDTH_PX,
	ROUTE_VIEW_BOX,
} from "./constants";

export function RouteDiagram() {
	return (
		<svg
			viewBox={ROUTE_VIEW_BOX}
			className="w-full"
			role="img"
			aria-label="Tramos de una ruta: bajo, moderado, alto y crítico, de izquierda a derecha"
		>
			<title>Riesgo por tramo de ruta</title>
			{ROUTE_SEGMENTS.map((segment) => (
				<polyline
					key={segment.className}
					points={segment.points}
					className={segment.className}
					fill="none"
					strokeWidth={ROUTE_STROKE_WIDTH_PX}
				/>
			))}
		</svg>
	);
}
