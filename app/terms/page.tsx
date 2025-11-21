import Header from "../components/navigations/Header";
import Text from "../components/atoms/Text/Text";

const sections = [
  {
    title: "1. Introduction",
    body: [
      "By accessing NDI HR, you agree to the Terms detailed below. If you’re accepting on behalf of an organization, you represent that you have authority to bind that organization to these Terms.",
    ],
  },
  {
    title: "2. Services Provided",
    body: [
      "We provide a suite of HR tools including onboarding, leave, performance and payroll automation.",
      "Beta features may change or be discontinued at any time without notice.",
    ],
  },
  {
    title: "3. Account Registration",
    body: [
      "Provide accurate information when creating an account and keep credentials confidential.",
      "Admins are responsible for permissions granted to teammates and contractors.",
    ],
  },
  {
    title: "4. Responsible Use",
    body: [
      "Do not use the platform to store unlawful content or disrupt other tenants.",
      "Security testing or scraping without prior written approval is prohibited.",
    ],
  },
  {
    title: "5. Fees & Billing",
    body: [
      "Invoices are due Net 30 unless a different order form is executed.",
      "Late payments may result in service suspension after a 7‑day grace period.",
    ],
  },
  {
    title: "6. Termination",
    body: [
      "You may export data and close the workspace at any time by contacting support.",
      "We may suspend or terminate access for material breach or unpaid invoices.",
    ],
  },
  {
    title: "7. Limitation of Liability",
    body: [
      "NDI HR is provided “as is”. Our total liability is limited to fees paid in the preceding 12 months.",
      "We are not liable for indirect, incidental, or consequential damages.",
    ],
  },
  {
    title: "8. Governing Law",
    body: [
      "These Terms are governed by the laws of England & Wales, unless a different jurisdiction is listed in your order form.",
      "Disputes will be handled exclusively in the competent courts of the governing jurisdiction.",
    ],
  },
  {
    title: "9. Updates",
    body: [
      "We may update these Terms to reflect product changes or legal requirements.",
      "Material changes will be announced in-product or via email at least 14 days before taking effect.",
    ],
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-slate-50 to-slate-100 px-6 pb-16 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 dark:text-slate-100">
      <div className="fixed left-6 right-6 top-12 z-40">
        <Header />
      </div>

      <div className="mx-auto max-w-5xl pt-32">
        <section className="rounded-[32px] border border-white/60 bg-white/95 p-10 text-center shadow-xl shadow-indigo-100 dark:border-slate-800/70 dark:bg-slate-900/85 dark:shadow-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
            legal center
          </p>
          <Text
            text="Terms & Conditions"
            className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white"
          />
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">
            These Terms describe how you may use the NDI HR platform. They include your responsibilities,
            payment obligations, limits of liability, and where disputes will be resolved.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Effective date", value: "05 Jan 2025" },
              { label: "Last update", value: "05 Jan 2025" },
              { label: "Contact", value: "legal@ndi.hr" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-sm shadow-slate-200 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-900/40"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {section.body.map((paragraph, index) => (
                  <li key={index} className="leading-relaxed">
                    {paragraph}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-[28px] border border-indigo-100 bg-indigo-50/70 p-8 text-slate-900 shadow-inner dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-white">
          <h3 className="text-2xl font-semibold">Need an executed copy?</h3>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
            Enterprise customers can request a countersigned PDF or a data processing agreement at any time.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:legal@ndi.hr"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Email legal
            </a>
            <a
              href="/privacy"
              className="inline-flex items-center rounded-xl border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              Review privacy policy
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TermsPage;
