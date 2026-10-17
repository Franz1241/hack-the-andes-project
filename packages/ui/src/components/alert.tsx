import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";

const alertVariants = cva(
	"group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-xs has-data-[slot=alert-action]:relative has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 has-data-[slot=alert-action]:pr-18 *:[svg:not([class*='size-'])]:size-4 *:[svg]:row-span-2 *:[svg]:translate-y-0",
	{
		variants: {
			variant: {
				default: "bg-card text-card-foreground",
				destructive:
					"border-l-2 border-l-destructive bg-card text-card-foreground *:[svg]:text-destructive",
				low: "border-l-2 border-l-risk-low bg-card text-card-foreground *:[svg]:text-risk-low",
				moderate:
					"border-l-2 border-l-risk-moderate bg-card text-card-foreground *:[svg]:text-risk-moderate",
				high: "border-l-2 border-l-risk-high bg-card text-card-foreground *:[svg]:text-risk-high",
				critical:
					"border-l-2 border-l-risk-critical bg-card text-card-foreground *:[svg]:text-risk-critical",
				info: "border-l-2 border-l-info bg-card text-card-foreground *:[svg]:text-info",
				success:
					"border-l-2 border-l-success bg-card text-card-foreground *:[svg]:text-success",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Alert({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn(
				"type-heading group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"type-body text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-2",
				className,
			)}
			{...props}
		/>
	);
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-action"
			className={cn(
				"absolute top-[calc(--spacing(1.25))] right-[calc(--spacing(1.25))]",
				className,
			)}
			{...props}
		/>
	);
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
