/**
 * ============================================================================
 *  MATH HACKS ACADEMY — Registration + Course Certificate backend
 *  Google Apps Script (bound to a Google Sheet), deployed as a Web App.
 * ============================================================================
 *
 *  WHAT IT DOES
 *  ------------
 *  1. action "register"    → saves the registration in the "Registrations" tab.
 *  2. action "certificate" → cross-checks the student against "Registrations"
 *                            (email + mobile + student name must all match).
 *                            Only if registered:
 *                              a. saves the request in the "Certificates" tab,
 *                              b. writes the student name + date onto the
 *                                 certificate template and saves it as a PNG
 *                                 in Google Drive,
 *                              c. emails the admin (notification), and
 *                              d. emails the student the certificate.
 *
 *  ONE-TIME SETUP
 *  --------------
 *  1. Create a new Google Sheet → Extensions → Apps Script.
 *     Replace the default Code.gs content with this file.
 *  2. In the Apps Script editor: Services (+) → add "Google Slides API"
 *     (identifier must be "Slides"). It is used to render the certificate.
 *  3. Upload public/certificate_template.jpeg to Google Drive. Open it, copy the
 *     ID from the URL (drive.google.com/file/d/<THIS_PART>/view) and paste it
 *     into CONFIG.TEMPLATE_FILE_ID below.
 *     (Alternatively leave it empty and set CONFIG.TEMPLATE_URL to the public
 *     URL of the image on your website.)
 *  4. Set CONFIG.ADMIN_EMAIL (and optionally CONFIG.CERT_FOLDER_ID).
 *  5. Select the function "setup" in the toolbar and click Run. Approve the
 *     permissions. This creates both tabs with headers + the Drive folder.
 *  6. (Optional) Run "testCertificate" — it renders a sample certificate into
 *     the Drive folder and logs its link, so you can check the placement.
 *  7. Deploy → New deployment → type "Web app"
 *       Execute as:      Me
 *       Who has access:  Anyone
 *     Copy the Web app URL (ends with /exec) into the website's .env file:
 *       VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
 *     then rebuild the website.
 *  8. Whenever you edit this script later: Deploy → Manage deployments →
 *     Edit (pencil) → Version: "New version" → Deploy (the URL stays the same).
 * ============================================================================
 */

const CONFIG = {
  ADMIN_EMAIL: 'admin@example.com', // ← who gets notified (comma-separate for several)
  ACADEMY_NAME: 'Math Hacks Academy',
  NOTIFY_ADMIN_ON_REGISTRATION: false, // set true to also get an email for each registration

  REGISTRATION_SHEET: 'Registrations',
  CERTIFICATE_SHEET: 'Certificates',

  TEMPLATE_FILE_ID: '', // ← Drive file ID of certificate_template.jpeg
  TEMPLATE_URL: '', //      or a public URL to it, e.g. https://yourdomain.com/certificate_template.jpeg
  CERT_FOLDER_ID: '', //    optional; if empty a "Math Hacks Certificates" folder is created
  CERT_FOLDER_NAME: 'Math Hacks Certificates',

  TIMEZONE: 'Asia/Kolkata',
  DATE_FORMAT: 'dd MMMM yyyy', // e.g. 02 November 2026
};

/**
 * Certificate layout, in pixels of the original 1280 × 904 template image.
 * (Converted to slide points automatically.) Tweak and run testCertificate().
 */
const LAYOUT = {
  TEMPLATE_W: 1280,
  TEMPLATE_H: 904,
  PAGE_W_PT: 960, // slide width in points; height follows the template ratio

  // Student name: the blank band between "THIS IS TO PROUDLY CERTIFY THAT"
  // and the "has Successfully Completed..." paragraph.
  NAME_BOX: { left: 335, top: 400, width: 680, height: 110 },
  NAME_FONT: 'Great Vibes',
  NAME_COLOR: '#A8781F',
  NAME_MAX_PT: 48, // shrinks automatically for long names
  NAME_MIN_PT: 26,
  NAME_UNDERLINE: { x1: 465, x2: 885, y: 510, color: '#C8912A', weightPt: 0.75 },

  // Date of submission: bottom-left, styled like the signature block on the right.
  DATE_VALUE_BOX: { left: 280, top: 690, width: 240, height: 44 },
  DATE_LINE: { x1: 305, x2: 495, y: 740, color: '#2B2A24', weightPt: 0.75 },
  DATE_LABEL_BOX: { left: 280, top: 748, width: 240, height: 34 },
  DATE_LABEL: 'Date of Issue',
  DATE_FONT: 'Playfair Display',
  DATE_COLOR: '#2B2A24',
  DATE_VALUE_PT: 14,
  DATE_LABEL_PT: 13,
};

