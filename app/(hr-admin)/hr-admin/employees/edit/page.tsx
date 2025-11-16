import Link from "next/link";

import Button from "../../../../components/atoms/buttons/Button";
import TextArea from "../../../../components/atoms/inputs/TextArea";
import TextInput from "../../../../components/atoms/inputs/TextInput";
import { EmployeeHeader } from "../../../../components/layouts/EmployeeHeader";

import {
  employeeDirectory,
  type Employee,
  type EmployeeStatus,
} from "../data";

type PageProps = {
  searchParams?: {
    employeeId?: string | string[];
  };
};

const statusOptions: EmployeeStatus[] = [
  "Active",
  "On Leave",
  "Probation",
  "Pending",
];

const employmentTypes = ["Full-time", "Part-time", "Contract"];
const workArrangements = ["Remote", "Hybrid", "On-site"];
const departmentOptions = [
  "Engineering",
  "Product",
  "People",
  "Finance",
  "Operations",
];

const resolveEmployee = (
  searchParams: PageProps["searchParams"]
): { employee: Employee | null; isFallback: boolean } => {
  if (!employeeDirectory.length) {
    return { employee: null, isFallback: false };
  }

  const employeeParam = searchParams?.employeeId;
  const employeeId = Array.isArray(employeeParam)
    ? employeeParam[0]
    : employeeParam;

  if (!employeeId) {
    return { employee: employeeDirectory[0], isFallback: true };
  }

  const normalizedId = employeeId.trim().toLowerCase();
  if (!normalizedId) {
    return { employee: employeeDirectory[0], isFallback: true };
  }

  const match = employeeDirectory.find(
    (person) => person.id.toLowerCase() === normalizedId
  );

  if (!match) {
    return { employee: employeeDirectory[0], isFallback: true };
  }

  return { employee: match, isFallback: false };
};

export default function EditEmployeePage({ searchParams }: PageProps) {
  const { employee, isFallback } = resolveEmployee(searchParams);

  if (!employee) {
    return (
      <section className="rounded-[32px] border border-dashed border-slate-200 bg-white/95 p-10 text-center shadow-xl shadow-indigo-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-200">
          Employee management
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
          No employee data yet
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Add employees from the Employee Management page to start editing profiles.
        </p>
        <Link
          href="/hr-admin/employees"
          className="mt-6 inline-flex items-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Back to directory
        </Link>
      </section>
    );
  }

  const joiningDate = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(employee.startDate));

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <EmployeeHeader
          name={employee.name}
          designation={employee.role}
          joining_date={joiningDate}
        />
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/hr-admin/employees/view?employeeId=${encodeURIComponent(employee.id)}`}
            className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:text-slate-200"
          >
            View profile
          </Link>
          <Button>Save changes</Button>
        </div>
        {isFallback ? (
          <p className="text-xs text-slate-500">
            Showing sample employee. Use the Employee Management table to edit a specific profile.
          </p>
        ) : null}
      </div>

      <form className="space-y-6">
        <div className="rounded-[32px] border border-white/60 bg-white/95 p-8 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Personal information
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Keep their core profile details up to date.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Full name"
                id="fullName"
                name="fullName"
                defaultValue={employee.name}
                className="w-full"
              />
              <TextInput
                label="Preferred name"
                id="preferredName"
                name="preferredName"
                defaultValue={employee.name.split(" ")[0]}
                className="w-full"
              />
              <TextInput
                label="Email address"
                id="email"
                name="email"
                type="email"
                defaultValue={employee.email}
                className="w-full"
              />
              <TextInput
                label="Phone number"
                id="phone"
                name="phone"
                type="tel"
                defaultValue={employee.phone}
                className="w-full"
              />
              <TextArea
                label="Residential address"
                id="address"
                name="address"
                defaultValue={employee.address}
                className="md:col-span-2 w-full"
                height="120px"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white/95 p-8 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Employment data
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update squad, manager, and compensation details.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Employee ID"
                id="employeeId"
                name="employeeId"
                defaultValue={employee.id}
                readOnly
                className="w-full"
              />
              <div className="flex flex-col">
                <label className="mb-2 text-[16px] font-bold text-text_bold dark:text-slate-200">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  defaultValue={employee.department}
                  className="rounded-[5px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-200/70 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <TextInput
                label="Squad / Team"
                id="squad"
                name="squad"
                defaultValue={employee.squad}
                className="w-full"
              />
              <TextInput
                label="Reporting manager"
                id="manager"
                name="manager"
                defaultValue={employee.manager}
                className="w-full"
              />
              <div className="flex flex-col">
                <label className="mb-2 text-[16px] font-bold text-text_bold dark:text-slate-200">
                  Employment type
                </label>
                <select
                  id="employmentType"
                  name="employmentType"
                  defaultValue={employee.employmentType}
                  className="rounded-[5px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-200/70 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {employmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-[16px] font-bold text-text_bold dark:text-slate-200">
                  Work arrangement
                </label>
                <select
                  id="workArrangement"
                  name="workArrangement"
                  defaultValue={employee.workArrangement}
                  className="rounded-[5px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-200/70 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {workArrangements.map((arrangement) => (
                    <option key={arrangement} value={arrangement}>
                      {arrangement}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-[16px] font-bold text-text_bold dark:text-slate-200">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={employee.status}
                  className="rounded-[5px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-200/70 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <TextInput
                label="Salary band"
                id="salaryBand"
                name="salaryBand"
                defaultValue={employee.salaryBand}
                className="w-full"
              />
              <TextInput
                label="Annual salary (USD)"
                id="annualSalary"
                name="annualSalary"
                type="number"
                defaultValue={employee.annualSalary.toString()}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white/95 p-8 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-none">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Emergency contact
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                HR relies on this for urgent communication.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <TextInput
                label="Name"
                id="emergencyName"
                name="emergencyName"
                defaultValue={employee.emergencyContact.name}
                className="w-full"
              />
              <TextInput
                label="Phone"
                id="emergencyPhone"
                name="emergencyPhone"
                type="tel"
                defaultValue={employee.emergencyContact.phone}
                className="w-full"
              />
              <TextInput
                label="Relation"
                id="emergencyRelation"
                name="emergencyRelation"
                defaultValue={employee.emergencyContact.relation}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href={`/hr-admin/employees/view?employeeId=${encodeURIComponent(employee.id)}`}
            className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:text-slate-200"
          >
            Cancel
          </Link>
          <Button>Save changes</Button>
        </div>
      </form>
    </div>
  );
}
