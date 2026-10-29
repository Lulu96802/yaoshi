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
const TYPES = [
  ['qixu', 'Low-energy type (气虚质)'], ['yangxu', 'Cold type (阳虚质)'], ['yinxu', 'Dry and warm type (阴虚质)'],
  ['tanshi', 'Heavy and damp type (痰湿质)'], ['shire', 'Damp and hot type (湿热质)'], ['xueyu', 'Sluggish circulation type (血瘀质)'],
  ['qiyu', 'Stressed type (气郁质)'], ['tebing', 'Sensitive type (特禀质)'], ['pinghe', 'Balanced type (平和质)']
];
const TYPE_IDS = TYPES.map(t => t[0]);
const QUIZ_HEADERS = ['Time', 'Visitor ID', 'Language', 'Device', 'Main type', 'Also leaning towards']
  .concat(TYPES.map(t => t[1] + ' score'), ['Answers Q1–Q36 (0 never … 4 always)']);
const RESPONSE_HEADERS = ['Time', 'Visitor ID', 'Language', 'Would try?', 'Items chosen', 'Something else', 'Email', 'Body type', 'Device'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ev = clean(d.ev, 30);
    if (!['visit', 'quiz_complete', 'survey_open', 'survey_answer', 'survey_submit', 'card_save'].includes(ev)) {
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
    if (ev === 'quiz_complete') {
      const sc = d.scores && typeof d.scores === 'object' ? d.scores : {};
      const lean = Array.isArray(d.lean) ? d.lean.filter(k => TYPE_IDS.includes(k)) : [];
      const label = id => (TYPES.find(t => t[0] === id) || [id, id])[1];
      ss.getSheetByName('Quiz results').appendRow(
        [new Date(), clean(d.vid, 20), clean(d.lang, 5), clean(d.device, 10),
         TYPE_IDS.includes(d.detail) ? label(d.detail) : '', lean.map(label).join(', ')]
          .concat(TYPE_IDS.map(k => { const n = Number(sc[k]); return isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : ''; }),
                  [clean(String(d.answers || '').replace(/[^0-4-]/g, ''), 60)])
      );
    }
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
  make('Quiz results', QUIZ_HEADERS);
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
    ['Character cards saved', '=COUNTIF(Events!B:B,"card_save")'],
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
  rows.push(['', ''], ['Body type quiz', ''], ['Quizzes recorded', "=COUNTA('Quiz results'!A2:A)"]);
  const typeStart = rows.length + 2;
  rows.push(['Body type', 'People with this as main type']);
  TYPES.forEach(([id, label], i) => {
    rows.push([label, "=COUNTIF('Quiz results'!E:E,\"" + label + "\")"]);
  });
  rows.push(['', ''], ['Average score by type (0–100)', 'Average']);
  const avgStart = rows.length;
  TYPES.forEach(([id, label], i) => {
    const col = String.fromCharCode(71 + i); // G..O
    rows.push([label, "=IFERROR(ROUND(AVERAGE('Quiz results'!" + col + "2:" + col + "),0),\"\")"]);
  });
  sum.getRange(1, 1, rows.length, 2).setValues(rows);
  sum.getRange('A1').setFontSize(14).setFontWeight('bold');
  ['A3', 'A10', 'A20', 'B20'].forEach(a => sum.getRange(a).setFontWeight('bold'));
  rows.forEach((r, i) => { if (['Body type quiz', 'Body type', 'Average score by type (0–100)'].includes(r[0])) sum.getRange(i + 1, 1, 1, 2).setFontWeight('bold'); });
  sum.getRange('B12').setNumberFormat('0.0%');
  sum.getRange('B17').setNumberFormat('0.0%');
  sum.setColumnWidth(1, 260);
  sum.setColumnWidth(2, 160);
  ss.setActiveSheet(sum);
  const first = ss.getSheetByName('Sheet1');
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 3) ss.deleteSheet(first);
}