const REG_HEADERS = [
  'Timestamp', 'Registration ID', 'Student Name', 'Parent Name',
  'Mobile', 'Email', 'Student DOB', 'Message',
];
const CERT_HEADERS = [
  'Timestamp', 'Request ID', 'Student Name', 'Email', 'Mobile',
  'Registration ID', 'Certificate Date', 'Certificate Link', 'Certificate File ID', 'Status',
];

/* ========================================================================== */
/*  Web app entry points                                                      */
/* ========================================================================== */

function doGet() {
  return json_({ ok: true, message: 'Math Hacks form endpoint is running.' });
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, message: 'Invalid request.' });
  }

  // Honeypot: real users never fill the hidden "website" field.
  if (data.website) return json_({ ok: true, message: 'Thank you!' });

  try {
    if (data.action === 'register') return json_(handleRegistration_(data));
    if (data.action === 'certificate') return json_(handleCertificate_(data));
    return json_({ ok: false, message: 'Unknown action.' });
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, message: 'Something went wrong on our side. Please try again in a few minutes.' });
  }
}

/* ========================================================================== */
/*  Registration                                                              */
/* ========================================================================== */

function handleRegistration_(d) {
  const studentName = cleanName_(d.studentName);
  const parentName = cleanName_(d.parentName);
  const mobile = normalizePhone_(d.mobile);
  const email = normalizeEmail_(d.email);
  const dob = String(d.dob || '').trim();
  const message = String(d.message || '').trim().slice(0, 1000);

  if (!studentName || !parentName) return fail_('Please enter both the student and parent names.');
  if (!mobile) return fail_('Please enter a valid 10-digit mobile number.');
  if (!email) return fail_('Please enter a valid email address.');
  if (!isValidDob_(dob)) return fail_('Please enter a valid date of birth.');

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSheet_(CONFIG.REGISTRATION_SHEET, REG_HEADERS);
    const rows = sheet.getDataRange().getValues().slice(1);

    // Same student already registered with the same contact details → don't duplicate.
    const existing = rows.find(r =>
      normalizeEmail_(r[5]) === email &&
      normalizePhone_(r[4]) === mobile &&
      nameKey_(r[2]) === nameKey_(studentName));
    if (existing) {
      return { ok: true, message: `${studentName} is already registered (ID ${existing[1]}). We'll be in touch soon!` };
    }

    const regId = 'MHR-' + String(rows.length + 1).padStart(4, '0');
    sheet.appendRow([
      new Date(), regId, safe_(studentName), safe_(parentName),
      "'" + mobile, safe_(email), "'" + dob, safe_(message),
    ]);

    if (CONFIG.NOTIFY_ADMIN_ON_REGISTRATION) {
      MailApp.sendEmail({
        to: CONFIG.ADMIN_EMAIL,
        subject: `New registration: ${studentName} (${regId})`,
        htmlBody: adminTable_('New student registration', [
          ['Registration ID', regId], ['Student', studentName], ['Parent', parentName],
          ['Mobile', mobile], ['Email', email], ['DOB', dob], ['Message', message || '—'],
        ]),
      });
    }

    return {
      ok: true,
      message: `Thank you! ${studentName} has been registered (ID ${regId}). Our team will contact you soon.`,
    };
  } finally {
    lock.releaseLock();
  }
}

/* ========================================================================== */
/*  Course completion certificate                                             */
/* ========================================================================== */

