import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { GradeLookup } from "./grade-lookup";

export default function GradesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteNavbar />

      <section className="relative overflow-hidden bg-brand-900 py-16">
        <div className="absolute inset-0 bg-geo-pattern opacity-10" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Check Student Grades
          </h1>
          <p className="mt-3 text-brand-200">
            Select a school year, class, and subject to view grade records.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <GradeLookup />
      </section>

      <SiteFooter />
    </div>
  );
}
