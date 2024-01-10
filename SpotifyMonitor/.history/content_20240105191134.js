console.log("Content script running");

let lastSentData = { title: '', artist: '', service: '' };
let debounceTimer;

function getCurrentService() {
    const hostname = window.location.hostname;
    return hostname.includes('spotify.com') ? 'Spotify' : 'Unknown';
}

function extractSongInfo() {
    let service = getCurrentService();
    if (service === 'Spotify') {
        let songTitleElement = document.querySelector('a[data-testid="context-item-link"]');
        let artistNameElement = document.querySelector('a[data-testid="context-item-info-artist"]');
        let currentTitle = songTitleElement ? songTitleElement.textContent : '';
        let currentArtist = artistNameElement ? artistNameElement.textContent : '';

        if (currentTitle !== lastSentData.title || currentArtist !== lastSentData.artist) {
            let songInfo = {
                service: service,
                title: currentTitle,
                artist: currentArtist,
                timestamp: new Date().toISOString()
            };
            console.log('Extracted Song Info:', songInfo);
            chrome.runtime.sendMessage(songInfo);
            lastSentData = { title: currentTitle, artist: currentArtist, service: service };
        }
    }
}

function debounceExtractSongInfo() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(extractSongInfo, 10000);
}

const observer = new MutationObserver(mutations => {
    mutations.forEach(() => debounceExtractSongInfo());
});
observer.observe(document.body, { childList: true, subtree: true });

setInterval(extractSongInfo, 30000);

console.log("Content script running");

let lastCheck = { playing: true, retries: 0, maxRetries: 3 };

function getRandomWaitTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

function simulatePlayClick(retryCount = 0, maxRetries = 3) {
    console.log("simulatePlayClick: Function called.");
    const service = getCurrentService();
    if (service === 'Spotify') {
        let playPauseButton = document.querySelector('button[data-testid="control-button-playpause"]');
        if (playPauseButton && playPauseButton.getAttribute('aria-label') === 'Play') {
            console.log("simulatePlayClick: Button in 'Play' state, attempting to click...");
            playPauseButton.click();
            console.log("simulatePlayClick: Play button clicked. Attempted to resume playback.");
        } else if (!playPauseButton && retryCount < maxRetries) {
            console.log(`simulatePlayClick: Play/Pause button not found. Retrying in 5 seconds. Retry count: ${retryCount}`);
            setTimeout(() => simulatePlayClick(retryCount + 1, maxRetries), 5000);
        } else {
            console.log("simulatePlayClick: Button not in 'Play' state, likely already playing.");
        }
    }
}

function reloadPageWithDelay() {
    const waitTime = getRandomWaitTime(3, 12);
    console.log(`Waiting for ${waitTime / 1000} seconds before reloading...`);
    setTimeout(() => {
        window.location.reload();
        console.log("Page reloaded. Attempting to simulate play click...");
        setTimeout(simulatePlayClick, 10000);
    }, waitTime);
}

function checkPlaybackStatus() {
    console.log("checkPlaybackStatus: Function called.");
    const service = getCurrentService();
    if (service === 'Spotify') {
        let playPauseButton = document.querySelector('button[data-testid="control-button-playpause"]');
        if (!playPauseButton) {
            console.log("checkPlaybackStatus: Play/Pause button not found.");
            return;
        }
        const isPlaying = playPauseButton.getAttribute('aria-label') === 'Pause';
        console.log(`checkPlaybackStatus: Is playing: ${isPlaying}`);
        if (!isPlaying && lastCheck.playing) {
            console.log("checkPlaybackStatus: Playback stopped, checking retry count.");
            if (lastCheck.retries < lastCheck.maxRetries) {
                reloadPageWithDelay();
                lastCheck.retries++;
            } else {
                console.log("checkPlaybackStatus: Failed to resume playback after retries.");
                lastCheck = { playing: true, retries: 0, maxRetries: 3 };
            }
        } else if (isPlaying) {
            console.log("checkPlaybackStatus: Playback is playing, resetting lastCheck.");
            lastCheck = { playing: true, retries: 0, maxRetries: 3 };
        }
        lastCheck.playing = isPlaying;
    }
}

window.onload = function() {
    console.log("Window loaded. Running initial functions.");
    setTimeout(() => {
        simulatePlayClick();
    }, 2000);
    setInterval(checkPlaybackStatus, 40000);
};
