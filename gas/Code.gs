const RECORD_SHEET = '탐험기록';
const CONNECTION_SHEET = '연결기록';
const HEADERS = [
  '저장시각','게임','학급코드','학번','탐사대원','지역코드','지역명','발견','질문','예상답',
  '조사방법','근거','최종답','영향받는사람','이익','위험','판단과원칙','다음질문','원칙1','원칙2','원칙3','보유코어'
];

function onOpen() {
  rememberSpreadsheet_();
  SpreadsheetApp.getUi()
    .createMenu('PROJECT Q')
    .addItem('기록 시트 준비', 'setupProjectQ')
    .addToUi();
}

function setupProjectQ() {
  rememberSpreadsheet_();
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(RECORD_SHEET);
  if (!sheet) sheet = ss.insertSheet(RECORD_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground('#0e2b47').setFontColor('#ffffff').setFontWeight('bold');
  }
  let connection = ss.getSheetByName(CONNECTION_SHEET);
  if (!connection) connection = ss.insertSheet(CONNECTION_SHEET);
  if (connection.getLastRow() === 0) connection.appendRow(['수신시각','상태']);
  SpreadsheetApp.getUi().alert('PROJECT Q 기록 시트 준비가 완료되었습니다.');
}

function doGet() {
  return json_({ ok: true, app: 'PROJECT Q', time: new Date().toISOString() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');
    const ss = getSpreadsheet_();
    if (data.type === 'ping') {
      let connection = ss.getSheetByName(CONNECTION_SHEET) || ss.insertSheet(CONNECTION_SHEET);
      if (connection.getLastRow() === 0) connection.appendRow(['수신시각','상태']);
      connection.appendRow([new Date(), '연결 성공']);
      return json_({ ok: true, type: 'ping' });
    }
    let sheet = ss.getSheetByName(RECORD_SHEET) || ss.insertSheet(RECORD_SHEET);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    const safe = value => {
      const text = String(value ?? '');
      return /^[=+\-@]/.test(text) ? "'" + text : text;
    };
    sheet.appendRow([
      new Date(), safe(data.game), safe(data.classCode), safe(data.studentNo), safe(data.agentName),
      safe(data.region), safe(data.regionName), safe(data.discovery), safe(data.question), safe(data.prediction),
      safe(data.method), safe(data.evidence), safe(data.answer), safe(data.stakeholders), safe(data.benefit),
      safe(data.risk), safe(data.decision), safe(data.nextQuestion), safe(data.principle1), safe(data.principle2),
      safe(data.principle3), safe(data.cores)
    ]);
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function rememberSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', active.getId());
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('스프레드시트에서 PROJECT Q > 기록 시트 준비를 먼저 실행하세요.');
  return SpreadsheetApp.openById(id);
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
