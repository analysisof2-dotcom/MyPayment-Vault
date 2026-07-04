import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, usersTable, activityEventsTable } from "@workspace/db";
import {
  GetMeResponse,
  UpdateMeBody,
  UpdateMeResponse,
  GetMyStatsResponse,
  GetActivityResponse,
} from "@workspace/api-zod";
import { resolveCurrentUser, UnauthorizedError } from "../../lib/currentUser";

const router: IRouter = Router();

router.get("/me", async (req, res): Promise<void> => {
  try {
    const user = await resolveCurrentUser(req);
    res.json(GetMeResponse.parse(user));
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    throw err;
  }
});

router.patch("/me", async (req, res): Promise<void> => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const user = await resolveCurrentUser(req);

    if (parsed.data.displayName === undefined) {
      res.json(UpdateMeResponse.parse(user));
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({ displayName: parsed.data.displayName })
      .where(eq(usersTable.id, user.id))
      .returning();

    await db.insert(activityEventsTable).values({
      userId: user.id,
      type: "profile_updated",
      description: "Updated your display name.",
    });

    res.json(UpdateMeResponse.parse(updated));
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    throw err;
  }
});

router.get("/me/stats", async (req, res): Promise<void> => {
  try {
    const user = await resolveCurrentUser(req);

    const events = await db
      .select()
      .from(activityEventsTable)
      .where(eq(activityEventsTable.userId, user.id));

    res.json(
      GetMyStatsResponse.parse({
        memberSince: user.createdAt,
        lastSeenAt: user.lastSeenAt,
        signInCount: user.signInCount,
        activityCount: events.length,
      }),
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    throw err;
  }
});

router.get("/activity", async (req, res): Promise<void> => {
  try {
    const user = await resolveCurrentUser(req);

    const events = await db
      .select()
      .from(activityEventsTable)
      .where(eq(activityEventsTable.userId, user.id))
      .orderBy(desc(activityEventsTable.createdAt))
      .limit(50);

    res.json(GetActivityResponse.parse(events));
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    throw err;
  }
});

export default router;
