"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod/v3";

import { FAQ } from "../components/FAQ";
import Text from "../components/atoms/Text/Text";
import Button from "../components/atoms/buttons/Button";
import { Card } from "../components/atoms/frame/Card";
import TextArea from "../components/atoms/inputs/TextArea";
import TextInput from "../components/atoms/inputs/TextInput";
import Header from "../components/navigations/Header";

const schema = z.object({
  subject: z.string().nonempty("Subject is required"),
  email: z
    .string()
    .nonempty("Email is required")
    .email("Please enter a valid email address"),
  message: z.string().nonempty("Message is required"),
});

type FormData = z.infer<typeof schema>;

const contactChannels = [
  {
    label: "Email",
    value: "support@ndi.hr",
    helper: "Average response under 2 hours during business days.",
  },
  {
    label: "Live chat",
    value: "Weekdays • 7 am – 7 pm GMT",
    helper: "Look for the chat bubble inside the app.",
  },
  {
    label: "Emergency pager",
    value: "+1 (855) 555‑0199",
    helper: "24/7 coverage for critical HR outages.",
  },
];

const responseHighlights = [
  { metric: "97%", label: "Satisfaction", helper: "CSAT across the last 90 days" },
  { metric: "< 1h", label: "Median response", helper: "High-priority tickets" },
  { metric: "Global", label: "Coverage", helper: "7 regional success pods" },
];

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "Go to Login → “Forgot password” and enter your work email. Our reset links stay valid for 30 minutes.",
  },
  {
    question: "How do I update my profile information?",
    answer: "Head to Profile → Edit. Save changes to sync with payroll automatically.",
  },
  {
    question: "Who do I contact for technical issues?",
    answer: "Use the form on this page or email support@ndi.hr for assistance.",
  },
  {
    question: "How do I submit a leave request?",
    answer: "From the dashboard, open Leave → New application and follow the guided form.",
  },
  {
    question: "Can I manage multiple departments?",
    answer:
      "Yes. HR Admins can create and assign departments under Settings → Organization.",
  },
];

function SupportPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleOnSubmit = (data: FormData) => {
    console.log("Support inquiry submitted:", data);
    alert("Your inquiry has been submitted. We will get back to you shortly.");
    reset();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-6 pb-16">
      <div className="fixed left-6 right-6 top-12 z-40">
        <Header />
      </div>

      <section className="mx-auto max-w-6xl pt-32">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-10 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/60">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  customer success
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  We’re on call for every HR question
                </h1>
                <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
                  Send us a note and the right specialist will respond with a clear plan of action.
                  We include references, product walkthroughs, and follow-up timelines for every ticket.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {responseHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center dark:border-slate-800/70 dark:bg-slate-900/60"
                  >
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {item.metric}
                    </p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.helper}</p>
                  </div>
                ))}
              </div>
            </div>
            <Card className="border border-slate-100 bg-slate-900 text-slate-100 shadow-lg shadow-slate-900/40">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">direct lines</p>
                {contactChannels.map((channel) => (
                  <div
                    key={channel.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-200">
                      {channel.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">{channel.value}</p>
                    <p className="text-sm text-slate-300">{channel.helper}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-white/70 bg-white/95 p-8 shadow-lg shadow-indigo-100 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-900/50">
            <div className="mb-6">
              <Text
                text="Submit an inquiry"
                className="text-2xl font-semibold text-slate-900 dark:text-white"
              />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Include as much context as possible. Links, screenshots, or ticket numbers help us
                respond faster.
              </p>
            </div>
            <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-5">
              <TextInput
                label="Subject"
                isRequired
                placeholder="Brief description of your request"
                register={register}
                name="subject"
                error={errors.subject}
              />
              <TextInput
                label="Work email"
                isRequired
                placeholder="you@ndi.team"
                register={register}
                name="email"
                error={errors.email}
              />
              <TextArea
                label="Message"
                isRequired
                placeholder="Describe the workflow, the users affected, and what you expected to happen."
                register={register}
                name="message"
                error={errors.message}
                height="160px"
              />
              <Button type="submit" theme="primary" isWidthFull disabled={isSubmitting}>
                <Text
                  text={isSubmitting ? "Sending..." : "Send to support"}
                  className="text-[16px] font-semibold"
                />
              </Button>
            </form>
          </Card>

          <Card className="border border-slate-100 bg-slate-50/80 p-8 shadow-inner dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-4">
              <Text
                text="Self-serve answers"
                className="text-lg font-semibold text-slate-900 dark:text-white"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Our most common questions, refreshed weekly.
              </p>
            </div>
            <FAQ faqs={faqs} />
          </Card>
        </div>
      </section>
    </div>
  );
}

export default SupportPage;
