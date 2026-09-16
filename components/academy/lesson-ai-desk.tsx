"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonPromptConsole } from "@/components/academy/lesson-prompt-console";
import {
  ACADEMY_AI_DESK_ATTACH,
  ACADEMY_AI_DESK_CTRL_C,
  ACADEMY_INFRA_OUTLOOK_HONESTY_BADGE,
  academyAiDeskActiveTab,
  academyAiDeskClipForHost,
  academyAiDeskClipVerb,
  academyAiDeskCueStart,
  academyAiDeskPastePhase,
  academyAiDeskPinnedForLesson,
  academyAiDeskTabsForHost,
  academyInfraAllowsDirectUpload,
  type AcademyAiDeskHost,
  type AcademyAiDeskTab,
} from "@/lib/academy/ai-desk";

export function useAcademyAiDeskTab(input: {
  lessonKey: string;
  cueIndex: number;
  currentTime?: number;
}) {
  const cueStart = useMemo(
    () => academyAiDeskCueStart(input.lessonKey, input.cueIndex),
    [input.lessonKey, input.cueIndex],
  );
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pinned, setPinned] = useState<AcademyAiDeskTab | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setPinned(null);
  }, [input.lessonKey, input.cueIndex]);

  const tab = academyAiDeskActiveTab({
    currentTime: input.currentTime,
    cueStart,
    reducedMotion,
    pinned: pinned ?? academyAiDeskPinnedForLesson(input.lessonKey),
  });
  const phase = academyAiDeskPastePhase({
    tab,
    currentTime: input.currentTime,
    cueStart,
    reducedMotion,
  });

  return { tab, phase, cueStart, reducedMotion, setTab: setPinned };
}

export function LessonOfficeCopilotRibbon({
  active,
  host,
}: {
  active: boolean;
  host: AcademyAiDeskHost;
}) {
  const gemini = host === "gmail";
  return (
    <span className="academy-office-copilot-ribbon" data-academy-ribbon-copilot-wrap="" data-host={host}>
      <span
        className="academy-office-copilot-btn"
        data-academy-ribbon-copilot=""
        data-academy-ribbon-gemini={gemini ? "" : undefined}
        data-on={active ? "true" : undefined}
      >
        {gemini ? "Gemini" : "Copilot"}
      </span>
      {active ? (
        <span className="academy-office-copilot-arrow" data-academy-copilot-arrow="" aria-hidden>
          <i />
          <em>{gemini ? "Gemini paneli" : "Copilot paneli"}</em>
        </span>
      ) : null}
    </span>
  );
}

export function LessonAiDesk({
  prompt,
  currentTime,
  lessonKey,
  cueIndex,
  host,
  hideReply,
  replyLines,
  transferLabels,
  tab,
  onTabChange,
  phase,
}: {
  prompt: string;
  currentTime?: number;
  lessonKey: string;
  cueIndex: number;
  host: AcademyAiDeskHost;
  hideReply?: boolean;
  replyLines?: readonly string[];
  transferLabels?: readonly string[];
  tab: AcademyAiDeskTab;
  onTabChange: (tab: AcademyAiDeskTab) => void;
  phase: ReturnType<typeof academyAiDeskPastePhase>;
}) {
  const clip = academyAiDeskClipForHost(host);
  const clipVerb = academyAiDeskClipVerb(host);
  const showPaste = tab === "chatgpt";
  const directUpload = academyInfraAllowsDirectUpload(host);
  const deskTabs = academyAiDeskTabsForHost(host);
  const nativeGemini = host === "gmail";

  return (
    <aside
      className={`academy-ai-desk academy-${host === "word" ? "excel" : host}-copilot`}
      data-academy-ai-desk=""
      data-academy-ai-desk-host={host}
      data-academy-ai-desk-tab={tab}
      data-academy-ai-desk-phase={phase}
      data-academy-infra-upload={directUpload ? "true" : "false"}
      data-academy-infra-gemini={nativeGemini ? "true" : undefined}
      aria-label="Yapay zekâ yazma paneli"
    >
      <nav className="academy-ai-desk-tabs" data-academy-ai-desk-tabs="" aria-label="Nereye yazılacak">
        {deskTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className="academy-ai-desk-tab"
            data-academy-ai-desk-tab-btn={item.id}
            data-on={tab === item.id ? "true" : undefined}
            onClick={() => onTabChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {transferLabels && transferLabels.length > 0 ? (
        <ul className="academy-excel-transfer-tags" data-academy-transfer-tags="">
          {transferLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : null}
      {tab === "copilot" ? (
        <div className="academy-ai-desk-copilot" data-academy-ai-desk-copilot="">
          <header className="academy-ai-desk-copilot-head">
            <b>{nativeGemini ? "Gemini" : "Microsoft Copilot"}</b>
            <span>{nativeGemini ? "Gmail yan paneli" : "Şerit · sağ üst"}</span>
          </header>
          <LessonPromptConsole
            prompt={prompt}
            currentTime={currentTime}
            lessonKey={lessonKey}
            cueIndex={cueIndex}
          />
          {hideReply === true || !replyLines || replyLines.length === 0 ? null : (
            <div className="academy-ai-desk-bubble" data-academy-ai-desk-reply="">
              {replyLines.map((line, index) => (
                <p key={`${index}:${line}`}>{line}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="academy-ai-desk-chat" data-academy-chatgpt-mini="" data-phase={phase}>
          <div className="academy-ai-desk-clip" data-academy-ai-desk-clip="">
            <p>{clipVerb}</p>
            <ul>
              {clip.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <kbd
              data-academy-ctrl-c={directUpload ? undefined : ""}
              data-academy-attach={directUpload ? "" : undefined}
              data-on={phase === "copy" || phase === "paste" ? "true" : undefined}
            >
              {directUpload ? ACADEMY_AI_DESK_ATTACH : ACADEMY_AI_DESK_CTRL_C}
            </kbd>
          </div>
          {host === "outlook" ? (
            <p className="academy-ai-desk-honesty" data-academy-infra-honesty="">
              {ACADEMY_INFRA_OUTLOOK_HONESTY_BADGE}
            </p>
          ) : null}
          <span className="academy-ai-desk-flight" data-academy-copy-flight="" aria-hidden />
          <article className="academy-chatgpt-window" data-academy-chatgpt-window="">
            <header>
              <b>ChatGPT</b>
              <em>{directUpload ? "Gemini" : "Claude"}</em>
            </header>
            <div
              className="academy-chatgpt-paste"
              data-academy-chatgpt-paste=""
              data-on={showPaste && (phase === "paste" || phase === "typed") ? "true" : undefined}
            >
              {clip.map((line) => (
                <p key={`paste:${line}`}>{line}</p>
              ))}
            </div>
            <LessonPromptConsole
              prompt={prompt}
              currentTime={currentTime}
              lessonKey={lessonKey}
              cueIndex={cueIndex}
            />
          </article>
        </div>
      )}
    </aside>
  );
}
