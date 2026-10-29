/**
 * Yaoshi site tracker — receives visits, quiz results and survey answers
 * from the website and writes them into this Google Sheet.
 *
 * Setup (once):
 *   1. Paste this whole file into Extensions → Apps Script, then Save.
 *   2. Choose the function "setup" at the top and click Run (allow access when asked).
 *   3. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone. Deploy.
 *   4. Copy the Web app URL and put it in the website (TRACK_URL).
 */

const ITEMS = [
  ['grain_paste', 'Breakfast grain pastes (e.g. 黑芝麻糊)'],
  ['flower_tea', 'Herbal and flower teas'],
  ['herbal_drink', 'Ready-to-drink herbal drinks'],
  ['sweet_soup', 'Sweet soups (糖水)'],
  ['pastry', 'Pancakes, cakes and cookies']
];
const ITEM_IDS = ITEMS.map(i => i[0]);
const EVENT_HEADERS = ['Time', 'Event', 'Visitor ID', 'Session ID', 'Language', 'Page', 'Device', 'Came from', 'Body type', 'Detail'];
const RESPONSE_HEADERS = ['Time', 'Visitor ID', 'Language', 'Would try?', 'Items chosen', 'Something else', 'Email', 'Body type', 'Device'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ev = clean(d.ev, 30);
    if (!['visit', 'quiz_complete', 'survey_open', 'survey_answer', 'survey_submit'].includes(ev)) {
      return ContentService.createTextOutput('ignored');
    }
    const items = Array.isArray(d.items) ? d.items.filter(i => ITEM_IDS.includes(i)) : [];
    const detail = ev === 'survey_answer' ? clean(d.q1, 10)
                 : ev === 'survey_submit' ? clean(d.q1, 10) + (items.length ? ': ' + items.join(', ') : '')
                 : clean(d.detail, 40);
    ss.getSheetByName('Events').appendRow([
      new Date(), ev, clean(d.vid, 20), clean(d.sid, 20), clean(d.lang, 5), clean(d.page, 60),
      clean(d.device, 10), clean(d.ref, 200), clean(d.bodytype, 12), detail
    ]);
    if (ev === 'survey_submit') {
      ss.getSheetByName('Responses').appendRow([
        new Date(), clean(d.vid, 20), clean(d.lang, 5), clean(d.q1, 10), items.join(', '),
        clean(d.other, 200), clean(d.email, 120), clean(d.bodytype, 12), clean(d.device, 10)
      ]);
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Yaoshi tracker is running.');
}

// Keeps text short and stops anything that looks like a spreadsheet formula.
function clean(v, max) {
  let s = String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const make = (name, headers) => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (headers) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
    return sh;
  };
  make('Events', EVENT_HEADERS);
  make('Responses', RESPONSE_HEADERS);
  const sum = make('Summary');
  sum.clear();
  const rows = [
    ['Yaoshi dashboard', ''],
    ['', ''],
    ['Traffic', ''],
    ['Visits (sessions)', '=COUNTIF(Events!B:B,"visit")'],
    ['Unique visitors', '=IFERROR(COUNTUNIQUE(FILTER(Events!C2:C,Events!B2:B="visit")),0)'],
    ['Visits from phones', '=COUNTIFS(Events!B:B,"visit",Events!G:G,"phone")'],
    ['Visits in English / 中文 / Français', '=COUNTIFS(Events!B:B,"visit",Events!E:E,"en")&" / "&COUNTIFS(Events!B:B,"visit",Events!E:E,"zh")&" / "&COUNTIFS(Events!B:B,"visit",Events!E:E,"fr")'],
    ['Body type quizzes finished', '=COUNTIF(Events!B:B,"quiz_complete")'],
    ['', ''],
    ['Survey', ''],
    ['Survey opened', '=COUNTIF(Events!B:B,"survey_open")'],
    ['Open rate (opened ÷ visits)', '=IFERROR(B11/B4,0)'],
    ['Answers sent', '=COUNTA(Responses!A2:A)'],
    ['Yes', '=COUNTIF(Responses!D:D,"yes")'],
    ['Maybe', '=COUNTIF(Responses!D:D,"maybe")'],
    ['No', '=COUNTIF(Responses!D:D,"no")'],
    ['Interested share (yes + maybe)', '=IFERROR((B14+B15)/B13,0)'],
    ['Emails collected', '=COUNTIF(Responses!G2:G,"?*")'],
    ['', ''],
    ['What people want to try', 'Votes']
  ];
  ITEMS.forEach(([id, label]) => rows.push([label, '=COUNTIF(Responses!E:E,"*' + id + '*")']));
  sum.getRange(1, 1, rows.length, 2).setValues(rows);
  sum.getRange('A1').setFontSize(14).setFontWeight('bold');
  ['A3', 'A10', 'A20', 'B20'].forEach(a => sum.getRange(a).setFontWeight('bold'));
  sum.getRange('B12').setNumberFormat('0.0%');
  sum.getRange('B17').setNumberFormat('0.0%');
  sum.setColumnWidth(1, 260);
  sum.setColumnWidth(2, 160);
  ss.setActiveSheet(sum);
  const first = ss.getSheetByName('Sheet1');
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 3) ss.deleteSheet(first);
}
