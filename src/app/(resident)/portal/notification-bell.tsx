"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAnnouncementsForPurok } from "@/lib/actions/announcements";
export function NotificationBell({
  initialAnnouncements,
  purokId,
}: {
  initialAnnouncements: { id: string; createdAt: Date | string }[];
  purokId?: string | null;
}) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize read IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("readAnnouncements");
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Update unread count when announcements or readIds change
  useEffect(() => {
    const unread = announcements.filter((a) => !readIds.includes(a.id));
    setUnreadCount(unread.length);
  }, [announcements, readIds]);

  // Play sound when new announcements arrive on initial load if unread > 0, 
  // but to avoid playing every reload, we only play if the most recent announcement
  // is newer than what we have in localStorage's latest seen.
  useEffect(() => {
    try {
      const unread = announcements.filter((a) => !readIds.includes(a.id));
      if (unread.length > 0) {
        const lastSeenStr = localStorage.getItem("lastSeenAnnouncementTime");
        const lastSeenTime = lastSeenStr ? new Date(lastSeenStr).getTime() : 0;
        
        // Find the newest announcement time among unread
        let newestTime = 0;
        unread.forEach(a => {
          const t = new Date(a.createdAt).getTime();
          if (t > newestTime) newestTime = t;
        });

        if (newestTime > lastSeenTime) {
          playNotificationSound();
          router.refresh();
          localStorage.setItem("lastSeenAnnouncementTime", new Date(newestTime).toISOString());
        }
      }
    } catch(e) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcements, readIds, router]);

  // Polling for new announcements
  useEffect(() => {
    if (!purokId) return;

    const interval = setInterval(async () => {
      try {
        const latest = await getAnnouncementsForPurok(purokId);
        setAnnouncements(latest as any);
      } catch (error) {
        console.error("Failed to fetch announcements", error);
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, [purokId]);

  const playNotificationSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5

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

  const handleMarkAsRead = useCallback(() => {
    const newReadIds = Array.from(new Set([...readIds, ...announcements.map((a) => a.id)]));
    setReadIds(newReadIds);
    try {
      localStorage.setItem("readAnnouncements", JSON.stringify(newReadIds));
    } catch (e) {}

    // Scroll to announcements section
    document.getElementById("community-announcements")?.scrollIntoView({ behavior: "smooth" });
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
