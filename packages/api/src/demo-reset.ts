import { createHash, timingSafeEqual } from "node:crypto";
import { DEMO_ACCOUNT_EMAIL } from "@hack-the-andes-project/business/demo-account";
import {
	type PrepareDemoInput,
	prepareDemo,
	wipeDemoFleet,
} from "@hack-the-andes-project/business/demo-seed";

export function verifyDemoResetSecret(
	providedSecret: string | undefined,
	expectedSecret: string | undefined,
) {
	const providedDigest = createHash("sha256")
		.update(providedSecret ?? "")
		.digest();
	const expectedDigest = createHash("sha256")
		.update(expectedSecret ?? "")
		.digest();
	return (
		timingSafeEqual(providedDigest, expectedDigest) &&
		Boolean(providedSecret) &&
		Boolean(expectedSecret)
	);
}

export interface ResetDemoInput
	extends Omit<PrepareDemoInput, "organizationId"> {}

export async function resetDemo(input: ResetDemoInput) {
	const user = await input.db.query.user.findFirst({
		where: { email: DEMO_ACCOUNT_EMAIL },
	});
	if (!user) return null;
	const membership = await input.db.query.member.findFirst({
		where: { userId: user.id, organizationId: user.id },
	});
	if (!membership) return null;
	await wipeDemoFleet(input.db, membership.organizationId);
	return prepareDemo({ ...input, organizationId: membership.organizationId });
}
