import Header from "../components/navigations/Header";
import Text from "../components/atoms/Text/Text";

function TermsPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] px-6 py-6 text-[color:var(--foreground)] transition-colors duration-200">
      <div className="fixed left-6 right-6 top-12 z-40">
        <Header />
      </div>
      <div className="mx-auto max-w-5xl px-6 pt-32">
        <div className="mb-10 text-center">
          <Text
            text="Terms and Conditions"
            className="text-3xl font-semibold text-slate-900 transition-colors duration-200 dark:text-slate-100"
          />
          <Text
            text="Please read these Terms and Conditions carefully before using our services."
            className="mt-4 text-base text-slate-600 transition-colors duration-200 dark:text-slate-400"
          />
        </div>
        <div className="prose prose-slate mx-auto dark:prose-invert">
          <h2>1. Introduction</h2>
          <p>
            Welcome to our website. By accessing or using our services, you agree to be bound by these Terms and Conditions.
            If you do not agree to these terms, please refrain from using our services.
          </p>

          <h2>2. Services Provided</h2>
          <p>
            We offer Human Resource (HR) management software, including tools for managing employee records, payroll, 
            leave requests, time tracking, and more.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To access certain features, you must register for an account. You agree to provide accurate, current, and 
            complete information during the registration process and to update such information as necessary.
          </p>

          <h2>4. User Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to notify us 
            immediately of any unauthorized use of your account.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>
            You agree to use our services in a lawful and ethical manner. You will not engage in any activity that may harm 
            or disrupt the services or infringe on others&apos; rights.
          </p>

          <h2>6. Privacy Policy</h2>
          <p>
            Your privacy is important to us. Please review our <a href="/privacy-policy">Privacy Policy</a> to understand 
            how we collect and use your personal information.
          </p>

          <h2>7. Fees and Payments</h2>
          <p>
            We may charge fees for certain services. All fees will be outlined at the time of purchase. You agree to pay 
            all applicable fees as outlined in the billing section.
          </p>

          <h2>8. Termination</h2>
          <p>
            We may suspend or terminate your account if we believe you have violated these Terms and Conditions. You may 
            terminate your account at any time by contacting our support team.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            We are not liable for any direct, indirect, incidental, or consequential damages resulting from the use or 
            inability to use our services.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms and Conditions are governed by the laws of the jurisdiction in which we operate. Any disputes 
            arising from these terms will be resolved in the courts of that jurisdiction.
          </p>

          <h2>11. Changes to the Terms</h2>
          <p>
            We reserve the right to update or change these Terms and Conditions at any time. Any changes will be posted on 
            this page, and the revised date will be updated accordingly.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us at support@hrms.com.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
