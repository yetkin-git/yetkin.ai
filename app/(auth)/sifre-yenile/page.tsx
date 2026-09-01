import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { isSupabaseConfigured } from "@/lib/kernel/auth/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { BrandIcon } from "@/components/ui/brand-icon";

export default function ResetPasswordPage() {
  const configured = isSupabaseConfigured();
  const copy = SEN_VOICE.auth.reset;
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 pb-14 pt-16">
      <div className="relative">
        <BrandIcon className="mb-4 h-10 w-10" />
        <Badge tone="safir">{SEN_VOICE.auth.brand}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-base text-slate-600">{copy.description}</p>
        <Card variant="glass" className="mt-6">
          {configured ? <ResetPasswordForm /> : <p>{copy.unbound}</p>}
        </Card>
        <div className="mt-4">
          <LinkButton href="/login" variant="outline" size="sm">
            {copy.loginCta}
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
