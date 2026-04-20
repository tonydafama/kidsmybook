import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { seedTasks } from "./data/seed";
import type { TaskRecord, TaskStatus } from "./types";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";

type Tab = "Overview" | "Projects" | "Team" | "Timeline";

const TABS: Tab[] = ["Overview", "Projects", "Team", "Timeline"];
const statusOptions: TaskStatus[] = ["Not Started", "In Progress", "Pending Approval", "Completed"];
const today = new Date("2026-04-16");
const HEAD_OWNER = "Anthony CHENG";

const fmtDate = (v: string | Date) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const daysUntil = (dateString: string) => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return 999;
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
};

const statusClass = (s: TaskStatus) => (s === "Completed" ? "pill done" : s === "In Progress" ? "pill ongoing" : s === "Pending Approval" ? "pill tender" : "pill upcoming");
const statusLabel = (s: TaskStatus) => (s === "Completed" ? "Updated" : s);

const categoryOf = (project: string) => {
  const p = project.toLowerCase();
  if (p.includes("ijso")) return "IJSO";
  if (p.includes("imo") || p.includes("uso")) return "USO";
  if (p.includes("hkyt") || p.includes("mypt")) return "YPT";
  if (p.includes("hkgap") || p.includes("gap")) return "HKGAP";
  if (p.includes("competition")) return "Competition";
  return "Administration";
};

const categoryClass = (c: string) =>
  c === "IJSO" || c === "USO"
    ? "cat usoc"
    : c === "YPT"
      ? "cat ypt"
      : c === "HKGAP"
        ? "cat hkgap"
        : c === "Competition"
          ? "cat competition"
          : "cat admin";

const normalizeStatus = (value: string): TaskStatus => {
  if (value === "In Progress" || value === "Pending Approval" || value === "Completed") return value;
  return "Not Started";
};

const normalizePriority = (value: string): "High" | "Medium" | "Low" => {
  if (value === "High" || value === "Low") return value;
  return "Medium";
};

const toTaskRecord = (row: Record<string, unknown>): TaskRecord => ({
  id: String(row.id ?? ""),
  owner_name: String(row.owner_name ?? ""),
  backup_owner_name: row.backup_owner_name ? String(row.backup_owner_name) : null,
  project: String(row.project ?? ""),
  task: String(row.task ?? ""),
  deliverables: String(row.deliverables ?? ""),
  deadline: String(row.deadline ?? ""),
  status: normalizeStatus(String(row.status ?? "Not Started")),
  progress: Number(row.progress ?? 0),
  priority: normalizePriority(String(row.priority ?? "Medium")),
  procurement_note: row.procurement_note ? String(row.procurement_note) : null,
  approval_chain: row.approval_chain ? String(row.approval_chain) : null,
  notes: row.notes ? String(row.notes) : null,
  last_update: String(row.last_update ?? today.toISOString().slice(0, 10)),
});

