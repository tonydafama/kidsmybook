const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const seedPath = path.join(process.cwd(), "src", "data", "seed.ts");
const source = fs.readFileSync(seedPath, "utf8");

const match = source.match(/export const seedTasks:[\s\S]*?=\s*(\[[\s\S]*?\]);\s*export const seedEmailSignals/);
if (!match) throw new Error("Cannot locate seedTasks block in seed.ts");
const tasks = Function("return " + match[1])();

const taskRows = tasks.map((t) => ({
  id: t.id,
  project: t.project,
  task: t.task,
  owner: t.owner_name || "",
  backup_owner: t.backup_owner_name || "",
  status: t.status,
  deadline: t.deadline,
  progress: t.progress,
  priority: t.priority,
  has_owner: t.owner_name && t.owner_name.trim() ? "Yes" : "No",
  notes: t.notes || "",
}));

const projectMap = new Map();
for (const t of tasks) {
  if (!projectMap.has(t.project)) {
    projectMap.set(t.project, {
      project: t.project,
      owners: new Set(),
      task_count: 0,
      completed: 0,
      in_progress: 0,
      pending_approval: 0,
      not_started: 0,
      unassigned_tasks: 0,
    });
  }

  const record = projectMap.get(t.project);
  record.task_count += 1;

  if (t.owner_name && t.owner_name.trim()) {
    record.owners.add(t.owner_name.trim());
  } else {
    record.unassigned_tasks += 1;
  }

  if (t.status === "Completed") record.completed += 1;
  else if (t.status === "In Progress") record.in_progress += 1;
  else if (t.status === "Pending Approval") record.pending_approval += 1;
  else if (t.status === "Not Started") record.not_started += 1;
}

const projectRows = [...projectMap.values()]
  .map((r) => ({
    project: r.project,
    owners: [...r.owners].sort().join("; "),
    owner_count: r.owners.size,
    task_count: r.task_count,
    completed: r.completed,
    in_progress: r.in_progress,
    pending_approval: r.pending_approval,
    not_started: r.not_started,
    unassigned_tasks: r.unassigned_tasks,
    ownership_ok: r.owners.size > 0 && r.unassigned_tasks === 0 ? "Yes" : "No",
  }))
  .sort((a, b) => a.project.localeCompare(b.project));

const unassignedRows = tasks
  .filter((t) => !t.owner_name || !t.owner_name.trim())
  .map((t) => ({
    project: t.project,
    task: t.task,
    backup_owner: t.backup_owner_name || "",
    status: t.status,
    deadline: t.deadline,
    notes: t.notes || "",
  }));

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taskRows), "Task_Ownership_Audit");
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(projectRows), "Project_Summary");
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.json_to_sheet(unassignedRows.length ? unassignedRows : [{ message: "No unassigned tasks" }]),
  "Unassigned_Check"
);

const reportsDir = path.join(process.cwd(), "reports");
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

const outPath = path.join(reportsDir, "ownership-audit.xlsx");
XLSX.writeFile(wb, outPath);
console.log(outPath);
