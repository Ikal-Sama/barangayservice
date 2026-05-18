"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ANNOUNCEMENT_TYPE_META, formatRelative } from "@/lib/utils";
import type { AnnouncementType } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: Date | string;
};

export function AnnouncementsList({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  return (
    <>
      <ol className="space-y-3">
        {announcements.map((announcement) => {
          const typeMeta =
            ANNOUNCEMENT_TYPE_META[announcement.type as AnnouncementType];
          return (
            <li
              key={announcement.id}
              onClick={() => setSelectedAnnouncement(announcement)}
              className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${
                    announcement.type === "emergency"
                      ? "bg-rose-100 text-rose-700"
                      : announcement.type === "events"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-cyan-100 text-cyan-700"
                  }`}
                >
                  {typeMeta?.label || announcement.type}
                </span>
                <time className="text-xs font-bold text-slate-400">
                  {formatRelative(new Date(announcement.createdAt))}
                </time>
              </div>
              <p className="text-base font-black tracking-tight text-slate-950">
                {announcement.title}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {announcement.body}
              </p>
            </li>
          );
        })}
      </ol>

      {/* Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedAnnouncement(null)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white text-left align-middle shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-black tracking-tight text-slate-950">
                Announcement Details
              </h3>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="grid h-10 w-10 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${
                    selectedAnnouncement.type === "emergency"
                      ? "bg-rose-100 text-rose-700"
                      : selectedAnnouncement.type === "events"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-cyan-100 text-cyan-700"
                  }`}
                >
                  {ANNOUNCEMENT_TYPE_META[selectedAnnouncement.type as AnnouncementType]?.label || selectedAnnouncement.type}
                </span>
                <time className="text-sm font-bold text-slate-400">
                  {formatRelative(new Date(selectedAnnouncement.createdAt))}
                </time>
              </div>
              <h4 className="mb-4 text-2xl font-black tracking-tight text-slate-950">
                {selectedAnnouncement.title}
              </h4>
              <div className="prose prose-slate prose-sm max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                  {selectedAnnouncement.body}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 sm:ml-3 sm:w-auto"
                onClick={() => setSelectedAnnouncement(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
