var sheet_id = '1Kz8tQAHTjFiAnbT9SU3hnaUlev-iwKcKPW1X-5ASVh4';
var main_sheet_name = "main_sheet";
var sheet_open = SpreadsheetApp.openById(sheet_id);
var sheet_target = sheet_open.getSheetByName(main_sheet_name);
var cache = CacheService.getScriptCache();

function doGet(e) {
  Logger.log(JSON.stringify(e));
  var result = 'Ok';
  if (e.parameter == 'undefined') {
    result = 'No Parameters';
  } else {
    var newRow = sheet_target.getLastRow() + 1;
    var rowDataLog = [];

    let calender = new Date();
    let year = calender.getFullYear();
    let month = calender.getMonth() + 1;
    let day = calender.getDate();
    let hour = calender.getHours();
    let minute = calender.getMinutes();
    let second = calender.getSeconds();

    var current_Date = `${month}/${day}/${year}`;
    rowDataLog[0] = current_Date;

    var current_Time = `${hour}:${minute}:${second}`;
    rowDataLog[1] = current_Time;

    var sts_val = '';

    // Loop through parameters sent from ESP32
    for (var param in e.parameter) {
      Logger.log('In for loop, param=' + param);
      var value = stripQuotes(e.parameter[param]);
      Logger.log(param + ':' + e.parameter[param]);

      switch (param) {
        case 'sts':
          sts_val = value;
          break;

        case 'temp':
          rowDataLog[2] = value;
          result += ', temp added';
          break;

        case 'humid':
          rowDataLog[3] = value;
          result += ', DHT11 added';
          break;


        case 'lux':
          rowDataLog[4] = value;
          result += ', LDR added';
          break;

        case 'air':
          rowDataLog[5] = value;
          result += ', MQ-2 added';
          break;

        default:
          result += ", unsupported parameter";
      }
    }

    if (sts_val === 'write') {
      Logger.log(JSON.stringify(rowDataLog));
      var newRangeDataLog = sheet_target.getRange(newRow, 1, 1, rowDataLog.length);
      newRangeDataLog.setValues([rowDataLog]);
      SpreadsheetApp.flush(); // Ensure data is written

      // Clear cache to force refresh
      cache.remove('latestData');
      return ContentService.createTextOutput(result);
    }
  }

  // Get the template and data
  var t = HtmlService.createTemplateFromFile('index');
  t.data = fetchLatestData(); // Fetch fresh data
  return t.evaluate()
    .setTitle("SafeMed")
    .setFaviconUrl("https://png.pngtree.com/png-vector/20221228/ourmid/pngtree-middle-speed-meter-in-green-yellow-red-color-for-indicator-png-image_6535104.png");
}

function postData() {
  return fetchLatestData();
}

// Function to fetch latest data with cache handling
function fetchLatestData() {
  let cachedData = cache.get('latestData');
  if (cachedData) {
    Logger.log('Using cached data');
    return JSON.parse(cachedData);
  } else {
    SpreadsheetApp.flush(); // Ensure data is up-to-date
    let data = sheet_target.getDataRange().getValues().slice(2);
    let latestEntry = data.length ? data[data.length - 1] : ["Loading...", ".", "0", "0", "0", "0"];
    let obj = {
      "date": latestEntry[0],
      "time": latestEntry[1],
      "temp": latestEntry[2],
      "humid": latestEntry[3],
      "lux": latestEntry[4],
      "air": latestEntry[5],
    };
    cache.put('latestData', JSON.stringify(obj), 10);
    Logger.log('Fetched fresh data: ' + JSON.stringify(obj));
    return obj;
  }
}

function stripQuotes(value) {
  return value.replace(/^["']|['"]$/g, "");
}
