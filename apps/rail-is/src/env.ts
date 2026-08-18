export type DronPublicEnv = {
  railApiBase: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function readDronPublicEnv(): DronPublicEnv {
  return {
    railApiBase: process.env.EXPO_PUBLIC_RAIL_API_BASE?.trim() ?? "",
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "",
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "",
  };
}

export function isDronAuthConfigured(env = readDronPublicEnv()): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isDronApiConfigured(env = readDronPublicEnv()): boolean {
  return Boolean(env.railApiBase);
}
