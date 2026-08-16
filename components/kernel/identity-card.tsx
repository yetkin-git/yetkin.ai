import { DisplayNameForm } from "@/components/kernel/display-name-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatProfileCreatedAt,
  PROFILE_UNSET_LABEL,
  profileEmail,
} from "@/lib/kernel/identity/display";
import type { IdentityProfile } from "@/lib/kernel/identity/types";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

const READONLY_FIELD =
  "cursor-default bg-[var(--surface-muted)] focus:border-[var(--border)] focus:ring-0";

function ReadField({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string;
  type?: "text" | "email";
}) {
  return (
    <Label>
      {label}
      <Input type={type} value={value} readOnly tabIndex={0} className={READONLY_FIELD} />
    </Label>
  );
}

export function IdentityCard({
  profile,
  sessionEmail,
}: {
  profile: IdentityProfile | null;
  sessionEmail: string;
}) {
  const createdAt = profile
    ? formatProfileCreatedAt(profile.createdAt, profile.locale, profile.timeZone)
    : PROFILE_UNSET_LABEL;
  const copy = SEN_VOICE.profil.card;

  return (
    <Card title={copy.title} eyebrow={copy.eyebrow} bodyClassName="text-[var(--foreground)]">
      <p className="mb-4 text-sm text-[var(--muted)]">{copy.intro}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {profile ? (
          <DisplayNameForm initialDisplayName={profile.displayName?.trim() ?? ""} />
        ) : (
          <ReadField label={copy.name} value={PROFILE_UNSET_LABEL} />
        )}
        <ReadField label={copy.email} type="email" value={profileEmail(profile?.email, sessionEmail)} />
        <ReadField label={copy.locale} value={profile?.locale ?? PROFILE_UNSET_LABEL} />
        <ReadField label={copy.timeZone} value={profile?.timeZone ?? PROFILE_UNSET_LABEL} />
        <div className="sm:col-span-2">
          <ReadField label={copy.createdAt} value={createdAt} />
        </div>
      </div>
    </Card>
  );
}
