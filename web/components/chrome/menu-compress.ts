"use client";

import { useEffect, useRef, type RefObject } from "react";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const MS = 320;

export function isWordmarkTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('[aria-label="TIDL home"]'));
}

/**
 * Drag up on a menu to shrink it with the finger. A flick, or a drag past
 * about a fifth of the open height, commits the collapse so the video
 * behind the menu stays in view. A short drag springs back open.
 */
export function useMenuCompress(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  onCommit: (openHeight: number) => void,
) {
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let tracking = false;
    let claimed = false;
    let originX = 0;
    let originY = 0;
    let openH = 0;
    let drag = 0;
    const samples: { y: number; t: number }[] = [];

    const velocity = () => {
      const last = samples[samples.length - 1];
      if (!last) return 0;
      let prior = samples[0];
      for (let i = samples.length - 1; i >= 0; i -= 1) {
        if (last.t - samples[i].t >= 70) {
          prior = samples[i];
          break;
        }
      }
      const dt = last.t - prior.t;
      if (dt <= 0) return 0;
      return (prior.y - last.y) / dt;
    };

    const paint = (px: number, animate: boolean) => {
      el.style.overflow = "hidden";
      el.style.transition = animate ? `height ${MS}ms ${EASE}` : "none";
      el.style.height = `${Math.max(0, px)}px`;
    };

    const clear = () => {
      el.style.transition = "";
      el.style.height = "";
      el.style.overflow = "";
      el.style.touchAction = "";
    };

    const swallowClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      el.removeEventListener("click", swallowClick, true);
    };

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      tracking = true;
      claimed = false;
      originX = touch.clientX;
      originY = touch.clientY;
      openH = el.getBoundingClientRect().height;
      drag = 0;
      samples.length = 0;
      samples.push({ y: originY, t: performance.now() });
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      const up = originY - touch.clientY;
      const dx = touch.clientX - originX;
      samples.push({ y: touch.clientY, t: performance.now() });
      if (samples.length > 8) samples.shift();
      if (!claimed) {
        if (up < 8 || Math.abs(dx) > up) return;
        claimed = true;
        el.style.touchAction = "none";
      }
      event.preventDefault();
      drag = Math.min(openH, Math.max(0, up));
      paint(openH - drag, false);
    };

    const finish = (commit: boolean) => {
      let done = false;
      const end = (event?: Event) => {
        if (event && event.target !== el) return;
        if (done) return;
        done = true;
        el.removeEventListener("transitionend", end);
        if (commit) commitRef.current(openH);
        else clear();
      };
      window.setTimeout(() => end(), MS + 50);
      el.addEventListener("transitionend", end);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (!claimed || openH < 1) {
        claimed = false;
        return;
      }
      claimed = false;
      el.addEventListener("click", swallowClick, true);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const flung = drag > 28 && velocity() > 0.45;
      const far = drag > Math.min(openH * 0.22, 110);
      if (flung || far) {
        if (reduce) {
          paint(0, false);
          commitRef.current(openH);
          return;
        }
        paint(0, true);
        finish(true);
        return;
      }
      if (reduce) {
        clear();
        return;
      }
      paint(openH, true);
      finish(false);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
      el.removeEventListener("click", swallowClick, true);
      clear();
    };
  }, [enabled, ref]);
}

/**
 * Drag down on a collapsed sheet's header to grow the menu back open.
 */
