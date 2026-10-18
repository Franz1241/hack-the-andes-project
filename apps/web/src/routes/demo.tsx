import {
	DEMO_SIGN_IN_AUTH_PATH,
	isDemoAccountEmail,
} from "@hack-the-andes-project/business/demo-account";
import {
	Alert,
	AlertDescription,
} from "@hack-the-andes-project/ui/components/alert";
import { AuthShell } from "@hack-the-andes-project/ui/components/auth-shell";
import { Button } from "@hack-the-andes-project/ui/components/button";
import { Spinner } from "@hack-the-andes-project/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { DEMO_START_ROUTE, TOO_MANY_REQUESTS_STATUS } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/demo")({
	head: () => ({ meta: [{ title: m.demo_page_title() }] }),
	component: DemoRoute,
});

function DemoRoute() {
	const { orpc, queryClient } = Route.useRouteContext();
	const navigate = useNavigate();
	const router = useRouter();
	const hasStartedSignIn = useRef(false);
	const {
		mutate: enterDemo,
		error,
		isError,
	} = useMutation({
		retry: false,
		mutationFn: async () => {
			const { error: signInError } = await authClient.$fetch(
				DEMO_SIGN_IN_AUTH_PATH,
				{ method: "POST", body: {}, credentials: "include" },
			);
			if (signInError) throw signInError;

			await queryClient.cancelQueries();
			queryClient.removeQueries();
			await orpc.demo.prepare.call().catch(() => undefined);

			const session = await authClient.getSession({
				query: { disableCookieCache: true },
			});
			if (session.error) throw session.error;
			if (!isDemoAccountEmail(session.data?.user.email)) {
				throw new Error(m.demo_sign_in_error());
			}
			authClient.$store.notify("$sessionSignal");
			await router.invalidate();
			await navigate({ to: DEMO_START_ROUTE, replace: true });
		},
	});

	useEffect(() => {
		if (hasStartedSignIn.current) return;
		hasStartedSignIn.current = true;
		enterDemo();
	}, [enterDemo]);

	const isRateLimited =
		error && "status" in error && error.status === TOO_MANY_REQUESTS_STATUS;

	return (
		<AuthShell>
			<div className="flex flex-col gap-6">
				{isError ? (
					<>
						<h2 className="type-title">{m.demo_error_title()}</h2>
						<Alert>
							<AlertDescription>
								{isRateLimited ? m.demo_rate_limited() : m.demo_sign_in_error()}
							</AlertDescription>
						</Alert>
						<Button className="min-h-11" onClick={() => enterDemo()}>
							{m.demo_retry()}
						</Button>
						<Button
							className="min-h-11"
							variant="link"
							nativeButton={false}
							render={<Link to="/login" />}
						>
							{m.account_sign_in()}
						</Button>
					</>
				) : (
					<div role="status" className="flex items-center gap-3">
						<Spinner aria-hidden="true" />
						<h2 className="type-heading">{m.demo_preparing()}</h2>
					</div>
				)}
			</div>
		</AuthShell>
	);
}
