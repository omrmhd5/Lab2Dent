import { cookies } from "next/headers";

export type Theme = "light" | "dark" | "system";

export const THEME_COOKIE = "lab2dent-theme";

export function isTheme(value: string): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE)?.value;
  return value && isTheme(value) ? value : "system";
}

export const THEME_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )lab2dent-theme=([^;]*)/);var v=m?decodeURIComponent(m[1]):"system";var dark=v==="dark"||(v!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;
