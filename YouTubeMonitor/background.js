// Example code for a Manifest V3 background service worker

console.log("Background service worker running");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  // Setup or migration code can go here
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      console.log('Song info received:', request);

      // Define the URL of your Flask app
      const flaskAppUrl = 'http://127.0.0.1:5000/collect';

      // Make a POST request to the Flask app
      fetch(flaskAppUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
      })
      .then(response => response.json())
      .then(data => {
          console.log('Success:', data);
          sendResponse({status: 'Song info sent successfully'});
      })
      .catch((error) => {
          console.error('Error:', error);
          sendResponse({status: 'Error sending song info'});
      });

      // Return true to indicate you wish to send a response asynchronously
      return true;
  }
);

// Add other background tasks here
