"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DASHBOARD_PULSE_PATH,
  EMPTY_DASHBOARD_PULSE,
  type DashboardPulse,
} from "@/lib/dashboard/pulse";

const DashboardPulseContext = createContext<DashboardPulse>(EMPTY_DASHBOARD_PULSE);

export function DashboardPulseProvider({ children }: { children: ReactNode }) {
  const [pulse, setPulse] = useState<DashboardPulse>(EMPTY_DASHBOARD_PULSE);

  useEffect(() => {
    let cancelled = false;
    void fetch(DASHBOARD_PULSE_PATH)
      .then(async (response) => {
        const body = (await response.json()) as { ok: boolean; pulse?: DashboardPulse };
        if (!cancelled && body.ok && body.pulse) {
          setPulse(body.pulse);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPulse(EMPTY_DASHBOARD_PULSE);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <DashboardPulseContext.Provider value={pulse}>{children}</DashboardPulseContext.Provider>;
}

export function useDashboardPulse(): DashboardPulse {
  return useContext(DashboardPulseContext);
}
