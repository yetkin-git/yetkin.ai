import { formatMinor } from "@/lib/kernel/money/format";
import type { AcademyCourseWithPrice } from "@/lib/academy/load";
import { ACADEMY_SHOWCASE } from "@/lib/showcase/catalog";
import { ListingCard, Vitrine } from "@/components/showcase/listing-card";
import { IconBook } from "@/components/ui/icons";

export function CourseList({ courses }: { courses: AcademyCourseWithPrice[] }) {
  if (courses.length === 0) {
    return (
      <Vitrine hint="Yayında kurs yok. Öne çıkan kartlar vitrin düzenidir; fiyat kilidi migrate sonrası dolar.">
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ACADEMY_SHOWCASE.map((item) => (
            <li key={item.title}>
              <ListingCard
                showcase
                title={item.title}
                summary={item.summary}
                price={item.price}
                badge={item.badge}
                badgeTone="amber"
                meta={item.meta}
                href="/academy/certificates"
                cta="Sertifikalar"
                icon={<IconBook />}
              />
            </li>
          ))}
        </ul>
      </Vitrine>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <li key={course.id}>
          <ListingCard
            title={course.title}
            summary={course.summary}
            price={
              course.priceMinor
                ? formatMinor(course.priceMinor, course.currencyCode)
                : "Katalog yok"
            }
            badge={course.purchasable ? "Yayında" : "Kilit yok"}
            badgeTone={course.purchasable ? "emerald" : "amber"}
            href={`/academy/${course.slug}`}
            cta="Kursu aç"
            icon={<IconBook />}
          />
        </li>
      ))}
    </ul>
  );
}
