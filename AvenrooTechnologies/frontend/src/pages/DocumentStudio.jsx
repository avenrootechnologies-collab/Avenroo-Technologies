import { useMemo, useRef, useState } from "react";
import { AlertCircle, Award, Download, FileSpreadsheet, FileText, Printer, ShieldCheck, Upload, X } from "lucide-react";
import "./DocumentStudio.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DOCUMENTS = 200;
const aliases = {
  name: ["name", "fullname", "employeename", "recipientname", "candidatename", "internname", "studentname"],
  designation: ["designation", "jobtitle", "position", "role", "jobrole"],
  department: ["department", "team", "division"],
  joiningDate: ["joiningdate", "startdate", "employmentstartdate", "dateofjoining"],
  salary: ["salary", "ctc", "compensation", "annualsalary", "pay"],
  location: ["location", "worklocation", "city", "office"],
  program: ["program", "course", "internship", "training", "achievement", "certification"],
  duration: ["duration", "programduration", "internshipduration", "courseperiod"],
  issueDate: ["issuedate", "date", "completiondate", "certificatedate", "dateofissue"],
  certificateId: ["certificateid", "certificatenumber", "credentialid"],
};

const normalizeHeader = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const cleanValue = (value) => String(value ?? "").trim();

function todayInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function formatDate(value) {
  const text = cleanValue(value);
  if (!text) return "";

  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const indianDate = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  let date;
  if (isoDate) date = new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  else if (indianDate) date = new Date(Number(indianDate[3]), Number(indianDate[2]) - 1, Number(indianDate[1]));
  else date = new Date(text);

  return Number.isNaN(date.getTime())
    ? text
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

async function downloadTemplate() {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Employee Name", "Designation", "Department", "Joining Date", "Salary", "Location", "Program", "Duration", "Issue Date", "Certificate ID"],
    ["Aarav Sharma", "Software Developer Intern", "Engineering", "2026-11-02", "₹18,000/month", "Remote", "Web Development Internship", "8 weeks", "2026-10-26", "AVT-2026-001"],
  ]);
  worksheet["!cols"] = [
    { wch: 22 }, { wch: 28 }, { wch: 18 }, { wch: 16 }, { wch: 19 },
    { wch: 16 }, { wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, "People");
  XLSX.writeFile(workbook, "avenroo-letter-studio-template.xlsx");
}

function getDocumentRows(table) {
  if (!table.length) throw new Error("The first worksheet is empty.");
  const headers = table[0].map(normalizeHeader);
  const columns = Object.fromEntries(
    Object.entries(aliases).map(([field, options]) => [field, headers.findIndex((header) => options.includes(header))]),
  );
  if (columns.name < 0) {
    throw new Error("Add a Name, Full Name, Employee Name, Candidate Name, or Recipient Name column to the first row.");
  }

  const records = table.slice(1).filter((row) => row.some((cell) => cleanValue(cell)));
  if (records.length > MAX_DOCUMENTS) {
    throw new Error(`This sheet has more than ${MAX_DOCUMENTS} non-empty rows. Split it into smaller batches.`);
  }

  let skippedRows = 0;
  const people = records.flatMap((row, index) => {
    const person = Object.fromEntries(Object.keys(aliases).map((field) => [
      field,
      columns[field] < 0 ? "" : cleanValue(row[columns[field]]),
    ]));
    if (!person.name) {
      skippedRows += 1;
      return [];
    }
    return [{ ...person, sourceRow: index + 2 }];
  });

  if (!people.length) throw new Error("No named people were found. Check that the sheet has names below its header row.");
  return { people, skippedRows };
}

