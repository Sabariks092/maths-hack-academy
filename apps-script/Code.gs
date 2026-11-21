/**
 * ============================================================================
 *  MATH HACKS ACADEMY — Registration + Course Certificate backend
 *  Google Apps Script (bound to a Google Sheet), deployed as a Web App.
 * ============================================================================
 *
 *  WHAT IT DOES
 *  ------------
 *  1. action "register"    → saves the registration in the "Registrations" tab.
 *  2. action "certificate" → the student REQUESTS a certificate. It is checked
 *                            against "Registrations" (email + mobile + student
 *                            name must all match), marked "Requested", logged in
 *                            the "Certificates" tab, and the admin is emailed.
 *                            Nothing is sent to the student yet.
 *  3. Admin page (/admin/, password protected) → lists all students, lets the
 *     admin create trainers, assign a trainer + mode of training, and
 *     ISSUE or REJECT each certificate request. Only on "Issue" is the
 *     certificate rendered (name + date on the template → PNG in Drive) and
 *     emailed to the student's registered email address.
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
 *  3b. CERTIFICATE SLIDE (one time): in Google Drive create a blank Google
 *     Slides file, then File → Page setup → Custom → 960 × 678 points
 *     (or 1280 × 904 pixels) → Apply. Copy its ID from the URL
 *     (docs.google.com/presentation/d/<THIS_PART>/edit) into
 *     CONFIG.SLIDES_TEMPLATE_ID. Leave the slide empty; the script copies it
 *     for each certificate and fills it in.
 *  3c. ADMIN PASSWORD: Project Settings (gear icon) → Script properties →
 *     Add script property:  Property = ADMIN_PASS   Value = <your password>.
 *     The admin page sends the typed password; it is checked HERE, so it is
 *     never stored in the website's code.
 *  4. Set CONFIG.ADMIN_EMAIL (and optionally CONFIG.CERT_FOLDER_ID).
 *  5. Select the function "setup" in the toolbar and click Run. Approve the
 *     permissions. This creates the tabs with headers + the Drive folder, and
 *     adds the new columns to an existing Registrations tab.
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
  ADMIN_EMAIL: 'mathvmhacks@gmail.com', // ← who gets notified (comma-separate for several)
  ACADEMY_NAME: 'Math Hacks Academy',
  NOTIFY_ADMIN_ON_REGISTRATION: false, // set true to also get an email for each registration
  ADMIN_PAGE_URL: 'https://maths-hack-academy.vercel.app/admin/', // linked in the "new request" email

  REGISTRATION_SHEET: 'Registrations',
  CERTIFICATE_SHEET: 'Certificates',
  TRAINER_SHEET: 'Trainers',

  // Choices for the "Mode of Training" column on the admin page.
  TRAINING_MODES: ['Online', 'Offline', 'Hybrid'],

  TEMPLATE_FILE_ID: '1Cqw2o2WLNY41mR_JgO0-TLl9Lg-p6arc', // ← Drive file ID of certificate_template.jpeg
  TEMPLATE_URL: 'https://maths-hack-academy.vercel.app/certificate_template.jpeg', //      or a public URL to it, e.g. https://yourdomain.com/certificate_template.jpeg
  CERT_FOLDER_ID: '18rUd4iHIpwKwdXlF5GZkqqIeT1y7r-Vj', //    optional; if empty a "Math Hacks Certificates" folder is created
  CERT_FOLDER_NAME: 'Math Hacks Certificates',

  // Google Slides file set to the certificate's page size (see "CERTIFICATE SLIDE"
  // in the setup notes): docs.google.com/presentation/d/<THIS_PART>/edit
  SLIDES_TEMPLATE_ID: '1NzMf1wUxrZzkkdVKaK0a9Hkioig7PjR3OiEG-q6jFl4',

  TIMEZONE: 'Asia/Kolkata',
  DATE_FORMAT: 'dd MMMM yyyy', // e.g. 02 November 2026

  ADMIN_MAX_FAILED_LOGINS: 10, // wrong passwords allowed per 15 minutes before admin login pauses
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
  'Trainer', 'Mode of Training',
  'Certificate', 'Certificate URL', 'Certificate Issue Date', 'Certificate File ID',
];
/** Column positions (0-based) in the Registrations tab. */
const RC = {
  TS: 0, ID: 1, NAME: 2, PARENT: 3, MOBILE: 4, EMAIL: 5, DOB: 6, MSG: 7,
  TRAINER: 8, MODE: 9, CERT: 10, CERT_URL: 11, CERT_DATE: 12, CERT_FILE: 13,
};
const CERT_STATUS = {
  NONE: 'Not requested',
  REQUESTED: 'Requested',
  ISSUED: 'Issued',
  REJECTED: 'Rejected',
};

