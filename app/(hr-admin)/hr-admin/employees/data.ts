export type EmployeeStatus = "Active" | "On Leave" | "Probation" | "Pending";

export type EmployeeDocumentStatus = "Signed" | "Pending" | "Missing";

export type EmployeeDocument = {
  name: string;
  status: EmployeeDocumentStatus;
};

export type EmergencyContact = {
  name: string;
  phone: string;
  relation: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  squad: string;
  location: string;
  status: EmployeeStatus;
  startDate: string; // ISO string
  email: string;
  phone: string;
  manager: string;
  employmentType: string;
  workArrangement: string;
  salaryBand: string;
  avatarInitials: string;
  experience: string;
  lastReview: string;
  nextReview: string;
  annualSalary: number;
  skills: string[];
  tags: string[];
  address: string;
  emergencyContact: EmergencyContact;
  documents: EmployeeDocument[];
  timeOffBalance: {
    annual: number;
    sick: number;
    casual: number;
  };
};

export type PendingApprovalStatus = "Awaiting Review" | "Documents Pending" | "Ready";

export type PendingApproval = {
  id: string;
  name: string;
  role: string;
  department: string;
  requestedAt: string;
  experience: string;
  email: string;
  channel: "Manual signup" | "Email invite" | "Self signup" | "Referral";
  note: string;
  status: PendingApprovalStatus;
};

export const employeeDirectory: Employee[] = [
  {
    id: "EMP-1024",
    name: "Marina Adkins",
    role: "Engineering Manager",
    department: "Engineering",
    squad: "Web Platform",
    location: "Remote — GMT+6",
    status: "Active",
    startDate: "2022-01-09",
    email: "marina.adkins@ndihr.io",
    phone: "+880 1718-120-456",
    manager: "Rafiq Hasan",
    employmentType: "Full-time",
    workArrangement: "Remote",
    salaryBand: "Band H",
    avatarInitials: "MA",
    experience: "12 yrs",
    lastReview: "2024-03-11",
    nextReview: "2024-09-10",
    annualSalary: 180000,
    skills: ["People Management", "SRE", "OKR Facilitation"],
    tags: ["Leadership", "Critical talent"],
    address: "House 18, Road 6, Gulshan 2, Dhaka",
    emergencyContact: {
      name: "Sumaiya Adkins",
      phone: "+880 1999-000-123",
      relation: "Spouse",
    },
    documents: [
      { name: "Employment Contract", status: "Signed" },
      { name: "Promotion Letter", status: "Signed" },
      { name: "Device Agreement", status: "Pending" },
    ],
    timeOffBalance: {
      annual: 12,
      sick: 6,
      casual: 3,
    },
  },
  {
    id: "EMP-1098",
    name: "Caleb Noor",
    role: "Product Designer",
    department: "Product",
    squad: "Design Systems",
    location: "Dhaka HQ",
    status: "Active",
    startDate: "2023-08-24",
    email: "caleb.noor@ndihr.io",
    phone: "+880 1550-299-210",
    manager: "Anika Tashnuva",
    employmentType: "Full-time",
    workArrangement: "Hybrid",
    salaryBand: "Band F",
    avatarInitials: "CN",
    experience: "7 yrs",
    lastReview: "2024-02-02",
    nextReview: "2024-08-01",
    annualSalary: 125000,
    skills: ["Design Systems", "Prototyping", "Accessibility"],
    tags: ["Mentor", "Design Guild"],
    address: "Apartment 11B, Banani DOHS, Dhaka",
    emergencyContact: {
      name: "Ruhan Noor",
      phone: "+880 1788-112-200",
      relation: "Brother",
    },
    documents: [
      { name: "Employment Contract", status: "Signed" },
      { name: "NDA", status: "Signed" },
      { name: "Payroll Form", status: "Pending" },
    ],
    timeOffBalance: {
      annual: 8,
      sick: 4,
      casual: 2,
    },
  },
  {
    id: "EMP-0871",
    name: "Soraya Mallick",
    role: "People Partner",
    department: "People",
    squad: "People Ops",
    location: "Remote — PST",
    status: "On Leave",
    startDate: "2021-03-02",
    email: "soraya.mallick@ndihr.io",
    phone: "+1 415-555-0112",
    manager: "Mahir Islam",
    employmentType: "Full-time",
    workArrangement: "Remote",
    salaryBand: "Band G",
    avatarInitials: "SM",
    experience: "9 yrs",
    lastReview: "2024-01-15",
    nextReview: "2024-07-14",
    annualSalary: 142000,
    skills: ["People Ops", "Compliance", "Coaching"],
    tags: ["Parental leave", "DEI Council"],
    address: "471 Mission St, San Francisco, CA",
    emergencyContact: {
      name: "Farhan Mallick",
      phone: "+1 415-330-9911",
      relation: "Partner",
    },
    documents: [
      { name: "Employment Contract", status: "Signed" },
      { name: "Leave of Absence", status: "Signed" },
      { name: "Return Plan", status: "Pending" },
    ],
    timeOffBalance: {
      annual: 4,
      sick: 10,
      casual: 1,
    },
  },
  {
    id: "EMP-1210",
    name: "Julius Rahman",
    role: "QA Specialist",
    department: "Engineering",
    squad: "Core Services",
    location: "Hybrid",
    status: "Probation",
    startDate: "2024-04-15",
    email: "julius.rahman@ndihr.io",
    phone: "+880 1734-882-991",
    manager: "Marina Adkins",
    employmentType: "Full-time",
    workArrangement: "Hybrid",
    salaryBand: "Band D",
    avatarInitials: "JR",
    experience: "3 yrs",
    lastReview: "—",
    nextReview: "2024-07-20",
    annualSalary: 82000,
    skills: ["Automation", "API Testing", "Playwright"],
    tags: ["New hire"],
    address: "Sector 5, Uttara, Dhaka",
    emergencyContact: {
      name: "Tania Rahman",
      phone: "+880 1922-110-010",
      relation: "Sister",
    },
    documents: [
      { name: "Employment Contract", status: "Signed" },
      { name: "Background Check", status: "Pending" },
      { name: "Probation Plan", status: "Pending" },
    ],
    timeOffBalance: {
      annual: 2,
      sick: 1,
      casual: 1,
    },
  },
  {
    id: "EMP-1180",
    name: "Lina Bose",
    role: "Financial Analyst",
    department: "Finance",
    squad: "Planning",
    location: "Dhaka HQ",
    status: "Pending",
    startDate: "2024-06-01",
    email: "lina.bose@ndihr.io",
    phone: "+880 1315-882-210",
    manager: "Sharif Uddin",
    employmentType: "Full-time",
    workArrangement: "On-site",
    salaryBand: "Band E",
    avatarInitials: "LB",
    experience: "5 yrs",
    lastReview: "—",
    nextReview: "2024-12-15",
    annualSalary: 98000,
    skills: ["FP&A", "SQL", "Stakeholder Reporting"],
    tags: ["Offer accepted"],
    address: "Road 10, Dhanmondi, Dhaka",
    emergencyContact: {
      name: "Muni Bose",
      phone: "+880 1700-771-222",
      relation: "Mother",
    },
    documents: [
      { name: "Employment Contract", status: "Pending" },
      { name: "Tax Declaration", status: "Pending" },
      { name: "Banking Form", status: "Missing" },
    ],
    timeOffBalance: {
      annual: 0,
      sick: 0,
      casual: 0,
    },
  },
];

