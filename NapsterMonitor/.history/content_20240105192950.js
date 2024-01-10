console.log("Content script running for Napster");

let lastCheck = { playing: true, retries: 0, maxRetries: 3 };

function getCurrentService() {
    const hostname = window.location.hostname;
    if (hostname.includes('napster.com')) {
        return 'Napster';
    } else {
        return 'Unknown';
    }
}

function simulatePlayClick(retryCount = 0, maxRetries = 3) {
    console.log("simulatePlayClick: Function called.");
    const service = getCurrentService();
    let playPauseButton;

    if (service === 'Napster') {
        playPauseButton = document.querySelector('button[data-testid="player-play-pause-button"]');
        if (playPauseButton && !playPauseButton.querySelector('svg[data-testid="player-pause-icon"]')) {
            console.log("simulatePlayClick: Napster button in 'Play' state, attempting to click...");
            playPauseButton.click();
            console.log("simulatePlayClick: Play button clicked. Attempted to resume playback.");
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
        playPauseButton = document.querySelector('button[data-testid="player-play-pause-button"]');
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
