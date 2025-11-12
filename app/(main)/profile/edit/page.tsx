"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/atoms/buttons/Button";
import ImageInput from "../../../components/atoms/inputs/ImageInput";
import PasswordInput from "../../../components/atoms/inputs/PasswordInput";
import TextArea from "../../../components/atoms/inputs/TextArea";
import TextInput from "../../../components/atoms/inputs/TextInput";
import { Card } from "../../../components/atoms/frame/Card";
import { Modal } from "../../../components/atoms/frame/Modal";
import Text from "../../../components/atoms/Text/Text";
import SelectBox from "../../../components/atoms/selectBox/SelectBox";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Prefer not to say", value: "none" },
];

const workModelOptions = [
  { label: "Onsite", value: "onsite" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Remote", value: "remote" },
];

const employmentTypeOptions = [
  { label: "Full Time", value: "full-time" },
  { label: "Part Time", value: "part-time" },
  { label: "Contract", value: "contract" },
];

const helperChecklist = [
  {
    title: "Upload a recent headshot",
    detail: "Boosts trust across the org chart",
  },
  {
    title: "Keep emergency info fresh",
    detail: "HR depends on accurate contacts during travel",
  },
  {
    title: "Share your working pattern",
    detail: "Helps teammates schedule with empathy",
  },
];

function EditProfilePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="glass-panel items-center justify-between gap-4 text-slate-600 transition-colors duration-200 dark:text-slate-300 md:flex-row">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
            Profile centre
          </p>
          <Text
            text="Keep your profile current and actionable."
            className="text-xl font-semibold text-slate-900 dark:text-slate-100"
          />
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            The more context you share, the easier it is for HR and your squad
            to support you.
          </p>
        </div>
        <Button theme="secondary" onClick={() => router.push("/profile")}>
          View Public Profile
        </Button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card title="Personal Basics" isTransparentBackground>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <ImageInput
                id="profilePic"
                onChange={(event) => console.log(event.target.files)}
              />
              <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Profile photo
                </p>
                <p>JPG or PNG · Max 5 MB · Square crop recommended.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="First Name" defaultValue="Md. Rafidul" />
              <TextInput label="Last Name" defaultValue="Islam" />
              <SelectBox label="Gender" options={genderOptions} name="gender" />
              <TextInput label="Date of Birth" defaultValue="01 Jan, 1996" />
              <TextInput label="Nationality" defaultValue="Bangladeshi" />
              <SelectBox
                label="Preferred Work Model"
                options={workModelOptions}
                name="workModel"
              />
            </div>
            <TextArea
              label="About me / Elevator pitch"
              placeholder="Give teammates a quick snapshot of what drives you and how you like to collaborate."
              defaultValue="Frontend engineer passionate about crafting dependable HR workflows and mentoring new joiners."
            />
          </div>
        </Card>

        <Card title="Profile Checklist" isTransparentBackground>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            {helperChecklist.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-900/60"
              >
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {item.title}
                </p>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6">
        <Card title="Contact & Address" isTransparentBackground>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Work Email" defaultValue="rafid@ndi.hr" />
            <TextInput label="Personal Email" defaultValue="rafid.personal@example.com" />
            <TextInput label="Work Phone" defaultValue="+880 1711-000000" />
            <TextInput label="Personal Phone" defaultValue="+880 1911-000000" />
            <TextInput
              label="Home Address"
              defaultValue="Comilla, Chittagong, Bangladesh"
            />
            <TextInput
              label="Current Address"
              defaultValue="Mohakhali, Dhaka, Bangladesh"
            />
          </div>
        </Card>

        <Card title="Professional Details" isTransparentBackground>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Employee ID" defaultValue="2023080021004" />
            <TextInput label="Designation" defaultValue="Software Engineer" />
            <TextInput label="Department" defaultValue="Frontend" />
            <TextInput label="Reporting Manager" defaultValue="Shahriar Duke" />
            <SelectBox
              label="Employment Type"
              name="employmentType"
              options={employmentTypeOptions}
            />
            <TextInput label="Joining Date" defaultValue="17 Aug, 2023" />
            <TextInput label="Primary Location" defaultValue="Dhaka HQ" />
            <TextInput label="Current Project" defaultValue="HR Core" />
          </div>
        </Card>

        <Card title="Emergency & Support" isTransparentBackground>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Emergency Contact Person" defaultValue="Shahriar Duke" />
            <TextInput label="Relationship" defaultValue="Brother" />
            <TextInput label="Emergency Phone" defaultValue="+880 1811-000000" />
            <TextInput label="Alternate Phone" defaultValue="+880 1710-222222" />
            <TextArea
              label="Health notes / considerations"
              placeholder="Share allergies or important medical guidance so HR can support you better."
            />
          </div>
        </Card>

        <Card title="Bank & Payroll" isTransparentBackground>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Bank Name" defaultValue="Eastern Bank Ltd." />
            <TextInput label="Account Holder" defaultValue="Md. Rafidul Islam" />
            <TextInput label="Account Number" defaultValue="1234 5678 9123" />
            <TextInput label="Branch" defaultValue="Gulshan Avenue, Dhaka" />
            <TextInput label="SWIFT / IFSC" defaultValue="EBLDBDDH" />
            <TextInput label="Tax ID (TIN)" defaultValue="12345-12345-12345" />
          </div>
        </Card>
      </section>

      <div className="flex flex-wrap justify-end gap-4">
        <Button theme="secondary" onClick={() => router.push("/profile")}>
          Cancel
        </Button>
        <Button onClick={() => setIsModalOpen(true)}>Save Changes</Button>
      </div>

      <Modal
        title="Save changes?"
        open={isModalOpen}
        setOpen={setIsModalOpen}
        isDoneButton
        doneButtonText="Confirm"
        isCancelButton
        cancelButtonText="Keep editing"
        buttonWidth="140px"
        buttonHeight="44px"
        onDoneClick={() => router.push("/profile")}
        closeOnClick={() => setIsModalOpen(false)}
        crossOnClick={() => setIsModalOpen(false)}
      >
        <Text
          className="text-sm text-slate-600 dark:text-slate-300"
          text="Please confirm with your password before saving these updates."
        />
        <PasswordInput label="Password" />
      </Modal>
    </div>
  );
}

export default EditProfilePage;