function DocumentPage({ person, type, settings }) {
  const issueDate = formatDate(person.issueDate) || formatDate(settings.issueDate) || formatDate(todayInputValue());
  const designation = person.designation || settings.defaultDesignation || "the offered position";
  const program = person.program || settings.defaultProgram || "Avenroo Technologies program";

  if (type === "certificate") {
    return (
      <article className="generated-document generated-document--certificate">
        <div className="certificate-frame">
          <header className="document-letterhead">
            <span className="document-monogram">AV</span>
            <span><strong>{settings.companyName || "Avenroo Technologies"}</strong><small>LEARNING · OPPORTUNITY · GROWTH</small></span>
          </header>
          <div className="certificate-content">
            <p className="certificate-kicker">CERTIFICATE OF ACHIEVEMENT</p>
            <h2>Certificate</h2>
            <p className="certificate-presented">This certificate is proudly presented to</p>
            <p className="certificate-recipient">{person.name}</p>
            <span className="certificate-rule" />
            <p className="certificate-copy">
              for successfully completing <strong>{program}</strong>{person.duration ? <> over <strong>{person.duration}</strong></> : null}
              {person.department ? <> with the <strong>{person.department}</strong> team</> : null}.
              Their dedication, curiosity, and contribution are sincerely appreciated.
            </p>
            <div className="certificate-meta">
              <div><span>DATE OF ISSUE</span><strong>{issueDate}</strong></div>
              {person.certificateId && <div><span>CERTIFICATE ID</span><strong>{person.certificateId}</strong></div>}
            </div>
            <div className="document-signature document-signature--certificate">
              <span className="signature-rule" />
              <strong>{settings.signatoryName || "Avenroo Technologies"}</strong>
              <small>{settings.signatoryTitle || "Authorized Signatory"}</small>
            </div>
          </div>
          <footer className="certificate-footer">{settings.companyName || "Avenroo Technologies"} · {issueDate}</footer>
        </div>
      </article>
    );
  }

  return (
    <article className="generated-document generated-document--offer">
      <header className="document-letterhead">
        <span className="document-monogram">AV</span>
        <span><strong>{settings.companyName || "Avenroo Technologies"}</strong><small>OFFER OF EMPLOYMENT</small></span>
      </header>
      <div className="offer-rule" />
      <div className="offer-copy">
        <p className="document-date">{issueDate}</p>
        <p className="document-recipient">{person.name}</p>
        {person.location && <p className="document-address">{person.location}</p>}
        <h2>Offer of employment</h2>
        <p>Dear {person.name},</p>
        <p>
          We are pleased to offer you the position of <strong>{designation}</strong>
          {person.department ? <> in our <strong>{person.department}</strong> team</> : null}
          {person.location ? <> based in <strong>{person.location}</strong></> : null} at {settings.companyName || "Avenroo Technologies"}.
        </p>
        <p>
          {person.joiningDate
            ? <>Your proposed joining date is <strong>{formatDate(person.joiningDate)}</strong>. </>
            : null}
          {person.salary ? <>The compensation for this position is <strong>{person.salary}</strong>. </> : null}
          We look forward to the skills and perspective you will bring to the team.
        </p>
        <p>Further employment terms and onboarding details will be shared with you separately. Please contact our team if you have any questions about this offer.</p>
        <p>We are excited about the possibility of working together.</p>
        <p className="offer-signoff">Warm regards,</p>
        <div className="document-signature">
          <span className="signature-rule" />
          <strong>{settings.signatoryName || "Avenroo Technologies"}</strong>
          <small>{settings.signatoryTitle || "Authorized Signatory"}</small>
          <small>{settings.companyName || "Avenroo Technologies"}</small>
        </div>
      </div>
      <footer className="offer-footer">{settings.companyName || "Avenroo Technologies"} · Private and confidential</footer>
    </article>
  );
}

