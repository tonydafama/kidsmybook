export type TaskStatus = "Not Started" | "In Progress" | "Pending Approval" | "Completed";
export type TaskPriority = "High" | "Medium" | "Low";
export type TeamRole = "manager" | "member";

export type TaskRecord = {
  id: string;
  owner_name: string;
  backup_owner_name: string | null;
  project: string;
  task: string;
  deliverables: string;
  deadline: string;
  status: TaskStatus;
  progress: number;
  priority: TaskPriority;
  procurement_note: string | null;
  approval_chain: string | null;
  notes: string | null;
  last_update: string;
};

export type EmailSignalRecord = {
  id: string;
  sender_name: string;
  email_subject: string;
  attachment_name: string | null;
  status: string;
  notes: string | null;
  target_owner_name: string | null;
  source_received_at: string | null;
};

export type TeamMemberRecord = {
  id: string;
  email: string;
  display_name: string;
  role: TeamRole;
};

export type CsvRow = Record<string, string>;
