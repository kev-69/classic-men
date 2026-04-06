declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export const initMetaPixel = (pixelId: string) => {
  if (!pixelId || initialized || typeof window === "undefined") {
    return;
  }

  if (!window.fbq) {
    ((f: Window & typeof globalThis, b: Document, e: string, v?: string, n?: (...args: unknown[]) => void, t?: HTMLScriptElement, s?: Node) => {
      if (f.fbq) {
        return;
      }
      n = function (...args: unknown[]) {
        if (n && "callMethod" in n && typeof (n as { callMethod?: (...callArgs: unknown[]) => void }).callMethod === "function") {
          (n as { callMethod: (...callArgs: unknown[]) => void }).callMethod(...args);
        } else {
          ((n as { queue?: unknown[][] }).queue = (n as { queue?: unknown[][] }).queue || []).push(args);
        }
      };
      if (!f._fbq) {
        f._fbq = n;
      }
      f.fbq = n;
      (n as { push?: (...pushArgs: unknown[]) => void; loaded?: boolean; version?: string; queue?: unknown[][] }).push = n;
      (n as { loaded?: boolean }).loaded = true;
      (n as { version?: string }).version = "2.0";
      (n as { queue?: unknown[][] }).queue = [];
      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v ?? "https://connect.facebook.net/en_US/fbevents.js";
      s = b.getElementsByTagName(e)[0];
      s?.parentNode?.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  }

  window.fbq?.("init", pixelId);
  initialized = true;
};

export const trackPixelEvent = (eventName: "PageView" | "ViewContent", payload?: Record<string, unknown>) => {
  if (!window.fbq) {
    return;
  }

  if (payload) {
    window.fbq("track", eventName, payload);
    return;
  }

  window.fbq("track", eventName);
};
