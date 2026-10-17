import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { Skeleton } from "./skeleton";

export interface FleetQueryFeedbackProps {
	isPending: boolean;
	isError: boolean;
	onRetry: () => void;
}

export function FleetQueryFeedback({
	isPending,
	isError,
	onRetry,
}: FleetQueryFeedbackProps) {
	if (isError)
		return (
			<Alert variant="destructive">
				<AlertTitle>No se pudieron actualizar los datos</AlertTitle>
				<AlertDescription>
					Verifica tu conexión. Si hay datos anteriores, se muestran a
					continuación.
					<Button variant="link" onClick={onRetry}>
						Reintentar
					</Button>
				</AlertDescription>
			</Alert>
		);
	if (isPending)
		return (
			<output aria-label="Cargando datos" className="flex flex-col gap-3">
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</output>
		);
	return null;
}
