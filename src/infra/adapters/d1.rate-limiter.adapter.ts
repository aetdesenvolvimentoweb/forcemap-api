import { eq } from "drizzle-orm";

import {
  RateLimiterProtocol,
  RateLimiterResult,
} from "../../application/protocols";
import { getDb } from "../db";
import { rateLimit } from "../db/schema";

interface AttemptRecord {
  attempts: number[];
  blockedUntil: Date | null;
}

/**
 * Rate limiter persistido no D1. Mantém a mesma semântica de janela deslizante
 * do adapter in-memory, mas o estado sobrevive entre isolates/requests.
 */
export class D1RateLimiterAdapter implements RateLimiterProtocol {
  private readonly maxBlockDuration = 15 * 60 * 1000; // 15 minutes

  private getRecord = async (key: string): Promise<AttemptRecord> => {
    const row = await getDb().query.rateLimit.findFirst({
      where: eq(rateLimit.key, key),
    });
    return {
      attempts: row?.attempts ?? [],
      blockedUntil: row?.blockedUntil ?? null,
    };
  };

  private saveRecord = async (
    key: string,
    record: AttemptRecord,
  ): Promise<void> => {
    await getDb()
      .insert(rateLimit)
      .values({
        key,
        attempts: record.attempts,
        blockedUntil: record.blockedUntil,
      })
      .onConflictDoUpdate({
        target: rateLimit.key,
        set: { attempts: record.attempts, blockedUntil: record.blockedUntil },
      });
  };

  public checkLimit = async (
    key: string,
    maxAttempts: number,
    windowMs: number,
  ): Promise<RateLimiterResult> => {
    const now = new Date();
    const record = await this.getRecord(key);

    if (record.blockedUntil && record.blockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.blockedUntil,
        totalAttempts: record.attempts.length,
      };
    }

    const windowStart = now.getTime() - windowMs;
    record.attempts = record.attempts.filter(
      (attempt) => attempt > windowStart,
    );

    const currentAttempts = record.attempts.length;
    const remainingAttempts = Math.max(0, maxAttempts - currentAttempts);

    if (currentAttempts >= maxAttempts) {
      record.blockedUntil = new Date(now.getTime() + this.maxBlockDuration);
      await this.saveRecord(key, record);

      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.blockedUntil,
        totalAttempts: currentAttempts,
      };
    }

    return {
      allowed: true,
      remainingAttempts,
      resetTime: new Date(now.getTime() + windowMs),
      totalAttempts: currentAttempts,
    };
  };

  public recordAttempt = async (
    key: string,
    windowMs: number,
  ): Promise<void> => {
    const now = new Date();
    const record = await this.getRecord(key);

    record.attempts.push(now.getTime());

    const windowStart = now.getTime() - windowMs;
    record.attempts = record.attempts.filter(
      (attempt) => attempt > windowStart,
    );

    await this.saveRecord(key, record);
  };

  public reset = async (key: string): Promise<void> => {
    await getDb().delete(rateLimit).where(eq(rateLimit.key, key));
  };

  public isBlocked = async (key: string): Promise<boolean> => {
    const record = await this.getRecord(key);
    if (!record.blockedUntil) {
      return false;
    }
    return record.blockedUntil > new Date();
  };
}
