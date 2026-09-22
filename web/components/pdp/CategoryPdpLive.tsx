"use client";

import { useEffect, useState } from "react";
import { CategoryPdp } from "@/components/pdp/CategoryPdp";
import type { CategoryPdpData } from "@/content/pdp/types";
import {
  getLiveOverlayForTheme,
  mergeSandboxIntoPdp,
} from "@/lib/prescriberx/live-catalog";

type Props = {
  data: CategoryPdpData;
};

/**
 * Same CategoryPdp chrome. When a sandbox catalog product matches the theme,
 * applies sandbox price, stock, short description (tagline), and plan prices.
 * Brand photos stay. Titles stay goal-framed. No match → fixture unchanged.
 */
export function CategoryPdpLive({ data }: Props) {
  const [merged, setMerged] = useState<CategoryPdpData>(data);

  useEffect(() => {
    let cancelled = false;
    setMerged(data);
    void (async () => {
      const live = await getLiveOverlayForTheme(data.themeId);
      if (cancelled) return;
      setMerged(mergeSandboxIntoPdp(data, live));
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  return <CategoryPdp data={merged} />;
}