/** Request log (one row per request; the Registrations tab holds the current state). */
const CERT_HEADERS = [
  'Timestamp', 'Request ID', 'Student Name', 'Email', 'Mobile',
  'Registration ID', 'Certificate Date', 'Certificate Link', 'Certificate File ID', 'Status',
];
const TRAINER_HEADERS = ['Trainer Name', 'Added On'];

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
    if (data.action === 'certificate') return json_(handleCertificateRequest_(data));
    if (String(data.action || '').indexOf('admin') === 0) return json_(handleAdmin_(data));
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
      normalizeEmail_(r[RC.EMAIL]) === email &&
      normalizePhone_(r[RC.MOBILE]) === mobile &&
      nameKey_(r[RC.NAME]) === nameKey_(studentName));
    if (existing) {
      return { ok: true, message: `${studentName} is already registered (ID ${existing[RC.ID]}). We'll be in touch soon!` };
    }

    const regId = 'MHR-' + String(rows.length + 1).padStart(4, '0');
    sheet.appendRow([
      new Date(), regId, safe_(studentName), safe_(parentName),
      "'" + mobile, safe_(email), "'" + dob, safe_(message),
      '', '', CERT_STATUS.NONE, '', '', '',
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
/*  Certificate request (public form) — needs admin approval                  */
/* ========================================================================== */

function handleCertificateRequest_(d) {
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
    const regSheet = getSheet_(CONFIG.REGISTRATION_SHEET, REG_HEADERS);
    const regRows = regSheet.getDataRange().getValues().slice(1);
    const contactMatches = regRows.filter(r =>
      normalizeEmail_(r[RC.EMAIL]) === email && normalizePhone_(r[RC.MOBILE]) === mobile);

    if (!contactMatches.length) {
      return fail_('We couldn\'t find a registration with this email and mobile number. ' +
        'Please use the same details you registered with, or contact the academy.');
    }
    const reg = contactMatches.find(r => nameKey_(r[RC.NAME]) === nameKey_(studentName));
    if (!reg) {
      return fail_('The student name doesn\'t match our registration records for this email and mobile. ' +
        'Please enter the name exactly as registered.');
    }
    const regId = String(reg[RC.ID]);
    const regName = String(reg[RC.NAME]);
    const regEmail = normalizeEmail_(reg[RC.EMAIL]);
    const rowNumber = regRows.indexOf(reg) + 2;
    const status = certStatus_(reg);

    // ---- 2. Already issued → re-send (at most once an hour) ---------------
    if (status === CERT_STATUS.ISSUED && reg[RC.CERT_FILE]) {
      const cache = CacheService.getScriptCache();
      const key = 'resent_' + regId;
      if (!cache.get(key)) {
        const file = DriveApp.getFileById(String(reg[RC.CERT_FILE]));
        sendStudentEmail_(regEmail, regName, file.getBlob());
        cache.put(key, '1', 3600);
      }
      return {
        ok: true,
        message: `The certificate for ${regName} has already been issued. We've sent it to ${regEmail} — please check your inbox and spam folder.`,
      };
    }

    // ---- 3. Already waiting for approval ----------------------------------
    if (status === CERT_STATUS.REQUESTED) {
      return {
        ok: true,
        message: `We already have a certificate request for ${regName}. It will be emailed to ${regEmail} as soon as the academy approves it.`,
      };
    }

    // ---- 4. New request (or a new request after a rejection) ---------------
    regSheet.getRange(rowNumber, RC.CERT + 1).setValue(CERT_STATUS.REQUESTED);

    const certSheet = getSheet_(CONFIG.CERTIFICATE_SHEET, CERT_HEADERS);
    const requestId = 'MHC-' + String(Math.max(certSheet.getLastRow(), 1)).padStart(4, '0');
    certSheet.appendRow([
      new Date(), requestId, safe_(regName), safe_(regEmail), "'" + mobile,
      regId, '', '', '', 'Pending approval',
    ]);

    try {
      MailApp.sendEmail({
        to: CONFIG.ADMIN_EMAIL,
        subject: `Certificate request awaiting approval: ${regName} (${regId})`,
        htmlBody: adminTable_('New course certificate request — please approve or reject', [
          ['Request ID', requestId], ['Registration ID', regId], ['Student', regName],
          ['Email', regEmail], ['Mobile', mobile], ['Trainer', String(reg[RC.TRAINER] || '—')],
          ['Admin page', `<a href="${esc_(CONFIG.ADMIN_PAGE_URL)}">Open the admin page to issue or reject</a>`],
        ], true),
      });
    } catch (err) {
      console.error('Admin notification failed: ' + err.message);
    }

    return {
      ok: true,
      message: `Thank you! Your certificate request for ${regName} has been received. ` +
        `Once the academy approves it, the certificate will be emailed to ${regEmail}.`,
    };
  } finally {
    lock.releaseLock();
  }
}

/* ========================================================================== */
/*  Admin API (password checked here, against Script property ADMIN_PASS)     */
/* ========================================================================== */

function handleAdmin_(d) {
  const auth = checkAdmin_(d.password);
  if (auth) return auth;

  switch (d.action) {
    case 'adminList': return adminList_();
    case 'adminSaveStudent': return adminSaveStudent_(d);
    case 'adminAddTrainer': return adminAddTrainer_(d);
    case 'adminIssue': return adminIssue_(d);
    case 'adminReject': return adminReject_(d);
    default: return fail_('Unknown admin action.');
  }
}

/** Returns null when the password is right, otherwise an error response. */
function checkAdmin_(password) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PASS');
  if (!expected) {
    return { ok: false, code: 'auth', message: 'The admin password is not set up yet (Script property ADMIN_PASS).' };
  }
  const cache = CacheService.getScriptCache();
  const failures = Number(cache.get('admin_failed') || 0);
  if (failures >= CONFIG.ADMIN_MAX_FAILED_LOGINS) {
    return { ok: false, code: 'auth', message: 'Too many wrong passwords. Please wait 15 minutes and try again.' };
  }
  if (String(password || '') !== expected) {
    cache.put('admin_failed', String(failures + 1), 900);
    return { ok: false, code: 'auth', message: 'Wrong password.' };
  }
  return null;
}

