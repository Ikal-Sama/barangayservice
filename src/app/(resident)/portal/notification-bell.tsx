"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Bell } from "lucide-react";
import {
  getAnnouncementsForPurok,
  markAnnouncementsAsRead,
} from "@/lib/actions/announcements";

export function NotificationBell({
  initialAnnouncements,
  initialReadIds,
  purokId,
}: {
  initialAnnouncements: { id: string; createdAt: Date | string }[];
  initialReadIds: string[];
  purokId?: string | null;
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [readIds, setReadIds] = useState<string[]>(initialReadIds);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousUnreadCount = useRef(
    initialAnnouncements.filter((a) => !initialReadIds.includes(a.id)).length
  );

  useEffect(() => {
    const unread = announcements.filter((a) => !readIds.includes(a.id));
    setUnreadCount(unread.length);

    if (unread.length > previousUnreadCount.current) {
      playNotificationSound();
    }
    previousUnreadCount.current = unread.length;
  }, [announcements, readIds]);

  useEffect(() => {
    if (!purokId) return;

    const interval = setInterval(async () => {
      try {
        const latest = await getAnnouncementsForPurok(purokId);
        setAnnouncements(latest);
      } catch (error) {
        console.error("Failed to fetch announcements", error);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [purokId]);

  const playNotificationSound = () => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const handleMarkAsRead = useCallback(async () => {
    const unreadIds = announcements
      .filter((a) => !readIds.includes(a.id))
      .map((a) => a.id);

    if (unreadIds.length === 0) {
      document
        .getElementById("community-announcements")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const previousReadIds = readIds;
    const newReadIds = Array.from(new Set([...previousReadIds, ...unreadIds]));
    setReadIds(newReadIds);

    const result = await markAnnouncementsAsRead(unreadIds);
    if (!result.success) {
      setReadIds(previousReadIds);
      console.error(result.error);
      return;
    }

    document
      .getElementById("community-announcements")
      ?.scrollIntoView({ behavior: "smooth" });
  }, [announcements, readIds]);

  return (
    <button
      onClick={handleMarkAsRead}
      className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm transition hover:text-slate-950"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 grid min-w-[20px] h-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
