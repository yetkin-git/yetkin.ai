import { juniorSealedCourseLessons } from "@/lib/junior/content-source";

/**
* Geriye dönük adaptör. Dizi, JuniorContentSource kapısından okunur.
* Tekil `mat/N.ts` dosyaları yerinde durur; katalog bu dosyayı doğrudan dizmez.
*/
export const JUNIOR_MAT_LESSONS = juniorSealedCourseLessons("jr_06_mat");
