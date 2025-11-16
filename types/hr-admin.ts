export type EmployeeStatus = "Active" | "On Leave" | "Probation" | "Pending";

export type EmployeeDocumentStatus = "Signed" | "Pending" | "Missing";

export type PendingApprovalStatus = "Awaiting Review" | "Documents Pending" | "Ready";

export type EmployeeDirectoryEntry = {
  id: string;
  employeeCode: string | null;
  name: string;
  role: string;
  department: string | null;
  squad: string | null;
  location: string | null;
  status: EmployeeStatus;
  startDate: string | null;
  email: string;
  phone: string | null;
  manager: string | null;
  employmentType: string;
  workArrangement: string | null;
  avatarInitials: string;
  experience: string;
};

export type PendingApproval = {
  id: string;
  name: string;
  role: string;
  department: string | null;
  requestedAt: string;
  experience: string;
  email: string;
  channel: "Manual signup" | "Email invite" | "Self signup" | "Referral";
  note: string;
  status: PendingApprovalStatus;
};

export type HrEmployeeDashboardResponse = {
  directory: EmployeeDirectoryEntry[];
  pendingApprovals: PendingApproval[];
};
