import { Button } from "@hack-the-andes-project/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@hack-the-andes-project/ui/components/dropdown-menu";

import { m } from "@/paraglide/messages";
import { getLocale, locales, setLocale } from "@/paraglide/runtime";

export function LanguageToggle() {
	const currentLocale = getLocale();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="outline"
						size="icon"
						aria-label={m.language_toggle()}
					/>
				}
			>
				{currentLocale}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{locales.map((locale) => (
					<DropdownMenuItem
						key={locale}
						lang={locale}
						className="capitalize"
						onClick={() => setLocale(locale)}
					>
						{new Intl.DisplayNames([locale], { type: "language" }).of(locale)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
