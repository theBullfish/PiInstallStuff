function simulatePlayClick(retryCount = 0, maxRetries = 3) {
    console.log("simulatePlayClick: Function called.");
    const service = getCurrentService();
    let playPauseButton;

    switch (service) {
        // ... other cases ...
        case 'Deezer':
            playPauseButton = document.querySelector('button[data-testid="play_button_pause"], button[data-testid="play_button_play"]');
            break;
        // ... other cases ...
    }

    if (playPauseButton) {
        const isPaused = playPauseButton.getAttribute('data-testid') === 'play_button_play';
        console.log("simulatePlayClick: Play/Pause button found. Is paused:", isPaused);
        if (isPaused) {
            console.log("simulatePlayClick: Button in 'Play' state, attempting to click...");
            playPauseButton.click();
            console.log("simulatePlayClick: Play button clicked. Attempted to resume playback.");
        } else {
            console.log("simulatePlayClick: Button not in 'Play' state, likely already playing.");
        }
    } else if (retryCount < maxRetries) {
        console.log(`simulatePlayClick: Play/Pause button not found. Retrying in 5 seconds. Retry count: ${retryCount}`);
        setTimeout(() => simulatePlayClick(retryCount + 1, maxRetries), 5000);
    } else {
        console.log("simulatePlayClick: Play/Pause button not found after retries.");
    }
}
