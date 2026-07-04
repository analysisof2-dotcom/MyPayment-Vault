import { type Request } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { and, eq, isNull, ne, or, sql } from "drizzle-orm";
import { db, usersTable, activityEventsTable, type User } from "@workspace/db";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

async function fetchClerkIdentity(
  req: Request,
  userId: string,
): Promise<{ email: string | null; displayName: string | null }> {
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      null;
    const name = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return {
      email,
      displayName: name.length > 0 ? name : (clerkUser.username ?? null),
    };
  } catch (err) {
    req.log.warn({ err }, "Failed to fetch Clerk user details");
    return { email: null, displayName: null };
  }
}

/**
 * Resolves the local user for the authenticated Clerk session, provisioning the
 * user record on first access and recording a sign-in event whenever a new
 * Clerk session is observed. Throws UnauthorizedError when there is no session.
 *
 * The dashboard fires several authenticated requests in parallel, so both
 * provisioning and sign-in tracking are written to be safe under concurrency:
 * inserts use ON CONFLICT DO NOTHING and session transitions use a conditional
 * UPDATE, with RETURNING telling us which request actually performed the change.
 */
export async function resolveCurrentUser(req: Request): Promise<User> {
  const { userId, sessionId } = getAuth(req);
  if (!userId) {
    throw new UnauthorizedError();
  }

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, userId));

  if (!existing) {
    const { email, displayName } = await fetchClerkIdentity(req, userId);

    const inserted = await db
      .insert(usersTable)
      .values({
        clerkUserId: userId,
        email,
        displayName,
        lastSessionId: sessionId ?? null,
        signInCount: 1,
      })
      .onConflictDoNothing({ target: usersTable.clerkUserId })
      .returning();

    if (inserted.length > 0) {
      const created = inserted[0];
      await db.insert(activityEventsTable).values([
        {
          userId: created.id,
          type: "account_created",
          description: "Account created and secured with your credentials.",
        },
        {
          userId: created.id,
          type: "sign_in",
          description: "Signed in to your account.",
        },
      ]);
      return created;
    }

    const [raced] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId));
    return raced;
  }

  if (sessionId != null) {
    const transitioned = await db
      .update(usersTable)
      .set({
        lastSessionId: sessionId,
        signInCount: sql`${usersTable.signInCount} + 1`,
        lastSeenAt: new Date(),
      })
      .where(
        and(
          eq(usersTable.id, existing.id),
          or(
            isNull(usersTable.lastSessionId),
            ne(usersTable.lastSessionId, sessionId),
          ),
        ),
      )
      .returning();

    if (transitioned.length > 0) {
      await db.insert(activityEventsTable).values({
        userId: existing.id,
        type: "sign_in",
        description: "Signed in to your account.",
      });
      return transitioned[0];
    }
  }

  const [updated] = await db
    .update(usersTable)
    .set({ lastSeenAt: new Date() })
    .where(eq(usersTable.id, existing.id))
    .returning();

  return updated;
}