function handleCertificate_(d) {
  const studentName = cleanName_(d.studentName);
  const email = normalizeEmail_(d.email);
  const mobile = normalizePhone_(d.mobile);

  if (!studentName) return fail_('Please enter the student name.');
  if (!email) return fail_('Please enter a valid email address.');
  if (!mobile) return fail_('Please enter a valid 10-digit mobile number.');

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    // ---- 1. Cross-validate against the Registrations tab -------------------
    const regRows = getSheet_(CONFIG.REGISTRATION_SHEET, REG_HEADERS).getDataRange().getValues().slice(1);
    const contactMatches = regRows.filter(r =>
      normalizeEmail_(r[5]) === email && normalizePhone_(r[4]) === mobile);

    if (!contactMatches.length) {
      return fail_('We couldn\'t find a registration with this email and mobile number. ' +
        'Please use the same details you registered with, or contact the academy.');
    }
    const reg = contactMatches.find(r => nameKey_(r[2]) === nameKey_(studentName));
    if (!reg) {
      return fail_('The student name doesn\'t match our registration records for this email and mobile. ' +
        'Please enter the name exactly as registered.');
    }
    const regId = String(reg[1]);

    // ---- 2. Already issued? Re-send instead of creating a duplicate --------
    const certSheet = getSheet_(CONFIG.CERTIFICATE_SHEET, CERT_HEADERS);
    const certRows = certSheet.getDataRange().getValues().slice(1);
    const issued = certRows.find(r => String(r[5]) === regId && r[8] && String(r[9]).indexOf('Sent') === 0);
    if (issued) {
      const file = DriveApp.getFileById(String(issued[8]));
      sendStudentEmail_(email, String(issued[2]), file.getBlob());
      return { ok: true, message: `A certificate was already issued for ${issued[2]}. We've re-sent it to ${email}.` };
    }

    // ---- 3. Save the request in the Certificates tab -----------------------
    const now = new Date();
    const certDate = Utilities.formatDate(now, CONFIG.TIMEZONE, CONFIG.DATE_FORMAT);
    const requestId = 'MHC-' + String(certRows.length + 1).padStart(4, '0');
    certSheet.appendRow([
      now, requestId, safe_(studentName), safe_(email), "'" + mobile,
      regId, certDate, '', '', 'Generating…',
    ]);
    const rowIndex = certSheet.getLastRow();
    const setStatus = (link, fileId, status) =>
      certSheet.getRange(rowIndex, 8, 1, 3).setValues([[link, fileId, status]]);

    // ---- 4. Generate certificate → Drive ----------------------------------
    let file;
    try {
      file = createCertificate_(studentName, certDate);
    } catch (err) {
      console.error(err && err.stack ? err.stack : err);
      setStatus('', '', 'Failed: ' + (err.message || err));
      MailApp.sendEmail(CONFIG.ADMIN_EMAIL, `Certificate generation FAILED: ${studentName}`,
        `Request ${requestId} for ${studentName} (${email}, ${mobile}) could not be generated.\n\nError: ${err.message || err}`);
      return fail_('Your details are verified, but we couldn\'t generate the certificate right now. ' +
        'Our team has been notified and will email it to you shortly.');
    }

    // ---- 5. Emails: admin + student ---------------------------------------
    const errors = [];
    try {
      sendStudentEmail_(email, studentName, file.getBlob());
    } catch (err) { errors.push('student email: ' + err.message); }
    try {
      MailApp.sendEmail({
        to: CONFIG.ADMIN_EMAIL,
        subject: `Certificate issued: ${studentName} (${requestId})`,
        htmlBody: adminTable_('Course completion certificate issued', [
          ['Request ID', requestId], ['Registration ID', regId], ['Student', studentName],
          ['Email', email], ['Mobile', mobile], ['Certificate date', certDate],
          ['Certificate', `<a href="${file.getUrl()}">Open in Google Drive</a>`],
        ], true),
      });
    } catch (err) { errors.push('admin email: ' + err.message); }

    setStatus(file.getUrl(), file.getId(), errors.length ? 'Created — ' + errors.join('; ') : 'Sent');

    if (errors.some(e => e.indexOf('student') === 0)) {
      return fail_('Your certificate was created, but we couldn\'t email it. Our team will send it to you shortly.');
    }
    return { ok: true, message: `Congratulations, ${studentName}! Your certificate has been emailed to ${email}.` };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Renders the certificate: template image as a slide background, name + date
 * as text boxes, exported to PNG via the Slides API, saved to Drive.
 * The temporary presentation is trashed afterwards.
 */
function createCertificate_(studentName, certDate) {
  const L = LAYOUT;
  const k = L.PAGE_W_PT / L.TEMPLATE_W; // px → pt
  const pageH = L.TEMPLATE_H * k;

  const pres = Slides.Presentations.create({
    title: 'tmp-certificate-' + Date.now(),
    pageSize: {
      width: { magnitude: L.PAGE_W_PT, unit: 'PT' },
      height: { magnitude: pageH, unit: 'PT' },
    },
  });
  const presId = pres.presentationId;

  try {
    const deck = SlidesApp.openById(presId);
    const slide = deck.getSlides()[0];
    slide.getPageElements().forEach(el => el.remove());
    slide.getBackground().setPictureFill(getTemplateBlob_());

    // Student name
    const nb = L.NAME_BOX;
    const nameShape = slide.insertTextBox(studentName, nb.left * k, nb.top * k, nb.width * k, nb.height * k);
    styleText_(nameShape, L.NAME_FONT, nameFontSize_(studentName), L.NAME_COLOR, false);

    const u = L.NAME_UNDERLINE;
    const line1 = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, u.x1 * k, u.y * k, u.x2 * k, u.y * k);
    line1.getLineFill().setSolidFill(u.color);
    line1.setWeight(u.weightPt);

    // Date (bottom-left)
    const dv = L.DATE_VALUE_BOX;
    const dateShape = slide.insertTextBox(certDate, dv.left * k, dv.top * k, dv.width * k, dv.height * k);
    styleText_(dateShape, L.DATE_FONT, L.DATE_VALUE_PT, L.DATE_COLOR, false, true);

    const dl = L.DATE_LINE;
    const line2 = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, dl.x1 * k, dl.y * k, dl.x2 * k, dl.y * k);
    line2.getLineFill().setSolidFill(dl.color);
    line2.setWeight(dl.weightPt);

    const lb = L.DATE_LABEL_BOX;
    const labelShape = slide.insertTextBox(L.DATE_LABEL, lb.left * k, lb.top * k, lb.width * k, lb.height * k);
    styleText_(labelShape, L.DATE_FONT, L.DATE_LABEL_PT, L.DATE_COLOR, true);

    const pageId = slide.getObjectId();
    deck.saveAndClose();

    // Export the slide as a PNG (LARGE = 1600 px wide)
    const thumb = Slides.Presentations.Pages.getThumbnail(presId, pageId, {
      'thumbnailProperties.mimeType': 'PNG',
      'thumbnailProperties.thumbnailSize': 'LARGE',
    });
    const png = UrlFetchApp.fetch(thumb.contentUrl).getBlob()
      .setName(`Math Hacks Certificate - ${studentName}.png`);

    return getCertFolder_().createFile(png);
  } finally {
    try { DriveApp.getFileById(presId).setTrashed(true); } catch (e) { /* ignore */ }
  }
}

