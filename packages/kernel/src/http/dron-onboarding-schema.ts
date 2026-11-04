/**
 * Yeni dron nabız zarfı. Oda dosyası `dronId` sabitini daraltır.
 * Sözleşme bind'i bu şemayı kullanır; hop kimliği `dron-onboarding-hops.ts`.
 */
import { z } from "zod";

export const dronOnboardingPulseDataSchema = z.strictObject({
  pulse: z.strictObject({
    live: z.boolean(),
    dronId: z.string().min(1),
    userId: z.uuid(),
  }),
});

export type DronOnboardingPulseData = z.infer<typeof dronOnboardingPulseDataSchema>;
