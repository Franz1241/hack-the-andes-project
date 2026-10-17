import { defineRelationsPart } from "drizzle-orm";
import {
	bigint,
	boolean,
	index,
	int,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/mysql-core";

import { mysqlTable } from "./_table";

// No FOREIGN KEY constraints: the database is shared with other projects, so
// relationships live in drizzle relations only and join columns get indexes.
export const user = mysqlTable("user", {
	id: varchar("id", { length: 36 }).primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3 })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = mysqlTable(
	"session",
	{
		id: varchar("id", { length: 36 }).primaryKey(),
		expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
		token: varchar("token", { length: 255 }).notNull().unique(),
		createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 3 })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: varchar("user_id", { length: 36 }).notNull(),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = mysqlTable(
	"account",
	{
		id: varchar("id", { length: 36 }).primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: varchar("user_id", { length: 36 }).notNull(),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 3 })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = mysqlTable(
	"verification",
	{
		id: varchar("id", { length: 36 }).primaryKey(),
		identifier: varchar("identifier", { length: 255 }).notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
		createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { fsp: 3 })
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

// better-auth rate limiter rows (`rateLimit.storage: "database"`): Workers keep
// no memory between isolates. `lastRequest` is an epoch-millisecond number, as
// the library stores it.
export const rateLimit = mysqlTable("rate_limit", {
	id: varchar("id", { length: 36 }).primaryKey(),
	key: varchar("key", { length: 255 }).notNull().unique(),
	count: int("count").notNull(),
	lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const authRelations = defineRelationsPart(
	{ user, session, account, verification },
	(r) => ({
		user: {
			sessions: r.many.session({
				from: r.user.id,
				to: r.session.userId,
			}),
			accounts: r.many.account({
				from: r.user.id,
				to: r.account.userId,
			}),
		},
		session: {
			user: r.one.user({
				from: r.session.userId,
				to: r.user.id,
			}),
		},
		account: {
			user: r.one.user({
				from: r.account.userId,
				to: r.user.id,
			}),
		},
	}),
);
