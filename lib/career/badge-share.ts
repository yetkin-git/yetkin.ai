import { YETKIN_BRAND } from "@/lib/copy/brand";
import { CANONICAL_SITE_ORIGIN } from "@/lib/copy/seo";

function appOrigin(origin?: string): string {
  return (
    origin?.trim().replace(/\/$/u, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/u, "") ||
    CANONICAL_SITE_ORIGIN
  );
}

export function absoluteAppUrl(path: string, origin?: string): string {
  if (path.startsWith("https://") || path.startsWith("http://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${appOrigin(origin)}${normalized}`;
}

export function linkedInAddCertificationUrl(input: {
  name: string;
  certUrl: string;
  certId: string;
  issuedAt: Date;
  origin?: string;
}): string {
  const issued = input.issuedAt;
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: input.name.trim() || YETKIN_BRAND,
    organizationName: YETKIN_BRAND,
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: absoluteAppUrl(input.certUrl, input.origin),
    certId: input.certId.trim(),
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}
