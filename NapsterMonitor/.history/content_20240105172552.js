console.log("Content script running");

let lastSentData = { title: '', artist: '', service: '' };
let debounceTimer;

function getCurrentService() {
    const hostname = window.location.hostname;

    if (hostname.includes('spotify.com')) {
        return 'Spotify';
    } else if (hostname.includes('tidal.com')) {
        return 'Tidal';
    } else if (hostname.includes('deezer.com')) {
        return 'Deezer';
    } else if (hostname.includes('napster.com')) {
        return 'Napster';
    } else if (hostname.includes('amazon.com') || hostname.includes('music.amazon')) {
        return 'Amazon Music';
    } else {
        return 'Unknown';
    }
}

function extractSongInfo() {
    let service = getCurrentService();
    let currentTitle = '';
    let currentArtist = '';

    if (service === 'Spotify') {
        let songTitleElement = document.querySelector('a[data-testid="context-item-link"]');
        let artistNameElement = document.querySelector('a[data-testid="context-item-info-artist"]');
        currentTitle = songTitleElement ? songTitleElement.textContent : '';
        currentArtist = artistNameElement ? artistNameElement.textContent : '';
    } else if (service === 'Tidal') {
        let songTitleElement = document.querySelector('span.wave-text-description-demi'); 
        let artistNameElement = document.querySelector('a[data-test="grid-item-detail-text-title-artist"]');
        currentTitle = songTitleElement ? songTitleElement.textContent : '';
        currentArtist = artistNameElement ? artistNameElement.textContent : '';
    } else if (service === 'Napster') {
        let songTitleElement = document.querySelector('p[data-testid="mini-player-track-name"]');
        let artistNameElement = document.querySelector('p[data-testid="mini-player-track-additional-info"]');
        currentTitle = songTitleElement ? songTitleElement.textContent : '';
        currentArtist = artistNameElement ? artistNameElement.textContent : '';
    } else if (service === 'Deezer') {
        let songTitleElement = document.querySelector('a.css-tadcwa.e1riuwxf1');
        let artistNameElement = document.querySelector('a.track-link.css-tadcwa.eahxk690');
        currentTitle = songTitleElement ? songTitleElement.textContent : '';
        currentArtist = artistNameElement ? artistNameElement.textContent : '';
    } else if (service === 'Amazon Music') {
        let songItemElement = document.querySelector('music-horizontal-item');
        currentTitle = songItemElement ? songItemElement.getAttribute('primary-text') : '';
        currentArtist = songItemElement ? songItemElement.getAttribute('secondary-text') : '';
    }

    if (currentTitle !== lastSentData.title || currentArtist !== lastSentData.artist || service !== lastSentData.service) {
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



console.log("Content script running");


let lastCheck = { playing: true, retries: 0, maxRetries: 3 };

function getRandomWaitTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000; // Convert to milliseconds
}

function simulatePlayClick(retryCount = 0, maxRetries = 3) {
    console.log("simulatePlayClick: Function called.");
    const service = getCurrentService();
    let playPauseButton;

    switch (service) {
        case 'Spotify':
            playPauseButton = document.querySelector('button[data-testid="control-button-playpause"]');
            break;
        case 'Tidal':
            playPauseButton = document.querySelector('button[data-test="pause"]');
            break;
        case 'Deezer':
            playPauseButton = document.querySelector('button[data-testid="play_button_pause"], button[data-testid="play_button_play"]');
            break;
        case 'Napster':
            playPauseButton = document.querySelector('button[data-testid="player-play-pause-button"]');
            break;
        case 'Amazon Music':
            playPauseButton = document.querySelector('music-button[aria-label="Pause"]');
            break;
        default:
            console.log("Service not recognized.");
            return;
    }
}

function simulatePlayClick(retryCount = 0, maxRetries = 3) {
    console.log("simulatePlayClick: Function called.");
    const service = getCurrentService();
    let playPauseButton;

    // ... existing switch case logic to find the playPauseButton ...

    if (service === 'Napster') {
        // Napster-specific logic
        if (playPauseButton && !playPauseButton.querySelector('[data-testid="player-pause-icon"]')) {
            console.log("simulatePlayClick: Napster button in 'Play' state, attempting realistic click...");
            simulateRealisticClick(playPauseButton);
        } else {
            console.log("simulatePlayClick: Napster button in 'Pause' state, likely already playing.");
        }
    } else {
        // General logic for other services
        if (playPauseButton && playPauseButton.getAttribute('aria-label') === 'Play') {
            console.log("simulatePlayClick: Button in 'Play' state, attempting to click...");
            playPauseButton.click();
            console.log("simulatePlayClick: Play button clicked. Attempted to resume playback.");
        } else if (!playPauseButton && retryCount < maxRetries) {
            console.log(`simulatePlayClick: Play/Pause button not found. Retrying in 5 seconds. Retry count: ${retryCount}`);
            setTimeout(() => simulatePlayClick(retryCount + 1, maxRetries), 5000);
        } else if (!playPauseButton) {
            console.log("simulatePlayClick: Play/Pause button not found after retries.");
        } else {
            console.log("simulatePlayClick: Button not in 'Play' state, likely already playing.");
        }
    }
}   
    


function simulateRealisticClick(element) {
    if (element) {
        const mouseDownEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        const mouseUpEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        element.dispatchEvent(mouseDownEvent);
        element.dispatchEvent(mouseUpEvent);
        element.dispatchEvent(clickEvent);
    }
}

function resumePlaybackNapster() {
    const playPauseButton = document.querySelector('button[data-testid="player-play-pause-button"]');
    const nextSongButton = document.querySelector('button[data-testid="skip-right"]'); // Update this selector to target the actual button

    // Click the play/pause button
    simulateRealisticClick(playPauseButton);

    // Wait for half a second before clicking the next song button
    setTimeout(() => {
        simulateRealisticClick(nextSongButton);
    }, 1000); // 1000 milliseconds = 1 seconds
}

// Modify the checkPlaybackStatus function to call resumePlaybackNapster for Napster
function checkPlaybackStatus() {
    // ... existing code ...

    if (!isPlaying && lastCheck.playing) {
        console.log("checkPlaybackStatus: Playback stopped, checking retry count.");
        if (lastCheck.retries < lastCheck.maxRetries) {
            if (service === 'Napster') {
                resumePlaybackNapster();
            } else {
                // Other services
                reloadPageWithDelay();
            }
            lastCheck.retries++;
        } else {
            console.log("checkPlaybackStatus: Failed to resume playback after retries.");
            lastCheck = { playing: true, retries: 0, maxRetries: 3 };
        }
    }

    // ... existing code ...
}




function reloadPageWithDelay() {
    const waitTime = getRandomWaitTime(3, 12);
    console.log(`Waiting for ${waitTime / 1000} seconds before reloading...`);
    setTimeout(() => {
        window.location.reload();
        console.log("Page reloaded. Attempting to simulate play click...");
        setTimeout(simulatePlayClick, 10000); // Wait 10 seconds after reload
    }, waitTime);
}

function checkPlaybackStatus() {
    console.log("checkPlaybackStatus: Function called.");
    const service = getCurrentService();
    let playPauseButton;

    switch (service) {
        case 'Spotify':
            playPauseButton = document.querySelector('button[data-testid="control-button-playpause"]');
            break;
        case 'Tidal':
            playPauseButton = document.querySelector('button[data-test="pause"]');
            break;
        case 'Deezer':
            playPauseButton = document.querySelector('button[data-testid="play_button_pause"]');
            break;
        case 'Napster':
            playPauseButton = document.querySelector('button[data-testid="player-play-pause-button"]');
            break;
        case 'Amazon Music':
            playPauseButton = document.querySelector('music-button[aria-label="Pause"]');
            break;
        default:
            console.log("Service not recognized.");
            return;
    }

    if (!playPauseButton) {
        console.log("checkPlaybackStatus: Play/Pause button not found.");
        return;
    }

    const isPlaying = (service === 'Napster' && playPauseButton.querySelector('[data-testid="player-pause-icon"]')) ||
                      (service !== 'Napster' && playPauseButton.getAttribute('aria-label') === 'Pause');

    console.log(`checkPlaybackStatus: Is playing: ${isPlaying}`);
    if (!isPlaying && lastCheck.playing) {
        console.log("checkPlaybackStatus: Playback stopped, checking retry count.");
        if (lastCheck.retries < lastCheck.maxRetries) {
            console.log(`checkPlaybackStatus: Attempting to resume playback. Retry count: ${lastCheck.retries}`);
            if (service === 'Napster') {
                // Use the realistic click simulation for Napster
                simulateRealisticClick(playPauseButton);
            } else {
                // Use the standard method for other services
                reloadPageWithDelay();
            }
            lastCheck.retries++;
        } else {
            console.log("checkPlaybackStatus: Failed to resume playback after retries.");
            lastCheck = { playing: true, retries: 0, maxRetries: 3 }; // Reset lastCheck after max retries
        }
    } else if (isPlaying) {
        console.log("checkPlaybackStatus: Playback is playing, resetting lastCheck.");
        lastCheck = { playing: true, retries: 0, maxRetries: 3 };
    }
    lastCheck.playing = isPlaying;
}

window.onload = function() {
    console.log("Window loaded. Running initial functions.");

    // Delay the initial call to simulatePlayClick to allow page elements to load
    setTimeout(() => {
        simulatePlayClick();
    }, 2000); // Adjust the delay as needed based on how quickly the page loads

    // ... any other onload actions ...
};
