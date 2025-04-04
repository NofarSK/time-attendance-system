const https = require('https');

const clients = new Set();
let timeCache = null;
let lastFetchTime = 0;
const FETCH_INTERVAL = 60000;
const CACHE_VALIDITY = 5000;
const TIMEZONE = 'Europe%2FBerlin';
let fetchInterval = null;
let updateInterval = null;

initializeTimeFetching();

function initializeTimeFetching() {
    fetchServerTime();
    fetchInterval = setInterval(fetchServerTime, FETCH_INTERVAL);
    updateInterval = setInterval(updateTime, 1000);
    console.log('Time service initialized');
}

exports.timeStream = (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
    });

    if (timeCache) {
        sendTimeUpdate(res);
    }

    clients.add(res);

    req.on('close', () => {
        clients.delete(res);
    });
};

function fetchServerTime() {
    const now = Date.now();

    if (timeCache && now - lastFetchTime < CACHE_VALIDITY) {
        return;
    }

    console.log('Fetching server time from timeapi.io...');

    const options = {
        hostname: 'timeapi.io',
        path: `/api/time/current/zone?timeZone=${TIMEZONE}`,
        method: 'GET',
        timeout: 5000
    };

    const req = https.request(options, res => {
        let data = '';

        res.on('data', chunk => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    timeCache = JSON.parse(data);
                    timeCache.timestamp = Date.now();
                    lastFetchTime = now;
                    console.log(`Berlin time from timeapi.io: ${timeCache.hour}:${timeCache.minute}:${timeCache.seconds}`);
                    broadcastTime();
                } catch (error) {
                    console.error('Error parsing time data from timeapi.io:', error);
                }
            } else {
                console.error(`API error from timeapi.io: ${res.statusCode}`);
            }
        });
    });

    req.on('error', error => {
        console.error('Error connecting to timeapi.io:', error);
    });

    req.end();
}

function updateTime() {
    if (!timeCache) return;

    const now = Date.now();
    const elapsed = now - lastFetchTime;
    const elapsedSeconds = Math.floor(elapsed / 1000);

    const berlinTime = new Date(
        timeCache.year,
        timeCache.month - 1,
        timeCache.day,
        timeCache.hour,
        timeCache.minute,
        timeCache.seconds
    );

    // Add the elapsed seconds
    berlinTime.setSeconds(berlinTime.getSeconds() + elapsedSeconds);

    // Update our cached time object
    timeCache.timestamp = now;
    timeCache.seconds = berlinTime.getSeconds();
    timeCache.minute = berlinTime.getMinutes();
    timeCache.hour = berlinTime.getHours();
    timeCache.day = berlinTime.getDate();
    timeCache.month = berlinTime.getMonth() + 1;
    timeCache.year = berlinTime.getFullYear();

    lastFetchTime = now;

    if (clients.size > 0) {
        broadcastTime();
    }

    // Re fetch from API every 15 minutes
    if (elapsed > 900000) {
        fetchServerTime();
    }
}

function broadcastTime() {
    if (!timeCache || clients.size === 0) return;

    clients.forEach(client => {
        sendTimeUpdate(client);
    });
}

function sendTimeUpdate(client) {
    client.write(`data: ${JSON.stringify(timeCache)}\n\n`);
}