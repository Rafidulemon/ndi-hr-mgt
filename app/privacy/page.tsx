import Text from "../components/atoms/Text/Text";
import Header from "../components/navigations/Header";

const principles = [
  {
    title: "Transparency",
    description: "We clearly explain how data is collected, processed, and stored across every HR workflow.",
  },
  {
    title: "Security",
    description: "Data is encrypted in transit and at rest. Access is gated by role-based controls and audited hourly.",
  },
  {
    title: "Control",
    description: "Admins can export, amend, or delete employee data at any time through the dashboard or API.",
  },
];

const policySections = [
  {
    title: "1. Information we collect",
    bullets: [
      "Profile data provided by admins and employees (name, email, role, employment information).",
      "Usage data such as login timestamps, device type, and feature interactions.",
      "Support artifacts like attachments or transcripts that you voluntarily share.",
    ],
  },
  {
    title: "2. How we use information",
    bullets: [
      "Operate and improve HR workflows including onboarding, attendance, payroll, and analytics.",
      "Provide support, send notifications, and surface insights that keep teams compliant.",
      "Fulfil legal requirements, including tax reporting and employment regulations.",
    ],
  },
  {
    title: "3. Data protection & retention",
    bullets: [
      "We host in ISO 27001 certified data centers with annual penetration tests.",
      "Backups are encrypted, regionally redundant, and retained for 35 days.",
      "Customer data is retained for the life of the contract plus 90 days unless deletion is requested sooner.",
    ],
  },
  {
    title: "4. Your rights",
    bullets: [
      "Request access, correction, or deletion of personal data through the admin console.",
      "Export data in CSV or JSON at any time without a support ticket.",
      "Object to certain processing or withdraw consent where applicable under GDPR/CCPA.",
    ],
  },
  {
    title: "5. Third-party processors",
    bullets: [
      "We only partner with vetted sub‑processors for infrastructure, communications, and analytics.",
      "A current list of processors, their locations, and purpose of processing is available on request.",
    ],
  },
  {
    title: "6. Changes to this policy",
    bullets: [
      "We’ll post updates here and alert workspace owners at least 14 days before material changes take effect.",
      "Past revisions are archived and accessible through support.",
    ],
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 pb-20 text-white">
      <div className="fixed left-6 right-6 top-12 z-40">
        <Header />
      </div>

      <main className="mx-auto max-w-5xl pt-32">
        <section className="rounded-[32px] border border-white/10 bg-white/10 p-10 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            privacy center
          </p>
          <Text text="Privacy Policy" className="mt-3 text-4xl font-semibold text-white" />
          <p className="mt-4 max-w-3xl text-base text-slate-200">
            This policy describes how NDI HR handles the personal data entrusted to us. It applies to
            every workspace that uses our employee experience platform worldwide.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {principles.map((principle) => (
              <div key={principle.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{principle.title}</p>
                <p className="mt-2 text-sm text-slate-200">{principle.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 space-y-6">
          {policySections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100 backdrop-blur"
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-[28px] border border-emerald-200/40 bg-emerald-500/10 p-8 text-emerald-50">
          <h3 className="text-2xl font-semibold text-white">Questions, audits, or DPAs?</h3>
          <p className="mt-2 text-sm text-emerald-100">
            Email privacy@ndi.hr for a signed data processing agreement, a list of sub‑processors, or to
            schedule a compliance review.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:privacy@ndi.hr"
              className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Contact privacy team
            </a>
            <a
              href="/terms"
              className="inline-flex items-center rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-white"
            >
              Review terms of service
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PrivacyPage;
