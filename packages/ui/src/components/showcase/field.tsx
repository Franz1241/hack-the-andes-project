import { cn } from "cn";
import type { HTMLAttributes } from "react";

interface FieldProps extends HTMLAttributes<HTMLDivElement> {
	orientation?: "vertical" | "horizontal";
}

export function FieldGroup({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			data-slot="field-group"
			className={cn("flex min-w-0 flex-col gap-6", className)}
			{...props}
		/>
	);
}

export function Field({
	orientation = "vertical",
	className,
	...props
}: FieldProps) {
	return (
		<div
			data-slot="field"
			data-orientation={orientation}
			className={cn(
				"flex min-w-0 gap-2 data-[orientation=vertical]:flex-col data-[orientation=horizontal]:items-center data-disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}
