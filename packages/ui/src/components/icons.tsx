export {
	ArrowUpIcon,
	BellIcon,
	ChevronRightIcon,
	CircleDashedIcon as SignalForecast,
	CloudLightningIcon,
	DiamondIcon as SignalBaseline,
	ExternalLinkIcon,
	EyeIcon,
	EyeOffIcon,
	MapIcon,
	MapPinIcon,
	Moon,
	NewspaperIcon,
	PlusIcon,
	RouteIcon,
	SettingsIcon,
	Sun,
	TriangleAlertIcon,
	TruckIcon,
} from "lucide-react";
export {
	EarthquakeIcon,
	FireIcon,
	FloodIcon,
	FloodWarningIcon,
	HazmatIcon,
	INCIDENT_CATEGORY_ICONS,
	LandslideIcon,
	MedicalIcon,
	OtherIncidentIcon,
	RainWarningIcon,
	RescueIcon,
	RoadAccidentIcon,
	RoadBlockIcon,
	RoadWorksIcon,
	WeatherIcon,
	WildfireIcon,
} from "./incident-icons";

export function SignalConfirmed({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			className={className}
		>
			<circle cx="12" cy="12" r="8" />
		</svg>
	);
}
