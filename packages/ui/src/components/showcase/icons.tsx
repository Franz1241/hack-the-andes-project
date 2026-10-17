export {
	ArrowDownIcon,
	ArrowRightIcon,
	BellIcon,
	FileTextIcon,
	MapPinIcon,
	SearchIcon,
	TriangleAlertIcon,
} from "lucide-react";

import { cn } from "cn";
import { LoaderCircleIcon } from "lucide-react";
import type { ComponentProps } from "react";

export function Spinner({
	className,
	...props
}: ComponentProps<typeof LoaderCircleIcon>) {
	return (
		<LoaderCircleIcon
			aria-hidden="true"
			data-slot="spinner"
			className={cn("animate-spin motion-reduce:animate-none", className)}
			{...props}
		/>
	);
}
