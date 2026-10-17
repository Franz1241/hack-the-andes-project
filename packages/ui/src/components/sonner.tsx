"use client";

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

interface ToastThemeStyle extends CSSProperties {
	[property: `--${string}`]: string;
}

const toastThemeStyle: ToastThemeStyle = {
	fontFamily: "var(--font-mono)",
	"--normal-bg": "var(--popover)",
	"--normal-text": "var(--popover-foreground)",
	"--normal-border": "var(--border)",
	"--normal-bg-hover": "var(--accent)",
	"--normal-border-hover": "var(--border)",
	"--success-bg": "var(--success)",
	"--success-text": "var(--success-foreground)",
	"--success-border": "var(--success)",
	"--info-bg": "var(--info)",
	"--info-text": "var(--info-foreground)",
	"--info-border": "var(--info)",
	"--warning-bg": "var(--risk-moderate)",
	"--warning-text": "var(--risk-moderate-foreground)",
	"--warning-border": "var(--risk-moderate)",
	"--error-bg": "var(--risk-critical)",
	"--error-text": "var(--risk-critical-foreground)",
	"--error-border": "var(--risk-critical)",
	"--border-radius": "0",
};

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme === "light" || theme === "dark" ? theme : "system"}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={toastThemeStyle}
			toastOptions={{
				classNames: {
					toast:
						"cn-toast shadow-none! focus-visible:outline-1! focus-visible:outline-ring!",
					title: "type-label!",
					description: "type-body! text-current!",
					actionButton:
						"rounded-none! font-mono! shadow-none! focus-visible:outline-1! focus-visible:outline-ring!",
					cancelButton:
						"rounded-none! bg-secondary! font-mono! text-secondary-foreground! shadow-none! focus-visible:outline-1! focus-visible:outline-ring!",
					closeButton:
						"rounded-none! border-border! bg-popover! text-popover-foreground! shadow-none! hover:bg-accent! focus-visible:outline-1! focus-visible:outline-ring!",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
