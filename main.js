function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
    };
    document.head.appendChild(script);
}

window.addEventListener('DOMContentLoaded', function () {
    loadScript("https://unpkg.com/timesync@1.0.11/dist/timesync.min.js", function () {
        if (typeof timesync === 'undefined') {
            console.error('Timesync library failed to load.');
            return;
        }
        
        const ts = timesync.create({
            server: 'https://time.ddmb.au/timesync',
            interval: 60000
        });
        
        ts.on('change', function (offset) {
            // console.log('Time offset changed:', offset);
        });
        
        function updateClock() {
            const now = ts.now();
            const date = new Date(now);
            let time = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }).substr(0,12);
            if (window.globalSettings.formatAsLocalTime) {
                time = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }).substr(0,12);
            } else {
                time = date.toISOString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }).substr(11,12);
            }

            if (window.globalSettings['clockPrecisionLevel'] == 'Milliseconds') {
                document.getElementById('clock').innerText = time.substr(0,12);
                requestAnimationFrame(updateClock);
            } else if (window.globalSettings['clockPrecisionLevel'] == 'Hundredths') {
                document.getElementById('clock').innerText = time.substr(0, 11);
                requestAnimationFrame(updateClock);
            } else if (window.globalSettings['clockPrecisionLevel'] == 'Tenths') {
                document.getElementById('clock').innerText = time.substr(0, 10);
                requestAnimationFrame(updateClock);
            } else if (window.globalSettings['clockPrecisionLevel'] == 'Seconds') {
                document.getElementById('clock').innerText = time.substr(0, 8);
                setTimeout(updateClock, 100);
            } else {
                document.getElementById('clock').innerText = time.substr(0, 5);
                setTimeout(updateClock, 1000);
            }
        }
        
        ts.on('sync', () => {
            // console.log('Timesync complete');
            updateClock();
        });

        Object.defineProperty(window, 'ts', {
            get: function() {
                return ts;
            }
        });

        loadScript("https://webtiming.github.io/timingsrc/lib/timingsrc-v3.js", function () {
            console.log(`Timingsrc version ${TIMINGSRC.version}!`);    
        
            if (typeof TIMINGSRC.TimingObject === 'undefined') {
                console.error('TimingSrc library failed to load.');
                return;
            }
            
            ts.on('sync', () => {
                const timeNow = ts.now();
                console.log('Timesync set to', timeNow);
                window.timingSrcObj.update({ position: (timeNow/1000), velocity: 1 });
            });
        });
    });
});


