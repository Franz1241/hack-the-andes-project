import { Button } from "@hack-the-andes-project/ui/components/button";
import { Moon, Sun } from "@hack-the-andes-project/ui/components/icons";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@hack-the-andes-project/ui/components/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@hack-the-andes-project/ui/components/tooltip";
import { LanguageToggle } from "@/components/language-toggle";
import { useTheme } from "@/components/theme-provider";
import { ThemeSwitchControl } from "@/components/theme-switch-control";
import { m } from "@/paraglide/messages";
import { getLocale, locales, setLocale } from "@/paraglide/runtime";

interface SidebarPreferencesProps {
	collapsed: boolean;
}

export function SidebarPreferences({ collapsed }: SidebarPreferencesProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const themeAction = isDark ? m.theme_enable_light() : m.theme_enable_dark();

	if (collapsed) {
		return (
			<div className="flex flex-col items-center gap-2">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								aria-label={themeAction}
								onClick={() => setTheme(isDark ? "light" : "dark")}
							/>
						}
					>
						{isDark ? <Sun /> : <Moon />}
					</TooltipTrigger>
					<TooltipContent side="right">{themeAction}</TooltipContent>
				</Tooltip>
				<LanguageToggle withTooltip />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 px-2">
			<ThemeSwitchControl showLabel className="justify-between" />
			<div className="flex items-center justify-between gap-2">
				<span className="font-medium text-sm">{m.language_label()}</span>
				<ToggleGroup
					variant="outline"
					size="sm"
					spacing={0}
					aria-label={m.language_label()}
					value={[getLocale()]}
					onValueChange={(selectedLocales) => {
						const selectedLocale = locales.find((locale) =>
							selectedLocales.includes(locale),
						);
						if (selectedLocale && selectedLocale !== getLocale())
							setLocale(selectedLocale);
					}}
				>
					{locales.map((locale) => (
						<ToggleGroupItem
							key={locale}
							value={locale}
							lang={locale}
							aria-label={new Intl.DisplayNames([locale], {
								type: "language",
							}).of(locale)}
						>
							{locale.toUpperCase()}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>
		</div>
	);
}
