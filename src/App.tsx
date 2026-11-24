import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  Factory,
  HandCoins,
  Home,
  Leaf,
  MapPin,
  Menu,
  Package,
  Plus,
  Recycle,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  advanceStatus,
  estimateEarnings,
  operatingBalance,
  recoveryRate,
  validatePositiveQuantity,
} from "./calculations";
import { initialRequests, listings, sources } from "./data";
import type { CollectionRequest, Material, Status, Unit } from "./models";
import "./App.css";

type Page =
  | "home"
  | "collect"
  | "materials"
  | "community"
  | "facility"
  | "businesses"
  | "epr"
  | "impact"
  | "about";
const pageMeta: Record<Page, { title: string; sub: string }> = {
  home: {
    title: "Plastic, back in the loop.",
    sub: "A community-led view of how Kolhapur can recover more plastic and create value from it.",
  },
  collect: {
    title: "Collection requests",
    sub: "Arrange a demonstration pickup and follow each step through delivery.",
  },
  materials: {
    title: "Recovered materials",
    sub: "Explore illustrative material lots and send a buyer enquiry.",
  },
  community: {
    title: "Community network",
    sub: "A fair, transparent model for collectors and local groups to participate.",
  },
  facility: {
    title: "Recycling facility",
    sub: "A proposed operating view for connecting collection to existing public infrastructure.",
  },
  businesses: {
    title: "Recycling businesses",
    sub: "Explore potential buyer categories and record expressions of interest.",
  },
  epr: {
    title: "EPR partnerships",
    sub: "How packaging recovery evidence could contribute to producer responsibility.",
  },
  impact: {
    title: "Impact & economics",
    sub: "Separate reported research benchmarks from simulated operations and illustrative economics.",
  },
  about: {
    title: "About this prototype",
    sub: "A transparent demonstration of a plastic-only circular system for Kolhapur city.",
  },
};
const cats: Material[] = [
  "PET",
  "HDPE",
  "LDPE",
  "PP",
  "Other rigid",
  "Mixed / unidentified",
];
const statuses: Status[] = [
  "Requested",
  "Accepted",
  "Collected",
  "Weighed",
  "Delivered",
];
const menu: { id: Page; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Overview", icon: Home },
  { id: "collect", label: "Collect plastic", icon: Truck },
  { id: "materials", label: "Materials", icon: Package },
  { id: "community", label: "Community", icon: Users },
];
const more: { id: Page; label: string; icon: typeof Home }[] = [
  { id: "facility", label: "Facility", icon: Factory },
  { id: "businesses", label: "Recycling businesses", icon: Building2 },
  { id: "epr", label: "EPR partnerships", icon: ShieldCheck },
  { id: "impact", label: "Impact & economics", icon: Leaf },
  { id: "about", label: "About this project", icon: CircleHelp },
];
const usd = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
const localKey = "kolhapur-plastic-loop-demo-v1";
function readRequests(): CollectionRequest[] {
  try {
    const val = localStorage.getItem(localKey);
    return val ? (JSON.parse(val) as CollectionRequest[]) : initialRequests;
  } catch {
    return initialRequests;
  }
}
function App() {
  const [page, setPage] = useState<Page>(
    () => (location.hash.replace("#/", "") as Page) || "home",
  );
  const [requests, setRequests] = useState<CollectionRequest[]>(readRequests);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const onHash = () =>
      setPage((location.hash.replace("#/", "") as Page) || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(localKey, JSON.stringify(requests));
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
  }, [requests]);
  const go = (id: Page) => {
    location.hash = `/${id}`;
    setPage(id);
    setMoreOpen(false);
    window.scrollTo(0, 0);
  };
  const createRequest = (
    r: Omit<CollectionRequest, "id" | "status" | "createdAt">,
  ) => {
    const entry: CollectionRequest = {
      ...r,
      id: `KPL-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`,
      status: "Requested",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setRequests([entry, ...requests]);
    setShowForm(false);
    setNotice(
      "Demo request saved in this browser. No pickup has been dispatched.",
    );
  };
  const reset = () => {
    if (
      window.confirm(
        "Reset Kolhapur Plastic Loop demonstration data in this browser?",
      )
    ) {
      try {
        localStorage.removeItem(localKey);
      } catch {
        // Reset still restores the in-memory seed for this session.
      }
      setRequests(initialRequests);
      setNotice("Demonstration data restored.");
    }
  };
  const statusAdvance = (id: string) =>
    setRequests((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, status: advanceStatus(r.status) } : r,
      ),
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => go("home")}
          aria-label="Kolhapur Plastic Loop home"
        >
          <span className="brand-mark">
            <Recycle size={23} />
          </span>
          <span>
            <b>plastic loop</b>
            <small>KOLHAPUR · MAHARASHTRA</small>
          </span>
        </button>
        <div className="city-pill">
          <MapPin size={15} /> Kolhapur City, India
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {menu.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`nav-item ${page === id ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "collect" && requests.length > 0 && (
                <span className="nav-count">{requests.length}</span>
              )}
            </button>
          ))}
        </nav>
        <button
          className={`nav-item more-trigger ${more.some((x) => x.id === page) ? "active" : ""}`}
          onClick={() => setMoreOpen(!moreOpen)}
        >
          <Menu size={18} />
          <span>More sections</span>
          <ChevronDown className={moreOpen ? "flip" : ""} size={15} />
        </button>
        <nav
          className={`more-list ${moreOpen || more.some((x) => x.id === page) ? "open" : ""}`}
          aria-label="More sections"
        >
          {more.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`nav-item sub-item ${page === id ? "active" : ""}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">
              <Leaf size={17} />
            </span>
            <b>Plastic has value.</b>
            <p>Keep it sorted. Keep it in the loop.</p>
            <button onClick={() => go("about")}>
              How it works <ArrowRight size={14} />
            </button>
          </div>
          <div className="user-chip">
            <div className="avatar">K</div>
            <span>
              <b>Guest explorer</b>
              <small>Demonstration mode</small>
            </span>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="crumb">
            <span>Workspace</span>
            <span className="slash">/</span>
            <b>{pageMeta[page]?.title || "Overview"}</b>
          </div>
          <div className="top-actions">
            <span className="demo-badge">
              <span /> DEMO ENVIRONMENT
            </span>
            <button
              className="icon-btn"
              aria-label="Notifications"
              onClick={() =>
                setNotice("You are viewing local demonstration data.")
              }
            >
              <Bell size={18} />
            </button>
            <div className="mini-avatar">K</div>
          </div>
        </header>
        <div className="page-wrap">
          <section className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" /> KOLHAPUR PLASTIC LOOP
              </div>
              <h1>{pageMeta[page]?.title || "Plastic, back in the loop."}</h1>
              <p>{pageMeta[page]?.sub || pageMeta.home.sub}</p>
            </div>
            {page === "collect" && (
              <button
                className="button primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={17} /> New collection request
              </button>
            )}
          </section>
          {notice && (
            <div className="toast" role="status">
              <Check size={17} />
              {notice}
              <button aria-label="Dismiss" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}
          <div className="demo-notice">
            <span className="notice-icon">
              <CircleHelp size={16} />
            </span>
            <p>
              <b>Prototype · local demonstration</b> — records stay in this
              browser. No pickup, payment or recycling is actually dispatched or
              confirmed.
            </p>
            <button onClick={() => go("about")}>
              Details <ArrowRight size={14} />
            </button>
          </div>
          {page === "home" && <Overview go={go} requests={requests} />}
          {page === "collect" && (
            <Collection
              requests={requests}
              onCreate={() => setShowForm(true)}
              onAdvance={statusAdvance}
            />
          )}
          {page === "materials" && (
            <Materials
              search={search}
              setSearch={setSearch}
              setNotice={setNotice}
            />
          )}
          {page === "community" && <Community />}
          {page === "facility" && <Facility />}
          {page === "businesses" && <Businesses setNotice={setNotice} />}
          {page === "epr" && <Epr />}
          {page === "impact" && <Impact />}
          {page === "about" && <About reset={reset} />}
          <footer className="footer">
            <span>
              Kolhapur Plastic Loop <i>·</i> Demonstration MVP
            </span>
            <span>Evidence-led · Plastic-only · City scope</span>
          </footer>
        </div>
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[
          { id: "home" as Page | "more", label: "Home", icon: Home },
          { id: "collect" as Page | "more", label: "Collect", icon: Truck },
          {
            id: "materials" as Page | "more",
            label: "Materials",
            icon: Package,
          },
          { id: "community" as Page | "more", label: "Community", icon: Users },
          { id: "more" as Page | "more", label: "More", icon: Menu },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={
              page === id || (id === "more" && more.some((x) => x.id === page))
                ? "selected"
                : ""
            }
            onClick={() => (id === "more" ? setMoreOpen((v) => !v) : go(id))}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {moreOpen && (
        <div className="mobile-more">
          <div className="mobile-more-head">
            <b>Explore</b>
            <button
              onClick={() => setMoreOpen(false)}
              aria-label="Close sections"
            >
              <X size={18} />
            </button>
          </div>
          {more.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => go(id)}>
              <Icon size={18} />
              {label}
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
      )}
      {showForm && (
        <RequestDialog
          onClose={() => setShowForm(false)}
          onSubmit={createRequest}
        />
      )}
    </div>
  );
}

function SectionHead({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  );
}
function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
function StatCard({
  label,
  value,
  change,
  icon: Icon,
  note,
}: {
  label: string;
  value: string;
  change?: string;
  icon: typeof Leaf;
  note: string;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">
          <Icon size={18} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        {change && (
          <span className="trend">
            <ArrowUpRight size={13} />
            {change}
          </span>
        )}
        <span>{note}</span>
      </div>
    </article>
  );
}
const trendData = [
  { m: "Jun", collected: 2.4, processed: 1.2 },
  { m: "Jul", collected: 3.1, processed: 1.8 },
  { m: "Aug", collected: 3.8, processed: 2.3 },
  { m: "Sep", collected: 3.3, processed: 1.9 },
  { m: "Oct", collected: 4.5, processed: 2.9 },
  { m: "Nov", collected: 5.2, processed: 3.1 },
];
const materialData = [
  { name: "PET", value: 34 },
  { name: "HDPE", value: 22 },
  { name: "PP", value: 17 },
  { name: "LDPE", value: 13 },
  { name: "Other", value: 14 },
];
const palette = ["#257b52", "#82b786", "#d1a351", "#e2b876", "#d7dfd5"];
function Overview({
  go,
  requests,
}: {
  go: (p: Page) => void;
  requests: CollectionRequest[];
}) {
  const flow = [
    { icon: Home, title: "Generate", text: "Homes & shops" },
    { icon: Truck, title: "Collect", text: "Community routes" },
    { icon: Package, title: "Sort", text: "Material grades" },
    { icon: Factory, title: "Process", text: "Facility hub" },
    { icon: Recycle, title: "Recover", text: "Saleable output" },
    { icon: ShoppingBag, title: "Make", text: "Recycled products" },
  ];
  return (
    <>
      <section className="welcome-panel">
        <div className="welcome-copy">
          <div className="welcome-label">
            <span /> COMMUNITY · MATERIAL · VALUE
          </div>
          <h2>
            Keep plastic moving.
            <br />
            <em>Keep value local.</em>
          </h2>
          <p>
            A city-focused prototype connecting households, community collectors
            and the next step for recovered plastic.
          </p>
          <div className="welcome-actions">
            <button className="button light" onClick={() => go("collect")}>
              Arrange a collection <ArrowRight size={16} />
            </button>
            <button
              className="text-button light-text"
              onClick={() => go("about")}
            >
              Explore the model
            </button>
          </div>
          <div className="welcome-meta">
            <span>
              <MapPin size={14} /> Kolhapur City
            </span>
            <span>
              <span className="live-dot" /> Prototype in progress
            </span>
          </div>
        </div>
        <div
          className="welcome-art"
          aria-label="Illustration of plastic recycling flow"
        >
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-center">
            <Recycle size={50} />
          </div>
          <div className="float-icon f1">
            <Home />
          </div>
          <div className="float-icon f2">
            <Truck />
          </div>
          <div className="float-icon f3">
            <Package />
          </div>
          <div className="float-icon f4">
            <Leaf />
          </div>
          <div className="art-caption">
            A shared loop
            <br />
            <b>from source to use</b>
          </div>
        </div>
        <div className="panel-deco" />
      </section>
      <div className="section-divider">
        <span>AT A GLANCE</span>
        <span>Evidence & demonstration data are kept separate</span>
      </div>
      <section className="stats-grid">
        <StatCard
          label="City generation benchmark"
          value="6.08 t/day"
          icon={MapPin}
          note="KMC area · reported 2021"
        />
        <StatCard
          label="Collected in demo"
          value="18.4 kg"
          change="+12.5%"
          icon={Truck}
          note="Simulated · last 30 days"
        />
        <StatCard
          label="Community participants"
          value="24"
          icon={Users}
          note="Illustrative profiles"
        />
        <StatCard
          label="Estimated material value"
          value={usd(12840)}
          icon={HandCoins}
          note="Illustrative only · no sales"
        />
      </section>
      <section className="grid-two chart-row">
        <article className="card chart-card">
          <SectionHead
            title="Collection moving through the loop"
            action={<Pill tone="amber">Simulated · kg / month</Pill>}
          >
            Example activity only. Not city performance.
          </SectionHead>
          <div className="chart-legend">
            <span>
              <i className="legend-green" /> Collected
            </span>
            <span>
              <i className="legend-yellow" /> Processed
            </span>
            <span>Jun — Nov 2026</span>
          </div>
          <div className="line-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="fillCollected"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#438962" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#438962" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="fillProcessed"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#d1a351" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#d1a351" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#e9eee9"
                  strokeDasharray="3 4"
                />
                <XAxis
                  dataKey="m"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#7e8c82", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#7e8c82", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(v) => [`${v} kg`, ""]}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e5ece5",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#438962"
                  strokeWidth={2.5}
                  fill="url(#fillCollected)"
                />
                <Area
                  type="monotone"
                  dataKey="processed"
                  stroke="#d1a351"
                  strokeWidth={2.5}
                  fill="url(#fillProcessed)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-source">
            Source: Local prototype records · window shown above · simulation
          </div>
        </article>
        <article className="card material-chart">
          <SectionHead
            title="Example material mix"
            action={
              <button className="quiet-link" onClick={() => go("materials")}>
                View materials <ArrowRight size={14} />
              </button>
            }
          >
            Illustrative intake mix · not measured locally.
          </SectionHead>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialData}
                  innerRadius={59}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {materialData.map((entry, i) => (
                    <Cell key={entry.name} fill={palette[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, "Illustrative share"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <b>100%</b>
              <small>demo mix</small>
            </div>
          </div>
          <div className="material-legend">
            {materialData.map((m, i) => (
              <div key={m.name}>
                <i style={{ background: palette[i] }} />
                <span>{m.name}</span>
                <b>{m.value}%</b>
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className="card flow-card">
        <SectionHead
          title="The plastic journey"
          action={
            <button className="quiet-link" onClick={() => go("facility")}>
              Explore facility model <ArrowRight size={14} />
            </button>
          }
        >
          A proposed pathway — facility capabilities and dispatch partners still
          need verification.
        </SectionHead>
        <div className="journey">
          {flow.map(({ icon: Icon, title, text }, i) => (
            <div className="journey-step" key={title}>
              <div className={`journey-icon step-${i}`}>
                <Icon size={20} />
              </div>
              <b>{title}</b>
              <span>{text}</span>
              {i < flow.length - 1 && (
                <ArrowRight className="journey-arrow" size={16} />
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="grid-two bottom-row">
        <article className="card benchmark-card">
          <div className="card-kicker">
            RESEARCH BENCHMARK{" "}
            <span>
              <ShieldCheck size={14} /> OFFICIALLY REPORTED
            </span>
          </div>
          <div className="benchmark-number">
            6.08 <small>tonnes / day</small>
          </div>
          <h3>
            Plastic generation benchmark for Kolhapur Municipal Corporation area
          </h3>
          <p>
            Reported in the 2021 district plan. This is a historical benchmark,
            not a current measurement or a live operational figure.
          </p>
          <a
            className="source-link"
            href={sources[0].url}
            target="_blank"
            rel="noreferrer"
          >
            Open MPCB District Environment Plan <ArrowUpRight size={14} />
          </a>
        </article>
        <article className="card activity-card">
          <SectionHead
            title="Your recent requests"
            action={
              <button className="quiet-link" onClick={() => go("collect")}>
                All requests <ArrowRight size={14} />
              </button>
            }
          >
            Local browser demonstration
          </SectionHead>
          {requests.slice(0, 2).map((r) => (
            <div className="activity-line" key={r.id}>
              <div className="material-token">
                {r.category === "PET" ? "P" : "M"}
              </div>
              <div className="activity-main">
                <b>{r.category} plastic collection</b>
                <small>
                  {r.id} · {r.area} · {r.quantity} {r.unit}
                </small>
              </div>
              <Pill tone={r.status === "Accepted" ? "green" : "amber"}>
                {r.status}
              </Pill>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}
function Collection({
  requests,
  onCreate,
  onAdvance,
}: {
  requests: CollectionRequest[];
  onCreate: () => void;
  onAdvance: (id: string) => void;
}) {
  return (
    <>
      <section className="collection-hero">
        <div>
          <Pill tone="darkgreen">DEMONSTRATION WORKFLOW</Pill>
          <h2>Make your plastic count.</h2>
          <p>
            Submit a sample request to explore how a pickup journey could work.
            No partner is currently connected.
          </p>
        </div>
        <button className="button primary" onClick={onCreate}>
          <Plus size={17} /> Create request
        </button>
      </section>
      <section className="card">
        <SectionHead title="Request journey">
          Requests are saved locally for this browser only.
        </SectionHead>
        <div className="status-flow">
          {statuses.map((s, i) => (
            <div key={s}>
              <span>{i + 1}</span>
              {s}
              {i < 4 && <i />}
            </div>
          ))}
        </div>
      </section>
      <section className="card request-list">
        <SectionHead title={`Your requests (${requests.length})`}>
          <span className="tag-sim">● Simulated records</span>
        </SectionHead>
        {requests.map((r) => (
          <article className="request-row" key={r.id}>
            <div className="material-token large">{r.category.slice(0, 1)}</div>
            <div className="request-info">
              <div>
                <b>{r.category} plastic</b>
                <span className="request-id">{r.id}</span>
              </div>
              <small>
                {r.quantity} {r.unit} <i>·</i> {r.area} <i>·</i> Preferred{" "}
                {r.date}
              </small>
              <div className="request-progress">
                {statuses.map((s, i) => (
                  <span
                    key={s}
                    className={i <= statuses.indexOf(r.status) ? "done" : ""}
                    title={s}
                  />
                ))}
              </div>
            </div>
            <div className="request-end">
              <Pill
                tone={
                  r.status === "Delivered"
                    ? "green"
                    : r.status === "Requested"
                      ? "amber"
                      : "blue"
                }
              >
                {r.status}
              </Pill>
              <button
                className="quiet-link"
                onClick={() => onAdvance(r.id)}
                disabled={r.status === "Delivered"}
              >
                Advance demo status <ArrowRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </section>
      <div className="info-banner">
        <CircleHelp size={19} />
        <div>
          <b>A note about collection</b>
          <p>
            This prototype does not dispatch vehicles or confirm collection.
            Area selection is illustrative. Please use it to explore the
            workflow only.
          </p>
        </div>
      </div>
    </>
  );
}
function RequestDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (r: Omit<CollectionRequest, "id" | "status" | "createdAt">) => void;
}) {
  const [category, setCategory] = useState<Material>("PET");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePositiveQuantity(Number(quantity))) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    if (!area.trim() || !date) {
      setError("Add an area and preferred date.");
      return;
    }
    onSubmit({
      category,
      quantity: Number(quantity),
      unit,
      area: area.trim(),
      date,
    });
  };
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <div className="dialog-head">
          <div>
            <div className="eyebrow">DEMO REQUEST</div>
            <h2 id="request-title">Arrange a collection</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <form onSubmit={submit}>
          <label>
            Plastic category
            <select
              autoFocus
              value={category}
              onChange={(e) => setCategory(e.target.value as Material)}
            >
              {cats.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <div className="form-split">
            <label>
              Quantity
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min="0.01"
                step="any"
                placeholder="e.g. 3.5"
                required
              />
            </label>
            <label>
              Unit
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
              >
                {(
                  ["g", "kg", "tonne", "bags", "containers", "items"] as Unit[]
                ).map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>
          {["bags", "containers", "items"].includes(unit) && (
            <p className="field-note">
              This item count is not converted to weight.
            </p>
          )}
          <label>
            Collection area
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Rajarampuri"
              required
            />
          </label>
          <label>
            Preferred date
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              required
            />
          </label>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <div className="dialog-note">
            <CircleHelp size={16} /> This sample request stays in your browser
            and will not be dispatched.
          </div>
          <div className="dialog-actions">
            <button type="button" className="button ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="button primary" type="submit">
              <Send size={16} /> Save demo request
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
function Materials({
  search,
  setSearch,
  setNotice,
}: {
  search: string;
  setSearch: (s: string) => void;
  setNotice: (s: string) => void;
}) {
  const filtered = listings.filter((x) =>
    `${x.material} ${x.buyer}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="toolbar">
        <div className="searchbox">
          <Search size={17} />
          <input
            placeholder="Search materials or buyers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="button primary"
          onClick={() =>
            setNotice(
              "Material listing created as a demo interaction. No inventory is published.",
            )
          }
        >
          <Plus size={16} /> List material
        </button>
      </div>
      <div className="market-alert">
        <CircleHelp size={17} />
        <span>
          All quantities below are illustrative demonstration lots. Prices are
          intentionally omitted because verified local market prices are
          unavailable.
        </span>
      </div>
      <div className="material-grid">
        {filtered.map((m, i) => (
          <article className="material-card" key={m.id}>
            <div className={`material-visual mv-${i % 6}`}>
              <span className="material-letter">
                {m.material === "Mixed / unidentified" ? "MIX" : m.material}
              </span>
              <div className="material-decoration">
                <Recycle size={35} />
              </div>
              <Pill tone="light">DEMO LOT</Pill>
            </div>
            <div className="material-body">
              <div className="material-title">
                <h3>{m.material}</h3>
                <span className="available">
                  <i />
                  Available
                </span>
              </div>
              <p>
                {m.material === "PET"
                  ? "Bottles and clear rigid packaging, subject to sorting and quality inspection."
                  : `${m.material} plastic material, subject to sorting and processor acceptance.`}
              </p>
              <div className="material-details">
                <div>
                  <small>Illustrative quantity</small>
                  <b>{m.quantityKg} kg</b>
                </div>
                <div>
                  <small>Quality</small>
                  <b>{m.quality.split(" · ")[0]}</b>
                </div>
              </div>
              <div className="buyer-line">
                <Building2 size={15} />
                <span>Potential buyer</span>
                <b>{m.buyer}</b>
              </div>
              <div className="material-actions">
                <button
                  className="button outline"
                  onClick={() =>
                    setNotice(
                      `Enquiry saved for ${m.material}. No buyer has been contacted.`,
                    )
                  }
                >
                  Express interest <ArrowRight size={15} />
                </button>
                <span>Price not verified</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
function Community() {
  const [qty, setQty] = useState("12");
  const [rate, setRate] = useState("18");
  const amount = useMemo(() => {
    try {
      return estimateEarnings(Number(qty) || 0, Number(rate) || 0);
    } catch {
      return 0;
    }
  }, [qty, rate]);
  return (
    <>
      <div className="community-banner">
        <div className="community-icon">
          <Users size={26} />
        </div>
        <div>
          <Pill tone="lightgreen">COMMUNITY FIRST</Pill>
          <h2>Build on the work already happening.</h2>
          <p>
            Any future network should recognise informal collectors' expertise,
            protect fair access to materials and avoid displacing existing
            livelihoods.
          </p>
        </div>
        <div className="community-people">
          <span>RK</span>
          <span>AS</span>
          <span>+22</span>
          <small>illustrative profiles</small>
        </div>
      </div>
      <div className="grid-two">
        <section className="card">
          <SectionHead title="Earnings calculator">
            <Pill tone="amber">Illustrative rate · not a wage quote</Pill>
          </SectionHead>
          <p className="muted-copy">
            Change the quantity and sample rate to understand the calculation.
            No payment is made.
          </p>
          <div className="calc-fields">
            <label>
              Collected plastic (kg)
              <input
                type="number"
                min="0"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </label>
            <label>
              Illustrative rate (₹ / kg)
              <input
                type="number"
                min="0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </label>
          </div>
          <div className="calc-result">
            <div>
              <small>ESTIMATED EARNINGS</small>
              <b>{usd(amount)}</b>
              <span>
                {qty || 0} kg × {usd(Number(rate) || 0)} / kg
              </span>
            </div>
            <HandCoins size={25} />
          </div>
          <p className="field-note">
            Rates vary by grade, cleanliness, buyer and local agreement. This
            sample is not a promised rate.
          </p>
        </section>
        <section className="card">
          <SectionHead title="Example participation">
            Illustrative collector records · no payments made.
          </SectionHead>
          {[
            [
              "Savitri Community Group",
              "Rajarampuri · PET / HDPE",
              "24.5 kg",
              "Estimate only",
            ],
            [
              "Shahu Nagar Collector Circle",
              "Shahupuri · mixed rigid",
              "18 kg",
              "Pending demo",
            ],
            [
              "Tarabai Park Route Team",
              "Tarabai Park · PET",
              "31 kg",
              "Estimate only",
            ],
          ].map((x) => (
            <div className="collector-row" key={x[0]}>
              <div className="avatar green-avatar">{x[0][0]}</div>
              <div>
                <b>{x[0]}</b>
                <small>{x[1]}</small>
              </div>
              <strong>{x[2]}</strong>
              <Pill tone="amber">{x[3]}</Pill>
            </div>
          ))}
        </section>
      </div>
      <section className="card">
        <SectionHead title="How a fair collector network could work">
          Proposed safeguards for a future real partnership.
        </SectionHead>
        <div className="principles">
          {[
            [
              "Recognise expertise",
              "Build routes with existing collectors and groups.",
            ],
            [
              "Transparent weighing",
              "Share measured weight and grade before any rate is applied.",
            ],
            [
              "Clear records",
              "Keep estimated earnings distinct from completed payments.",
            ],
            [
              "Co-design access",
              "Agree service areas and material rules with the community.",
            ],
          ].map((x) => (
            <article key={x[0]}>
              <Check size={16} />
              <div>
                <b>{x[0]}</b>
                <p>{x[1]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
function Facility() {
  const stages = [
    "Receiving",
    "Weighing",
    "Sorting",
    "Quality check",
    "Processing",
    "Storage",
    "Dispatch",
  ];
  return (
    <>
      <div className="facility-status">
        <div className="facility-symbol">
          <Factory size={27} />
        </div>
        <div>
          <Pill tone="amber">PROVISIONAL PROFILE</Pill>
          <h2>Kolhapur city facility details need confirmation</h2>
          <p>
            No facility identity, operator, installed capacity or machine
            capability has been verified for this prototype.
          </p>
        </div>
        <button
          className="button outline"
          onClick={() =>
            window.open(sources[0].url, "_blank", "noopener,noreferrer")
          }
        >
          Evidence source <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="facility-facts">
        <article>
          <small>Facility name</small>
          <b>Data unavailable</b>
          <span>Confirm with KMC / operator</span>
        </article>
        <article>
          <small>Location & operator</small>
          <b>Not verified</b>
          <span>No address displayed</span>
        </article>
        <article>
          <small>Installed capacity</small>
          <b>Data unavailable</b>
          <span>No figure assumed</span>
        </article>
        <article>
          <small>Equipment capability</small>
          <b>To be confirmed</b>
          <span>Proposed workflows only</span>
        </article>
      </div>
      <section className="card">
        <SectionHead title="Proposed material handling workflow">
          <Pill tone="blue">PROPOSED · NOT CONFIRMED OPERATIONS</Pill>
        </SectionHead>
        <div className="facility-stages">
          {stages.map((s, i) => (
            <div key={s}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <b>{s}</b>
              {i < stages.length - 1 && <ArrowRight size={15} />}
            </div>
          ))}
        </div>
        <div className="mass-balance">
          <div>
            <small>Plastic received</small>
            <b>Data unavailable</b>
            <span>Measured at facility</span>
          </div>
          <ArrowRight />
          <div>
            <small>Sorted / accepted</small>
            <b>Data unavailable</b>
            <span>Grade and reject logged</span>
          </div>
          <ArrowRight />
          <div>
            <small>Saleable output</small>
            <b>Data unavailable</b>
            <span>Weighed at dispatch</span>
          </div>
        </div>
      </section>
      <div className="info-banner">
        <ShieldCheck size={19} />
        <div>
          <b>Why the profile is provisional</b>
          <p>
            The 2021 district plan reports one plastic waste collection centre
            in Kagal (district-level), but that does not verify an operating
            facility inside Kolhapur city or its processing equipment.
          </p>
        </div>
      </div>
    </>
  );
}
function Businesses({ setNotice }: { setNotice: (s: string) => void }) {
  const groups = [
    ["PET recyclers", "Bottle-to-flake and fibre recycling"],
    ["HDPE reprocessors", "Rigid container washing and reprocessing"],
    ["PP granule manufacturers", "Sorted polypropylene reprocessing"],
    ["Recycled product makers", "Products using recovered plastic feedstock"],
    [
      "Authorised processors",
      "CPCB / SPCB registered plastic waste processors",
    ],
  ];
  return (
    <>
      <div className="market-alert">
        <ShieldCheck size={17} />
        <span>
          No company partnerships are verified in this prototype. These are
          buyer categories, not named businesses.
        </span>
      </div>
      <div className="partner-grid">
        {groups.map(([a, b], i) => (
          <article className="partner-card" key={a}>
            <div className="partner-icon">
              <Building2 size={21} />
            </div>
            <div>
              <Pill tone="amber">PROSPECTIVE PARTNER · UNCONFIRMED</Pill>
              <h3>{a}</h3>
              <p>{b}</p>
              <small>
                Material requirements vary by buyer and must be confirmed
                directly.
              </small>
              <button
                className="quiet-link"
                onClick={() =>
                  setNotice(
                    `Interest in ${a} recorded locally. No company has been contacted.`,
                  )
                }
              >
                Record purchase enquiry <ArrowRight size={14} />
              </button>
            </div>
            <span className="partner-no">0{i + 1}</span>
          </article>
        ))}
      </div>
      <section className="card">
        <SectionHead title="Information to verify before a transaction">
          A real marketplace needs documented material specifications and buyer
          validation.
        </SectionHead>
        <div className="principles three">
          {[
            [
              "Registration",
              "Check relevant CPCB / MPCB processor registration.",
            ],
            [
              "Specification",
              "Agree polymer, grade, contamination and accepted form.",
            ],
            [
              "Transaction evidence",
              "Record measured weight, invoice, receipt and dispatch.",
            ],
          ].map((x) => (
            <article key={x[0]}>
              <ShieldCheck size={16} />
              <div>
                <b>{x[0]}</b>
                <p>{x[1]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
function Epr() {
  const parts = [
    ["Producer / importer / brand owner", "Responsible entity"],
    ["Collection & segregation", "Material recovery route"],
    ["Registered PWP", "Authorised processing"],
    ["Evidence & portal records", "CPCB EPR system"],
    ["Compliance obligation", "Eligible certificate flow"],
  ];
  return (
    <>
      <div className="epr-intro">
        <div className="epr-icon">
          <ShieldCheck size={25} />
        </div>
        <div>
          <Pill tone="darkgreen">INDIA · PLASTIC PACKAGING</Pill>
          <h2>Responsibility follows the packaging.</h2>
          <p>
            India’s EPR framework establishes obligations for producers,
            importers and brand owners, with registered plastic waste processors
            and a centralised portal supporting compliance evidence.
          </p>
        </div>
      </div>
      <section className="card">
        <SectionHead title="A possible EPR pathway">
          <Pill tone="blue">EXPLANATORY · NOT A LIVE AGREEMENT</Pill>
        </SectionHead>
        <div className="epr-flow">
          {parts.map(([name, label], i) => (
            <div key={name}>
              <span className="epr-index">0{i + 1}</span>
              <b>{name}</b>
              <small>{label}</small>
              {i < parts.length - 1 && <ArrowRight size={17} />}
            </div>
          ))}
        </div>
        <div className="epr-caveat">
          <CircleHelp size={18} />
          <p>
            <b>Collection alone does not create an EPR certificate.</b> Eligible
            packaging, authorised processing, required records, and compliance
            with applicable CPCB rules and portal requirements are necessary.
            This prototype creates no certificates or compliance claims.
          </p>
        </div>
      </section>
      <section className="grid-two">
        <article className="card">
          <SectionHead title="Packaging categories in scope">
            EPR applies to plastic packaging under the rules' defined
            categories.
          </SectionHead>
          <div className="category-list">
            {[
              ["I", "Rigid plastic packaging"],
              ["II", "Flexible plastic packaging"],
              ["III", "Multi-layered plastic packaging"],
              ["IV", "Compostable plastic packaging"],
            ].map(([n, s]) => (
              <div key={n}>
                <span>{n}</span>
                <b>{s}</b>
                <Check size={15} />
              </div>
            ))}
          </div>
        </article>
        <article className="card">
          <SectionHead title="Evidence to assemble">
            For any future eligible transaction.
          </SectionHead>
          <ul className="checklist">
            <li>
              <Check />
              Processor registration and scope
            </li>
            <li>
              <Check />
              Packaging category and quantity evidence
            </li>
            <li>
              <Check />
              Chain-of-custody and processing records
            </li>
            <li>
              <Check />
              Portal filings and certificate validation
            </li>
            <li>
              <Check />
              Applicable rules and latest amendments
            </li>
          </ul>
          <a
            className="source-link"
            href="https://eprplastic.cpcb.gov.in/"
            target="_blank"
            rel="noreferrer"
          >
            Open CPCB EPR portal <ArrowUpRight size={14} />
          </a>
        </article>
      </section>
      <div className="source-strip">
        <ShieldCheck size={16} />
        <span>
          Reference: Plastic Waste Management Rules, 2016 as amended; EPR
          Guidelines notified in 2022. Confirm current requirements with CPCB /
          MPCB.
        </span>
        <a href="https://pwm.cpcb.gov.in/" target="_blank" rel="noreferrer">
          CPCB rules & resources <ArrowUpRight size={14} />
        </a>
      </div>
    </>
  );
}
function Impact() {
  const recovery = recoveryRate(8.8, 17);
  const pie = materialData;
  const sourceData = [
    { k: "Material sales", v: 12840 },
    { k: "Processed material sales", v: 5400 },
    { k: "EPR revenue", v: 0 },
    { k: "Municipal service", v: 1600 },
    { k: "Commercial collection", v: 2200 },
  ];
  const costData = [
    { k: "Transport", v: 3100 },
    { k: "Labour", v: 6500 },
    { k: "Processing", v: 2400 },
    { k: "Other", v: 900 },
  ];
  const totalRevenue = sourceData.reduce((sum, item) => sum + item.v, 0);
  const totalCosts = costData.reduce((sum, item) => sum + item.v, 0);
  const demoBalance = operatingBalance(
    sourceData.map((item) => item.v),
    costData.map((item) => item.v),
  );
  const salesByMaterial = [
    { k: "PET", v: 6200 },
    { k: "HDPE", v: 3000 },
    { k: "PP", v: 2200 },
    { k: "LDPE", v: 900 },
    { k: "Other", v: 540 },
  ];
  const earningsData = [
    { k: "Jun", v: 1200 },
    { k: "Jul", v: 1800 },
    { k: "Aug", v: 2100 },
    { k: "Sep", v: 2400 },
    { k: "Oct", v: 2900 },
    { k: "Nov", v: 3600 },
  ];
  return (
    <>
      <div className="data-warning">
        <CircleHelp size={18} />
        <div>
          <b>
            This dashboard mixes research context and a labelled simulation.
          </b>
          <p>
            All operational charts below use simulated prototype records for
            Jun–Nov 2026. They are not measurements of Kolhapur recycling
            performance.
          </p>
        </div>
      </div>
      <div className="impact-kpis">
        <StatCard
          label="Plastic collected"
          value="18.4 kg"
          icon={Truck}
          note="Simulated activity · Nov 2026"
        />
        <StatCard
          label="Plastic segregated"
          value="14.8 kg"
          icon={Factory}
          note="Simulated · Nov 2026"
        />
        <StatCard
          label="Saleable recycled output"
          value="8.8 kg"
          icon={Recycle}
          note="Simulated · estimated"
        />
        <StatCard
          label="Recovery rate"
          value={`${recovery?.toFixed(1)}%`}
          icon={Leaf}
          note="8.8 kg output ÷ 17 kg received"
        />
      </div>
      <div className="impact-kpis secondary-kpis">
        <StatCard
          label="Facility received"
          value="17.0 kg"
          icon={Factory}
          note="Simulated · Nov 2026"
        />
        <StatCard
          label="Plastic processed"
          value="10.4 kg"
          icon={Recycle}
          note="Simulated · Nov 2026"
        />
        <StatCard
          label="Rejects & residuals"
          value="8.2 kg"
          icon={Package}
          note="Received less saleable · demo"
        />
        <StatCard
          label="Diverted / collection efficiency"
          value="Data unavailable"
          icon={CircleHelp}
          note="Needs verified city destinations"
        />
      </div>
      <section className="grid-two impact-charts">
        <article className="card chart-card">
          <SectionHead
            title="Collection vs saleable output"
            action={<Pill tone="amber">Simulated · kg / month</Pill>}
          >
            Synthetic example to demonstrate comparison only.
          </SectionHead>
          <div className="impact-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{ top: 8, right: 10, left: -18, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#edf0eb" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar
                  dataKey="collected"
                  name="Collected"
                  fill="#438962"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="processed"
                  name="Saleable output"
                  fill="#d2a657"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-source">
            Local synthetic demonstration records · Jun–Nov 2026 · kg/month
          </div>
        </article>
        <article className="card chart-card">
          <SectionHead
            title="Example composition"
            action={<Pill tone="amber">Simulated</Pill>}
          >
            Sample mix, not a city waste characterisation study.
          </SectionHead>
          <div className="impact-pie">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={74}
                  paddingAngle={3}
                >
                  {pie.map((p, i) => (
                    <Cell key={p.name} fill={palette[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-source">
            Illustrative composition percentages · category shares total 100%
          </div>
        </article>
        <article className="card chart-card">
          <SectionHead
            title="Revenue by source"
            action={<Pill tone="amber">Illustrative ₹</Pill>}
          >
            Estimated demo values; no revenue recorded.
          </SectionHead>
          <div className="small-bars">
            {sourceData.map((x) => (
              <div key={x.k}>
                <span>{x.k}</span>
                <div>
                  <i
                    style={{
                      width: `${x.v ? Math.max(2, (x.v / 12840) * 100) : 0}%`,
                    }}
                  />
                </div>
                <b>{usd(x.v)}</b>
              </div>
            ))}
          </div>
          <div className="chart-source">
            Illustrative ₹ values · Jun–Nov 2026 · no transactions
          </div>
        </article>
        <article className="card chart-card">
          <SectionHead
            title="Operating costs"
            action={<Pill tone="amber">Illustrative ₹</Pill>}
          >
            Example cost model only; not a local cost study.
          </SectionHead>
          <div className="small-bars cost-bars">
            {costData.map((x) => (
              <div key={x.k}>
                <span>{x.k}</span>
                <div>
                  <i style={{ width: `${(x.v / 6500) * 100}%` }} />
                </div>
                <b>{usd(x.v)}</b>
              </div>
            ))}
          </div>
          <div className="chart-source">
            Illustrative ₹ values · Jun–Nov 2026 · not a local cost study
          </div>
        </article>
        <article className="card chart-card">
          <SectionHead
            title="Material sales by category"
            action={<Pill tone="amber">Illustrative ₹</Pill>}
          >
            Illustrative category value split; no sale or local price is
            verified.
          </SectionHead>
          <div className="small-bars">
            {salesByMaterial.map((x) => (
              <div key={x.k}>
                <span>{x.k}</span>
                <div>
                  <i style={{ width: `${(x.v / 6200) * 100}%` }} />
                </div>
                <b>{usd(x.v)}</b>
              </div>
            ))}
          </div>
          <div className="chart-source">
            Illustrative ₹ split · Jun–Nov 2026 · not a market quote
          </div>
        </article>
        <article className="card chart-card">
          <SectionHead
            title="Estimated community earnings"
            action={<Pill tone="amber">Simulated · ₹ / month</Pill>}
          >
            Estimated from hypothetical collection records; no payments made.
          </SectionHead>
          <div className="small-bars earnings-bars">
            {earningsData.map((x) => (
              <div key={x.k}>
                <span>{x.k} 2026</span>
                <div>
                  <i style={{ width: `${(x.v / 3600) * 100}%` }} />
                </div>
                <b>{usd(x.v)}</b>
              </div>
            ))}
          </div>
          <div className="chart-source">
            Illustrative earnings estimates · Jun–Nov 2026 · no payment data
          </div>
        </article>
      </section>
      <section
        className="balance-strip"
        aria-label="Illustrative operating model"
      >
        <div>
          <small>ILLUSTRATIVE REVENUE</small>
          <b>{usd(totalRevenue)}</b>
        </div>
        <span aria-hidden="true">−</span>
        <div>
          <small>ILLUSTRATIVE COSTS</small>
          <b>{usd(totalCosts)}</b>
        </div>
        <span aria-hidden="true">=</span>
        <div>
          <small>DEMO OPERATING SURPLUS</small>
          <b>{usd(demoBalance)}</b>
        </div>
        <Pill tone="amber">SIMULATION · JUN–NOV 2026</Pill>
      </section>
      <section className="card research-card">
        <SectionHead title="Official research benchmarks">
          Each metric retains its reporting period and geography.
        </SectionHead>
        <div className="research-table">
          <div className="research-row table-head">
            <span>Metric</span>
            <span>Value</span>
            <span>Geography · period</span>
            <span>Evidence</span>
          </div>
          {sources.map((s, i) => (
            <div className="research-row" key={`${s.label}-${i}`}>
              <span>
                <b>{s.label}</b>
                <small>{s.classification}</small>
              </span>
              <strong>
                {s.value.toLocaleString("en-IN")} <small>{s.unit}</small>
              </strong>
              <span>
                {s.geography}
                <small>{s.period}</small>
              </span>
              <a href={s.url} target="_blank" rel="noreferrer">
                {i < 2 ? "District Plan" : "MPCB Annual Report"}{" "}
                <ArrowUpRight size={13} />
              </a>
            </div>
          ))}
        </div>
        <div className="discrepancy-note">
          <CircleHelp size={16} />
          <p>
            The regional annual report's collection total (8,284 t) is slightly
            higher than reported generation (8,270 t). These are source-reported
            regional totals across 44 ULBs; they are not reconciled or used as
            city performance data.
          </p>
        </div>
      </section>
    </>
  );
}
function About({ reset }: { reset: () => void }) {
  return (
    <>
      <section className="about-hero">
        <div className="about-mark">
          <Recycle size={32} />
        </div>
        <div>
          <Pill tone="lightgreen">A PROTOTYPE · NOT A MUNICIPAL SERVICE</Pill>
          <h2>
            Local recovery.
            <br />
            Visible value.
          </h2>
          <p>
            Kolhapur Plastic Loop demonstrates how a focused community
            collection system could connect plastic generators to collectors,
            sorting, processors and manufacturers.
          </p>
        </div>
      </section>
      <section className="grid-two">
        <article className="card">
          <SectionHead title="Prototype boundaries">
            A transparent local demonstration.
          </SectionHead>
          <ul className="boundary-list">
            <li>
              <Check />
              Records are stored in this browser only.
            </li>
            <li>
              <Check />
              No collection requests are sent to a partner.
            </li>
            <li>
              <Check />
              No payments or transactions are processed.
            </li>
            <li>
              <Check />
              Prospective partner categories are not commitments.
            </li>
            <li>
              <Check />
              Demonstration activity is not proof of actual recycling.
            </li>
          </ul>
        </article>
        <article className="card">
          <SectionHead title="Evidence and geography">
            City data is kept distinct from district and region.
          </SectionHead>
          <p className="muted-copy">
            The KMC-area generation benchmark comes from a 2021 district plan.
            MPCB 2022–23 Kolhapur-region totals cover 44 urban local bodies.
            Current city-only collection and recycling data remain unavailable
            in these sources.
          </p>
          <a
            className="source-link"
            href={sources[0].url}
            target="_blank"
            rel="noreferrer"
          >
            MPCB District Environment Plan <ArrowUpRight size={14} />
          </a>
          <a
            className="source-link"
            href={sources[2].url}
            target="_blank"
            rel="noreferrer"
          >
            MPCB Annual Report 2022–23 <ArrowUpRight size={14} />
          </a>
        </article>
      </section>
      <section className="card reset-card">
        <div className="reset-icon">
          <RotateCcw size={20} />
        </div>
        <div>
          <b>Reset demonstration records</b>
          <p>
            Remove this app’s local request data and restore the original sample
            records. Other browser storage is not affected.
          </p>
        </div>
        <button className="button outline" onClick={reset}>
          Reset demo data
        </button>
      </section>
      <section className="card future-card">
        <SectionHead title="What a real pilot would need">
          A practical next step requires shared decisions and verified
          infrastructure.
        </SectionHead>
        <div className="principles three">
          {[
            [
              "Government partner",
              "Confirm facility, operator, capabilities, routing and city data.",
            ],
            [
              "Community partners",
              "Co-design fair collection areas, weighing and payment rules.",
            ],
            [
              "Commercial partners",
              "Verify processors, buyers, specifications and transaction evidence.",
            ],
          ].map((x) => (
            <article key={x[0]}>
              <ArrowRight size={16} />
              <div>
                <b>{x[0]}</b>
                <p>{x[1]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default App;
