import { and, eq, gt, lte, or } from "drizzle-orm";

import { UserSession } from "../../../domain/entities";
import { SessionRepository } from "../../../domain/repositories";
import { getDb } from "../../db";
import { session } from "../../db/schema";

export class SessionRepositoryD1 implements SessionRepository {
  private activeAndValid = (now: Date) =>
    and(eq(session.isActive, true), gt(session.expiresAt, now));

  public create = async (
    data: Omit<UserSession, "id" | "createdAt" | "lastAccessAt">,
  ): Promise<UserSession> => {
    const now = new Date();
    const newSession: UserSession = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      lastAccessAt: now,
    };
    await getDb().insert(session).values(newSession);
    return newSession;
  };

  public findByToken = async (token: string): Promise<UserSession | null> => {
    const row = await getDb().query.session.findFirst({
      where: and(eq(session.token, token), this.activeAndValid(new Date())),
    });
    return row ?? null;
  };

  public findByRefreshToken = async (
    refreshToken: string,
  ): Promise<UserSession | null> => {
    const row = await getDb().query.session.findFirst({
      where: and(
        eq(session.refreshToken, refreshToken),
        this.activeAndValid(new Date()),
      ),
    });
    return row ?? null;
  };

  public findBySessionId = async (
    sessionId: string,
  ): Promise<UserSession | null> => {
    const row = await getDb().query.session.findFirst({
      where: and(eq(session.id, sessionId), this.activeAndValid(new Date())),
    });
    return row ?? null;
  };

  public findActiveByUserId = async (
    userId: string,
  ): Promise<UserSession | null> => {
    const row = await getDb().query.session.findFirst({
      where: and(eq(session.userId, userId), this.activeAndValid(new Date())),
    });
    return row ?? null;
  };

  public updateLastAccess = async (sessionId: string): Promise<void> => {
    await getDb()
      .update(session)
      .set({ lastAccessAt: new Date() })
      .where(eq(session.id, sessionId));
  };

  public updateToken = async (
    sessionId: string,
    newToken: string,
  ): Promise<void> => {
    await getDb()
      .update(session)
      .set({ token: newToken, lastAccessAt: new Date() })
      .where(eq(session.id, sessionId));
  };

  public updateRefreshToken = async (
    sessionId: string,
    newRefreshToken: string,
  ): Promise<void> => {
    await getDb()
      .update(session)
      .set({ refreshToken: newRefreshToken, lastAccessAt: new Date() })
      .where(eq(session.id, sessionId));
  };

  public deactivateSession = async (sessionId: string): Promise<void> => {
    await getDb()
      .update(session)
      .set({ isActive: false })
      .where(eq(session.id, sessionId));
  };

  public deactivateAllUserSessions = async (
    userId: string,
  ): Promise<void> => {
    await getDb()
      .update(session)
      .set({ isActive: false })
      .where(eq(session.userId, userId));
  };

  public deleteExpiredSessions = async (): Promise<void> => {
    const now = new Date();
    await getDb()
      .delete(session)
      .where(or(lte(session.expiresAt, now), eq(session.isActive, false)));
  };
}