function adminList_() {
  const rows = getSheet_(CONFIG.REGISTRATION_SHEET, REG_HEADERS).getDataRange().getValues().slice(1);
  return {
    ok: true,
    students: rows.filter(r => r[RC.ID]).map(studentJson_),
    trainers: listTrainers_(),
    modes: CONFIG.TRAINING_MODES,
  };
}

function adminSaveStudent_(d) {
  const trainer = cleanName_(d.trainer);
  const mode = String(d.mode || '').trim();
  if (trainer && listTrainers_().map(nameKey_).indexOf(nameKey_(trainer)) === -1) {
    return fail_('Please add this trainer first.');
  }
  if (mode && CONFIG.TRAINING_MODES.indexOf(mode) === -1) return fail_('Unknown mode of training.');

  return withStudent_(d.regId, (sheet, rowNumber) => {
    sheet.getRange(rowNumber, RC.TRAINER + 1, 1, 2).setValues([[safe_(trainer), mode]]);
    return { ok: true, message: 'Saved.' };
  });
}

function adminAddTrainer_(d) {
  const name = cleanName_(d.name);
  if (!name) return fail_('Please enter the trainer\'s name.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const trainers = listTrainers_();
    if (trainers.map(nameKey_).indexOf(nameKey_(name)) !== -1) return fail_(`${name} is already in the trainer list.`);
    getSheet_(CONFIG.TRAINER_SHEET, TRAINER_HEADERS).appendRow([safe_(name), new Date()]);
    return { ok: true, message: `Trainer ${name} added.`, trainers: trainers.concat(name) };
  } finally {
    lock.releaseLock();
  }
}

/** Approve: render the certificate, email it to the registered address, record it. */
function adminIssue_(d) {
  return withStudent_(d.regId, (sheet, rowNumber, reg) => {
    const status = certStatus_(reg);
    if (status === CERT_STATUS.ISSUED) return fail_('This certificate has already been issued.');
    if (status !== CERT_STATUS.REQUESTED) return fail_('The student hasn\'t requested a certificate.');

    const name = String(reg[RC.NAME]);
    const email = normalizeEmail_(reg[RC.EMAIL]);
    const certDate = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, CONFIG.DATE_FORMAT);

    let file;
    try {
      file = createCertificate_(name, certDate);
    } catch (err) {
      console.error(err && err.stack ? err.stack : err);
      return fail_('Could not generate the certificate: ' + (err.message || err));
    }

    sheet.getRange(rowNumber, RC.CERT + 1, 1, 4)
      .setValues([[CERT_STATUS.ISSUED, file.getUrl(), "'" + certDate, file.getId()]]);

    let emailError = '';
    try {
      sendStudentEmail_(email, name, file.getBlob());
    } catch (err) {
      emailError = err.message || String(err);
    }
    updateRequestLog_(String(reg[RC.ID]), [certDate, file.getUrl(), file.getId(),
      emailError ? 'Issued — email failed: ' + emailError : 'Issued']);

    return {
      ok: true,
      message: emailError
        ? `Certificate created for ${name}, but the email failed (${emailError}). The student can submit the certificate form again to have it re-sent.`
        : `Certificate issued and emailed to ${email}.`,
    };
  });
}

