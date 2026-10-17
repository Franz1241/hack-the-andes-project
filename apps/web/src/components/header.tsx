import { Link } from "@tanstack/react-router";

import { m } from "@/paraglide/messages";

import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const links = [
		{ to: "/", label: m.nav_home() },
		{ to: "/dashboard", label: m.nav_dashboard() },
		{ to: "/design-system", label: m.nav_design_system() },
	] as const;

	return (
		<div>
			<div className="flex flex-wrap items-center justify-between gap-3 px-2 py-2">
				<nav className="flex flex-wrap gap-4 text-sm">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} to={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<LanguageToggle />
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}
