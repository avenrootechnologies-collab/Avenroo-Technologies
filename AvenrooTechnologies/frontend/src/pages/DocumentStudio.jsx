import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Award, Download, FileSpreadsheet, FileText, Printer, ShieldCheck, Upload, X } from "lucide-react";
import API from "../api/axios";
import BrandLogo from "../components/BrandLogo";
import { CONTACT_EMAIL } from "../config/contact";
import "./DocumentStudio.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DOCUMENTS = 200;
const SIGNATURE_IMAGE_PATH = "/avenroo-signature.png";
const aliases = {
  name: ["employeename", "name", "fullname"],
  designation: ["designation", "jobtitle", "position", "role", "jobrole"],
  department: ["department", "team", "division"],
  engagementType: ["engagementtype", "employmenttype", "engagement"],
  joiningDate: ["joiningdate", "startdate", "employmentstartdate", "dateofjoining"],
  salary: ["salary", "ctc", "compensation", "annualsalary", "pay"],
  location: ["location", "worklocation", "city", "office"],
  noticePeriod: ["noticeperiod", "notice"],
  program: ["program", "course", "internship", "training", "achievement", "certification"],
  duration: ["duration", "programduration", "internshipduration", "courseperiod"],
  issueDate: ["issuedate", "date", "completiondate", "certificatedate", "dateofissue"],
  certificateId: ["certificateid", "certificatenumber", "credentialid"],
};

const normalizeHeader = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const cleanValue = (value) => String(value ?? "").trim();
const engagementCategory = (value) => {
  if (/unpaid[\s-]*intern/i.test(value)) return "unpaid-internship";
  if (/paid[\s-]*intern/i.test(value)) return "paid-internship";
  if (/unpaid/i.test(value)) return "unpaid";
  if (/paid/i.test(value)) return "paid";
  if (/part[\s-]*time/i.test(value)) return "part-time";
  if (/full[\s-]*time/i.test(value)) return "full-time";
  return "";
};

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

async function downloadTemplate(templatePolicy) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const columns = templatePolicy.spreadsheetColumns;
  const headers = columns.map((column) => column.label);
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  worksheet["!cols"] = columns.map(({ width }) => ({ wch: width }));
  XLSX.utils.book_append_sheet(workbook, worksheet, "People");
  const engagementTypes = templatePolicy.offer.engagementTypes.join(", ");
  const engagementTypeColumn = columns.find(({ key }) => key === "engagementType");
  const engagementTypeIsOptional = engagementTypeColumn?.optionalFor?.includes("offer") ?? true;
  const salaryIsOptional = templatePolicy.offer.salaryIsOptional;
  const instructions = XLSX.utils.aoa_to_sheet([
    ["Avenroo Letter Studio - input guide"],
    ["Enter one real employee or certificate recipient per row. The People sheet contains only the approved document fields."],
    [`Engagement Type is ${engagementTypeIsOptional ? "optional" : "required"}. Suggested values: ${engagementTypes}.`],
    [`Salary is ${salaryIsOptional ? "optional" : "required"}. If the Engagement Type is unpaid, leave Salary blank; unpaid terms will be stated in the letter.`],
    ["An empty Salary cell does not automatically mean unpaid. Use Engagement Type when you need to state full-time, part-time, paid, or unpaid status."],
    ["For offer letters, provide Designation, Joining Date, and Location. Salary, Department, Program, Duration, and Notice Period may be left blank when not applicable."],
    ["For certificates, provide Program. Duration, Issue Date, and Certificate ID are included when supplied."],
    ["Enter the exact registered employer, verified office address, authorized signatory, and company contact email in Document setup."],
    ["The workbook is processed in your browser and is not uploaded to the server."],
  ]);
  instructions["!cols"] = [{ wch: 130 }];
  XLSX.utils.book_append_sheet(workbook, instructions, "Instructions");
  XLSX.writeFile(workbook, "avenroo-letter-studio-template.xlsx");
}

