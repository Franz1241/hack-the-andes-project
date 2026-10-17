import { format } from "date-fns";
import { es } from "date-fns/locale/es";

export interface DateTimeProps {
	value: Date;
	className?: string;
}

export function DateTime({ value, className }: DateTimeProps) {
	return (
		<time dateTime={value.toISOString()} className={className}>
			{format(value, "d MMM yyyy, HH:mm", { locale: es })}
		</time>
	);
}
