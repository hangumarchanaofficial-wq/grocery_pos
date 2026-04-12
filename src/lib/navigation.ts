/**
 * Single active-state rules for sidebar + mobile nav.
 * Dashboard (/dashboard) must not match /dashboard/settings, /billing, etc.
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  const p = pathname.replace(/\/$/, "") || "/";
  const h = href.replace(/\/$/, "") || "/";
  if (h === "/dashboard") {
    return p === "/dashboard";
  }
  return p === h || p.startsWith(`${h}/`);
}
