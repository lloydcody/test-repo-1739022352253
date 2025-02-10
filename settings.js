window.globalSettings = {
  clockPrecisionLevel: 'Seconds',
  formatAsLocalTime: true
};

// First, load the Google Sheets API
function loadGoogleSheetsAPI() {
  return new Promise((resolve, reject) => {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: 'AIzaSyBcDvcA9HQnFJaBMdH64GQJGhLnmhJd7SE',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      }).then(resolve).catch(reject);
    });
  });
}

class ClockSyncSettings {
  constructor(spreadsheetId, range) {
    this.spreadsheetId = spreadsheetId;
    this.range = range;
  }

  async initialize() {
    await loadGoogleSheetsAPI();
    await this.loadSettings();
    // checkForChanges(new Date().toISOString());
    setTimeout(init, 120000);
  }

  async loadSettings() {
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
      });

      // Convert sheet data to settings values
      const rows = response.result.values;
      this.settingsList = {
        timeServerPollInterval: rows[4][1],
        clockPrecisionLevel: rows[2][1],
        formatAsLocalTime: rows[8][1] == 'TRUE',
        scaleClockUI: rows[1][1] == 'TRUE',
        // classesToRemove: row[2] ? row[2].split(',').map(c => c.trim()) : [],
        // classesToAdd: row[3] ? row[3].split(',').map(c => c.trim()) : [],
        // transitionType: row[4] ? row[4].split(',').map(c => c.trim()) : [],
        // transitionDuration: row[5] ? row[5].split(',').map(c => c.trim()) : []
      };

      window.globalSettings = this.settingsList;

    } catch (error) {
      console.error('Error loading Settings from Google Sheets:', error);
    }
  }
}

const settingsImporter = new ClockSyncSettings(
  '1vfigIVdQr1goZNtSGOEN_7fNANqh1ugZJ5cxypyTeag',
  'Settings!C2:D50'
);

// Initialize and start the timeline
function init() {
  settingsImporter.initialize().then(() => {
    console.log('Settings loaded.');
  });
}
init();
