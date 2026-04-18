"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./activity-snackbar.module.css";

interface ActivitySnackbarProps {
  children: ReactNode;
  autoHideMs?: number;
  revealDelayMs?: number;
  scrollOffsetPx?: number;
}

export function ActivitySnackbar({
  children,
  autoHideMs = 5200,
  revealDelayMs = 700,
  scrollOffsetPx = 320,
}: ActivitySnackbarProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const revealTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (dismissed || hasShown) {
      return;
    }

    function clearRevealTimer() {
      if (revealTimerRef.current != null) {
        window.clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    }

    function handleScroll() {
      if (window.scrollY < scrollOffsetPx) {
        clearRevealTimer();
        return;
      }

      if (revealTimerRef.current == null) {
        revealTimerRef.current = window.setTimeout(() => {
          setVisible(true);
          setHasShown(true);
          revealTimerRef.current = null;
        }, revealDelayMs);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearRevealTimer();
    };
  }, [dismissed, hasShown, revealDelayMs, scrollOffsetPx]);

  useEffect(() => {
    if (!visible || dismissed) {
      return;
    }

    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setDismissed(true);
    }, autoHideMs);

    return () => {
      if (hideTimerRef.current != null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [autoHideMs, dismissed, visible]);

  if (dismissed) {
    return null;
  }

  return (
    <div
      className={`${styles.shell} ${visible ? styles.visible : ""}`}
      aria-hidden={visible ? "false" : "true"}
    >
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.close}
          aria-label="Dismiss live activity"
          onClick={() => setDismissed(true)}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default ActivitySnackbar;
