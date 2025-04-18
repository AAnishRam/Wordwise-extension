// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_SYNONYMS") {
    console.log("Background: Fetching synonyms for", message.word);

    // Make API request to get synonyms
    fetch(`https://api.datamuse.com/words?rel_syn=${message.word}`)
      .then((res) => res.json())
      .then((data) => {
        // Extract just the words from the API response
        const synonyms = data.map((entry) => entry.word);

        // Send results back to content script
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "SHOW_SYNONYMS",
          word: message.word,
          synonyms,
        });

        console.log(
          "Background: Sent synonyms back to content script",
          synonyms
        );
      })
      .catch((error) => {
        console.error("Background: Error fetching synonyms:", error);

        // Send an empty result in case of error
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "SHOW_SYNONYMS",
          word: message.word,
          synonyms: [],
        });
      });
  }

  // Return true to indicate we'll respond asynchronously
  return true;
});

console.log("WordWise background script initialized");