export const pendingApprovals: PendingApproval[] = [
  {
    id: "REQ-302",
    name: "Sadia Rahman",
    role: "HR Generalist",
    department: "People",
    requestedAt: "2024-06-09T08:30:00.000Z",
    experience: "4.5 yrs",
    email: "sadia.rahman@ndihr.io",
    channel: "Manual signup",
    note: "Background check ready for review",
    status: "Awaiting Review",
  },
  {
    id: "REQ-295",
    name: "Tahmid Aronno",
    role: "Payroll Associate",
    department: "Finance",
    requestedAt: "2024-06-08T07:15:00.000Z",
    experience: "3 yrs",
    email: "tahmid.aronno@ndihr.io",
    channel: "Self signup",
    note: "Needs compensation alignment",
    status: "Documents Pending",
  },
  {
    id: "REQ-287",
    name: "Farhana Yeasin",
    role: "People Ops Specialist",
    department: "People",
    requestedAt: "2024-06-07T05:22:00.000Z",
    experience: "5 yrs",
    email: "farhana.yeasin@ndihr.io",
    channel: "Referral",
    note: "All documents uploaded",
    status: "Ready",
  },
];

export const employeeStatusStyles: Record<
  EmployeeStatus,
  { bg: string; text: string }
> = {
  Active: {
    bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
    text: "text-emerald-700 dark:text-emerald-200",
  },
  "On Leave": {
    bg: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
    text: "text-amber-700 dark:text-amber-200",
  },
  Probation: {
    bg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200",
    text: "text-indigo-700 dark:text-indigo-200",
  },
  Pending: {
    bg: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-200",
    text: "text-purple-700 dark:text-purple-200",
  },
};

export const pendingApprovalStatusStyles: Record<
  PendingApprovalStatus,
  string
> = {
  "Awaiting Review":
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  "Documents Pending":
    "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
  Ready:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
};
