import type { CsvRow, EmailSignalRecord, TaskRecord, TaskPriority, TaskStatus } from "../types";

export const parseCsv = (text: string): CsvRow[] => {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      currentCell += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      if (currentCell.length > 0 || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
      }
      currentCell = "";
      currentRow = [];
      continue;
    }
    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];
  const [headers, ...dataRows] = rows;

  return dataRows
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) =>
      headers.reduce<CsvRow>((acc, header, idx) => {
        acc[header] = row[idx] || "";
        return acc;
      }, {})
    );
};

const normalizeStatus = (value: string): TaskStatus => {
  if (value === "Completed") return "Completed";
  if (value === "Pending Approval") return "Pending Approval";
  if (value === "Not Started") return "Not Started";
  return "In Progress";
};

const normalizePriority = (value: string): TaskPriority => {
  if (value === "High" || value === "Medium" || value === "Low") return value;
  return "Medium";
};

const estimateProgress = (status: TaskStatus): number => {
  if (status === "Completed") return 100;
  if (status === "Pending Approval") return 85;
  if (status === "Not Started") return 10;
  return 60;
};

export const dashboardSeedCsvToTasks = (rows: CsvRow[]): TaskRecord[] => {
  return rows.map((row, index) => {
    const status = normalizeStatus(row.status || "In Progress");
    const progress = Number(row.progress || row.completion_pct || "");
    return {
      id: `csv-task-${index + 1}`,
      owner_name: row.owner || "Unassigned",
      backup_owner_name: row.backup_owner || null,
      project: row.project || "General",
      task: row.task || "Untitled task",
      deliverables: row.deliverables || row.next_action || "Pending details",
      deadline: row.deadline || new Date().toISOString().slice(0, 10),
      status,
      progress: Number.isFinite(progress) && progress >= 0 ? Math.min(progress, 100) : estimateProgress(status),
      priority: normalizePriority(row.priority || "Medium"),
      procurement_note: row.procurement || row.blocker || null,
      approval_chain: row.approval_chain || null,
      notes: row.notes || row.next_action || null,
      last_update: row.last_update || new Date().toISOString().slice(0, 10),
    };
  });
};

export const auditCsvToSignals = (rows: CsvRow[]): EmailSignalRecord[] => {
  return rows.map((row, index) => ({
    id: `csv-email-${index + 1}`,
    sender_name: row.sender || "Unknown",
    email_subject: row.email_subject || "No Subject",
    attachment_name: row.attachment || null,
    status: row.status || "indexed",
    notes: row.notes || null,
    target_owner_name: row.sender || null,
    source_received_at: null,
  }));
};
