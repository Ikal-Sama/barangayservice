import "server-only";

import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import { and, eq, gt, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import {
  announcements,
  emergencyContacts,
  puroks,
  wasteSchedules,
} from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

function dayRange(dateKey: string) {
  const start = new Date(`${dateKey}T00:00:00`);
  const end = new Date(`${dateKey}T23:59:59.999`);
  return { start, end };
}

export async function getAllPuroksCached() {
  "use cache";
  cacheTag(CACHE_TAGS.puroks);
  cacheLife("minutes");

  return db.query.puroks.findMany({
    orderBy: (p, { asc }) => [asc(p.name)],
  });
}

export async function getActivePuroksCached() {
  "use cache";
  cacheTag(CACHE_TAGS.puroks);
  cacheLife("minutes");

  return db.query.puroks.findMany({
    where: (p, { eq: eqFn }) => eqFn(p.isActive, true),
    orderBy: (p, { asc }) => [asc(p.name)],
  });
}

export async function getAllEmergencyContactsCached() {
  "use cache";
  cacheTag(CACHE_TAGS.emergencyContacts);
  cacheLife("minutes");

  return db.query.emergencyContacts.findMany({
    orderBy: (ec, { asc }) => [asc(ec.sortOrder), asc(ec.name)],
  });
}

export async function getActiveEmergencyContactsCached() {
  "use cache";
  cacheTag(CACHE_TAGS.emergencyContacts);
  cacheLife("minutes");

  return db.query.emergencyContacts.findMany({
    where: eq(emergencyContacts.isActive, true),
    orderBy: (ec, { asc }) => [asc(ec.sortOrder), asc(ec.name)],
  });
}

export async function getTodaySchedulesCached(dateKey: string) {
  "use cache";
  cacheTag(CACHE_TAGS.wasteSchedules);
  cacheLife("minutes");

  const { start, end } = dayRange(dateKey);

  return db.query.wasteSchedules.findMany({
    where: and(
      gte(wasteSchedules.scheduledDate, start),
      lte(wasteSchedules.scheduledDate, end)
    ),
    with: { purok: true },
    orderBy: (ws, { asc }) => [asc(ws.scheduledDate)],
  });
}

export async function getResidentScheduleCached(
  purokId: string,
  dateKey: string
) {
  "use cache";
  cacheTag(CACHE_TAGS.wasteSchedules);
  cacheLife("minutes");

  const { start, end } = dayRange(dateKey);

  return db.query.wasteSchedules.findFirst({
    where: and(
      eq(wasteSchedules.purokId, purokId),
      gte(wasteSchedules.scheduledDate, start),
      lte(wasteSchedules.scheduledDate, end)
    ),
    with: { purok: true },
    orderBy: (ws, { desc }) => [desc(ws.scheduledDate)],
  });
}

export async function getAnnouncementsForPurokCached(purokId: string) {
  "use cache";
  cacheTag(CACHE_TAGS.announcements);
  cacheLife("minutes");

  const now = new Date();
  const rows = await db.query.announcements.findMany({
    where: and(
      eq(announcements.isActive, true),
      or(isNull(announcements.expiresAt), gt(announcements.expiresAt, now))
    ),
    with: { announcementPuroks: { with: { purok: true } }, author: true },
    orderBy: (a, { desc }) => [desc(a.createdAt)],
    limit: 20,
  });

  return rows.filter(
    (a) =>
      a.targetAllPuroks ||
      a.announcementPuroks.some((ap) => ap.purokId === purokId)
  );
}
