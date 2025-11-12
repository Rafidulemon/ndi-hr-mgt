"use client"
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

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "Go to the Login page, click on 'Forgot Password', and follow the instructions.",
  },
  {
    question: "How do I update my profile information?",
    answer:
      "Navigate to the Profile section in the dashboard and click 'Edit'.",
  },
  {
    question: "Who do I contact for technical issues?",
    answer:
      "Use the form on this page or email support@hrms.com for assistance.",
  },
  {
    question: "How do I submit a leave request?",
    answer:
      "Go to the 'Leave' section in the dashboard and click on 'Request Leave'.",
  },
  {
    question: "Can I manage multiple departments?",
    answer:
      "Yes, you can add and manage multiple departments from the 'Departments' section.",
  },
];

function SupportPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleOnSubmit = (data: FormData) => {
    console.log("Support inquiry submitted:", data);
    alert("Your inquiry has been submitted. We will get back to you shortly.");
  };

  return (
    <div className="max-w-screen min-h-screen p-6 bg-[#ECECEC]">
      <div className="fixed top-12 left-6 right-6 z-40">
        <Header />
      </div>
      <div className="pt-32 px-6">
        <div className="mb-10">
          <Text
            text="Support"
            className="text-black text-[32px] font-semibold text-center"
          />
          <Text
            text="Need assistance? We're here to help. Submit your inquiry below or check out our FAQs for quick answers."
            className="text-black text-[16px] text-center mt-4"
          />
        </div>
        <div className="grid grid-cols-2 gap-10">
          <Card className="p-6 rounded-lg shadow-md">
            <Text
              text="Submit an Inquiry"
              className="text-black text-[20px] font-semibold mb-6"
            />
            <form
              onSubmit={handleSubmit(handleOnSubmit)}
              className="flex flex-col gap-4"
            >
              <TextInput
                label="Subject"
                isRequired
                placeholder="Brief description of your issue"
                register={register}
                name="subject"
                error={errors.subject}
              />
              <TextInput
                label="Email"
                isRequired
                placeholder="your.email@example.com"
                register={register}
                name="email"
                error={errors.email}
              />
              <TextArea
                label="Message"
                isRequired
                placeholder="Describe your issue or question in detail"
                register={register}
                name="message"
                error={errors.message}
              />
              <Button type="submit" theme="primary" isWidthFull>
                <Text text="Submit" className="text-[16px] font-semibold" />
              </Button>
            </form>
          </Card>

          <Card className="p-6 rounded-lg shadow-md" background="primary">
            <Text
              text="Frequently Asked Questions"
              className="text-white text-[20px] font-semibold mb-4"
            />
            <FAQ faqs={faqs} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SupportPage;
