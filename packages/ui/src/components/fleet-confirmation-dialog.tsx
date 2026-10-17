import { Alert, AlertDescription, AlertTitle } from "./alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./alert-dialog";

export interface FleetConfirmationDialogProps {
	open: boolean;
	title: string;
	description: string;
	actionLabel: string;
	isPending: boolean;
	error: Error | null;
	onConfirm: () => void;
	onClose: () => void;
}

export function FleetConfirmationDialog({
	open,
	title,
	description,
	actionLabel,
	isPending,
	error,
	onConfirm,
	onClose,
}: FleetConfirmationDialogProps) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen && !isPending) onClose();
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				{error && (
					<Alert variant="destructive">
						<AlertTitle>No se pudo guardar el cambio</AlertTitle>
						<AlertDescription>{error.message}</AlertDescription>
					</Alert>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Volver</AlertDialogCancel>
					<AlertDialogAction disabled={isPending} onClick={onConfirm}>
						{isPending ? "Guardando…" : actionLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
