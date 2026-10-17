import { MIN_PASSWORD_LENGTH_CHARS } from "@hack-the-andes-project/business/constants";
import { useState } from "react";
import { z } from "zod";

import { MIN_NAME_LENGTH_CHARS } from "../constants";
import { Alert, AlertDescription } from "./alert";
import { Button } from "./button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "./field";
import { Input } from "./input";
import { PasswordInput } from "./password-input";

export type AuthMode = "sign-in" | "sign-up";

const signInSchema = z.object({
	name: z.string(),
	email: z.email("Ingresa un correo válido."),
	password: z.string().min(1, "Ingresa tu contraseña."),
});

const signUpSchema = signInSchema.extend({
	name: z
		.string()
		.trim()
		.min(
			MIN_NAME_LENGTH_CHARS,
			`Tu nombre debe tener al menos ${MIN_NAME_LENGTH_CHARS} caracteres.`,
		),
	password: z
		.string()
		.min(
			MIN_PASSWORD_LENGTH_CHARS,
			`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH_CHARS} caracteres.`,
		),
});

export interface AuthFormValues extends z.infer<typeof signInSchema> {}

interface AuthFieldErrors {
	name?: string[];
	email?: string[];
	password?: string[];
}

interface AuthModeCopy {
	title: string;
	description: string;
	submit: string;
	pending: string;
	switchPrompt: string;
	switchAction: string;
}

const AUTH_MODE_COPY: Record<AuthMode, AuthModeCopy> = {
	"sign-in": {
		title: "Inicia sesión",
		description: "Entra al centro de operaciones de tu flota.",
		submit: "Entrar",
		pending: "Entrando…",
		switchPrompt: "¿Aún no tienes cuenta?",
		switchAction: "Crea una",
	},
	"sign-up": {
		title: "Crea tu cuenta",
		description: "Monitorea tu flota y las rutas del Perú desde un solo lugar.",
		submit: "Crear cuenta",
		pending: "Creando cuenta…",
		switchPrompt: "¿Ya tienes cuenta?",
		switchAction: "Inicia sesión",
	},
};

const AUTH_CONTROL_CLASS_NAME = "h-10 text-sm md:text-sm";

export interface AuthFormProps {
	mode: AuthMode;
	onModeChange: (mode: AuthMode) => void;
	onSubmit: (values: AuthFormValues) => Promise<string | undefined>;
}

export function AuthForm({ mode, onModeChange, onSubmit }: AuthFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
	const [submitError, setSubmitError] = useState<string>();
	const copy = AUTH_MODE_COPY[mode];
	const isSignUp = mode === "sign-up";

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<h2 className="font-heading text-3xl tracking-tight">{copy.title}</h2>
				<p className="text-muted-foreground text-sm">{copy.description}</p>
			</div>
			<form
				noValidate
				className="flex flex-col gap-6"
				onSubmit={async (event) => {
					event.preventDefault();
					const formData = new FormData(event.currentTarget);
					const parsedValues = (
						isSignUp ? signUpSchema : signInSchema
					).safeParse({
						name: String(formData.get("name") ?? ""),
						email: String(formData.get("email") ?? ""),
						password: String(formData.get("password") ?? ""),
					});
					setSubmitError(undefined);
					if (!parsedValues.success) {
						setFieldErrors(z.flattenError(parsedValues.error).fieldErrors);
						return;
					}
					setFieldErrors({});
					setIsSubmitting(true);
					try {
						setSubmitError(await onSubmit(parsedValues.data));
					} finally {
						setIsSubmitting(false);
					}
				}}
			>
				<fieldset disabled={isSubmitting} className="min-w-0">
					<FieldGroup>
						{isSignUp && (
							<Field data-invalid={Boolean(fieldErrors.name)}>
								<FieldLabel htmlFor="auth-name">Nombre</FieldLabel>
								<Input
									id="auth-name"
									name="name"
									autoComplete="name"
									placeholder="María Quispe"
									aria-invalid={Boolean(fieldErrors.name)}
									className={AUTH_CONTROL_CLASS_NAME}
								/>
								<FieldError>{fieldErrors.name?.[0]}</FieldError>
							</Field>
						)}
						<Field data-invalid={Boolean(fieldErrors.email)}>
							<FieldLabel htmlFor="auth-email">Correo electrónico</FieldLabel>
							<Input
								id="auth-email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="tu@empresa.com"
								aria-invalid={Boolean(fieldErrors.email)}
								className={AUTH_CONTROL_CLASS_NAME}
							/>
							<FieldError>{fieldErrors.email?.[0]}</FieldError>
						</Field>
						<Field data-invalid={Boolean(fieldErrors.password)}>
							<FieldLabel htmlFor="auth-password">Contraseña</FieldLabel>
							<PasswordInput
								id="auth-password"
								name="password"
								autoComplete={isSignUp ? "new-password" : "current-password"}
								aria-invalid={Boolean(fieldErrors.password)}
								className="text-sm md:text-sm"
								groupClassName="h-10"
							/>
							{fieldErrors.password ? (
								<FieldError>{fieldErrors.password[0]}</FieldError>
							) : (
								isSignUp && (
									<FieldDescription>
										Al menos {MIN_PASSWORD_LENGTH_CHARS} caracteres.
									</FieldDescription>
								)
							)}
						</Field>
					</FieldGroup>
				</fieldset>
				{submitError && (
					<Alert variant="destructive">
						<AlertDescription>{submitError}</AlertDescription>
					</Alert>
				)}
				<Button
					type="submit"
					size="lg"
					className="h-10 w-full text-sm"
					disabled={isSubmitting}
				>
					{isSubmitting ? copy.pending : copy.submit}
				</Button>
			</form>
			<p className="text-center text-muted-foreground text-sm">
				{copy.switchPrompt}{" "}
				<Button
					variant="link"
					className="h-auto p-0 text-sm"
					onClick={() => onModeChange(isSignUp ? "sign-in" : "sign-up")}
				>
					{copy.switchAction}
				</Button>
			</p>
		</div>
	);
}