function styleText_(shape, font, sizePt, color, bold, italic) {
  shape.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
  const text = shape.getText();
  text.getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  text.getTextStyle()
    .setFontFamily(font)
    .setFontSize(sizePt)
    .setForegroundColor(color)
    .setBold(!!bold)
    .setItalic(!!italic);
}

function nameFontSize_(name) {
  const L = LAYOUT;
  const n = name.length;
  if (n <= 22) return L.NAME_MAX_PT;
  return Math.max(L.NAME_MIN_PT, Math.round((L.NAME_MAX_PT * 22) / n));
}

function getTemplateBlob_() {
  if (CONFIG.TEMPLATE_FILE_ID) return DriveApp.getFileById(CONFIG.TEMPLATE_FILE_ID).getBlob();
  if (CONFIG.TEMPLATE_URL) return UrlFetchApp.fetch(CONFIG.TEMPLATE_URL).getBlob();
  throw new Error('Set CONFIG.TEMPLATE_FILE_ID (or CONFIG.TEMPLATE_URL) to the certificate template.');
}

function getCertFolder_() {
  if (CONFIG.CERT_FOLDER_ID) return DriveApp.getFolderById(CONFIG.CERT_FOLDER_ID);
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('CERT_FOLDER_ID');
  if (savedId) {
    try {
      const f = DriveApp.getFolderById(savedId);
      if (!f.isTrashed()) return f;
    } catch (e) { /* folder deleted → recreate */ }
  }
  const folder = DriveApp.createFolder(CONFIG.CERT_FOLDER_NAME);
  props.setProperty('CERT_FOLDER_ID', folder.getId());
  return folder;
}

