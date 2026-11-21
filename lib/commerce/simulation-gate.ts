/** Üretimde kapalı. Yalnız üretim dışı ve açık bayrakta örnek satış/soru yazılır. */
export function commerceSimulationAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV !== "production" && env.COMMERCE_ALLOW_SIMULATION === "true";
}
