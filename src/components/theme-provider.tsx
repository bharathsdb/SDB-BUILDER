"use client";

import * as React from "react";

const STORAGE_KEY = "theme";
const DARK_MEDIA = "(prefers-color-scheme: dark)";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(DARK_MEDIA).matches ? "dark" : "light";
}

function getStoredTheme(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function generateInitScript({
  attribute,
  defaultTheme,
  forcedTheme,
  storageKey,
  themes,
  value,
  enableSystem,
  enableColorScheme,
}: {
  attribute: string | string[];
  defaultTheme: string;
  forcedTheme: string | null;
  storageKey: string;
  themes: string[];
  value: Record<string, string> | null;
  enableSystem: boolean;
  enableColorScheme: boolean;
}) {
  const attrs = Array.isArray(attribute) ? attribute : [attribute];
  const attrsJson = JSON.stringify(attrs);
  const themesJson = JSON.stringify(themes);
  const valueJson = JSON.stringify(value);
  const forcedThemeJson = JSON.stringify(forcedTheme);
  const storageKeyJson = JSON.stringify(storageKey);
  const defaultThemeJson = JSON.stringify(defaultTheme);

  return `!function(){var d=document.documentElement,w=["light","dark"],a=${attrsJson};function p(n){for(var i=0;i<a.length;i++){var y=a[i],k=y==="class";k?(d.classList.remove.apply(d.classList,${themesJson}),d.classList.add((${valueJson}&&${valueJson}[n])||n)):d.setAttribute(y,(${valueJson}&&${valueJson}[n])||n)}${enableColorScheme ? 'w.indexOf(n)!==-1&&(d.style.colorScheme=n)' : ''}}function c(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(${forcedThemeJson}){p(${forcedThemeJson})}else{try{var n=localStorage.getItem(${storageKeyJson})||${defaultThemeJson};p(${enableSystem ? 'n==="system"?c():n' : 'n'})}catch(e){}}}()`;
}

interface ThemeContextValue {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  forcedTheme?: string;
  resolvedTheme?: "light" | "dark";
  themes: string[];
  systemTheme?: "light" | "dark";
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: undefined,
  setTheme: () => {},
  themes: ["light", "dark"],
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string | string[];
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  enableColorScheme?: boolean;
  storageKey?: string;
  themes?: string[];
  value?: Record<string, string>;
  nonce?: string;
  forcedTheme?: string;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  enableColorScheme = true,
  storageKey = STORAGE_KEY,
  themes = ["light", "dark"],
  value,
  nonce,
  forcedTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<string>(
    () => getStoredTheme(storageKey, defaultTheme)
  );
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">(
    getSystemTheme
  );

  const resolvedTheme =
    theme === "system" ? systemTheme : (theme as "light" | "dark");

  const applyTheme = React.useCallback(
    (t: string) => {
      const attrs = Array.isArray(attribute) ? attribute : [attribute];
      const resolved = t === "system" ? getSystemTheme() : t;
      for (const attr of attrs) {
        if (attr === "class") {
          const cl = document.documentElement.classList;
          cl.remove(...themes);
          cl.add(value?.[resolved] || resolved);
        } else {
          document.documentElement.setAttribute(
            attr,
            value?.[resolved] || resolved
          );
        }
      }
      if (enableColorScheme) {
        document.documentElement.style.colorScheme = resolved;
      }
    },
    [attribute, themes, value, enableColorScheme]
  );

  const setTheme = React.useCallback(
    (t: string) => {
      setThemeState(t);
      try {
        localStorage.setItem(storageKey, t);
      } catch {}
    },
    [storageKey]
  );

  React.useEffect(() => {
    applyTheme(forcedTheme || theme);
  }, [theme, forcedTheme, applyTheme]);

  React.useEffect(() => {
    const mq = window.matchMedia(DARK_MEDIA);
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  React.useEffect(() => {
    if (theme === "system" && !forcedTheme) {
      applyTheme("system");
    }
  }, [systemTheme, theme, forcedTheme, applyTheme]);

  React.useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [storageKey]);

  React.useEffect(() => {
    if (!disableTransitionOnChange) return;
    const css = document.createElement("style");
    if (nonce) css.setAttribute("nonce", nonce);
    css.textContent =
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";
    document.head.appendChild(css);
    window.getComputedStyle(document.body);
    return () => {
      setTimeout(() => document.head.removeChild(css), 1);
    };
  }, [theme, disableTransitionOnChange, nonce]);

  const scriptContent = React.useMemo(
    () =>
      generateInitScript({
        attribute,
        defaultTheme,
        forcedTheme: forcedTheme || null,
        storageKey,
        themes,
        value: value || null,
        enableSystem,
        enableColorScheme,
      }),
    [
      attribute,
      defaultTheme,
      forcedTheme,
      storageKey,
      themes,
      value,
      enableSystem,
      enableColorScheme,
    ]
  );

  const ctx = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme,
      themes: enableSystem ? [...themes, "system"] : themes,
      systemTheme: enableSystem ? systemTheme : undefined,
    }),
    [theme, setTheme, forcedTheme, resolvedTheme, themes, enableSystem, systemTheme]
  );

  return (
    <ThemeContext.Provider value={ctx}>
      <div
        id="next-themes-init"
        aria-hidden
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `<script>${scriptContent}${nonce ? `\n//# sourceURL=next-themes-init` : ''}<\/script>`,
        }}
      />
      {children}
    </ThemeContext.Provider>
  );
}
