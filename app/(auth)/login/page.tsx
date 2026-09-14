import type { Metadata } from "next";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { AUTH_ROBOTS, PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { LoginForm } from "@/components/auth/login-form";
import { LoginPageContent } from "@/components/auth/login-page-content";
import { readPostLoginPathFromSearch } from "@/lib/kernel/auth/redirects";

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.login,
  robots: AUTH_ROBOTS,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const copy = SEN_VOICE.auth.login;
  const params = await searchParams;
  const nextRaw = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = readPostLoginPathFromSearch(null, nextRaw);
  return (
    <LoginPageContent copy={copy}>
      <LoginForm nextPath={nextPath} />
    </LoginPageContent>
  );
}
