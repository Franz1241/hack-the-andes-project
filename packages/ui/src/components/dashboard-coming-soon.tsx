import type { ComponentType } from "react";

import { Badge } from "./badge";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./empty";

export interface DashboardComingSoonProps {
	title: string;
	description: string;
	icon: ComponentType;
}

export function DashboardComingSoon({
	title,
	description,
	icon: Icon,
}: DashboardComingSoonProps) {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon />
				</EmptyMedia>
				<Badge variant="secondary">Próximamente</Badge>
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
