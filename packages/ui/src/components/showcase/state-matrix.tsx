import { cn } from "cn";
import type { ReactNode } from "react";

const DEFAULT_STATES = ["default", "hover", "focus", "active", "disabled"];
const STATE_LABELS: Record<string, string> = {
	default: "Reposo",
	hover: "Hover",
	focus: "Foco",
	active: "Pulsado",
	disabled: "Deshabilitado",
	invalid: "Inválido",
};

interface StateMatrixProps<Row extends string> {
	rows: readonly Row[];
	states?: readonly string[];
	render: (row: Row, state: string) => ReactNode;
	className?: string;
}

export function StateMatrix<Row extends string>({
	rows,
	states = DEFAULT_STATES,
	render,
	className,
}: StateMatrixProps<Row>) {
	return (
		<div className={cn("w-full min-w-0 overflow-x-auto", className)}>
			<table className="w-full border-separate border-spacing-x-2 border-spacing-y-3">
				<thead>
					<tr>
						<th scope="col">
							<span className="sr-only">Variante</span>
						</th>
						{states.map((state) => (
							<th
								key={state}
								scope="col"
								className="type-label text-left text-muted-foreground"
							>
								{STATE_LABELS[state] ?? state}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row}>
							<th
								scope="row"
								className="type-label pr-4 text-left text-muted-foreground"
							>
								{row}
							</th>
							{states.map((state) => (
								<td key={state}>{render(row, state)}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function previewState(state: string) {
	if (state === "disabled") return { disabled: true };
	if (["hover", "focus", "active"].includes(state))
		return { "data-preview": state };
	return {};
}
