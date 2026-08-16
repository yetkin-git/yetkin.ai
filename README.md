# yetkin-rail

Yetkin Rail — mühürlü emek işletim sistemi.

Kimlik **Supabase Auth** ile mühürlenir, veri **Prisma** üzerinden Postgres’e yazılır, gövde tek **Next.js** App Router uygulamasıdır. On iki oda aynı nakit defteri ve aynı LLM gümrüğünü paylaşır.

Omurgayı bağlamak: `.env.example` → `.env.local`, sonra `npm run ops:migrate`. Adımlar `docs/07_OPS_RUNBOOK.md`.
