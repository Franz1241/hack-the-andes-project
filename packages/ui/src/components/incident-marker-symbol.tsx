import type { Incident } from "../lib/incident";
import { INCIDENT_SEVERITY_FILL_CLASSES } from "../lib/incident-constants";
import { cn } from "../lib/utils";
import { INCIDENT_CATEGORY_ICONS } from "./incident-icons";

export interface IncidentMarkerSymbolProps {
	category: Incident["category"];
	severity: Incident["severity"];
	className?: string;
}

export function IncidentMarkerSymbol({
	category,
	severity,
	className,
}: IncidentMarkerSymbolProps) {
	const CategoryIcon = INCIDENT_CATEGORY_ICONS[category];
	return (
		<span
			aria-hidden="true"
			className={cn(
				"flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-background",
				INCIDENT_SEVERITY_FILL_CLASSES[severity],
				className,
			)}
		>
			<CategoryIcon className="size-4" />
		</span>
	);
}