function adminReject_(d) {
  return withStudent_(d.regId, (sheet, rowNumber, reg) => {
    if (certStatus_(reg) !== CERT_STATUS.REQUESTED) return fail_('There is no pending request to reject.');
    sheet.getRange(rowNumber, RC.CERT + 1).setValue(CERT_STATUS.REJECTED);
    updateRequestLog_(String(reg[RC.ID]), ['', '', '', 'Rejected']);
    return { ok: true, message: `Request from ${reg[RC.NAME]} rejected.` };
  });
}

/**
 * Finds a student by registration ID (under the script lock), runs fn, and
 * attaches the student's fresh data to a successful result.
 */
function withStudent_(regId, fn) {
  regId = String(regId || '').trim();
  if (!regId) return fail_('Missing registration ID.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSheet_(CONFIG.REGISTRATION_SHEET, REG_HEADERS);
    const rows = sheet.getDataRange().getValues();
    const index = rows.findIndex((r, i) => i > 0 && String(r[RC.ID]) === regId);
    if (index === -1) return fail_('Student not found. Please refresh the page.');
    const rowNumber = index + 1;

    const result = fn(sheet, rowNumber, rows[index]);
    if (result.ok) {
      SpreadsheetApp.flush();
      result.student = studentJson_(sheet.getRange(rowNumber, 1, 1, REG_HEADERS.length).getValues()[0]);
    }
    return result;
  } finally {
    lock.releaseLock();
  }
}

/** Updates the latest "Pending approval" log row for a registration (Certificate Date … Status). */
function updateRequestLog_(regId, values) {
  const sheet = getSheet_(CONFIG.CERTIFICATE_SHEET, CERT_HEADERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = rows.length - 1; i > 0; i--) {
    if (String(rows[i][5]) === regId && String(rows[i][9]) === 'Pending approval') {
      values[0] = values[0] ? "'" + values[0] : '';
      sheet.getRange(i + 1, 7, 1, 4).setValues([values]);
      return;
    }
  }
}

function studentJson_(r) {
  return {
    regId: String(r[RC.ID]),
    registeredAt: fmtDate_(r[RC.TS], 'dd MMM yyyy, hh:mm a'),
    studentName: String(r[RC.NAME]),
    parentName: String(r[RC.PARENT]),
    mobile: String(r[RC.MOBILE]),
    email: String(r[RC.EMAIL]),
    dob: fmtDate_(r[RC.DOB], 'yyyy-MM-dd'),
    message: String(r[RC.MSG]),
    trainer: String(r[RC.TRAINER] || ''),
    mode: String(r[RC.MODE] || ''),
    certStatus: certStatus_(r),
    certUrl: String(r[RC.CERT_URL] || ''),
    certDate: fmtDate_(r[RC.CERT_DATE], CONFIG.DATE_FORMAT),
  };
}

function certStatus_(r) {
  return String(r[RC.CERT] || '').trim() || CERT_STATUS.NONE;
}

function listTrainers_() {
  return getSheet_(CONFIG.TRAINER_SHEET, TRAINER_HEADERS).getDataRange().getValues().slice(1)
    .map(r => String(r[0]).trim()).filter(Boolean);
}

/* ========================================================================== */
/*  Certificate rendering                                                     */
/* ========================================================================== */

/**
 * Renders the certificate: template image as a slide background, name + date
 * as text boxes, exported to PNG via the Slides API, saved to Drive.
 * The temporary presentation is trashed afterwards.
 */
