/**
 * Amiral istemci — kanonik `/api/...` + `x-rail-api-version: 1` + same-origin çerez.
 * JSON şekli Dron ile aynı v1 zarfıdır. Çerez oturumu Bearer'a çevrilmez;
 * `/api/v1` hop'ları Bearer ister, amiral `/api/...` çerezle oturum açar.
 */
import {
  RAIL_WEB_API_VERSION_HEADER,
  RAIL_WEB_API_VERSION_LABEL,
} from "@/lib/ui/parse-rail-json";

export { RAIL_WEB_API_VERSION_HEADER, RAIL_WEB_API_VERSION_LABEL };

export function railClientHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  headers.set(RAIL_WEB_API_VERSION_HEADER, RAIL_WEB_API_VERSION_LABEL);
  return headers;
}

export function withRailApiVersion(init?: RequestInit): RequestInit {
  return {
    credentials: "same-origin",
    ...init,
    headers: railClientHeaders(init?.headers),
  };
}
