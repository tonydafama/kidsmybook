const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const HEAD_OWNER = "Anthony CHENG";

const seedPath = path.join(process.cwd(), "src", "data", "seed.ts");
const source = fs.readFileSync(seedPath, "utf8");
const match = source.match(/export const seedTasks:[\s\S]*?=\s*(\[[\s\S]*?\]);\s*export const seedEmailSignals/);
if (!match) throw new Error("Cannot locate seedTasks block in seed.ts");
const tasks = Function("return " + match[1])();

const activeTasks = tasks
  .filter((t) => t.owner_name !== HEAD_OWNER && t.status !== "Completed")
  .sort((a, b) => {
    const ownerCmp = String(a.owner_name).localeCompare(String(b.owner_name));
    if (ownerCmp !== 0) return ownerCmp;
    const projectCmp = String(a.project).localeCompare(String(b.project));
    if (projectCmp !== 0) return projectCmp;
    return String(a.deadline).localeCompare(String(b.deadline));
  });

const updateRows = activeTasks.map((t, idx) => ({
  row_no: idx + 1,
  task_id: t.id,
  owner_name: t.owner_name,
  backup_owner_name: t.backup_owner_name || "",
  project: t.project,
  task: t.task,
  deliverables: t.deliverables,
  current_status: t.status,
  current_progress_percent: t.progress,
  current_deadline: t.deadline,
  new_status: "",
  new_progress_percent: "",
  new_deadline: "",
  update_note: "",
  blocker: "",
  next_action: "",
  reply_by_staff: "",
  reply_date: "",
  manager_review: "",
}));

const guideRows = [
  {
    field: "task_id",
    required: "Yes",
    format: "Keep original value",
    notes: "Unique key. Do not edit.",
  },
  {
    field: "owner_name",
    required: "Yes",
    format: "Text",
    notes: "Owner currently assigned. Keep same unless manager approved reassignment.",
  },
  {
    field: "new_status",
    required: "Yes",
    format: "Not Started / In Progress / Pending Approval / Completed",
    notes: "Team member must choose one status.",
  },
  {
    field: "new_progress_percent",
    required: "Yes",
    format: "0-100",
    notes: "Integer only.",
  },
  {
    field: "new_deadline",
    required: "If changed",
    format: "YYYY-MM-DD",
    notes: "Leave blank if no deadline change.",
  },
  {
    field: "update_note",
    required: "Yes",
    format: "Text",
    notes: "What has been done since last update.",
  },
  {
    field: "blocker",
    required: "If any",
    format: "Text",
    notes: "Dependencies or issues blocking progress.",
  },
  {
    field: "next_action",
    required: "Yes",
    format: "Text",
    notes: "Next concrete step and timing.",
  },
  {
    field: "reply_by_staff",
    required: "Yes",
    format: "Text",
    notes: "Name of staff who submitted this update.",
  },
  {
    field: "reply_date",
    required: "Yes",
    format: "YYYY-MM-DD",
    notes: "Submission date.",
  },
];

const statusRows = [
  { allowed_status: "Not Started" },
  { allowed_status: "In Progress" },
  { allowed_status: "Pending Approval" },
  { allowed_status: "Completed" },
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(updateRows), "Task_Update_Form");
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(guideRows), "Field_Guide");
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statusRows), "Status_Options");

const reportsDir = path.join(process.cwd(), "reports");
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

const outPath = path.join(reportsDir, "team-task-update-template.xlsx");
XLSX.writeFile(wb, outPath);
console.log(outPath);