/* ========================================================================== */
/*  Emails                                                                    */
/* ========================================================================== */

function sendStudentEmail_(to, studentName, pngBlob) {
  const name = esc_(studentName);
  MailApp.sendEmail({
    to: to,
    replyTo: CONFIG.ADMIN_EMAIL.split(',')[0].trim(),
    name: CONFIG.ACADEMY_NAME,
    subject: `🎓 Your Course Completion Certificate — ${CONFIG.ACADEMY_NAME}`,
    htmlBody: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#16150f;line-height:1.6">
        <div style="height:4px;background:linear-gradient(90deg,#c8912a,#e2b23c,#1f8a7e)"></div>
        <h2 style="font-weight:normal;margin:24px 0 8px">Congratulations, ${name}! 🎉</h2>
        <p>You have successfully completed the <b>Vedic Mathematics course</b> at ${esc_(CONFIG.ACADEMY_NAME)}.
           Your course completion certificate is attached to this email.</p>
        <p>We are proud of your dedication and wish you continued growth, confidence and success
           in your mathematical journey.</p>
        <p style="margin-top:28px">Warm regards,<br><b>Kiruthika R</b><br>Founder &amp; Director, ${esc_(CONFIG.ACADEMY_NAME)}</p>
        <p style="font-size:12px;color:#6b6555;margin-top:28px">Math Hacks — Smart way to success</p>
      </div>`,
    attachments: [pngBlob],
  });
}

function adminTable_(title, rows, allowHtmlInLast) {
  const tr = rows.map(([k, v], i) => {
    const val = allowHtmlInLast && i === rows.length - 1 ? v : esc_(v);
    return `<tr><td style="padding:6px 12px;background:#f7f1e3;font-weight:bold">${esc_(k)}</td>` +
      `<td style="padding:6px 12px">${val}</td></tr>`;
  }).join('');
  return `<div style="font-family:Arial,sans-serif;color:#16150f">
      <h3>${esc_(title)}</h3>
      <table style="border-collapse:collapse;border:1px solid #e5dcc4">${tr}</table>
      <p style="font-size:12px;color:#6b6555">Spreadsheet: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}</p>
    </div>`;
}

/* ========================================================================== */
/*  Setup + test helpers (run these from the editor)                          */
/* ========================================================================== */

/** Run once: creates both tabs with headers and the certificate folder. */
function setup() {
  getSheet_(CONFIG.REGISTRATION_SHEET, REG_HEADERS);
  getSheet_(CONFIG.CERTIFICATE_SHEET, CERT_HEADERS);
  const folder = getCertFolder_();
  getTemplateBlob_(); // fails early if the template isn't configured
  console.log('Setup complete. Certificates folder: ' + folder.getUrl());
}

/** Renders a sample certificate into the Drive folder so you can check placement. */
function testCertificate() {
  const date = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, CONFIG.DATE_FORMAT);
  const file = createCertificate_('Aarav Krishnamurthy', date);
  console.log('Sample certificate: ' + file.getUrl());
}

/* ========================================================================== */
/*  Utilities                                                                 */
/* ========================================================================== */

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold').setBackground('#16150f').setFontColor('#f7f1e3');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail_(message) {
  return { ok: false, message: message };
}

/** Trim, collapse spaces, cap length. */
function cleanName_(v) {
  return String(v || '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

/** Comparison key for names: case/spacing/punctuation-insensitive. */
function nameKey_(v) {
  return String(v || '').toLowerCase().replace(/[^a-z\u0080-￿]+/g, '');
}

function normalizeEmail_(v) {
  const e = String(v || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : '';
}

/** Returns the 10-digit Indian mobile number, or '' if invalid. */
function normalizePhone_(v) {
  let digits = String(v || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
  if (digits.length === 11 && digits[0] === '0') digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : '';
}

function isValidDob_(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00');
  return !isNaN(d) && d <= new Date() && d.getFullYear() > 1900;
}

/** Prevent spreadsheet formula injection from user input. */
function safe_(v) {
  const s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function esc_(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
