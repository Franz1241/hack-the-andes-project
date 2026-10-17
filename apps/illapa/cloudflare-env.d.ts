/// <reference types="@cloudflare/workers-types" />
import type { IllapaEnv } from "@hack-the-andes-project/infra/alchemy.run";

// This file infers types for the cloudflare:workers environment from your Alchemy Worker.
// @see https://alchemy.run/cloudflare/compute/workers

export interface CloudflareEnv extends IllapaEnv {}

declare global {
	interface Env extends CloudflareEnv {}
}

declare module "cloudflare:workers" {
	namespace Cloudflare {
		export interface Env extends CloudflareEnv {}
	}
}
