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

class AnimationTimeline {
  constructor(spreadsheetId, range) {
    this.spreadsheetId = spreadsheetId;
    this.range = range;
    this.events = [];
    this.timingSrc = null;
    this.currentTime = 0;
    this.duration = 0;
  }

  async initialize() {
    await loadGoogleSheetsAPI();
    await this.loadEvents();
    this.setupTimeline();
  }

  async loadEvents() {
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
      });

      // Convert sheet data to event objects
      this.events = response.result.values.map(row => ({
        time: parseInt(row[0]), // milliseconds past the hour
        target: row[1], // CSS selector for target element
        classesToRemove: row[2] ? row[2].split(',').map(c => c.trim()) : [],
        classesToAdd: row[3] ? row[3].split(',').map(c => c.trim()) : [],
        transitionType: row[4] ? row[4].split(',').map(c => c.trim()) : [],
        transitionDuration: row[5] ? row[5].split(',').map(c => c.trim()) : []
      })).sort((a, b) => a.time - b.time);

      // Calculate total duration
      this.duration = this.events[this.events.length - 1].time;
    } catch (error) {
      console.error('Error loading events from Google Sheets:', error);
    }
  }

  setupTimeline() {
    // Create TimingSrc timeline
    this.ds = new TIMINGSRC.Dataset();
    window.timingSrcObj = new TIMINGSRC.TimingObject({
      range: [0, Infinity]
    });


    // const tempCues = [
    //     { key: 'a', time: 5, callback: () => { console.log('Event at 5 seconds'); updateDom('body', 'bg-*', 'bg-blue')} },
    //     { key: 'b', time: 10, callback: () => { console.log('Event at 10 seconds'); updateDom('body', 'bg-*', 'bg-red')} }
    //     // { key: 'b', time: 3000, callback: () => { console.log('Event at 3 seconds'); } },
    //     // { key: 'c', time: 5000, callback: () => { console.log('Event at 5 seconds'); } }
    // ];

    let sequencerImportedCues = [];
    let rangeEndTime = 0;

    this.events.forEach(event => {
      console.log('evemt props', event.target, event.classesToRemove, event.classesToAdd);
      if (isNaN(event.time)) return;
      const eventTime = event.time / 1000;
      sequencerImportedCues.push({
        key: event.time + '_' + event.target.replace(/[^a-zA-Z0-9]/g, '') + '_' + Math.random().toString().substr(3,7),
        time: eventTime,
        callback: () => {
          updateDom(event.target, event.classesToRemove, event.classesToAdd);
        }
      });
      rangeEndTime = (eventTime > rangeEndTime) ? eventTime : rangeEndTime;
    });

    console.log('sequencerImportedCues', sequencerImportedCues, 'rangeEndTime', rangeEndTime);

    this.timingSrc = new TIMINGSRC.LoopConverter(window.timingSrcObj, [0, rangeEndTime]);  // 20 seconds
    this.seq = new TIMINGSRC.Sequencer(this.ds, this.timingSrc);

    const cues = sequencerImportedCues.map(item => {
      return {
        key: item.key,
        interval: new TIMINGSRC.Interval(item.time, ((item.time + 0.5) < rangeEndTime) ? (item.time + 0.5) : rangeEndTime),
        data: item
      };
    });

    this.seq.on('change', (eArg, eInfo) => {
      console.log('Sequencer changed', eArg, eInfo);
      eArg.new.data.callback();
      // console.log('pos', this.timingSrc.pos);
    });

    this.timingSrc.on('change', () => {
      // const bgColor = getTimeColor(window.timing.pos);
      // document.body.style.backgroundColor = bgColor;
      // console.log('timingSrcObj change event.', this.timingSrc.pos);
      // Find and execute missed cues
      // cues.forEach(cue => {
      //   if (cue.time > lastTime && cue.time <= newTime) {
      //       cue.action(); // Manually trigger cue
      //   }
      // });
    });

    this.ds.update(cues);
  }

  // Control methods
  play() {
    this.timingSrc.update({ velocity: 1 });
  }

  pause() {
    this.timingSrc.update({ velocity: 0 });
  }

  reset() {
    this.timingSrc.update({ position: 0 });
  }

  seekTo(timeInMs) {
    this.timingSrc.update({ position: timeInMs % this.duration });
  }
}

const timeline = new AnimationTimeline(
  '1vfigIVdQr1goZNtSGOEN_7fNANqh1ugZJ5cxypyTeag',
  'Sequencer-Main!A1:F100'
);

// Initialize and start the timeline
timeline.initialize().then(() => {
  console.log('Timeline ready');
});

function updateDom(targetSelector, classNameToRemove, classNameToAdd) {
  const targetEl = document.querySelector(targetSelector);
  if (!targetEl) return;

  classNameToRemove = (Array.isArray(classNameToRemove)) ? classNameToRemove[0] : classNameToRemove;
  classNameToAdd = (Array.isArray(classNameToAdd)) ? classNameToAdd[0] : classNameToAdd;

  if (classNameToRemove) {
    if (classNameToRemove.endsWith('*')) {
      console.log('multi-matching for', classNameToRemove);
      targetEl.classList.remove(...targetEl.className
        .split(' ')
        .filter(
          className => className.startsWith(classNameToRemove.slice(0, -1))
        )
      );
      console.log(targetEl, 'Removed class', classNameToRemove);
    } else {
      targetEl.classList.remove(classNameToRemove);
      console.log(targetEl, 'Removed class:', classNameToRemove);
    }
  } else {
    console.log(targetEl, 'Has no classes to remove');
  }

  if (classNameToAdd) {
    targetEl.classList.add(classNameToAdd);
  }

  console.log(targetEl, 'Now has classes:', targetEl.className);
}