export function useMenuExpand(
  handleRef: RefObject<HTMLElement | null>,
  sheetRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  openHeight: () => number,
  onExpand: () => void,
) {
  const expandRef = useRef(onExpand);
  expandRef.current = onExpand;
  const heightRef = useRef(openHeight);
  heightRef.current = openHeight;

  useEffect(() => {
    if (!enabled) return;
    const handle = handleRef.current;
    const sheet = sheetRef.current;
    if (!handle || !sheet) return;

    let tracking = false;
    let claimed = false;
    let originY = 0;
    let originX = 0;
    let full = 0;
    let drag = 0;

    const paint = (px: number, animate: boolean) => {
      sheet.style.overflow = "hidden";
      sheet.style.transition = animate ? `height ${MS}ms ${EASE}` : "none";
      sheet.style.height = `${Math.max(0, px)}px`;
    };

    const clear = () => {
      sheet.style.transition = "";
      sheet.style.height = "";
      sheet.style.overflow = "";
    };

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      if (isWordmarkTarget(event.target)) return;
      const touch = event.touches[0];
      if (!touch) return;
      tracking = true;
      claimed = false;
      originX = touch.clientX;
      originY = touch.clientY;
      full = heightRef.current();
      drag = 0;
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      const down = touch.clientY - originY;
      const dx = touch.clientX - originX;
      if (!claimed) {
        if (down < 8 || Math.abs(dx) > down) return;
        claimed = true;
      }
      event.preventDefault();
      drag = Math.min(full, Math.max(0, down));
      paint(drag, false);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (!claimed) return;
      claimed = false;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const commit = drag > Math.min(full * 0.22, 110) || drag > 48;
      if (!commit) {
        if (reduce) {
          sheet.style.transition = "";
          sheet.style.height = "";
        } else {
          paint(0, true);
          window.setTimeout(() => {
            sheet.style.transition = "";
            sheet.style.height = "";
          }, MS + 50);
        }
        return;
      }
      if (reduce) {
        sheet.dataset.collapsed = "false";
        clear();
        expandRef.current();
        return;
      }
      paint(full, true);
      let done = false;
      const end = (event?: Event) => {
        if (event && event.target !== sheet) return;
        if (done) return;
        done = true;
        sheet.removeEventListener("transitionend", end);
        sheet.dataset.collapsed = "false";
        clear();
        expandRef.current();
      };
      sheet.addEventListener("transitionend", end);
      window.setTimeout(() => end(), MS + 50);
    };

    handle.addEventListener("touchstart", onStart, { passive: true });
    handle.addEventListener("touchmove", onMove, { passive: false });
    handle.addEventListener("touchend", onEnd);
    handle.addEventListener("touchcancel", onEnd);
    return () => {
      handle.removeEventListener("touchstart", onStart);
      handle.removeEventListener("touchmove", onMove);
      handle.removeEventListener("touchend", onEnd);
      handle.removeEventListener("touchcancel", onEnd);
    };
  }, [enabled, handleRef, sheetRef]);
}

/**
 * Pull down on the top bar while the landing menu is closed. The sheet
 * grows with the finger. A flick, or a drag past about a fifth of the
 * open height, leaves the menu open. A short drag springs shut.
 */
