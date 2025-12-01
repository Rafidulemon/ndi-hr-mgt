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
  profilePhotoUrl: string | null;
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

import type { EmploymentType, UserRole } from "@prisma/client";

export type HrInviteRoleOption = {
  value: UserRole;
  label: string;
};

export type HrManualInviteOptions = {
  organizationDomain: string | null;
  organizationName: string;
  departments: Array<{ id: string; name: string }>;
  managers: Array<{ id: string; name: string; role: UserRole; designation: string | null }>;
  locations: string[];
  employmentTypes: Array<{ value: EmploymentType; label: string }>;
  allowedRoles: HrInviteRoleOption[];
};

export type HrEmployeeDashboardResponse = {
  directory: EmployeeDirectoryEntry[];
  pendingApprovals: PendingApproval[];
  viewerRole: UserRole;
  manualInvite: HrManualInviteOptions;
};

export type HrEmployeeDocument = {
  name: string;
  status: EmployeeDocumentStatus;
};

export type HrEmployeeEmergencyContact = {
  name: string;
  phone: string;
  relation: string;
};

export type HrEmployeeLeaveBalances = {
  annual: number;
  sick: number;
  casual: number;
  parental: number;
};

export type HrEmployeeProfile = {
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
  profilePhotoUrl: string | null;
  experience: string;
  address: string | null;
  emergencyContact: HrEmployeeEmergencyContact | null;
  leaveBalances: HrEmployeeLeaveBalances;
  tags: string[];
  skills: string[];
  documents: HrEmployeeDocument[];
  salaryBand: string | null;
  annualSalary: number | null;
  lastReview: string | null;
  nextReview: string | null;
};

export type HrEmployeeProfileResponse = {
  profile: HrEmployeeProfile;
};

export type HrEmployeeForm = {
  id: string;
  employeeCode: string | null;
  fullName: string;
  preferredName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
  department: string | null;
  employmentType: string;
  workArrangement: string | null;
  workLocation: string | null;
  startDate: string | null;
  status: EmployeeStatus;
  emergencyContact: HrEmployeeEmergencyContact | null;
  profilePhotoUrl: string | null;
  leaveBalances: HrEmployeeLeaveBalances;
};

export type HrEmployeeFormResponse = {
  form: HrEmployeeForm;
};

export type HrEmployeeUpdateInput = {
  employeeId: string;
  fullName: string;
  preferredName?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: string;
  department?: string | null;
  employmentType: string;
  workArrangement?: string | null;
  workLocation?: string | null;
  startDate?: string | null;
  status: EmployeeStatus;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  emergencyRelation?: string | null;
};

export type HrEmployeeLeaveQuotaUpdateInput = {
  employeeId: string;
  annual: number;
  sick: number;
  casual: number;
  parental: number;
};

export type HrEmployeeLeaveQuotaResponse = {
  leaveBalances: HrEmployeeLeaveBalances;
};

export type HrEmployeeInviteResponse = {
  userId: string;
  email: string;
  role: UserRole;
  invitationSent: boolean;
  inviteUrl: string;
};

export type HrEmployeeInviteInput = {
  fullName: string;
  workEmail: string;
  inviteRole: UserRole;
  designation: string;
  departmentId?: string | null;
  managerId?: string | null;
  startDate?: string | null;
  workLocation?: string | null;
  employmentType: EmploymentType;
  notes?: string | null;
  sendInvite?: boolean;
};
