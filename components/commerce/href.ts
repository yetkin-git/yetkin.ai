import type { Route } from "next";

export function cockpitHref(path: string): Route {
  return path as unknown as Route;
}
