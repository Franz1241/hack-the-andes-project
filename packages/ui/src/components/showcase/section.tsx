import { cn } from "cn";
import type { ReactNode } from "react";

interface ShowcaseSectionProps {
	id: string;
	number: string;
	title: string;
	description: string;
	children: ReactNode;
	className?: string;
}

export function ShowcaseSection({
	id,
	number,
	title,
	description,
	children,
	className,
}: ShowcaseSectionProps) {
	return (
		<section
			id={id}
			aria-labelledby={`${id}-title`}
			className={cn("min-w-0 scroll-mt-8 py-16 md:py-24", className)}
		>
			<header className="mb-10 flex max-w-3xl flex-col gap-4">
				<p className="type-label text-muted-foreground">
					{number} / Sistema Fénix
				</p>
				<h2 id={`${id}-title`} className="type-title">
					{title}
				</h2>
				<p className="type-body text-muted-foreground">{description}</p>
			</header>
			{children}
		</section>
	);
}