export function useNavPullOpen(
  handleRef: RefObject<HTMLElement | null>,
  sheetRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onOpen: () => void,
) {
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  useEffect(() => {
    if (!enabled) return;
    const handle = handleRef.current;
    const sheet = sheetRef.current;
    if (!handle || !sheet) return;
    const header = handle.closest("header");

    let tracking = false;
    let claimed = false;
    let originX = 0;
    let originY = 0;
    let full = 0;
    let contentH = 0;
    let drag = 0;
    let atTop = true;
    let pending: "open" | "close" | null = null;
    let timer = 0;
    let endFn: ((event?: Event) => void) | null = null;
    const samples: { y: number; t: number }[] = [];

    const velocity = () => {
      const last = samples[samples.length - 1];
      if (!last) return 0;
      let prior = samples[0];
      for (let i = samples.length - 1; i >= 0; i -= 1) {
        if (last.t - samples[i].t >= 70) {
          prior = samples[i];
          break;
        }
      }
      const dt = last.t - prior.t;
      if (dt <= 0) return 0;
      return (last.y - prior.y) / dt;
    };

    const markOpen = () => {
      sheet.dataset.open = "true";
      if (!header) return;
      header.dataset.mobileOpen = "true";
      header.dataset.mobileLoad = atTop ? "true" : "false";
    };

    const reveal = (px: number, animate: boolean) => {
      markOpen();
      sheet.style.pointerEvents = "none";
      sheet.style.overflow = "hidden";
      sheet.style.gridTemplateRows = "1fr";
      sheet.style.paddingBottom = "0px";
      sheet.style.transition = animate ? `height ${MS}ms ${EASE}` : "none";
      sheet.style.height = `${Math.max(0, px)}px`;
    };

    const clearSheet = () => {
      sheet.style.transition = "";
      sheet.style.height = "";
      sheet.style.overflow = "";
      sheet.style.gridTemplateRows = "";
      sheet.style.pointerEvents = "";
      sheet.style.visibility = "";
      sheet.style.paddingBottom = "";
    };

    const restoreClosed = () => {
      sheet.style.transition = "none";
      sheet.style.height = "0px";
      sheet.style.gridTemplateRows = "0fr";
      sheet.dataset.open = "false";
      if (header) {
        header.dataset.mobileOpen = "false";
        header.dataset.mobileLoad = "false";
      }
      requestAnimationFrame(() => {
        if (sheet.dataset.open === "true") return;
        clearSheet();
      });
    };

    const measureFull = () => {
      markOpen();
      sheet.style.transition = "none";
      sheet.style.gridTemplateRows = "1fr";
      sheet.style.overflow = "hidden";
      sheet.style.visibility = "hidden";
      sheet.style.paddingBottom = "0px";
      sheet.style.height = "auto";
      const content = sheet.getBoundingClientRect().height;
      sheet.style.paddingBottom = "";
      const open = sheet.getBoundingClientRect().height;
      sheet.style.visibility = "";
      sheet.style.paddingBottom = "0px";
      return { content, open };
    };

    const swallowClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      handle.removeEventListener("click", swallowClick, true);
    };

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      if (isWordmarkTarget(event.target)) return;
      const touch = event.touches[0];
      if (!touch) return;
      tracking = true;
      claimed = false;
      atTop = window.scrollY <= 8;
      originX = touch.clientX;
      originY = touch.clientY;
      full = 0;
      contentH = 0;
      drag = 0;
      samples.length = 0;
      samples.push({ y: originY, t: performance.now() });
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      const down = touch.clientY - originY;
      const dx = touch.clientX - originX;
      samples.push({ y: touch.clientY, t: performance.now() });
      if (samples.length > 8) samples.shift();
      if (!claimed) {
        if (down < 8 || Math.abs(dx) > down) return;
        claimed = true;
        const measured = measureFull();
        contentH = measured.content;
        full = measured.open;
        handle.style.touchAction = "none";
      }
      if (contentH < 1) return;
      event.preventDefault();
      drag = Math.min(contentH, Math.max(0, down));
      reveal(drag, false);
    };

    const settle = (commit: boolean) => {
      pending = null;
      if (commit) {
        sheet.dataset.open = "true";
        clearSheet();
        openRef.current();
        return;
      }
      restoreClosed();
    };

    const finish = (commit: boolean) => {
      let done = false;
      pending = commit ? "open" : "close";
      const end = (event?: Event) => {
        if (event && event.target !== sheet) return;
        if (event instanceof TransitionEvent && event.propertyName !== "height") return;
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        sheet.removeEventListener("transitionend", end);
        settle(commit);
      };
      endFn = end;
      timer = window.setTimeout(() => end(), MS + 50);
      sheet.addEventListener("transitionend", end);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      handle.style.touchAction = "";
      if (!claimed || contentH < 1) {
        claimed = false;
        return;
      }
      claimed = false;
      handle.addEventListener("click", swallowClick, true);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const flung = drag > 28 && velocity() > 0.45;
      const far = drag > Math.min(contentH * 0.22, 110);
      if (flung || far) {
        if (reduce) {
          sheet.dataset.open = "true";
          clearSheet();
          openRef.current();
          return;
        }
        const pad = Math.max(0, full - contentH);
        sheet.style.transition = `height ${MS}ms ${EASE}, padding-bottom ${MS}ms ${EASE}`;
        sheet.style.paddingBottom = `${pad}px`;
        sheet.style.height = `${full}px`;
        finish(true);
        return;
      }
      if (reduce) {
        restoreClosed();
        return;
      }
      reveal(0, true);
      finish(false);
    };

    handle.addEventListener("touchstart", onStart, { passive: true });
    handle.addEventListener("touchmove", onMove, { passive: false });
    handle.addEventListener("touchend", onEnd);
    handle.addEventListener("touchcancel", onEnd);
    return () => {
      window.clearTimeout(timer);
      if (endFn) sheet.removeEventListener("transitionend", endFn);
      if (pending === "open") settle(true);
      else if (pending === "close" || claimed) restoreClosed();
      handle.removeEventListener("touchstart", onStart);
      handle.removeEventListener("touchmove", onMove);
      handle.removeEventListener("touchend", onEnd);
      handle.removeEventListener("touchcancel", onEnd);
      handle.removeEventListener("click", swallowClick, true);
      handle.style.touchAction = "";
    };
  }, [enabled, handleRef, sheetRef]);
}

