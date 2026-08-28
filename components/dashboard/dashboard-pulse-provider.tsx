"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DASHBOARD_PULSE_PATH,
  EMPTY_DASHBOARD_PULSE,
  type DashboardPulse,
} from "@/lib/dashboard/pulse";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const DashboardPulseContext = createContext<DashboardPulse>(EMPTY_DASHBOARD_PULSE);

export function DashboardPulseProvider({
  children,
  initialPulse,
}: {
  children: ReactNode;
  initialPulse?: DashboardPulse;
}) {
  const [pulse, setPulse] = useState<DashboardPulse>(initialPulse ?? EMPTY_DASHBOARD_PULSE);
  const hydratedFromServer = initialPulse !== undefined;

  useEffect(() => {
    if (hydratedFromServer) {
      return;
    }
    let cancelled = false;
    void fetch(DASHBOARD_PULSE_PATH, withRailApiVersion())
      .then(async (response) => {
        if (!response.ok) {
          if (!cancelled) {
            setPulse(EMPTY_DASHBOARD_PULSE);
          }
          return;
        }
        const parsed = parseRailClientJson<{ pulse?: DashboardPulse }>(await response.json());
        if (!cancelled && parsed.ok && parsed.data.pulse) {
          setPulse(parsed.data.pulse);
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
  }, [hydratedFromServer]);

  return <DashboardPulseContext.Provider value={pulse}>{children}</DashboardPulseContext.Provider>;
}

export function useDashboardPulse(): DashboardPulse {
  return useContext(DashboardPulseContext);
}
