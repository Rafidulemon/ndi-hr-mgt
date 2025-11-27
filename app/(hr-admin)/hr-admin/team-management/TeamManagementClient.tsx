"use client";

import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiUsers, FiUserPlus } from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";
import TextInput from "@/app/components/atoms/inputs/TextInput";
import TextArea from "@/app/components/atoms/inputs/TextArea";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import type { HrTeamPerson } from "@/types/hr-team";
import { TEAM_MANAGEMENT_ROLES } from "@/types/hr-team";
import { trpc } from "@/trpc/client";

type AlertState = { type: "success" | "error"; message: string } | null;

const AlertBanner = ({ alert }: { alert: AlertState }) => {
  if (!alert) return null;
  const Icon = alert.type === "success" ? FiCheckCircle : FiAlertCircle;
  const baseClasses =
    alert.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
      : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200";
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${baseClasses}`}>
      <Icon className="text-base" />
      <p className="font-semibold">{alert.message}</p>
    </div>
  );
};

const MemberPill = ({ person }: { person: HrTeamPerson }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-left shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{person.fullName}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400">
      {person.designation ?? person.teamName ?? "Role coming soon"}
    </p>
  </div>
);

const emptyStateIllustrations = [
  "No teams yet. Start by creating your first squad.",
  "Assign a lead to unlock capacity planning.",
  "Map teammates to squads so reporting stays accurate.",
];

export default function TeamManagementClient() {
  const utils = trpc.useUtils();
  const overviewQuery = trpc.hrTeam.overview.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const createTeamMutation = trpc.hrTeam.createTeam.useMutation();
  const assignLeadMutation = trpc.hrTeam.assignLead.useMutation();
  const assignMembersMutation = trpc.hrTeam.assignMembers.useMutation();

  const data = overviewQuery.data;
  const canManage = data?.canManage ?? false;

  const [createForm, setCreateForm] = useState({
    name: "",
    departmentId: "",
    description: "",
  });
  const [alert, setAlert] = useState<AlertState>(null);
  const [pendingLeadTeam, setPendingLeadTeam] = useState<string | null>(null);
  const [pendingMemberTeam, setPendingMemberTeam] = useState<string | null>(null);
  const [leadEdits, setLeadEdits] = useState<Record<string, string>>({});
  const [memberEdits, setMemberEdits] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!alert) return;
    const timer = window.setTimeout(() => setAlert(null), 5000);
    return () => window.clearTimeout(timer);
  }, [alert]);

  const baseLeadSelection: Record<string, string> = data?.teams
    ? data.teams.reduce<Record<string, string>>((acc, team) => {
        acc[team.id] = team.lead?.userId ?? "";
        return acc;
      }, {})
    : {};

  const baseMemberSelection: Record<string, string[]> = data?.teams
    ? data.teams.reduce<Record<string, string[]>>((acc, team) => {
        acc[team.id] = team.memberUserIds;
        return acc;
      }, {})
    : {};

  const memberSelectSize = useMemo(() => {
    const total = data?.employees.length ?? 4;
    return Math.min(10, Math.max(4, total));
  }, [data?.employees.length]);

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) {
      setAlert({
        type: "error",
        message: "Only managers, org admins, or super admins can change teams.",
      });
      return;
    }

    if (!createForm.name.trim() || !createForm.departmentId) {
      setAlert({ type: "error", message: "Provide both a team name and a department." });
      return;
    }

    createTeamMutation.mutate(
      {
        name: createForm.name.trim(),
        departmentId: createForm.departmentId,
        description: createForm.description.trim() ? createForm.description.trim() : undefined,
      },
      {
        onSuccess: () => {
          setCreateForm({ name: "", departmentId: "", description: "" });
          setAlert({ type: "success", message: "Team created successfully." });
          void utils.hrTeam.overview.invalidate();
        },
        onError: (error) => {
          setAlert({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleLeadChange = (teamId: string, value: string) => {
    setLeadEdits((prev) => ({ ...prev, [teamId]: value }));
  };

  const handleMembersChange = (teamId: string, options: HTMLCollectionOf<HTMLOptionElement>) => {
    const selectedValues = Array.from(options).map((option) => option.value);
    setMemberEdits((prev) => ({ ...prev, [teamId]: selectedValues }));
  };

  const handleSaveLead = (teamId: string) => {
    if (!canManage) {
      setAlert({
        type: "error",
        message: "Only manager, org admin, or super admin roles can change leads.",
      });
      return;
    }
    const selectedLead =
      leadEdits[teamId] ?? baseLeadSelection[teamId] ?? "";
    setPendingLeadTeam(teamId);
    assignLeadMutation.mutate(
      {
        teamId,
        leadUserId: selectedLead.length ? selectedLead : null,
      },
      {
        onSuccess: () => {
          setLeadEdits((prev) => {
            const next = { ...prev };
            delete next[teamId];
            return next;
          });
          setAlert({ type: "success", message: "Team lead updated." });
          void utils.hrTeam.overview.invalidate();
        },
        onError: (error) => setAlert({ type: "error", message: error.message }),
        onSettled: () => setPendingLeadTeam(null),
      },
    );
  };

  const handleSaveMembers = (teamId: string) => {
    if (!canManage) {
      setAlert({
        type: "error",
        message: "You need manager, org admin, or super admin rights to change members.",
      });
      return;
    }
    const selectedMembers = memberEdits[teamId] ?? baseMemberSelection[teamId] ?? [];
    setPendingMemberTeam(teamId);
    assignMembersMutation.mutate(
      {
        teamId,
        memberUserIds: selectedMembers,
      },
      {
        onSuccess: () => {
          setMemberEdits((prev) => {
            const next = { ...prev };
            delete next[teamId];
            return next;
          });
          setAlert({ type: "success", message: "Team members updated." });
          void utils.hrTeam.overview.invalidate();
        },
        onError: (error) => setAlert({ type: "error", message: error.message }),
        onSettled: () => setPendingMemberTeam(null),
      },
    );
  };

  if (overviewQuery.isLoading) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-md dark:border-slate-700/70 dark:bg-slate-900/70">
        <LoadingSpinner
          label="Loading team management"
          helper="Fetching teams, departments, and eligible teammates."
        />
      </div>
    );
  }

  if (overviewQuery.error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
        <p className="text-lg font-semibold">We couldn’t load the team data.</p>
        <p className="text-sm text-rose-600 dark:text-rose-300">
          {overviewQuery.error.message}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const viewerRole = data.viewerRole;
  const roleList = TEAM_MANAGEMENT_ROLES.join(", ");

  return (
    <div className="space-y-8">
      <header className="space-y-3 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
          <FiUsers />
          Team Operations
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Team Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create squads, assign leads, and keep every teammate aligned to the right pod.
            Only {roleList} can make changes. You are signed in as {viewerRole}.
          </p>
        </div>
      </header>

      <AlertBanner alert={alert} />

      {!canManage ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="text-base font-semibold">Read-only access</p>
          <p className="text-sm">
            Managers, org admins, or super admins can make changes. Contact your workspace
            admin to request access.
          </p>
        </div>
      ) : null}

      {canManage ? (
        <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900/5 p-3 text-indigo-600 dark:bg-white/5 dark:text-indigo-300">
              <FiUserPlus className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Create a new team
              </h2>
              <p className="text-sm text-slate-500">
                Give the team a memorable name, attach it to a department, and describe what they do.
              </p>
            </div>
          </div>
          <form className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr]" onSubmit={handleCreateSubmit}>
            <div>
              <TextInput
                label="Team name"
                placeholder="Growth, Platform, Customer Care..."
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, name: event.target.value }))
                }
                disabled={createTeamMutation.isPending}
                isRequired
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Department</label>
              <select
                value={createForm.departmentId}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, departmentId: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/30"
                disabled={createTeamMutation.isPending}
              >
                <option value="">Select a department</option>
                {data.departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <TextArea
                label="Team mission"
                placeholder="What problems does this team own? Where do they focus?"
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, description: event.target.value }))
                }
                disabled={createTeamMutation.isPending}
                height="130px"
                className="w-full"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={createTeamMutation.isPending}>
                {createTeamMutation.isPending ? "Creating..." : "Save team"}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Manage teams</h2>
          <p className="text-sm text-slate-500">
            Assign leads, map members, and keep an eye on who still needs placement.
          </p>
        </div>

        {data.teams.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-slate-500 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              No teams yet
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {emptyStateIllustrations.map((tip) => (
                <li key={tip}>&middot; {tip}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid gap-6">
            {data.teams.map((team) => {
              const memberValues =
                memberEdits[team.id] ?? baseMemberSelection[team.id] ?? team.memberUserIds;
              const selectedLeadValue =
                leadEdits[team.id] ?? baseLeadSelection[team.id] ?? team.lead?.userId ?? "";
              const pendingLead = pendingLeadTeam === team.id && assignLeadMutation.isPending;
              const pendingMembers =
                pendingMemberTeam === team.id && assignMembersMutation.isPending;
              return (
                <div
                  key={team.id}
                  className="space-y-6 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/80"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {team.departmentName}
                      </p>
                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {team.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {team.description ?? "No description provided yet."}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-900/5 px-4 py-3 text-right text-slate-900 dark:bg-white/5 dark:text-white">
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Headcount
                      </p>
                      <p className="text-3xl font-semibold">{team.memberCount}</p>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-600">Team lead</p>
                        <p className="text-xs text-slate-500">
                          Pick who owns rituals, sprint plans, and approvals.
                        </p>
                      </div>
                      <select
                        value={selectedLeadValue}
                        onChange={(event) => handleLeadChange(team.id, event.target.value)}
                        disabled={!canManage}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/30"
                      >
                        <option value="">No lead selected</option>
                        {data.employees.map((employee) => (
                          <option key={employee.userId} value={employee.userId}>
                            {employee.fullName}
                            {employee.designation ? ` • ${employee.designation}` : ""}
                            {employee.teamName && employee.teamId !== team.id
                              ? ` (Currently ${employee.teamName})`
                              : ""}
                          </option>
                        ))}
                      </select>
                      <Button
                        theme="secondary"
                        onClick={() => handleSaveLead(team.id)}
                        disabled={!canManage || pendingLead}
                      >
                        {pendingLead ? "Saving..." : "Save lead"}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-600">Members</p>
                        <p className="text-xs text-slate-500">
                          Multi-select teammates to invite them into this pod.
                        </p>
                      </div>
                      <select
                        multiple
                        size={memberSelectSize}
                        value={memberValues}
                        onChange={(event) => handleMembersChange(team.id, event.target.selectedOptions)}
                        disabled={!canManage}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner shadow-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/30"
                      >
                        {data.employees.map((employee) => (
                          <option key={employee.userId} value={employee.userId}>
                            {employee.fullName}
                            {employee.designation ? ` • ${employee.designation}` : ""}
                            {employee.teamName && employee.teamId !== team.id
                              ? ` (Currently ${employee.teamName})`
                              : employee.teamName
                                ? " (Already here)"
                                : " (Unassigned)"}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => handleSaveMembers(team.id)}
                        disabled={!canManage || pendingMembers}
                      >
                        {pendingMembers ? "Updating..." : "Update members"}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-600">
                      Snapshot ({team.memberCount} teammate{team.memberCount === 1 ? "" : "s"})
                    </p>
                    {team.memberPreview.length ? (
                      <div className="flex flex-wrap gap-3">
                        {team.memberPreview.map((member) => (
                          <MemberPill key={member.userId} person={member} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No members assigned yet.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