function createCertificate_(studentName, certDate) {
  const L = LAYOUT;
  if (!CONFIG.SLIDES_TEMPLATE_ID) {
    throw new Error('Set CONFIG.SLIDES_TEMPLATE_ID (see "CERTIFICATE SLIDE" in the setup notes).');
  }

  // The Slides API can't set a page size on new decks (they're always 16:9),
  // so copy a deck that was set up once with the template's 1280×904 ratio.
  const copy = DriveApp.getFileById(CONFIG.SLIDES_TEMPLATE_ID).makeCopy('tmp-certificate-' + Date.now());
  const presId = copy.getId();

  try {
    const deck = SlidesApp.openById(presId);
    const pageW = deck.getPageWidth();
    const pageH = deck.getPageHeight();
    checkPageRatio_(pageW, pageH);

    // Template pixels → slide points, measured from the real page size.
    const kx = pageW / L.TEMPLATE_W;
    const ky = pageH / L.TEMPLATE_H;
    const fs = pageW / L.PAGE_W_PT; // font sizes in LAYOUT assume a 960 pt wide page
    const box = (b) => [b.left * kx, b.top * ky, b.width * kx, b.height * ky];

    const slides = deck.getSlides();
    slides.slice(1).forEach(s => s.remove());
    const slide = slides[0];
    slide.getPageElements().forEach(el => el.remove());
    slide.getBackground().setPictureFill(getTemplateBlob_());

    // Student name
    const nameShape = slide.insertTextBox(studentName, ...box(L.NAME_BOX));
    styleText_(nameShape, L.NAME_FONT, nameFontSize_(studentName) * fs, L.NAME_COLOR, false);

    const u = L.NAME_UNDERLINE;
    const line1 = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, u.x1 * kx, u.y * ky, u.x2 * kx, u.y * ky);
    line1.getLineFill().setSolidFill(u.color);
    line1.setWeight(u.weightPt * fs);

    // Date (bottom-left)
    const dateShape = slide.insertTextBox(certDate, ...box(L.DATE_VALUE_BOX));
    styleText_(dateShape, L.DATE_FONT, L.DATE_VALUE_PT * fs, L.DATE_COLOR, false, true);

    const dl = L.DATE_LINE;
    const line2 = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, dl.x1 * kx, dl.y * ky, dl.x2 * kx, dl.y * ky);
    line2.getLineFill().setSolidFill(dl.color);
    line2.setWeight(dl.weightPt * fs);

    const labelShape = slide.insertTextBox(L.DATE_LABEL, ...box(L.DATE_LABEL_BOX));
    styleText_(labelShape, L.DATE_FONT, L.DATE_LABEL_PT * fs, L.DATE_COLOR, true);

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

/** The slide must have the template's shape, or the image gets stretched. */
function checkPageRatio_(pageW, pageH) {
  const want = LAYOUT.TEMPLATE_W / LAYOUT.TEMPLATE_H; // 1.416
  const got = pageW / pageH;
  if (Math.abs(got - want) / want > 0.01) {
    throw new Error(
      `Certificate slide is ${Math.round(pageW)} × ${Math.round(pageH)} pt (ratio ${got.toFixed(3)}), ` +
      `but the template needs ratio ${want.toFixed(3)}. In the Slides file set ` +
      'File → Page setup → Custom → 960 × 678 points (or 1280 × 904 pixels).');
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

/** Run once (safe to re-run): creates/updates the tabs and checks the config. */
function setup() {
  getSheet_(CONFIG.REGISTRATION_SHEET, REG_HEADERS);
  getSheet_(CONFIG.CERTIFICATE_SHEET, CERT_HEADERS);
  getSheet_(CONFIG.TRAINER_SHEET, TRAINER_HEADERS);
  const folder = getCertFolder_();
  getTemplateBlob_(); // fails early if the template isn't configured
  if (!CONFIG.SLIDES_TEMPLATE_ID) throw new Error('Set CONFIG.SLIDES_TEMPLATE_ID (setup step 3b).');
  const deck = SlidesApp.openById(CONFIG.SLIDES_TEMPLATE_ID);
  checkPageRatio_(deck.getPageWidth(), deck.getPageHeight());
  if (!PropertiesService.getScriptProperties().getProperty('ADMIN_PASS')) {
    console.warn('ADMIN_PASS is not set yet — the admin page will not open (setup step 3c).');
  }
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

/** Gets (or creates) a tab and makes sure its header row has every column. */
function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  const isEmpty = sheet.getLastRow() === 0;
  if (isEmpty || sheet.getLastColumn() < headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
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

function fmtDate_(v, pattern) {
  if (v instanceof Date && !isNaN(v)) return Utilities.formatDate(v, CONFIG.TIMEZONE, pattern);
  return String(v == null ? '' : v);
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
