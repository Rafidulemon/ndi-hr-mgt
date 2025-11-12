import Text from "../components/atoms/Text/Text";
import { Card } from "../components/atoms/frame/Card";
import Header from "../components/navigations/Header";

function PrivacyPage() {
  return (
    <div className="max-w-screen min-h-screen p-6 bg-[#ECECEC]">
      <div className="fixed top-12 left-6 right-6 z-40">
        <Header />
      </div>
      <div className="pt-32 px-6">
        <div className="mb-10 text-center">
          <Text
            text="Privacy Policy"
            className="text-black text-[32px] font-semibold"
          />
          <Text
            text="Your privacy is important to us. Please read this policy to understand how we collect, use, and protect your personal information."
            className="text-black text-[16px] mt-4"
          />
        </div>

        <div className="grid grid-cols-1 gap-10">
          <Card className="p-6 rounded-lg shadow-md bg-white">
            <Text text="1. Introduction" className="text-[20px] font-semibold" />
            <Text className="mt-2 text-[16px]" text="This Privacy Policy explains how we collect, use, and safeguard your
              personal information when you use our website and services. By using
              our services, you agree to the collection and use of information in
              accordance with this policy."/>
          </Card>

          <Card className="p-6 rounded-lg shadow-md bg-white">
            <Text text="2. Information We Collect" className="text-[20px] font-semibold" />
            <Text className="mt-2 text-[16px]" text="We collect various types of information to provide and improve our
              services:"/>
              <ul className="list-disc ml-6 mt-2">
                <li>Personal Information: Name, email, etc.</li>
                <li>Usage Data: How you interact with our services.</li>
                <li>Cookies and Tracking Technologies: For enhancing user experience.</li>
              </ul>
          </Card>

          <Card className="p-6 rounded-lg shadow-md bg-white">
            <Text text="3. How We Use Your Information" className="text-[20px] font-semibold" />
            <Text className="mt-2 text-[16px]" text="We use the information we collect in the following ways:"/>
              <ul className="list-disc ml-6 mt-2">
                <li>To provide and improve our services</li>
                <li>To communicate with you about updates, offers, and support</li>
                <li>To personalize your experience and respond to inquiries</li>
              </ul>
          </Card>

          <Card className="p-6 rounded-lg shadow-md bg-white">
            <Text text="4. Data Protection" className="text-[20px] font-semibold" />
            <Text className="mt-2 text-[16px]" text="We implement various security measures to protect your personal
              information from unauthorized access, alteration, or disclosure."/>
          </Card>

          <Card className="p-6 rounded-lg shadow-md bg-white">
            <Text text="5. Your Rights" className="text-[20px] font-semibold" />
            <Text className="mt-2 text-[16px]" text="You have the right to:"/>
              
              <ul className="list-disc ml-6 mt-2">
                <li>Access, update, or delete your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability or restriction of processing</li>
              </ul>
          </Card>

          <Card className="p-6 rounded-lg shadow-md bg-white">
            <Text text="6. Changes to This Privacy Policy" className="text-[20px] font-semibold" />
            <Text className="mt-2 text-[16px]" text="We may update this Privacy Policy periodically. We will notify you
              of any changes by posting the updated policy on this page with an updated
              revision date."/>
          </Card>

          <Card className="p-6 rounded-lg shadow-md bg-white">
            <Text text="7. Contact Us" className="text-[20px] font-semibold" />
            <Text className="mt-2 text-[16px]" text="If you have any questions about this Privacy Policy, please contact us at:"/>
              
              <br />
              <a href="mailto:support@yourdomain.com" className="text-primary font-semibold">
                support@yourdomain.com
              </a>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