export default function App() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [tasks, setTasks] = useState<TaskRecord[]>(seedTasks);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timelineProject, setTimelineProject] = useState("All");
  const [banner, setBanner] = useState("Ready. Click any row to update task progress.");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<TaskRecord | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [booting, setBooting] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [taskDraft, setTaskDraft] = useState({
    owner_name: "Bob TO",
    project: "",
    task: "",
    deliverables: "",
    deadline: "",
    status: "Not Started" as TaskStatus,
    progress: "0",
  });

  const liveMode = Boolean(isSupabaseConfigured && supabase);

  const loadTasksFromSupabase = useCallback(async (silent = false) => {
    if (!supabase || !session) return;
    setSyncing(true);
    const { data, error } = await supabase.from("tasks").select("*").order("deadline", { ascending: true });
    setSyncing(false);
    if (error) {
      if (!silent) setBanner(`Live sync failed: ${error.message}`);
      return;
    }
    setTasks((data ?? []).map((row) => toTaskRecord(row as Record<string, unknown>)));
    if (!silent) setBanner("Live sync completed.");
  }, [session]);

  useEffect(() => {
    const supabaseClient = supabase;
    if (!liveMode || !supabaseClient) {
      setBooting(false);
      return;
    }

    const init = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setSession(data.session ?? null);
      setBooting(false);
    };
    void init();

    const { data: sub } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [liveMode]);

  useEffect(() => {
    if (!liveMode || !session) return;
    void loadTasksFromSupabase(true);
  }, [liveMode, session, loadTasksFromSupabase]);

  useEffect(() => {
    const supabaseClient = supabase;
    if (!liveMode || !session || !supabaseClient) return;

    const channel = supabaseClient
      .channel(`tasks-live-${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          void loadTasksFromSupabase(true);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setBanner("Live sync connected. Team updates will auto-refresh.");
        }
      });

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [liveMode, session, loadTasksFromSupabase]);

  const visibleTasks = useMemo(
    () => tasks.filter((t) => t.owner_name !== HEAD_OWNER && t.status !== "Completed"),
    [tasks]
  );

  const owners = useMemo(() => Array.from(new Set(visibleTasks.map((t) => t.owner_name))).sort(), [visibleTasks]);
  const projects = useMemo(() => Array.from(new Set(visibleTasks.map((t) => t.project))).sort(), [visibleTasks]);

  const rows = useMemo(
    () =>
      visibleTasks
        .map((t) => ({ ...t, category: categoryOf(t.project), days: daysUntil(t.deadline) }))
        .filter((r) => {
          if (ownerFilter !== "All" && r.owner_name !== ownerFilter) return false;
          if (statusFilter !== "All" && r.status !== statusFilter) return false;
          if (search && !`${r.task} ${r.project} ${r.owner_name}`.toLowerCase().includes(search.toLowerCase())) return false;
          return true;
        })
        .sort((a, b) => a.days - b.days),
    [visibleTasks, ownerFilter, statusFilter, search]
  );

  const rowsByOwner = useMemo(
    () =>
      rows.reduce<Record<string, typeof rows>>((acc, row) => {
        if (!acc[row.owner_name]) acc[row.owner_name] = [];
        acc[row.owner_name].push(row);
        return acc;
      }, {}),
    [rows]
  );

  const upcoming = useMemo(() => rows.filter((r) => r.days >= 0 && r.days <= 30 && r.status !== "Completed"), [rows]);
  const nearestDeadlines = useMemo(
    () => rows.filter((r) => r.status !== "Completed").slice(0, 12),
    [rows]
  );
  const overviewRows = upcoming.length > 0 ? upcoming : nearestDeadlines;

  const timelineRows = useMemo(
    () =>
      visibleTasks
        .filter((t) => (timelineProject === "All" ? true : t.project === timelineProject))
        .map((t) => ({ ...t, days: daysUntil(t.deadline) }))
        .sort((a, b) => a.days - b.days),
    [visibleTasks, timelineProject]
  );

  const counts = useMemo(
    () => ({
      total: visibleTasks.length,
      ongoing: visibleTasks.filter((t) => t.status === "In Progress").length,
      upcoming: visibleTasks.filter((t) => t.status === "Not Started" || t.status === "Pending Approval").length,
      urgent: visibleTasks.filter((t) => daysUntil(t.deadline) <= 30).length,
    }),
    [visibleTasks]
  );

  const ownershipAudit = useMemo(() => {
    const unassignedTasks = tasks.filter((t) => !t.owner_name || !t.owner_name.trim() || t.owner_name.toLowerCase() === "tbd");
    const projectOwnerMap = new Map<string, Set<string>>();
    for (const t of tasks) {
      if (!projectOwnerMap.has(t.project)) projectOwnerMap.set(t.project, new Set());
      if (t.owner_name && t.owner_name.trim()) projectOwnerMap.get(t.project)?.add(t.owner_name.trim());
    }
    const projectsWithoutOwner = [...projectOwnerMap.entries()].filter(([, ownersSet]) => ownersSet.size === 0).map(([project]) => project);
    return { unassignedTasks, projectsWithoutOwner };
  }, [tasks]);

  const openEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setEditingId(id);
    setEditing({ ...task });
  };

  const saveEdit = () => {
    if (!editingId || !editing) return;
    const next = { ...editing, last_update: today.toISOString().slice(0, 10) };

    if (liveMode && supabase && session) {
      void (async () => {
        const { error } = await supabase
          .from("tasks")
          .update({
            owner_name: next.owner_name,
            backup_owner_name: next.backup_owner_name,
            project: next.project,
            task: next.task,
            deliverables: next.deliverables,
            deadline: next.deadline,
            status: next.status,
            progress: next.progress,
            priority: next.priority,
            procurement_note: next.procurement_note,
            approval_chain: next.approval_chain,
            notes: next.notes,
            last_update: next.last_update,
          })
          .eq("id", editingId);

        if (error) {
          setBanner(`Update failed: ${error.message}`);
          return;
        }
        setTasks((prev) => prev.map((t) => (t.id === editingId ? next : t)));
        setBanner(`Updated: ${next.task}`);
      })();
    } else {
      setTasks((prev) => prev.map((t) => (t.id === editingId ? next : t)));
      setBanner(`Updated: ${next.task}`);
    }
    setEditingId(null);
    setEditing(null);
  };

  const addTask = () => {
    if (!taskDraft.owner_name || !taskDraft.project || !taskDraft.task || !taskDraft.deadline) {
      setBanner("Please fill Owner, Project, Task and Deadline.");
      return;
    }

    const next: TaskRecord = {
      id: `task-${Date.now()}`,
      owner_name: taskDraft.owner_name,
      backup_owner_name: null,
      project: taskDraft.project,
      task: taskDraft.task,
      deliverables: taskDraft.deliverables || "Pending details",
      deadline: taskDraft.deadline,
      status: taskDraft.status,
      progress: Math.min(100, Math.max(0, Number(taskDraft.progress) || 0)),
      priority: daysUntil(taskDraft.deadline) <= 30 ? "High" : "Medium",
      procurement_note: null,
      approval_chain: null,
      notes: "Added by manager",
      last_update: today.toISOString().slice(0, 10),
    };

    if (liveMode && supabase && session) {
      void (async () => {
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            owner_name: next.owner_name,
            backup_owner_name: next.backup_owner_name,
            project: next.project,
            task: next.task,
            deliverables: next.deliverables,
            deadline: next.deadline,
            status: next.status,
            progress: next.progress,
            priority: next.priority,
            procurement_note: next.procurement_note,
            approval_chain: next.approval_chain,
            notes: next.notes,
            last_update: next.last_update,
          })
          .select("*")
          .single();

        if (error) {
          setBanner(`Create failed: ${error.message}`);
          return;
        }
        setTasks((prev) => [toTaskRecord(data as Record<string, unknown>), ...prev]);
        setBanner(`Added task for ${next.owner_name}`);
      })();
    } else {
      setTasks((prev) => [next, ...prev]);
      setBanner(`Added task for ${next.owner_name}`);
    }
    setTaskDraft({
      owner_name: taskDraft.owner_name,
      project: taskDraft.project,
      task: "",
      deliverables: "",
      deadline: "",
      status: "Not Started",
      progress: "0",
    });
  };

  const sendMagicLink = async () => {
    if (!supabase || !authEmail.trim()) return;
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBanner(error ? `Login link failed: ${error.message}` : "Magic link sent. Please check your email.");
  };

  const signInWithPassword = async () => {
    if (!supabase || !authEmail.trim() || !authPassword.trim()) return;
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(),
      password: authPassword,
    });
    setBanner(error ? `Login failed: ${error.message}` : "Signed in.");
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setBanner("Signed out.");
  };

  if (booting) {
    return (
      <div className="app">
        <main className="wrap main">
          <section className="panel">
            <h3>Loading dashboard...</h3>
            <p className="muted">Initializing {liveMode ? "Live Mode" : "Demo Mode"}.</p>
          </section>
        </main>
      </div>
    );
  }

  if (liveMode && !session) {
    return (
      <div className="app">
        <header className="header">
          <div className="wrap">
            <div className="heading">
              <div>
                <p className="topline">THE HONG KONG ACADEMY FOR GIFTED EDUCATION</p>
                <h1>SI Competitions &amp; Deadlines Dashboard</h1>
                <p className="subline">Live Mode - Team Login Required</p>
              </div>
            </div>
          </div>
        </header>
        <main className="wrap main">
          <section className="panel">
            <h3>Sign in to update tasks</h3>
            <div className="form-grid">
              <input
                placeholder="Email"
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
              <input
                placeholder="Password (optional if using magic link)"
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="primary-btn" onClick={sendMagicLink}>
                Send Magic Link
              </button>
              <button onClick={signInWithPassword}>Sign in with Password</button>
            </div>
            <p className="muted">Use company email. After login, updates are shared to all users in real time data source.</p>
            <p className="muted">{banner}</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="wrap">
          <div className="heading">
            <div>
              <p className="topline">THE HONG KONG ACADEMY FOR GIFTED EDUCATION</p>
              <h1>SI Competitions &amp; Deadlines Dashboard</h1>
              <p className="subline">Programme Manager: Anthony CHENG | Head: Marius CHOW</p>
            </div>
            <p className="asof">
              Data as of {fmtDate(today)} {liveMode ? `| Live: ${syncing ? "Syncing..." : "Connected"}` : "| Demo"}
            </p>
          </div>
          <nav className="tabbar">
            {TABS.map((t) => (
              <button key={t} className={tab === t ? "tab active" : "tab"} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
            {liveMode && (
              <button className="tab" onClick={signOut}>
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="wrap main">
        <div className="status-banner">{banner}</div>
        <section className="kpis">
          <div className="kpi total">
            <p>Total Projects</p>
            <h2>{counts.total}</h2>
          </div>
          <div className="kpi ongoing">
            <p>Ongoing</p>
            <h2>{counts.ongoing}</h2>
          </div>
          <div className="kpi upcoming">
            <p>Upcoming / Tender</p>
            <h2>{counts.upcoming}</h2>
          </div>
          <div className="kpi urgent">
            <p>Urgent (30 days)</p>
            <h2>{counts.urgent}</h2>
          </div>
        </section>

        {tab === "Overview" && (
          <section className="panel">
            <h3>{upcoming.length > 0 ? "Upcoming Deadlines (Next 30 Days)" : "Nearest Deadlines (No 30-day item found)"}</h3>
            <p className="muted">
              Ownership check:{" "}
              {ownershipAudit.unassignedTasks.length === 0 && ownershipAudit.projectsWithoutOwner.length === 0
                ? "All tasks/projects have owner assigned."
                : "Some items need owner assignment."}
            </p>
            {overviewRows.length === 0 && <p className="muted">No task data available.</p>}
            {overviewRows.map((r) => (
              <div className="deadline-row" key={r.id}>
                <div className={r.days <= 14 ? "days-chip urgent" : "days-chip"}>{r.days}d</div>
                <div className="deadline-main">
                  <p>{r.task}</p>
                  <span>{fmtDate(r.deadline)}</span>
                </div>
                <span className={categoryClass(r.category)}>{r.category}</span>
                <span className={statusClass(r.status)}>{statusLabel(r.status)}</span>
                {(r.days <= 14 || r.priority === "High") && <span className="urgent-pill">URGENT</span>}
              </div>
            ))}
          </section>
        )}

        {tab === "Projects" && (
          <section className="panel">
            <div className="filter-row">
              <input className="search" placeholder="Search project/task..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
                <option value="All">All People</option>
                {owners.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
              <span className="shown">{rows.length} active tasks</span>
            </div>

            {Object.keys(rowsByOwner).length === 0 && <p className="muted">No result under current filter.</p>}
            {Object.entries(rowsByOwner).map(([owner, ownerRows]) => (
              <div key={owner} className="owner-section">
                <h4 className="owner-title">
                  {owner} <span>{ownerRows.length} tasks</span>
                </h4>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>PROJECT</th>
                        <th>TASK</th>
                        <th>CATEGORY</th>
                        <th>STATUS</th>
                        <th>DEADLINE</th>
                        <th>DAYS LEFT</th>
                        <th>IN-CHARGE</th>
                        <th>DELIVERABLES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ownerRows.map((r) => (
                        <tr key={r.id} onClick={() => openEdit(r.id)} className={r.days <= 14 && r.days >= 0 ? "row-urgent" : ""}>
                          <td>{r.project}</td>
                          <td className="taskcol">{r.task}</td>
                          <td>
                            <span className={categoryClass(r.category)}>{r.category}</span>
                          </td>
                          <td>
                            <span className={statusClass(r.status)}>{statusLabel(r.status)}</span>
                          </td>
                          <td>{fmtDate(r.deadline)}</td>
                          <td className={r.days <= 14 ? "red" : ""}>{r.days}d</td>
                          <td>{r.owner_name}</td>
                          <td className="deliver">{r.deliverables}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === "Team" && (
          <div className="dual-grid">
            <section className="panel">
              <h3>Owner Workload</h3>
              <div className="owner-grid">
                {owners.map((o) => (
                  <div className="owner-card" key={o}>
                    <p>{o}</p>
                    <span>{visibleTasks.filter((t) => t.owner_name === o).length} tasks</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <h3>Quick Add Task Menu</h3>
              <div className="form-grid">
                <select value={taskDraft.owner_name} onChange={(e) => setTaskDraft((p) => ({ ...p, owner_name: e.target.value }))}>
                  {owners.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>

                <select value={taskDraft.project} onChange={(e) => setTaskDraft((p) => ({ ...p, project: e.target.value }))}>
                  <option value="">Select existing project</option>
                  {projects.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <input placeholder="Task name" value={taskDraft.task} onChange={(e) => setTaskDraft((p) => ({ ...p, task: e.target.value }))} />
                <input type="date" value={taskDraft.deadline} onChange={(e) => setTaskDraft((p) => ({ ...p, deadline: e.target.value }))} />

                <select value={taskDraft.status} onChange={(e) => setTaskDraft((p) => ({ ...p, status: e.target.value as TaskStatus }))}>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
                <input placeholder="Progress %" value={taskDraft.progress} onChange={(e) => setTaskDraft((p) => ({ ...p, progress: e.target.value }))} />

                <textarea
                  placeholder="Deliverables / notes"
                  value={taskDraft.deliverables}
                  onChange={(e) => setTaskDraft((p) => ({ ...p, deliverables: e.target.value }))}
                />
              </div>
              <button className="primary-btn" onClick={addTask}>
                <Plus size={14} /> Add Task
              </button>
            </section>
          </div>
        )}

        {tab === "Timeline" && (
          <section className="panel">
            <div className="filter-row">
              <select value={timelineProject} onChange={(e) => setTimelineProject(e.target.value)}>
                <option value="All">All Projects</option>
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span className="shown">{timelineRows.length} tasks in timeline</span>
            </div>

            <div className="timeline">
              {timelineRows.map((u) => (
                <div key={u.id} className="timeline-item" onClick={() => openEdit(u.id)}>
                  <div className="dot" />
                  <div>
                    <p>
                      {u.project} - {u.task}
                    </p>
                    <span>
                      {fmtDate(u.deadline)} · {u.owner_name} · {u.days}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {editingId && editing && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Update Task</h3>
            <label>Owner</label>
            <select value={editing.owner_name} onChange={(e) => setEditing((p) => (p ? { ...p, owner_name: e.target.value } : p))}>
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <label>Status</label>
            <select value={editing.status} onChange={(e) => setEditing((p) => (p ? { ...p, status: e.target.value as TaskStatus } : p))}>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            <label>Deadline</label>
            <input type="date" value={editing.deadline} onChange={(e) => setEditing((p) => (p ? { ...p, deadline: e.target.value } : p))} />
            <label>Progress ({editing.progress}%)</label>
            <input type="range" min={0} max={100} value={editing.progress} onChange={(e) => setEditing((p) => (p ? { ...p, progress: Number(e.target.value) } : p))} />
            <label>Deliverables</label>
            <textarea value={editing.deliverables} onChange={(e) => setEditing((p) => (p ? { ...p, deliverables: e.target.value } : p))} />
            <label>Notes</label>
            <textarea value={editing.notes || ""} onChange={(e) => setEditing((p) => (p ? { ...p, notes: e.target.value } : p))} />
            <div className="modal-actions">
              <button onClick={() => setEditingId(null)}>Cancel</button>
              <button className="primary-btn" onClick={saveEdit}>
                Save Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
