"use client";

import { useEffect, useState } from "react";
import type { Job } from "./types";

export function useJob(jobId: string | null) {
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/v1/content/jobs/${jobId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as Job;
        if (!cancelled) setJob(data);
        if (data.status === "succeeded" || data.status === "failed") {
          return; // stop
        }
        if (!cancelled) setTimeout(poll, 600);
      } catch {
        if (!cancelled) setTimeout(poll, 1500);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  return job;
}