export default function DocumentStudio() {
  const fileInputRef = useRef(null);
  const [type, setType] = useState("offer");
  const [people, setPeople] = useState([]);
  const [fileName, setFileName] = useState("");
  const [skippedRows, setSkippedRows] = useState(0);
  const [error, setError] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "Avenroo Technologies",
    issueDate: todayInputValue(),
    defaultDesignation: "Software Developer Intern",
    defaultProgram: "Avenroo Technologies Internship Program",
    signatoryName: "Avenroo Technologies",
    signatoryTitle: "Authorized Signatory",
  });
  const documents = useMemo(() => people.map((person) => ({ person, key: `${person.sourceRow}-${person.name}` })), [people]);

  const updateSetting = (field, value) => setSettings((current) => ({ ...current, [field]: value }));

  const importWorkbook = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setIsReading(true);
    try {
      if (file.size > MAX_FILE_SIZE) throw new Error("Choose a spreadsheet smaller than 10 MB.");
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true, sheetRows: MAX_DOCUMENTS + 2 });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error("No worksheet was found in this file.");
      const table = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false, blankrows: false });
      const result = getDocumentRows(table);
      setPeople(result.people);
      setSkippedRows(result.skippedRows);
      setFileName(file.name);
    } catch (readError) {
      setError(readError.message || "This spreadsheet could not be opened. Try an .xlsx, .xls, or .csv file.");
      setPeople([]);
      setSkippedRows(0);
      setFileName("");
    } finally {
      setIsReading(false);
    }
  };

  const clearWorkbook = () => {
    setPeople([]);
    setFileName("");
    setSkippedRows(0);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="admin-document-studio">
      <section className="document-studio-hero">
        <div>
          <p className="admin-eyebrow">HR document tools</p>
          <h2>Good work deserves a thoughtful welcome.</h2>
          <p>Turn a staff spreadsheet into consistent offer letters or certificates, ready to review and print.</p>
        </div>
        <div className="document-studio-mark"><Award size={30} /><span>LETTER<br />STUDIO</span></div>
      </section>

      <div className="document-studio-notice"><ShieldCheck size={18} /><p><strong>Your file stays on this device.</strong> The spreadsheet is read in your browser and is not uploaded to the Avenroo server.</p></div>

      <div className="document-studio-layout">
        <section className="admin-panel-card document-controls-card">
          <div className="admin-panel-heading"><div><p className="admin-eyebrow">Build a batch</p><h2>Document setup</h2><p className="admin-panel-subtitle">Choose a format, upload a sheet, and set the company details.</p></div></div>

          <fieldset className="document-type-picker">
            <legend>Choose document</legend>
            <button type="button" className={type === "offer" ? "is-selected" : ""} onClick={() => setType("offer")} aria-pressed={type === "offer"}>
              <FileText size={18} /><span><strong>Offer letters</strong><small>Employment offers</small></span>
            </button>
            <button type="button" className={type === "certificate" ? "is-selected" : ""} onClick={() => setType("certificate")} aria-pressed={type === "certificate"}>
              <Award size={18} /><span><strong>Certificates</strong><small>Program completion</small></span>
            </button>
          </fieldset>

          <div className="document-upload-card">
            <span className="document-upload-icon"><FileSpreadsheet size={21} /></span>
            <div><strong>{fileName || "Upload an Excel sheet"}</strong><small>{fileName ? `${people.length} document${people.length === 1 ? "" : "s"} ready` : "Use .xlsx, .xls, or .csv · up to 200 people"}</small></div>
            {fileName && <button type="button" className="document-clear-button" onClick={clearWorkbook} aria-label="Remove spreadsheet"><X size={17} /></button>}
            <label className="admin-secondary-button document-upload-button"><Upload size={16} /> {isReading ? "Reading…" : fileName ? "Replace sheet" : "Choose file"}<input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" onChange={importWorkbook} disabled={isReading} /></label>
          </div>

          {error && <div className="document-error" role="alert"><AlertCircle size={17} /><span>{error}</span></div>}
          {fileName && <p className="document-file-note">Reading the first worksheet. Expected a name column such as <strong>Name</strong>, <strong>Employee Name</strong>, or <strong>Full Name</strong>.{skippedRows ? ` ${skippedRows} blank-name row${skippedRows === 1 ? " was" : "s were"} skipped.` : ""}</p>}

          <div className="document-settings-grid">
            <label className="document-field document-field--wide">Company name<input maxLength={100} value={settings.companyName} onChange={(event) => updateSetting("companyName", event.target.value)} /></label>
            <label className="document-field">Issue date<input type="date" value={settings.issueDate} onChange={(event) => updateSetting("issueDate", event.target.value)} /></label>
            {type === "offer" ? <label className="document-field">Default job title<input maxLength={100} value={settings.defaultDesignation} onChange={(event) => updateSetting("defaultDesignation", event.target.value)} /></label> : <label className="document-field">Default program name<input maxLength={120} value={settings.defaultProgram} onChange={(event) => updateSetting("defaultProgram", event.target.value)} /></label>}
            <label className="document-field">Signatory name<input maxLength={100} value={settings.signatoryName} onChange={(event) => updateSetting("signatoryName", event.target.value)} /></label>
            <label className="document-field">Signatory title<input maxLength={100} value={settings.signatoryTitle} onChange={(event) => updateSetting("signatoryTitle", event.target.value)} /></label>
          </div>

          <div className="document-studio-actions">
            <button type="button" className="admin-secondary-button" onClick={downloadTemplate}><Download size={16} /> Excel template</button>
            <button type="button" className="admin-primary-button" onClick={() => window.print()} disabled={!people.length}><Printer size={16} /> Print / Save as PDF</button>
          </div>
          <p className="document-print-hint">Opens the print dialog with one document per page. Choose <strong>Save as PDF</strong> to create a file.</p>
        </section>

        <section className="admin-panel-card document-preview-card">
          <div className="admin-panel-heading"><div><p className="admin-eyebrow">Review before printing</p><h2>Batch preview</h2></div><span className="document-count-pill">{people.length} ready</span></div>
          {people.length ? (
            <>
              <div className="document-preview-summary"><span>{type === "offer" ? <FileText size={18} /> : <Award size={18} />}</span><div><strong>{type === "offer" ? "Offer letters" : "Certificates"}</strong><small>{fileName} · {people.length} page{people.length === 1 ? "" : "s"}</small></div></div>
              <div className="document-preview-table-wrap"><table className="document-preview-table"><thead><tr><th>Name</th><th>{type === "offer" ? "Position" : "Program"}</th><th>{type === "offer" ? "Joining date" : "Issue date"}</th></tr></thead><tbody>
                {people.slice(0, 8).map((person) => <tr key={`${person.sourceRow}-${person.name}`}><td>{person.name}</td><td>{type === "offer" ? person.designation || settings.defaultDesignation : person.program || settings.defaultProgram}</td><td>{formatDate(type === "offer" ? person.joiningDate : person.issueDate) || formatDate(settings.issueDate)}</td></tr>)}
              </tbody></table></div>
              {people.length > 8 && <p className="document-preview-more">Showing 8 of {people.length}. All rows will be included in the printout.</p>}
            </>
          ) : (
            <div className="document-empty-preview"><span><Upload size={21} /></span><strong>Your batch preview will appear here</strong><p>Upload the staff or participant spreadsheet to create a page for each person.</p><button type="button" className="admin-text-button" onClick={downloadTemplate}><Download size={16} /> Download the Excel template</button></div>
          )}
        </section>
      </div>

      <div className="document-print-pages" aria-hidden="true">
        {documents.map(({ person, key }) => <DocumentPage key={key} person={person} type={type} settings={settings} />)}
      </div>
    </div>
  );
}
