"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MenuBarrage } from "@/components/chrome/MenuBarrage";
import {
  endMenuBarragePlay,
  menuBarragePlay,
  subscribeMenuBarrage,
} from "@/components/chrome/menu-barrage-session";

function destination(href: string): URL | null {
  try {
    return new URL(href, window.location.origin);
  } catch {
    return null;
  }
}

function arrived(href: string): boolean {
  const next = destination(href);
  if (!next || next.origin !== window.location.origin) return false;
  return (
    next.pathname === window.location.pathname &&
    next.search === window.location.search
  );
}

/**
 * The sequence lives on the root layout so a route change under it does
 * not remount the frames. It stays up until the product route is current,
 * so the home page never shows between the barrage and the product page.
 */
export function MenuBarrageHost() {
  const pathname = usePathname();
  const router = useRouter();
  const play = useSyncExternalStore(
    subscribeMenuBarrage,
    menuBarragePlay,
    () => null,
  );
  const holdRef = useRef(false);

  useEffect(() => {
    if (!play) {
      holdRef.current = false;
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [play]);

  useEffect(() => {
    if (!play || !holdRef.current) return;
    if (!arrived(play.href)) return;
    holdRef.current = false;
    endMenuBarragePlay();
  }, [pathname, play]);

  if (!play) return null;

  return (
    <MenuBarrage
      key={play.n}
      catalogId={play.id}
      onDone={() => {
        const href = play.href;
        const next = destination(href);
        if (!next) {
          endMenuBarragePlay();
          return;
        }
        if (next.origin !== window.location.origin) {
          endMenuBarragePlay();
          window.location.assign(href);
          return;
        }
        if (arrived(href)) {
          endMenuBarragePlay();
          return;
        }
        holdRef.current = true;
        router.push(`${next.pathname}${next.search}${next.hash}`);
        window.setTimeout(() => {
          if (!holdRef.current) return;
          holdRef.current = false;
          endMenuBarragePlay();
        }, 4000);
      }}
    />
  );
}
