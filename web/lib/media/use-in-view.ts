"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** True while the node intersects the viewport, with a prefetch margin. */
export function useInView<T extends HTMLElement>(
  eager = false,
  rootMargin = "40% 0px",
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [hot, setHot] = useState(eager);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setHot(entry.isIntersecting);
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, hot];
}
