function bytesToMB(bytes) {
    return (bytes / 1048576).toFixed(2); // Converts bytes to MB and rounds to 2 decimal places
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['totalBandwidth', 'hourlyBandwidth'], function(data) {
        // Convert bytes to MB for display
        var totalMB = bytesToMB(data.totalBandwidth);
        var hourlyMB = bytesToMB(data.hourlyBandwidth);

        document.getElementById('total').textContent = totalMB + ' MB';
        document.getElementById('hourly').textContent = hourlyMB + ' MB';
    });

    document.getElementById('export').addEventListener('click', function() {
        chrome.storage.local.get(null, function(data) {
            // Export data logic
        });
    });
});