function getDocumentRows(table) {
  if (!table.length) throw new Error("The first worksheet is empty.");
  const headers = table[0].map(normalizeHeader);
  const columns = Object.fromEntries(
    Object.entries(aliases).map(([field, options]) => [field, headers.findIndex((header) => options.includes(header))]),
  );
  if (columns.name < 0) {
    throw new Error("Add an Employee Name column to the first row.");
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

function DocumentPage({ person, type, settings, templatePolicy }) {
  const issueDate = formatDate(person.issueDate) || formatDate(settings.issueDate) || "";
  const designation = person.designation || settings.defaultDesignation || "";
  const program = person.program || settings.defaultProgram || "";
  const fieldLabels = templatePolicy?.offer?.fieldLabels;

  if (type === "certificate") {
    return (
      <article className="generated-document generated-document--certificate">
        <div className="certificate-frame">
          <header className="document-letterhead">
            <BrandLogo />
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
              <div><span>{fieldLabels?.issueDate?.toUpperCase() || "DATE OF ISSUE"}</span><strong>{issueDate}</strong></div>
              {person.certificateId && <div><span>{fieldLabels?.certificateId?.toUpperCase() || "CERTIFICATE ID"}</span><strong>{person.certificateId}</strong></div>}
            </div>
            <div className="document-signature document-signature--certificate">
              <img className="authorized-signature-image authorized-signature-image--certificate" src={SIGNATURE_IMAGE_PATH} alt="Authorized electronic signature" />
              <small>{settings.signatoryTitle}</small>
            </div>
          </div>
          <footer className="certificate-footer">{settings.companyName || "Avenroo Technologies"} · {issueDate}</footer>
        </div>
      </article>
    );
  }

  const engagementType = cleanValue(person.engagementType || settings.defaultEngagementType);
  const engagement = engagementCategory(engagementType);
  const isInternship = engagement.endsWith("internship");
  const isUnpaidEngagement = engagement === "unpaid" || engagement === "unpaid-internship";
  const isUnpaidInternship = engagement === "unpaid-internship";
  const unpaidTemplate = templatePolicy?.offer?.unpaidEngagement;
  const labels = fieldLabels || {};
  const offerHeading = isUnpaidInternship ? unpaidTemplate?.heading : engagementType ? `Offer of ${engagementType.toLowerCase()}` : "Offer letter";
  const terms = [
    [labels.designation, designation],
    person.department && [labels.department, person.department],
    engagementType && [labels.engagementType, engagementType],
    [labels.joiningDate, formatDate(person.joiningDate)],
    !isUnpaidEngagement && person.salary && [isInternship ? labels.unpaidSalary : labels.salary, person.salary],
    isUnpaidEngagement && [isInternship ? labels.unpaidSalary : labels.salary, isInternship ? unpaidTemplate?.internshipSalaryValue : unpaidTemplate?.salaryValue],
    person.location && [labels.location, person.location],
    person.program && [labels.program, person.program],
    person.duration && [labels.duration, person.duration],
    person.noticePeriod && [labels.noticePeriod, person.noticePeriod],
  ].filter((entry) => Array.isArray(entry) && entry[0] && entry[1]);

  return (
    <article className="generated-document generated-document--offer">
      <header className="offer-letterhead">
        <div className="offer-brand-block">
          <BrandLogo />
          <div className="offer-brand-contact">
            {settings.legalEmployerName && <strong>{settings.legalEmployerName}</strong>}
            {settings.officeAddress && <span>{settings.officeAddress}</span>}
            <span>{settings.companyName || "Avenroo Technologies"} · avenroo.in · {settings.contactEmail}</span>
          </div>
        </div>
        <div className="offer-document-label"><span>PRIVATE &amp; CONFIDENTIAL</span><strong>OFFER LETTER</strong></div>
      </header>
      <div className="offer-rule" />
      <div className="offer-copy">
        <div className="offer-metadata">
          <div><span>ISSUED</span><strong>{issueDate}</strong></div>
        </div>
        <div className="offer-recipient">
          <span>To</span>
          <strong>{person.name}</strong>
        </div>
        <h2>{offerHeading}</h2>
        <p>Dear {person.name},</p>
        <p>
          We are pleased to offer you {isInternship ? "an internship as" : "the position of"} <strong>{designation}</strong>{person.department ? <> in the <strong>{person.department}</strong> department</> : null} with <strong>{settings.companyName || "Avenroo Technologies"}</strong>. The legal employer or contracting entity is <strong>{settings.legalEmployerName}</strong>.
        </p>
        {isUnpaidEngagement && <p className="offer-unpaid-notice"><strong>{isUnpaidInternship ? unpaidTemplate?.internshipNoStipendHeading : unpaidTemplate?.noStipendHeading}:</strong> {unpaidTemplate?.noStipendStatement} {unpaidTemplate?.reimbursementStatement} {isUnpaidInternship && unpaidTemplate?.futureEmploymentStatement}</p>}
        <h3>Role and engagement details</h3>
        <table className="offer-terms-table"><tbody>{terms.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value}</td></tr>)}</tbody></table>
        {isUnpaidInternship && <p className="offer-responsibilities">{unpaidTemplate?.learningStatement}</p>}
        <h3>Offer and acceptance</h3>
        <p>
          Please review the terms above and sign below to record your acceptance. This offer is based on the details listed and is governed by applicable law. Any change to these terms must be confirmed in writing by the authorized employer representative.
        </p>
        <p className="offer-contact-line">Questions about this offer? Contact <strong>{settings.contactEmail}</strong>.</p>
        <div className="offer-signature-grid">
          <div className="offer-signature-panel">
            <span>For {settings.legalEmployerName}</span>
            <img className="authorized-signature-image authorized-signature-image--offer" src={SIGNATURE_IMAGE_PATH} alt="Authorized electronic signature" />
            <strong>{settings.signatoryTitle}</strong>
            <small>Date: __________________</small>
          </div>
          <div className="offer-signature-panel">
            <span>Candidate acceptance</span>
            <p>I, {person.name}, accept this offer on the terms stated above.</p>
            <div className="offer-signature-space" />
            <strong>{person.name}</strong>
            <small>Signature and date</small>
          </div>
        </div>
      </div>
      <footer className="offer-footer">{settings.companyName || "Avenroo Technologies"} · {settings.contactEmail} · avenroo.in</footer>
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
  const [templatePolicy, setTemplatePolicy] = useState(null);
  const [templateError, setTemplateError] = useState("");
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  useEffect(() => {
    let isCurrent = true;
    API.get("/admin/document-template")
      .then(({ data }) => {
        if (isCurrent) setTemplatePolicy(data);
      })
      .catch(() => {
        if (isCurrent) setTemplateError("The approved document rules could not be loaded. Refresh the admin page before generating documents.");
      })
      .finally(() => {
        if (isCurrent) setIsLoadingTemplate(false);
      });
    return () => { isCurrent = false; };
  }, []);
  const [settings, setSettings] = useState({
    companyName: "Avenroo Technologies",
    legalEmployerName: "",
    officeAddress: "",
    contactEmail: CONTACT_EMAIL,
    issueDate: todayInputValue(),
    defaultDesignation: "",
    defaultEngagementType: "",
    defaultProgram: "",
    signatoryTitle: "Founder",
    unpaidEngagementConfirmed: false,
  });
  const documents = useMemo(() => people.map((person) => ({ person, key: `${person.sourceRow}-${person.name}` })), [people]);
  const hasUnpaidEngagement = people.some((person) => ["unpaid", "unpaid-internship"].includes(engagementCategory(person.engagementType || settings.defaultEngagementType)));
  const printIssues = useMemo(() => {
    const issues = [];
    if (!templatePolicy) return [templateError || "load the approved document rules from the server"];
    const requiredSettings = type === "offer" ? templatePolicy.offer.requiredSettings : templatePolicy.certificate.requiredSettings;
    requiredSettings.forEach(({ key, message, format }) => {
      const value = cleanValue(settings[key]);
      if (!value || (format === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) issues.push(message);
    });
    if (type === "offer") {
      people.forEach((person) => {
        const missing = [];
        const engagement = cleanValue(person.engagementType || settings.defaultEngagementType);
        const category = engagementCategory(engagement);
        templatePolicy.offer.requiredPersonFields.forEach(({ key, message }) => {
          const value = key === "designation" ? (person.designation || settings.defaultDesignation) : person[key];
          if (!cleanValue(value)) missing.push(message);
        });
        if (engagement && !templatePolicy.offer.engagementTypes.some((item) => normalizeHeader(item) === normalizeHeader(engagement))) missing.push("a supported engagement type or leave Engagement Type blank");
        if (!person.issueDate && !settings.issueDate) missing.push("issue date");
        if (category.endsWith("internship")) templatePolicy.offer.internshipRequiredFields.forEach(({ key, message }) => { if (!cleanValue(person[key])) missing.push(message); });
        if (!templatePolicy.offer.salaryIsOptional && !cleanValue(person.salary) && !["unpaid", "unpaid-internship"].includes(category)) missing.push("salary");
        if (["unpaid", "unpaid-internship"].includes(category) && cleanValue(person.salary)) missing.push("leave Salary blank for an unpaid engagement");
        if (missing.length) issues.push(`row ${person.sourceRow}: ${missing.join(", ")}`);
      });
    } else {
      people.forEach((person) => {
        templatePolicy.certificate.requiredPersonFields.forEach(({ key, message }) => {
          const value = key === "program" ? (person.program || settings.defaultProgram) : person[key];
          if (!cleanValue(value)) issues.push(`row ${person.sourceRow}: ${message}`);
        });
        if (!person.issueDate && !settings.issueDate) issues.push(`row ${person.sourceRow}: issue date`);
      });
    }
    if (hasUnpaidEngagement && !settings.unpaidEngagementConfirmed) issues.push(templatePolicy.offer.unpaidEngagement.confirmationIssue);
    return issues;
  }, [hasUnpaidEngagement, people, settings, templateError, templatePolicy, type]);
  const canPrint = Boolean(people.length) && printIssues.length === 0;

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
      setSettings((current) => ({ ...current, unpaidEngagementConfirmed: false }));
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
    setSettings((current) => ({ ...current, unpaidEngagementConfirmed: false }));
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
      {templateError && <div className="document-error" role="alert"><AlertCircle size={17} /><span>{templateError}</span></div>}
      {isLoadingTemplate && <p className="document-print-hint">Loading the approved document terms…</p>}

      <div className="document-studio-layout">
        <section className="admin-panel-card document-controls-card">
          <div className="admin-panel-heading"><div><p className="admin-eyebrow">Build a batch</p><h2>Document setup</h2><p className="admin-panel-subtitle">Choose a format, upload a sheet, and set the company details.</p></div></div>

          <fieldset className="document-type-picker">
            <legend>Choose document</legend>
            <button type="button" className={type === "offer" ? "is-selected" : ""} onClick={() => setType("offer")} aria-pressed={type === "offer"}>
              <FileText size={18} /><span><strong>Offer letters</strong><small>Employment and internship offers</small></span>
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
          {fileName && <p className="document-file-note">Reading the first worksheet. Use actual recipient data; sample names, compensation, employer details, and signatures are not invented.{skippedRows ? ` ${skippedRows} blank-name row${skippedRows === 1 ? " was" : "s were"} skipped.` : ""}</p>}

          <div className="document-settings-grid">
            <label className="document-field">Company / brand name<input maxLength={100} value={settings.companyName} onChange={(event) => updateSetting("companyName", event.target.value)} /></label>
            {type === "offer" && <label className="document-field">Exact registered employer name<input maxLength={160} value={settings.legalEmployerName} onChange={(event) => updateSetting("legalEmployerName", event.target.value)} placeholder="As registered; required for offers" /></label>}
            {type === "offer" && <label className="document-field document-field--wide">Verified registered / principal office address<input maxLength={220} value={settings.officeAddress} onChange={(event) => updateSetting("officeAddress", event.target.value)} placeholder="As registered; required for offers" /></label>}
            <label className="document-field">Company contact email<input maxLength={160} type="email" value={settings.contactEmail} onChange={(event) => updateSetting("contactEmail", event.target.value)} /></label>
            <label className="document-field">Issue date<input type="date" value={settings.issueDate} onChange={(event) => updateSetting("issueDate", event.target.value)} /></label>
            {type === "offer" ? <>
              <label className="document-field">Default job title<input maxLength={100} value={settings.defaultDesignation} onChange={(event) => updateSetting("defaultDesignation", event.target.value)} placeholder="Optional; use the sheet for different roles" /></label>
              <label className="document-field">Default engagement type (optional)<select value={settings.defaultEngagementType} onChange={(event) => updateSetting("defaultEngagementType", event.target.value)}><option value="">Use each row or leave unspecified</option>{templatePolicy?.offer?.engagementTypes.map((option) => <option key={option}>{option}</option>)}</select></label>
            </> : <label className="document-field">Default program name<input maxLength={120} value={settings.defaultProgram} onChange={(event) => updateSetting("defaultProgram", event.target.value)} /></label>}
            <label className="document-field">Signatory title<input maxLength={100} value={settings.signatoryTitle} onChange={(event) => updateSetting("signatoryTitle", event.target.value)} /></label>
          </div>
          <div className="document-esignature-preview"><div><strong>Electronic signature</strong><small>Used on generated offers and certificates</small></div><img src={SIGNATURE_IMAGE_PATH} alt="Authorized electronic signature preview" /></div>

          {type === "offer" && <div className="document-authenticity-note"><ShieldCheck size={17} /><span>Offer generation uses the approved server-side template rules. The registered employer, verified office address, authorized e-signature and signatory title, and each recipient's required terms must be complete. Workbook contents remain in this browser.</span></div>}
          {type === "offer" && hasUnpaidEngagement && <>
            <label className="unpaid-internship-confirmation"><input type="checkbox" checked={settings.unpaidEngagementConfirmed} onChange={(event) => updateSetting("unpaidEngagementConfirmed", event.target.checked)} /><span>{templatePolicy?.offer?.unpaidEngagement?.confirmationLabel}</span></label>
            <p className="unpaid-internship-legal-note"><strong>{templatePolicy?.offer?.unpaidEngagement?.legalReviewHeading}:</strong> {templatePolicy?.offer?.unpaidEngagement?.legalReviewStatement} <a href={templatePolicy?.offer?.unpaidEngagement?.legalReviewUrl} target="_blank" rel="noreferrer">Read the Act</a></p>
            <details className="unpaid-internship-review-checklist">
              <summary>Internal pre-issue checklist</summary>
              <ul>{templatePolicy?.offer?.unpaidEngagement?.reviewChecklist?.map((item) => <li key={item.title}><strong>{item.title}.</strong> {item.text}</li>)}</ul>
            </details>
          </>}

          <div className="document-studio-actions">
            <button type="button" className="admin-secondary-button" onClick={() => downloadTemplate(templatePolicy)} disabled={!templatePolicy}><Download size={16} /> Excel template</button>
            <button type="button" className="admin-primary-button" onClick={() => window.print()} disabled={!canPrint}><Printer size={16} /> Print / Save as PDF</button>
          </div>
          <p className="document-print-hint">{printIssues.length ? <>To enable printing: <strong>{printIssues.slice(0, 3).join("; ")}{printIssues.length > 3 ? `; and ${printIssues.length - 3} more` : ""}</strong>.</> : <>Opens the print dialog with one document per page. Choose <strong>Save as PDF</strong> to create a file.</>}</p>
        </section>

        <section className="admin-panel-card document-preview-card">
          <div className="admin-panel-heading"><div><p className="admin-eyebrow">Review before printing</p><h2>Batch preview</h2></div><span className="document-count-pill">{people.length} ready</span></div>
          {people.length ? (
            <>
              <div className="document-preview-summary"><span>{type === "offer" ? <FileText size={18} /> : <Award size={18} />}</span><div><strong>{type === "offer" ? "Offer letters" : "Certificates"}</strong><small>{fileName} · {people.length} page{people.length === 1 ? "" : "s"}</small></div></div>
              <div className="document-preview-table-wrap"><table className="document-preview-table"><thead><tr>{(type === "offer" ? ["Employee Name", "Designation", "Department", "Joining Date", "Salary", "Location", "Program", "Duration", "Issue Date", "Notice Period", "Engagement Type"] : ["Employee Name", "Department", "Program", "Duration", "Issue Date", "Certificate ID"]).map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>
                {people.slice(0, 8).map((person) => {
                  const engagement = person.engagementType || settings.defaultEngagementType;
                  const unpaid = ["unpaid", "unpaid-internship"].includes(engagementCategory(engagement));
                  const cells = type === "offer"
                    ? [person.name, person.designation || settings.defaultDesignation, person.department, formatDate(person.joiningDate), unpaid ? "Unpaid" : person.salary, person.location, person.program, person.duration, formatDate(person.issueDate) || formatDate(settings.issueDate), person.noticePeriod, engagement]
                    : [person.name, person.department, person.program || settings.defaultProgram, person.duration, formatDate(person.issueDate) || formatDate(settings.issueDate), person.certificateId];
                  return <tr key={`${person.sourceRow}-${person.name}`}>{cells.map((cell, index) => <td key={index}>{cell || "—"}</td>)}</tr>;
                })}
              </tbody></table></div>
              {people.length > 8 && <p className="document-preview-more">Showing 8 of {people.length}. All rows will be included in the printout.</p>}
            </>
          ) : (
            <div className="document-empty-preview"><span><Upload size={21} /></span><strong>Your batch preview will appear here</strong><p>Upload the staff or participant spreadsheet to create a page for each person.</p><button type="button" className="admin-text-button" onClick={() => downloadTemplate(templatePolicy)} disabled={!templatePolicy}><Download size={16} /> Download the Excel template</button></div>
          )}
        </section>
      </div>

      <div className="document-print-pages" aria-hidden="true">
        {documents.map(({ person, key }) => <DocumentPage key={key} person={person} type={type} settings={settings} templatePolicy={templatePolicy} />)}
      </div>
    </div>
  );
}
