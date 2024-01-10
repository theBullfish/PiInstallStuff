console.log("Content script running for Napster");

let lastCheck = { playing: true, retries: 0, maxRetries: 3 };
let lastSentData = { title: '', artist: '', service: '' };
let debounceTimer;

function getCurrentService() {
    const hostname = window.location.hostname;
    if (hostname.includes('napster.com')) {
        return 'Napster';
    } else {
        return 'Unknown';
    }
}

function extractSongInfo() {
    let service = getCurrentService();
    let currentTitle = '';
    let currentArtist = '';

    if (service === 'Napster') {
        let songTitleElement = document.querySelector('p[data-testid="mini-player-track-name"]');
        let artistNameElement = document.querySelector('p[data-testid="mini-player-track-additional-info"]');
        currentTitle = songTitleElement ? songTitleElement.textContent : '';
        currentArtist = artistNameElement ? artistNameElement.textContent : '';
    }

    if (currentTitle !== lastSentData.title || currentArtist !== lastSentData.artist || service !== lastSentData.service) {
        let songInfo = {
            service: service,
            title: currentTitle,
            artist: currentArtist,
            timestamp: new Date().toISOString()
        };
        console.log('Extracted Song Info:', songInfo);
        // Replace chrome.runtime.sendMessage with your method of sending/storing this data
        lastSentData = { title: currentTitle, artist: currentArtist, service: service };
    }
}

function debounceExtractSongInfo() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(extractSongInfo, 10000); // Adjust the timeout as needed
}

// Observe changes in the page content
const observer = new MutationObserver(mutations => {
    mutations.forEach(() => debounceExtractSongInfo());
});
observer.observe(document.body, { childList: true, subtree: true });

// Fallback: Check for changes every 30 seconds
setInterval(extractSongInfo, 30000);

// ... rest of your script for play/pause functionality ...


function getCurrentService() {
    const hostname = window.location.hostname;
    if (hostname.includes('napster.com')) {
        return 'Napster';
    } else {
        return 'Unknown';
    }
}

function simulateRealisticClick(element) {
    if (element) {
        const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });

        element.dispatchEvent(mouseDownEvent);
        element.dispatchEvent(mouseUpEvent);
        element.dispatchEvent(clickEvent);
    }
}

function simulatePlayClick(retryCount = 0, maxRetries = 3) {
    console.log("simulatePlayClick: Function called.");
    const service = getCurrentService();
    let playPauseButton;

    if (service === 'Napster') {
        playPauseButton = document.querySelector('button[data-testid="player-play-pause-button"]');
        if (playPauseButton && !playPauseButton.querySelector('svg[data-testid="player-pause-icon"]')) {
            console.log("simulatePlayClick: Napster button in 'Play' state, attempting realistic click...");
            simulateRealisticClick(playPauseButton);
            console.log("simulatePlayClick: Realistic click attempted on Play button.");
        } else {
            console.log("simulatePlayClick: Napster button in 'Pause' state, likely already playing.");
        }
    } else {
        console.log("simulatePlayClick: Not Napster service, skipping action.");
    }

    if (!playPauseButton && retryCount < maxRetries) {
        console.log(`simulatePlayClick: Play/Pause button not found. Retrying in 5 seconds. Retry count: ${retryCount}`);
        setTimeout(() => simulatePlayClick(retryCount + 1, maxRetries), 5000);
    } else if (!playPauseButton) {
        console.log("simulatePlayClick: Play/Pause button not found after retries.");
    }
}

function checkPlaybackStatus() {
    console.log("checkPlaybackStatus: Function called.");
    const service = getCurrentService();
    let playPauseButton;

    if (service === 'Napster') {
        playPauseButton = document.querySelector('button[data-testid="player-play-pause-button']");
        if (!playPauseButton) {
            console.log("checkPlaybackStatus: Play/Pause button not found.");
            return;
        }

        const isPlaying = playPauseButton.querySelector('svg[data-testid="player-pause-icon"]') !== null;
        console.log(`checkPlaybackStatus: Is playing: ${isPlaying}`);
        if (!isPlaying && lastCheck.playing) {
            console.log("checkPlaybackStatus: Playback stopped, checking retry count.");
            if (lastCheck.retries < lastCheck.maxRetries) {
                simulatePlayClick();
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
    } else {
        console.log("checkPlaybackStatus: Not Napster service, skipping action.");
    }
}

window.onload = function() {
    console.log("Window loaded. Running initial functions for Napster.");
    setTimeout(() => {
        simulatePlayClick();
    }, 2000); // Adjust the delay as needed based on how quickly the page loads
};

// Check every 30 seconds
setInterval(checkPlaybackStatus, 40000);
