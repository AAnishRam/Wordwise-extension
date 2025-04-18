chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "FETCH_SYNONYMS") {
    fetch(`https://api.datamuse.com/words?rel_syn=${message.word}`)
      .then((res) => res.json())
      .then((data) => {
        const synonyms = data.map((entry) => entry.word);
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "SHOW_SYNONYMS",
          word: message.word,
          synonyms,
        });
      });
  }
});
