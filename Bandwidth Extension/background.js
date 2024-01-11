let totalBandwidth = 0;
let hourlyBandwidth = 0;
let lastHour = new Date().getHours();

chrome.webRequest.onCompleted.addListener(
  (details) => {
    let size = details.responseHeaders?.find(header => header.name.toLowerCase() === 'content-length')?.value;
    size = parseInt(size, 10) || 0;
    totalBandwidth += size;
    hourlyBandwidth += size;
    chrome.storage.local.set({ totalBandwidth });
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

function resetHourlyStats() {
  let currentHour = new Date().getHours();
  if (currentHour !== lastHour) {
    lastHour = currentHour;
    chrome.storage.local.set({ hourlyBandwidth });
    hourlyBandwidth = 0;
  }
}

setInterval(resetHourlyStats, 3600000); // Check every hour