function paneById(root: HTMLElement, id: string) {
  return root.querySelector<HTMLElement>(`#mobile-panel-${id}`);
}

function shiftPane(pane: HTMLElement, x: number, animate: boolean) {
  pane.style.visibility = "visible";
  pane.style.pointerEvents = "none";
  pane.style.transition = animate ? `transform ${MS}ms ${EASE}` : "none";
  pane.style.transform = `translate3d(${x}px, 0, 0)`;
}

export function clearMenuPaneShift(root: HTMLElement | null) {
  if (!root) return;
  root.style.overflow = "";
  root.querySelectorAll<HTMLElement>('[id^="mobile-panel-"]').forEach((pane) => {
    pane.style.visibility = "";
    pane.style.pointerEvents = "";
    pane.style.transition = "";
    pane.style.transform = "";
    pane.style.zIndex = "";
    pane.style.position = "";
  });
}

/**
 * Drag sideways inside the dropdown. The tiles follow the finger.
 * A drag to the right pulls in the tab on the left. A drag to the left
 * pulls in the tab on the right. A short drag springs back.
 */
export function useMenuTabSwipe(
  rootRef: RefObject<HTMLElement | null>,
  panesRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  getActive: () => string,
  getOrder: () => readonly string[],
  onCommit: (next: string) => void,
  onSwipeChange: (swiping: boolean) => void,
) {
  const commitRef = useRef(onCommit);
  const swipeRef = useRef(onSwipeChange);
  const activeRef = useRef(getActive);
  const orderRef = useRef(getOrder);
  commitRef.current = onCommit;
  swipeRef.current = onSwipeChange;
  activeRef.current = getActive;
  orderRef.current = getOrder;

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const panes = panesRef.current;
    if (!root || !panes) return;

    let tracking = false;
    let claimed = false;
    let originX = 0;
    let originY = 0;
    let drag = 0;
    let targetId = "";
    const samples: { x: number; t: number }[] = [];

    const velocity = () => {
      const last = samples[samples.length - 1];
      if (!last) return 0;
      let prior = samples[0];
      for (let i = samples.length - 1; i >= 0; i -= 1) {
        if (last.t - samples[i].t >= 70) {
          prior = samples[i];
          break;
        }
      }
      const dt = last.t - prior.t;
      if (dt <= 0) return 0;
      return (last.x - prior.x) / dt;
    };

    const neighbor = (dx: number) => {
      const order = orderRef.current();
      const index = order.indexOf(activeRef.current());
      if (index < 0) return "";
      if (dx > 0) return order[index - 1] ?? "";
      if (dx < 0) return order[index + 1] ?? "";
      return "";
    };

    const paint = (dx: number, animate: boolean, id = neighbor(dx)) => {
      const width = panes.clientWidth || 1;
      const activeEl = paneById(panes, activeRef.current());
      const nextEl = id ? paneById(panes, id) : null;
      const order = orderRef.current();
      const activeIndex = order.indexOf(activeRef.current());
      const nextIndex = id ? order.indexOf(id) : -1;
      const side = nextIndex >= 0 && nextIndex < activeIndex ? -1 : 1;
      const x = dx === 0
        ? 0
        : nextEl
          ? Math.sign(dx) * Math.min(Math.abs(dx), width)
          : Math.sign(dx) * Math.min(Math.abs(dx) * 0.28, width * 0.16);
      panes.style.overflow = "hidden";
      panes.querySelectorAll<HTMLElement>('[id^="mobile-panel-"]').forEach((pane) => {
        if (pane === activeEl || pane === nextEl) return;
        pane.style.visibility = "";
        pane.style.pointerEvents = "";
        pane.style.transition = "";
        pane.style.transform = "";
      });
      if (activeEl) {
        activeEl.style.position = "relative";
        activeEl.style.zIndex = "0";
        shiftPane(activeEl, x, animate);
      }
      if (nextEl) {
        nextEl.style.zIndex = "1";
        shiftPane(nextEl, side * width + x, animate);
      }
    };

    const swallowClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      root.removeEventListener("click", swallowClick, true);
    };

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      if (
        event.target instanceof Element &&
        event.target.closest("[data-menu-row]")
      ) {
        return;
      }
      const nav = root.closest("[data-menu-compress]");
      if (nav instanceof HTMLElement && nav.style.height) return;
      tracking = true;
      claimed = false;
      targetId = "";
      originX = touch.clientX;
      originY = touch.clientY;
      drag = 0;
      samples.length = 0;
      samples.push({ x: originX, t: performance.now() });
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - originX;
      const dy = touch.clientY - originY;
      samples.push({ x: touch.clientX, t: performance.now() });
      if (samples.length > 8) samples.shift();
      if (!claimed) {
        const nav = root.closest("[data-menu-compress]");
        if (nav instanceof HTMLElement && nav.style.height) {
          tracking = false;
          return;
        }
        if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
        claimed = true;
        swipeRef.current(true);
        root.style.touchAction = "none";
      }
      event.preventDefault();
      event.stopPropagation();
      drag = dx;
      targetId = neighbor(dx);
      paint(dx, false);
    };

    const finish = (commitId: string, endX: number) => {
      paint(endX, true, commitId || targetId);
      let done = false;
      const end = (event?: Event) => {
        if (event instanceof TransitionEvent) {
          const node = event.target;
          if (event.propertyName !== "transform") return;
          if (!(node instanceof HTMLElement) || !node.id.startsWith("mobile-panel-")) return;
        }
        if (done) return;
        done = true;
        panes.removeEventListener("transitionend", end);
        if (commitId) commitRef.current(commitId);
        else clearMenuPaneShift(panes);
        swipeRef.current(false);
        root.style.touchAction = "";
      };
      panes.addEventListener("transitionend", end);
      window.setTimeout(() => end(), MS + 50);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (!claimed) return;
      claimed = false;
      root.addEventListener("click", swallowClick, true);
      const width = panes.clientWidth || 1;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const flung = Math.abs(drag) > 28 && Math.abs(velocity()) > 0.45 && Math.sign(velocity()) === Math.sign(drag);
      const far = Math.abs(drag) > Math.min(width * 0.22, 96);
      const commit = Boolean(targetId) && (flung || far);
      if (!commit) {
        if (reduce) {
          clearMenuPaneShift(panes);
          swipeRef.current(false);
          root.style.touchAction = "";
          return;
        }
        finish("", 0);
        return;
      }
      if (reduce) {
        clearMenuPaneShift(panes);
        commitRef.current(targetId);
        swipeRef.current(false);
        root.style.touchAction = "";
        return;
      }
      finish(targetId, drag > 0 ? width : -width);
    };

    root.addEventListener("touchstart", onStart, { passive: true });
    root.addEventListener("touchmove", onMove, { passive: false });
    root.addEventListener("touchend", onEnd);
    root.addEventListener("touchcancel", onEnd);
    return () => {
      root.removeEventListener("touchstart", onStart);
      root.removeEventListener("touchmove", onMove);
      root.removeEventListener("touchend", onEnd);
      root.removeEventListener("touchcancel", onEnd);
      root.removeEventListener("click", swallowClick, true);
      clearMenuPaneShift(panes);
      root.style.touchAction = "";
    };
  }, [enabled, panesRef, rootRef]);
}
