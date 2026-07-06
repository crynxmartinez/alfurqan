import Image from "next/image";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { getPhoto, searchPhotos } from "@/lib/pexels";

export const revalidate = 86400;

export default async function HomePage() {
  const [heroPhoto, highlightPhotos] = await Promise.all([
    getPhoto("islamic mosque architecture"),
    searchPhotos("students studying classroom", 3),
  ]);

  const highlights = [
    {
      title: "Qualified Teachers",
      desc: "Experienced educators guiding both Islamic studies and academic subjects.",
    },
    {
      title: "Transparent Grading",
      desc: "Parents and students can check grades anytime — no login required.",
    },
    {
      title: "Balanced Curriculum",
      desc: "Quran, Islamic studies, and modern academics taught side by side.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950">
        <div className="absolute inset-0 bg-geo-pattern opacity-10" />
        {heroPhoto && (
          <Image
            src={heroPhoto.src.large2x}
            alt={heroPhoto.alt || "Islamic architecture"}
            fill
            priority
            className="object-cover opacity-30"
          />
        )}
        <div className="relative mx-auto flex max-w-7xl flex-col items-start px-6 py-28 md:py-36">
          <span className="mb-4 inline-block rounded-full border border-brand-400 px-4 py-1 text-xs font-medium uppercase tracking-widest text-brand-200">
            Est. Al-Furqan Madrasah
          </span>
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight text-white md:text-6xl">
            Knowledge, Character &amp; Faith — Together
          </h1>
          <p className="mt-6 max-w-xl text-lg text-brand-200">
            A madrasah dedicated to nurturing students academically and
            spiritually, with full transparency for parents and students.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/grades"
              className="rounded-md bg-white px-7 py-3 text-sm font-semibold text-brand-950 transition hover:bg-brand-100"
            >
              Check Your Grades
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </section>

      <div className="geo-divider" />

      {/* About */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-bold text-brand-900">
          About Our Madrasah
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-brand-600">
          Al-Furqan Madrasah is committed to providing a balanced education —
          combining Quranic and Islamic studies with a strong academic
          foundation. We believe every student deserves an environment built
          on discipline, sincerity, and excellence.
        </p>
      </section>

      {/* Highlights */}
      <section className="bg-brand-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-bold text-brand-900">
            Why Al-Furqan
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {highlights.map((item, i) => {
              const photo = highlightPhotos[i];
              return (
                <div
                  key={item.title}
                  className="overflow-hidden rounded-xl border border-brand-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-44 w-full bg-brand-200">
                    {photo && (
                      <Image
                        src={photo.src.large}
                        alt={photo.alt || item.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-brand-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-brand-600">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-brand-900 py-20">
        <div className="absolute inset-0 bg-geo-pattern opacity-10" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-white">
            Check Your Grades Anytime
          </h2>
          <p className="mt-4 text-brand-200">
            Select the school year, class, and subject to view grade records
            — fully transparent, no account needed.
          </p>
          <Link
            href="/grades"
            className="mt-8 inline-block rounded-md bg-white px-8 py-3 text-sm font-semibold text-brand-950 transition hover:bg-brand-100"
          >
            Go to Grade Lookup
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
