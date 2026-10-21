import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  FileSpreadsheet,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Send,
  Server,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react";
import API from "../api/axios";
import "./AdminPage.css";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "sheet", label: "Contact sheet", icon: FileSpreadsheet },
  { id: "campaigns", label: "Email campaigns", icon: Mail },
  { id: "services", label: "Services", icon: BriefcaseBusiness },
  { id: "team", label: "Team access", icon: UserPlus },
  { id: "system", label: "System status", icon: Activity },
];

const blankSheetRow = () => ({
  id: `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: "",
  email: "",
  company: "",
  status: "",
  notes: "",
  marketingConsent: false,
});

const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
const isConsentValue = (value) => ["yes", "true", "1", "opted in", "opt-in"].includes(String(value || "").trim().toLowerCase());
const localDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
};

function parseCsv(text) {
  const records = [];
  let record = [];
  let cell = "";
  let quoted = false;
  const source = String(text || "").replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      record.push(cell);
      cell = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      record.push(cell);
      if (record.some((value) => value.trim())) records.push(record);
      record = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  record.push(cell);
  if (record.some((value) => value.trim())) records.push(record);
  return records;
}

const normalizeHeader = (value) => String(value || "").toLowerCase().replace(/[^a-z]/g, "");

function importRowsFromCsv(text) {
  const [header = [], ...records] = parseCsv(text);
  const aliases = {
    name: ["name", "fullname", "contactname"],
    email: ["email", "emailaddress"],
    company: ["company", "organization", "organisation"],
    status: ["status", "stage"],
    notes: ["notes", "note", "comments"],
    marketingConsent: ["marketingconsent", "consent", "optin", "permission"],
  };
  const headers = header.map(normalizeHeader);
  const indexes = Object.fromEntries(
    Object.entries(aliases).map(([field, options]) => [field, headers.findIndex((value) => options.includes(value))]),
  );
  const hasRecognizedHeaders = Object.values(indexes).some((index) => index >= 0);

  return (hasRecognizedHeaders ? records : [header, ...records])
    .map((row) => {
      const getValue = (field, fallbackIndex) => {
        const index = indexes[field] >= 0 && hasRecognizedHeaders ? indexes[field] : fallbackIndex;
        return String(row[index] || "").trim();
      };
      return {
        ...blankSheetRow(),
        name: getValue("name", 0),
        email: getValue("email", 1).toLowerCase(),
        company: getValue("company", 2),
        status: getValue("status", 3),
        notes: getValue("notes", 4),
        marketingConsent: isConsentValue(getValue("marketingConsent", 5)),
      };
    })
    .filter((row) => row.name || row.email || row.company || row.status || row.notes);
}

const escapeCsv = (value) => {
  const text = value === true ? "Yes" : value === false ? "No" : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

function downloadSheet(rows) {
  const columns = [
    ["name", "Name"], ["email", "Email"], ["company", "Company"], ["status", "Status"],
    ["notes", "Notes"], ["marketingConsent", "Marketing consent"],
  ];
  const contents = [
    columns.map(([, label]) => escapeCsv(label)).join(","),
    ...rows.map((row) => columns.map(([key]) => escapeCsv(row[key])).join(",")),
  ].join("\r\n");
  const blob = new Blob([`\uFEFF${contents}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "avenroo-contacts.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function StatusPill({ children, tone = "muted" }) {
  return <span className={`admin-status admin-status--${tone}`}>{children}</span>;
}

function StatCard({ label, value, detail, icon: Icon, tone = "mint" }) {
  return (
    <article className="admin-stat-card">
      <div className={`admin-stat-icon admin-stat-icon--${tone}`}><Icon size={19} /></div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function AdminLogin({ authStatus, invite, inviteError, onLogin, onRegister, loading, error, message }) {
  const bootstrap = Boolean(authStatus?.bootstrapAvailable);
  const [mode, setMode] = useState(bootstrap || invite ? "register" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(invite?.email || (bootstrap ? "connect@avenroo.in" : ""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const isRegistering = mode === "register" && !message;
  const canRegister = bootstrap || Boolean(invite);

  return (
    <main className="admin-login min-h-screen px-4 py-10">
      <form
        className="admin-login-card"
        onSubmit={(event) => {
          event.preventDefault();
          setFormError("");
          if (isRegistering) {
            if (password !== confirmPassword) {
              setFormError("The passwords do not match.");
              return;
            }
            onRegister({ name, email, password, inviteToken: invite?.token || "" });
          } else {
            onLogin(email, password);
          }
        }}
      >
        <div className="admin-login-mark">AV</div>
        <p className="admin-eyebrow mt-7">Avenroo Technologies</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{isRegistering ? "Create your admin account." : "Operations, in one place."}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {isRegistering
            ? bootstrap
              ? "Set up the owner account. A confirmation link will be sent to the official Avenroo inbox."
              : "Finish setting up your invited account. Confirm your email before signing in."
            : "Sign in to manage enquiries, contact data, services, and email campaigns."}
        </p>
        {isRegistering && !canRegister ? (
          <div className="admin-auth-notice mt-6">
            <ShieldCheck size={18} />
            <span>New accounts are invitation-only. Ask an active administrator to send you an invitation.</span>
          </div>
        ) : (
          <>
            {isRegistering && <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="admin-name">Your name<input id="admin-name" className="admin-login-input mt-2" autoComplete="name" maxLength={100} required value={name} onChange={(event) => setName(event.target.value)} /></label>}
            <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="admin-email">Work email</label>
            <input id="admin-email" className="admin-login-input mt-2" type="email" autoComplete="email" required readOnly={Boolean(invite) || (bootstrap && isRegistering)} value={email} onChange={(event) => setEmail(event.target.value)} />
            <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="admin-password">Password</label>
            <input id="admin-password" className="admin-login-input mt-2" type="password" autoComplete={isRegistering ? "new-password" : "current-password"} minLength={isRegistering ? 12 : 1} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
            {isRegistering && <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="admin-confirm-password">Confirm password<input id="admin-confirm-password" className="admin-login-input mt-2" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>}
            {isRegistering && <p className="mt-2 text-xs text-slate-400">Use at least 12 characters.</p>}
          </>
        )}
        {inviteError && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{inviteError}</p>}
        {message && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{message}</p>}
        {(error || formError) && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{formError || error}</p>}
        {(!isRegistering || canRegister) && <button className="admin-primary-button mt-5 w-full justify-center" disabled={loading} type="submit">
          <ShieldCheck size={17} /> {loading ? (isRegistering ? "Creating account…" : "Signing in…") : (isRegistering ? "Create account" : "Sign in")}
        </button>}
        {!invite && <button className="admin-auth-switch mt-5 w-full" type="button" onClick={() => { setMode(isRegistering ? "login" : "register"); setFormError(""); }}>
          {isRegistering ? "Already have an account? Sign in" : bootstrap ? "Set up the owner account" : "Create account or accept an invitation"}
        </button>}
        {isRegistering && bootstrap && <p className="mt-4 text-center text-xs leading-5 text-slate-400">The first owner account must use connect@avenroo.in.</p>}
      </form>
    </main>
  );
}

function EmptyState({ icon: Icon, title, copy }) {
  return (
    <div className="admin-empty-state">
      <span><Icon size={21} /></span>
      <strong>{title}</strong>
      <p>{copy}</p>
    </div>
  );
}

export default function AdminPage() {
  const authInitializationStarted = useRef(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [authStatus, setAuthStatus] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [inviteError, setInviteError] = useState("");
  const [teamUsers, setTeamUsers] = useState([]);
  const [teamInvites, setTeamInvites] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState("");
  const [health, setHealth] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactTotal, setContactTotal] = useState(0);
  const [services, setServices] = useState([]);
  const [sheetRows, setSheetRows] = useState([]);
  const [sheetUpdatedAt, setSheetUpdatedAt] = useState(null);
  const [sheetStorage, setSheetStorage] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingSheet, setIsSavingSheet] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [selectedCampaignEmails, setSelectedCampaignEmails] = useState(null);
  const [showSendReview, setShowSendReview] = useState(false);
  const [sendConfirmation, setSendConfirmation] = useState("");
  const [serviceDrafts, setServiceDrafts] = useState({});
  const [savingServiceId, setSavingServiceId] = useState("");

  const announce = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  }, []);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    const results = await Promise.allSettled([
      API.get("/health"),
      API.get("/contact?limit=100"),
      API.get("/services?includeInactive=true"),
      API.get("/admin/sheet"),
      API.get("/admin/campaigns"),
      API.get("/admin/session"),
      API.get("/admin/users"),
    ]);

    const [healthResult, contactResult, serviceResult, sheetResult, campaignResult, sessionResult, teamResult] = results;
    if (results.some((result) => result.status === "rejected" && result.reason?.response?.status === 401)) {
      setIsAuthorized(false);
      setCurrentUser(null);
    }
    if (healthResult.status === "fulfilled") setHealth(healthResult.value.data);
    if (contactResult.status === "fulfilled") {
      setContacts(contactResult.value.data?.items || []);
      setContactTotal(contactResult.value.data?.pagination?.total || 0);
    }
    if (serviceResult.status === "fulfilled") {
      const list = serviceResult.value.data || [];
      setServices(list);
      setServiceDrafts(Object.fromEntries(list.map((service) => [service._id, {
        title: service.title || "",
        description: service.description || "",
        startingPriceLabel: service.startingPriceLabel || "",
      }])));
    }
    if (sheetResult.status === "fulfilled") {
      setSheetRows((sheetResult.value.data?.rows || []).map((row) => ({ ...blankSheetRow(), ...row })));
      setSheetUpdatedAt(sheetResult.value.data?.updatedAt || null);
      setSheetStorage(sheetResult.value.data?.storage || "");
    }
    if (campaignResult.status === "fulfilled") setCampaigns(campaignResult.value.data?.items || []);
    if (sessionResult.status === "fulfilled") {
      setSessionInfo(sessionResult.value.data);
      setCurrentUser(sessionResult.value.data?.user || null);
    }
    if (teamResult.status === "fulfilled") {
      setTeamUsers(teamResult.value.data?.users || []);
      setTeamInvites(teamResult.value.data?.invites || []);
    }
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    if (authInitializationStarted.current) return;
    authInitializationStarted.current = true;
    const initializeAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const verificationToken = params.get("verify");
      const inviteToken = params.get("invite");
      try {
        const status = await API.get("/auth/status");
        setAuthStatus(status.data);
      } catch (error) {
        setLoginError(error.response?.data?.message || "Could not reach the account service.");
      }

      if (inviteToken) {
        try {
          const response = await API.get(`/auth/invites/${encodeURIComponent(inviteToken)}`);
          setInviteInfo({ ...response.data, token: inviteToken });
          params.delete("invite");
          const query = params.toString();
          window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
        } catch (error) {
          setInviteError(error.response?.data?.message || "This invitation is invalid or has expired.");
        }
      }

      if (verificationToken) {
        try {
          const response = await API.post("/auth/verify", { token: verificationToken });
          setAuthMessage(response.data.message || "Email confirmed. You can now sign in.");
          params.delete("verify");
          const query = params.toString();
          window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
        } catch (error) {
          setLoginError(error.response?.data?.message || "Could not confirm this email address.");
        }
      }

      try {
        const response = await API.get("/auth/me");
        setCurrentUser(response.data.user);
        setIsAuthorized(true);
        await loadData();
      } catch {
        setIsAuthorized(false);
      } finally {
        setIsCheckingSession(false);
      }
    };
    initializeAuth();
  }, [loadData]);

  const handleLogin = async (email, password) => {
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const response = await API.post("/auth/login", { email, password });
      setCurrentUser(response.data.user);
      setIsAuthorized(true);
      setAuthMessage("");
      await loadData();
    } catch (error) {
      setLoginError(error.response?.data?.message || "Could not sign in. Check your email and password.");
    } finally {
      setIsLoggingIn(false);
      setIsCheckingSession(false);
    }
  };

  const handleRegister = async (account) => {
    setIsLoggingIn(true);
    setLoginError("");
    setAuthMessage("");
    try {
      const response = await API.post("/auth/register", account);
      setAuthMessage(response.data.message || "Check your inbox for the confirmation email.");
      setInviteInfo(null);
    } catch (error) {
      setLoginError(error.response?.data?.message || "Could not create the account.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      // Locally clear the session UI even if the API is unavailable.
    }
    setIsAuthorized(false);
    setCurrentUser(null);
    setSessionInfo(null);
    setActiveTab("overview");
  };

  const handleInvite = async (event) => {
    event.preventDefault();
    setIsInviting(true);
    try {
      const response = await API.post("/admin/invites", { email: inviteEmail });
      setInviteEmail("");
      announce(response.data.message || "Invitation sent.");
      await loadData();
    } catch (error) {
      announce(error.response?.data?.message || "Could not send this invitation.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleContactStatus = async (contactId, status) => {
    try {
      const response = await API.patch(`/contact/${contactId}/status`, { status });
      setContacts((current) => current.map((contact) => contact._id === contactId ? response.data.contact : contact));
      announce("Enquiry status updated.");
    } catch (error) {
      announce(error.response?.data?.message || "Could not update this enquiry.");
    }
  };

  const updateSheetRow = (rowId, field, value) => {
    setSheetRows((current) => current.map((row) => row.id === rowId ? { ...row, [field]: value } : row));
  };

  const saveSheet = async () => {
    setIsSavingSheet(true);
    try {
      const response = await API.put("/admin/sheet", { rows: sheetRows });
      setSheetRows(response.data.rows || []);
      setSheetUpdatedAt(response.data.updatedAt || null);
      setSheetStorage(response.data.storage || "");
      announce("Contact sheet saved.");
    } catch (error) {
      announce(error.response?.data?.message || "Could not save the contact sheet.");
    } finally {
      setIsSavingSheet(false);
    }
  };

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const rows = importRowsFromCsv(await file.text());
      if (rows.length > 1000) {
        announce("The sheet supports up to 1,000 rows.");
        return;
      }
      setSheetRows(rows);
      announce(`${rows.length} rows loaded. Save the sheet to apply this import.`);
    } catch {
      announce("Could not read that CSV file.");
    }
  };

  const eligibleRecipients = useMemo(() => {
    const unique = new Map();
    sheetRows.forEach((row) => {
      const email = String(row.email || "").trim().toLowerCase();
      if (row.marketingConsent && validEmail(email)) unique.set(email, row);
    });
    return [...unique.values()];
  }, [sheetRows]);

  const defaultCampaignEmails = useMemo(
    () => eligibleRecipients.slice(0, 100).map((row) => String(row.email).trim().toLowerCase()),
    [eligibleRecipients],
  );
  const currentlyEligibleEmails = new Set(eligibleRecipients.map((row) => String(row.email).trim().toLowerCase()));
  const campaignEmails = (selectedCampaignEmails || defaultCampaignEmails)
    .filter((email) => currentlyEligibleEmails.has(email));
  const selectedRecipients = useMemo(() => {
    const selection = new Set(campaignEmails);
    return eligibleRecipients.filter((row) => selection.has(String(row.email).trim().toLowerCase()));
  }, [campaignEmails, eligibleRecipients]);

  const launchCampaign = async () => {
    if (sendConfirmation !== "SEND") return;
    setIsSending(true);
    try {
      const response = await API.post("/admin/campaigns", {
        subject: campaignSubject,
        message: campaignMessage,
        recipientEmails: selectedRecipients.map((row) => String(row.email).trim().toLowerCase()),
        confirmed: true,
      });
      setCampaigns((current) => [response.data.campaign, ...current]);
      setCampaignSubject("");
      setCampaignMessage("");
      setSelectedCampaignEmails(null);
      setShowSendReview(false);
      setSendConfirmation("");
      announce(`Campaign finished: ${response.data.campaign.sentCount} sent, ${response.data.campaign.failedCount} failed.`);
    } catch (error) {
      announce(error.response?.data?.message || "Campaign could not be sent.");
    } finally {
      setIsSending(false);
    }
  };

  const updateServiceDraft = (serviceId, field, value) => {
    setServiceDrafts((current) => ({ ...current, [serviceId]: { ...current[serviceId], [field]: value } }));
  };

  const saveService = async (service) => {
    setSavingServiceId(service._id);
    try {
      const response = await API.put(`/services/${service._id}`, serviceDrafts[service._id]);
      setServices((current) => current.map((item) => item._id === service._id ? response.data : item));
      announce("Service details saved.");
    } catch (error) {
      announce(error.response?.data?.message || "Could not update this service.");
    } finally {
      setSavingServiceId("");
    }
  };

  const toggleService = async (service) => {
    try {
      const response = await API.put(`/services/${service._id}`, { isActive: !service.isActive });
      setServices((current) => current.map((item) => item._id === service._id ? response.data : item));
      announce(response.data.isActive ? "Service published." : "Service archived.");
    } catch (error) {
      announce(error.response?.data?.message || "Could not change this service.");
    }
  };

  if (isCheckingSession) {
    return <main className="admin-login min-h-screen"><div className="admin-session-loader">Loading admin panel…</div></main>;
  }
  if (!isAuthorized) return <AdminLogin authStatus={authStatus} invite={inviteInfo} inviteError={inviteError} onLogin={handleLogin} onRegister={handleRegister} loading={isLoggingIn} error={loginError} message={authMessage} />;

  const activeTitle = navItems.find((item) => item.id === activeTab)?.label || "Overview";
  const newEnquiries = contacts.filter((contact) => contact.status === "new").length;
  const liveServices = services.filter((service) => service.isActive !== false).length;
  const apiIsHealthy = health?.status === "ok";

  return (
    <div className="admin-shell min-h-screen text-slate-900">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand-lockup" aria-label="Avenroo Technologies home">
          <span className="admin-brand-mark">AV</span>
          <span><strong>Avenroo</strong><small>Operations</small></span>
        </a>
        <p className="admin-nav-caption">WORKSPACE</p>
        <nav className="admin-nav-list" aria-label="Admin sections">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`admin-nav-item ${activeTab === item.id ? "is-active" : ""}`}>
                <Icon size={18} /> <span>{item.label}</span>
                {item.id === "enquiries" && newEnquiries > 0 && <b>{newEnquiries}</b>}
              </button>
            );
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-status"><span className={apiIsHealthy ? "is-online" : "is-offline"} />
            <span><strong>API connection</strong><small>{health?.status || "Checking status"}</small></span>
          </div>
          <button onClick={handleLogout} className="admin-logout-button"><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-breadcrumb">Avenroo <span>/</span> {activeTitle}</p>
            <h1>{activeTitle}</h1>
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-user-chip"><span className="admin-user-avatar">{(currentUser?.name || "A").slice(0, 1).toUpperCase()}</span><span><strong>{currentUser?.name || "Administrator"}</strong><small>{currentUser?.email || "Secure session"}</small></span></div>
            <button className="admin-icon-button" onClick={loadData} disabled={isRefreshing} aria-label="Refresh dashboard" title="Refresh dashboard">
              <RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        <main className="admin-content">
          {activeTab === "overview" && (
            <>
              <section className="admin-welcome-card">
                <div><p className="admin-eyebrow">Operations overview</p><h2>Good work starts with a clear view.</h2><p>Keep enquiries moving, contact data tidy, and routine work in one place.</p></div>
                <div className="admin-welcome-art"><div className="admin-welcome-orbit" /><span>AV</span><small>Build with clarity.</small></div>
              </section>
              <section className="admin-stats-grid">
                <StatCard label="Total enquiries" value={contactTotal} detail={`${newEnquiries} need a first look`} icon={Inbox} />
                <StatCard label="New enquiries" value={newEnquiries} detail="Ready for follow-up" icon={Clock3} tone="coral" />
                <StatCard label="Contact records" value={sheetRows.length} detail={`${eligibleRecipients.length} opted-in email contacts`} icon={FileSpreadsheet} tone="blue" />
                <StatCard label="Live services" value={liveServices} detail={`${services.length - liveServices} archived`} icon={BriefcaseBusiness} tone="violet" />
              </section>
              <div className="admin-overview-grid">
                <section className="admin-panel-card">
                  <div className="admin-panel-heading"><div><p className="admin-eyebrow">Latest activity</p><h2>Recent enquiries</h2></div><button className="admin-text-button" onClick={() => setActiveTab("enquiries")}>View all <ArrowUpRight size={15} /></button></div>
                  {contacts.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Contact</th><th>Service</th><th>Received</th><th>Status</th></tr></thead><tbody>
                    {contacts.slice(0, 5).map((contact) => <tr key={contact._id}><td><strong>{contact.name}</strong><small>{contact.email}</small></td><td>{contact.serviceType || "—"}</td><td>{localDate(contact.createdAt)}</td><td><StatusPill tone={contact.status === "new" ? "mint" : contact.status === "resolved" ? "blue" : "coral"}>{contact.status || "new"}</StatusPill></td></tr>)}
                  </tbody></table></div> : <EmptyState icon={Inbox} title="No enquiries yet" copy="New project messages will appear here." />}
                </section>
                <section className="admin-panel-card admin-quick-card">
                  <div className="admin-panel-heading"><div><p className="admin-eyebrow">At a glance</p><h2>System pulse</h2></div><button className="admin-icon-button" onClick={loadData} aria-label="Refresh status"><RefreshCw size={16} /></button></div>
                  <div className="admin-pulse-list">
                    <div><span className="admin-pulse-icon"><Server size={17} /></span><span><strong>API service</strong><small>{health?.status || "Status unavailable"}</small></span><StatusPill tone={apiIsHealthy ? "mint" : "coral"}>{apiIsHealthy ? "Online" : "Check"}</StatusPill></div>
                    <div><span className="admin-pulse-icon"><Database size={17} /></span><span><strong>Storage</strong><small>{health?.database || "Unavailable"}</small></span><StatusPill tone={health?.database === "connected" ? "mint" : "coral"}>{health?.database === "connected" ? "Connected" : "Local"}</StatusPill></div>
                    <div><span className="admin-pulse-icon"><Mail size={17} /></span><span><strong>Campaign email</strong><small>{sessionInfo?.campaignEmail?.fromEmail || "Sender settings"}</small></span><StatusPill tone={sessionInfo?.campaignEmail?.configured ? "mint" : "coral"}>{sessionInfo?.campaignEmail?.configured ? "Ready" : "Setup"}</StatusPill></div>
                  </div>
                  <button className="admin-secondary-button mt-5 w-full justify-center" onClick={() => setActiveTab("system")}>Open system status <ArrowUpRight size={15} /></button>
                </section>
              </div>
            </>
          )}

          {activeTab === "enquiries" && (
            <section className="admin-panel-card">
              <div className="admin-panel-heading"><div><p className="admin-eyebrow">Inbox</p><h2>Project enquiries</h2><p className="admin-panel-subtitle">Review new requests and move each one through its next step.</p></div><StatusPill tone="muted">{contactTotal} total</StatusPill></div>
              {contacts.length ? <div className="admin-table-wrap"><table className="admin-table admin-enquiries-table"><thead><tr><th>Contact</th><th>Project</th><th>Received</th><th>Progress</th></tr></thead><tbody>
                {contacts.map((contact) => <tr key={contact._id}><td><strong>{contact.name}</strong><small><a href={`mailto:${contact.email}`}>{contact.email}</a>{contact.phone && <> · {contact.phone}</>}</small></td><td><strong>{contact.serviceType || "General enquiry"}</strong><small>{contact.timeline || "Timeline not specified"}{contact.budget ? ` · ${contact.budget}` : ""}</small><p className="admin-message-preview">{contact.message}</p></td><td>{localDate(contact.createdAt)}</td><td><select value={contact.status || "new"} onChange={(event) => handleContactStatus(contact._id, event.target.value)} aria-label={`Status for ${contact.name}`} className="admin-select"><option value="new">New</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select></td></tr>)}
              </tbody></table></div> : <EmptyState icon={Inbox} title="Your inbox is clear" copy="Enquiries submitted through the website will show here." />}
            </section>
          )}

          {activeTab === "sheet" && (
            <section className="admin-panel-card">
              <div className="admin-panel-heading admin-sheet-heading"><div><p className="admin-eyebrow">Excel-ready contact list</p><h2>Contact operations sheet</h2><p className="admin-panel-subtitle">Edit records here, or import and export a CSV file that opens in Excel.</p><p className="admin-last-saved">{sheetUpdatedAt ? `Last saved ${localDate(sheetUpdatedAt)}` : "No saved changes yet"} · {sheetStorage || "Loading storage"}</p></div>
                <div className="admin-sheet-actions"><label className="admin-secondary-button admin-file-button"><Upload size={16} /> Import CSV<input type="file" accept=".csv,.txt,text/csv" onChange={importCsv} /></label><button className="admin-secondary-button" onClick={() => downloadSheet(sheetRows)}><Download size={16} /> Export CSV</button><button className="admin-primary-button" onClick={saveSheet} disabled={isSavingSheet}><Save size={16} /> {isSavingSheet ? "Saving…" : "Save sheet"}</button></div>
              </div>
              <div className="admin-sheet-notice"><ShieldCheck size={17} /><span>Bulk email only includes valid addresses with the <strong>Marketing consent</strong> box checked.</span></div>
              <div className="admin-table-wrap admin-sheet-table-wrap"><table className="admin-table admin-sheet-table"><thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Status</th><th>Notes</th><th>Marketing consent</th><th aria-label="Actions" /></tr></thead><tbody>
                {sheetRows.map((row) => <tr key={row.id}><td><input value={row.name || ""} onChange={(event) => updateSheetRow(row.id, "name", event.target.value)} aria-label="Name" placeholder="Name" /></td><td><input value={row.email || ""} onChange={(event) => updateSheetRow(row.id, "email", event.target.value)} aria-label="Email" placeholder="name@example.com" /></td><td><input value={row.company || ""} onChange={(event) => updateSheetRow(row.id, "company", event.target.value)} aria-label="Company" placeholder="Company" /></td><td><input value={row.status || ""} onChange={(event) => updateSheetRow(row.id, "status", event.target.value)} aria-label="Status" placeholder="Lead" /></td><td><input value={row.notes || ""} onChange={(event) => updateSheetRow(row.id, "notes", event.target.value)} aria-label="Notes" placeholder="Notes" /></td><td><label className="admin-consent-control"><input type="checkbox" checked={Boolean(row.marketingConsent)} onChange={(event) => updateSheetRow(row.id, "marketingConsent", event.target.checked)} /><span>Opted in</span></label></td><td><button className="admin-row-delete" onClick={() => setSheetRows((current) => current.filter((item) => item.id !== row.id))} aria-label={`Delete ${row.name || "row"}`}><Trash2 size={16} /></button></td></tr>)}
                {!sheetRows.length && <tr><td className="admin-sheet-empty" colSpan="7">Import a CSV or add a contact row to get started.</td></tr>}
              </tbody></table></div>
              <div className="admin-sheet-footer"><span>{sheetRows.length} / 1,000 rows · {eligibleRecipients.length} unique opted-in recipients</span><button className="admin-text-button" onClick={() => setSheetRows((current) => [...current, blankSheetRow()])}><Plus size={16} /> Add row</button></div>
            </section>
          )}

          {activeTab === "campaigns" && (
            <div className="admin-campaign-layout">
              <section className="admin-panel-card">
                <div className="admin-panel-heading"><div><p className="admin-eyebrow">Compose</p><h2>New email campaign</h2><p className="admin-panel-subtitle">Each opted-in contact receives a separate email, so addresses stay private.</p></div><span className="admin-recipient-count"><strong>{selectedRecipients.length}</strong> selected · {eligibleRecipients.length} eligible</span></div>
                <div className="admin-campaign-compose">
                  {!sessionInfo?.campaignEmail?.configured && <div className="admin-warning-banner"><AlertCircle size={18} /><span>SMTP is not ready for campaigns. Add SMTP host, credentials, and sender details to the API environment.</span></div>}
                  <fieldset className="admin-recipient-picker"><legend>Recipients <small>Up to 100 per send</small></legend>
                    {eligibleRecipients.length ? <div className="admin-recipient-list">{eligibleRecipients.map((row) => {
                      const email = String(row.email).trim().toLowerCase();
                      const isSelected = campaignEmails.includes(email);
                      return <label key={email} className="admin-recipient-option"><input type="checkbox" checked={isSelected} onChange={(event) => {
                        const next = new Set(campaignEmails);
                        if (event.target.checked) {
                          if (next.size >= 100) { announce("Select up to 100 contacts per campaign."); return; }
                          next.add(email);
                        } else next.delete(email);
                        setSelectedCampaignEmails([...next]);
                      }} /><span><strong>{row.name || "Unnamed contact"}</strong><small>{email}</small></span></label>;
                    })}</div> : <p className="admin-no-recipients">Add valid email addresses and mark their consent in the Contact sheet.</p>}
                    {eligibleRecipients.length > 100 && <p className="admin-recipient-hint">The first 100 eligible contacts are selected by default. Choose a different group above.</p>}
                  </fieldset>
                  <label>Subject<input maxLength="180" value={campaignSubject} onChange={(event) => setCampaignSubject(event.target.value)} placeholder="A useful update from Avenroo" /></label>
                  <label>Message<textarea maxLength="12000" rows="9" value={campaignMessage} onChange={(event) => setCampaignMessage(event.target.value)} placeholder="Write your email. Use {{name}} to add each recipient’s first name." /></label>
                  <div className="admin-compose-helper"><span>Personalization token: <code>{"{{name}}"}</code></span><span>{campaignMessage.length.toLocaleString()} / 12,000</span></div>
                  <div className="admin-send-footer"><p>Only contacts with a valid email and saved consent are included. Per-send limit: 100.</p><button className="admin-primary-button" onClick={() => { setSendConfirmation(""); setShowSendReview(true); }} disabled={!sessionInfo?.campaignEmail?.configured || !campaignSubject.trim() || !campaignMessage.trim() || !selectedRecipients.length}><Send size={16} /> Review send</button></div>
                </div>
              </section>
              <section className="admin-panel-card">
                <div className="admin-panel-heading"><div><p className="admin-eyebrow">Delivery log</p><h2>Recent campaigns</h2></div></div>
                {campaigns.length ? <div className="admin-campaign-history">{campaigns.map((campaign) => <article key={campaign._id}><span className="admin-campaign-icon"><Mail size={17} /></span><div><strong>{campaign.subject}</strong><small>{localDate(campaign.createdAt)} · {campaign.recipientCount} recipients</small></div><div className="admin-campaign-result"><StatusPill tone={campaign.status === "sent" ? "mint" : campaign.status === "partial" ? "coral" : "muted"}>{campaign.status}</StatusPill><small>{campaign.sentCount} sent · {campaign.failedCount} failed</small></div></article>)}</div> : <EmptyState icon={Mail} title="No campaigns sent" copy="Campaign delivery results will be recorded here." />}
              </section>
            </div>
          )}

          {activeTab === "services" && (
            <section className="admin-panel-card">
              <div className="admin-panel-heading"><div><p className="admin-eyebrow">Public service catalogue</p><h2>Manage service listings</h2><p className="admin-panel-subtitle">Update the service cards shown on the public website or archive a listing.</p></div><StatusPill tone="mint">{liveServices} live</StatusPill></div>
              {services.length ? <div className="admin-services-list">{services.map((service) => <article className="admin-service-card" key={service._id}><div className="admin-service-title"><span className="admin-service-icon"><BriefcaseBusiness size={18} /></span><div><strong>{service.title}</strong><small>{service.slug}</small></div><StatusPill tone={service.isActive === false ? "muted" : "mint"}>{service.isActive === false ? "Archived" : "Live"}</StatusPill></div><div className="admin-service-fields"><label>Title<input value={serviceDrafts[service._id]?.title || ""} onChange={(event) => updateServiceDraft(service._id, "title", event.target.value)} /></label><label>Price label<input value={serviceDrafts[service._id]?.startingPriceLabel || ""} onChange={(event) => updateServiceDraft(service._id, "startingPriceLabel", event.target.value)} placeholder="e.g. Starting from ₹…" /></label><label className="admin-service-description">Description<textarea rows="3" value={serviceDrafts[service._id]?.description || ""} onChange={(event) => updateServiceDraft(service._id, "description", event.target.value)} /></label></div><div className="admin-service-actions"><button className="admin-secondary-button" onClick={() => toggleService(service)}>{service.isActive === false ? "Publish listing" : "Archive listing"}</button><button className="admin-primary-button" onClick={() => saveService(service)} disabled={savingServiceId === service._id}><Save size={16} /> {savingServiceId === service._id ? "Saving…" : "Save details"}</button></div></article>)}</div> : <EmptyState icon={BriefcaseBusiness} title="No services available" copy="The service catalogue could not be loaded." />}
            </section>
          )}

          {activeTab === "team" && (
            <div className="admin-team-layout">
              <section className="admin-panel-card">
                <div className="admin-panel-heading"><div><p className="admin-eyebrow">Account security</p><h2>Team access</h2><p className="admin-panel-subtitle">Invite trusted teammates. Each person must create a password and confirm their email before they can sign in.</p></div><StatusPill tone={sessionInfo?.accountEmail?.configured ? "mint" : "coral"}>{sessionInfo?.accountEmail?.configured ? "Email ready" : "Email setup needed"}</StatusPill></div>
                {!sessionInfo?.accountEmail?.configured && <div className="admin-warning-banner mt-5"><AlertCircle size={18} /><span>Invitations require SMTP to send from connect@avenroo.in. {sessionInfo?.accountEmail?.reason || "Check the API mail settings."}</span></div>}
                <form className="admin-invite-form" onSubmit={handleInvite}>
                  <label htmlFor="invite-email">Invite by email</label>
                  <div><input id="invite-email" type="email" autoComplete="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@company.com" /><button className="admin-primary-button" type="submit" disabled={isInviting || !sessionInfo?.accountEmail?.configured}><UserPlus size={16} />{isInviting ? "Sending…" : "Send invitation"}</button></div>
                  <small>Invitation links expire after 7 days. A new invitation replaces any older unused invitation for the same address.</small>
                </form>
              </section>
              <section className="admin-panel-card">
                <div className="admin-panel-heading"><div><p className="admin-eyebrow">Admin accounts</p><h2>Administrators</h2></div><StatusPill tone="muted">{teamUsers.length} total</StatusPill></div>
                {teamUsers.length ? <div className="admin-team-list">{teamUsers.map((user) => <article key={user.id}><span className="admin-team-avatar">{(user.name || "A").slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.email}</small></div><StatusPill tone={user.emailVerifiedAt ? "mint" : "coral"}>{user.emailVerifiedAt ? (user.role === "owner" ? "Owner" : "Verified") : "Pending verification"}</StatusPill></article>)}</div> : <EmptyState icon={ShieldCheck} title="No accounts found" copy="The admin account list could not be loaded." />}
              </section>
              <section className="admin-panel-card">
                <div className="admin-panel-heading"><div><p className="admin-eyebrow">Open invitations</p><h2>Awaiting registration</h2></div><StatusPill tone="muted">{teamInvites.length} pending</StatusPill></div>
                {teamInvites.length ? <div className="admin-team-list">{teamInvites.map((invite) => <article key={invite.id}><span className="admin-team-avatar admin-team-avatar--invite"><Mail size={16} /></span><div><strong>{invite.email}</strong><small>Expires {localDate(invite.expiresAt)}</small></div><StatusPill tone="coral">Waiting</StatusPill></article>)}</div> : <EmptyState icon={Mail} title="No open invitations" copy="Invited teammates will appear here until they register." />}
              </section>
            </div>
          )}

          {activeTab === "system" && (
            <>
              <section className="admin-system-banner"><span className={apiIsHealthy ? "is-online" : "is-offline"} /><div><strong>{apiIsHealthy ? "API is responding normally" : "API needs attention"}</strong><p>Last checked {localDate(health?.timestamp)}.</p></div><button className="admin-secondary-button" onClick={loadData}><RefreshCw size={15} /> Check again</button></section>
              <div className="admin-system-grid">
                <article className="admin-system-card"><div><span className="admin-pulse-icon"><Server size={18} /></span><StatusPill tone={apiIsHealthy ? "mint" : "coral"}>{health?.status || "Unknown"}</StatusPill></div><h2>API service</h2><p>Application health endpoint and service availability.</p><small>{health?.timestamp ? `Checked ${localDate(health.timestamp)}` : "No health response received"}</small></article>
                <article className="admin-system-card"><div><span className="admin-pulse-icon"><Database size={18} /></span><StatusPill tone={health?.database === "connected" ? "mint" : "coral"}>{health?.database || "Unknown"}</StatusPill></div><h2>Contact storage</h2><p>Database and contact form storage status.</p><small>{health?.contactStorage || "Storage detail unavailable"}</small></article>
                <article className="admin-system-card"><div><span className="admin-pulse-icon"><Mail size={18} /></span><StatusPill tone={sessionInfo?.campaignEmail?.configured ? "mint" : "coral"}>{sessionInfo?.campaignEmail?.configured ? "Ready" : "Setup needed"}</StatusPill></div><h2>Bulk email</h2><p>SMTP configuration used to deliver individual campaign messages.</p><small>{sessionInfo?.campaignEmail?.fromEmail || "SMTP sender not configured"}</small></article>
                <article className="admin-system-card"><div><span className="admin-pulse-icon"><ShieldCheck size={18} /></span><StatusPill tone="mint">Protected</StatusPill></div><h2>Admin access</h2><p>Verified email accounts use server-side sessions and invitation-based registration.</p><small>{currentUser?.email || "Session user unavailable"}</small></article>
              </div>
              <section className="admin-note-card"><AlertCircle size={18} /><p><strong>Deployment note</strong> Your sheet is saved in MongoDB when the database is connected. The local-file fallback is for development and may not persist across hosted service restarts.</p></section>
            </>
          )}
        </main>
      </div>

      {toast && <div className="admin-toast" role="status"><CheckCircle2 size={17} />{toast}</div>}

      {showSendReview && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSendReview(false); }}><section className="admin-send-modal" role="dialog" aria-modal="true" aria-labelledby="send-review-title"><span className="admin-modal-icon"><Send size={19} /></span><p className="admin-eyebrow mt-5">Final review</p><h2 id="send-review-title">Send this email to {selectedRecipients.length} contacts?</h2><p className="mt-3 text-sm leading-6 text-slate-500">The message will be sent individually to each valid, opted-in email address. This action cannot be recalled.</p><div className="admin-review-summary"><strong>{campaignSubject}</strong><p>{campaignMessage.slice(0, 240)}{campaignMessage.length > 240 ? "…" : ""}</p><span>{selectedRecipients.length} recipients · addresses sent separately</span></div><label className="admin-confirm-send-label">Type <strong>SEND</strong> to confirm<input value={sendConfirmation} onChange={(event) => setSendConfirmation(event.target.value)} autoComplete="off" /></label><div className="admin-modal-actions"><button className="admin-secondary-button" onClick={() => setShowSendReview(false)} disabled={isSending}>Cancel</button><button className="admin-primary-button" onClick={launchCampaign} disabled={sendConfirmation !== "SEND" || isSending}><Send size={16} /> {isSending ? "Sending…" : `Send to ${selectedRecipients.length}`}</button></div></section></div>}
    </div>
  );
}
