import { type ComponentProps, useState } from "react";

import { EyeIcon, EyeOffIcon } from "./icons";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "./input-group";

export interface PasswordInputProps
	extends Omit<ComponentProps<typeof InputGroupInput>, "type"> {
	groupClassName?: string;
}

export function PasswordInput({
	groupClassName,
	...props
}: PasswordInputProps) {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<InputGroup className={groupClassName}>
			<InputGroupInput type={isVisible ? "text" : "password"} {...props} />
			<InputGroupAddon align="inline-end">
				<InputGroupButton
					size="icon-xs"
					aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
					aria-pressed={isVisible}
					onClick={() => setIsVisible((wasVisible) => !wasVisible)}
				>
					{isVisible ? <EyeOffIcon /> : <EyeIcon />}
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	);
}
