import React, { useState, useEffect } from "react";

function App() {
  const [status, setStatus] = useState("Active");
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("main");
  const [wordHistory, setWordHistory] = useState([]);
  const [favoriteWords, setFavoriteWords] = useState([]);
  const [wordOfTheDay, setWordOfTheDay] = useState(null);

  // Load data on initial render
  useEffect(() => {
    // Load extension state
    chrome.storage.local.get(["extensionEnabled"], (result) => {
      if (result.extensionEnabled === false) {
        setIsEnabled(false);
        setStatus("Disabled");
      }
    });

    // Load word history
    loadWordHistory();

    // Load favorite words
    loadFavoriteWords();

    // Set up word of the day
    fetchWordOfTheDay();
  }, []);

  // Load word history from storage
  const loadWordHistory = () => {
    chrome.storage.local.get(["wordHistory"], (result) => {
      if (result.wordHistory) {
        setWordHistory(result.wordHistory);
      }
    });
  };

  // Load favorite words from storage
  const loadFavoriteWords = () => {
    chrome.storage.local.get(["favoriteWords"], (result) => {
      if (result.favoriteWords) {
        setFavoriteWords(result.favoriteWords);
      }
    });
  };

  // Fetch word of the day
  const fetchWordOfTheDay = () => {
    // Check if we already showed a word today
    chrome.storage.local.get(["wordOfTheDay"], (result) => {
      if (
        result.wordOfTheDay &&
        isSameDay(new Date(result.wordOfTheDay.timestamp), new Date())
      ) {
        setWordOfTheDay(result.wordOfTheDay);
      } else {
        // Fetch new word of the day
        fetch("https://api.dictionaryapi.dev/api/v2/entries/en/random")
          .then((res) => {
            if (!res.ok) {
              // If random word endpoint unavailable, use a fallback word
              return Promise.resolve([
                {
                  word: "serendipity",
                  meanings: [
                    {
                      partOfSpeech: "noun",
                      definitions: [
                        {
                          definition:
                            "The occurrence and development of events by chance in a happy or beneficial way.",
                        },
                      ],
                    },
                  ],
                },
              ]);
            }
            return res.json();
          })
          .then((data) => {
            if (data && data.length > 0) {
              const newWordOfDay = {
                word: data[0].word,
                definition:
                  data[0].meanings[0]?.definitions[0]?.definition ||
                  "No definition available",
                partOfSpeech: data[0].meanings[0]?.partOfSpeech || "",
                timestamp: new Date().toISOString(),
              };

              setWordOfTheDay(newWordOfDay);
              chrome.storage.local.set({ wordOfTheDay: newWordOfDay });
            }
          })
          .catch((error) => {
            console.error("Error fetching word of the day:", error);
            // Use fallback
            const fallbackWord = {
              word: "ubiquitous",
              definition: "Present, appearing, or found everywhere.",
              partOfSpeech: "adjective",
              timestamp: new Date().toISOString(),
            };
            setWordOfTheDay(fallbackWord);
            chrome.storage.local.set({ wordOfTheDay: fallbackWord });
          });
      }
    });
  };

  // Helper to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Toggle extension functionality
  const toggleExtension = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    setStatus(newState ? "Active" : "Disabled");

    // Store state in local storage
    chrome.storage.local.set({ extensionEnabled: newState });

    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "TOGGLE_EXTENSION",
          enabled: newState,
        });
      }
    });
  };

  // Remove word from history
  const removeFromHistory = (index) => {
    const updatedHistory = [...wordHistory];
    updatedHistory.splice(index, 1);
    setWordHistory(updatedHistory);
    chrome.storage.local.set({ wordHistory: updatedHistory });
  };

  // Remove word from favorites
  const removeFromFavorites = (index) => {
    const updatedFavorites = [...favoriteWords];
    updatedFavorites.splice(index, 1);
    setFavoriteWords(updatedFavorites);
    chrome.storage.local.set({ favoriteWords: updatedFavorites });
  };

  // Clear all history
  const clearHistory = () => {
    setWordHistory([]);
    chrome.storage.local.set({ wordHistory: [] });
  };

  // Apply styles with inline CSS for simplicity
  const styles = {
    container: {
      width: "350px",
      minHeight: "400px",
      maxHeight: "500px",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "10px",
    },
    logo: {
      fontWeight: "bold",
      fontSize: "20px",
      color: "#333",
    },
    status: {
      fontSize: "14px",
      color: isEnabled ? "green" : "gray",
    },
    tabs: {
      display: "flex",
      borderBottom: "1px solid #ddd",
      marginBottom: "15px",
    },
    tab: {
      padding: "8px 12px",
      cursor: "pointer",
      borderBottom: "2px solid transparent",
      marginRight: "10px",
    },
    activeTab: {
      borderBottom: "2px solid #4285f4",
      fontWeight: "bold",
      color: "#4285f4",
    },
    tabContent: {
      flexGrow: 1,
      overflowY: "auto",
    },
    button: {
      backgroundColor: isEnabled ? "#f44336" : "#4CAF50",
      border: "none",
      color: "white",
      padding: "10px 15px",
      textAlign: "center",
      textDecoration: "none",
      display: "inline-block",
      fontSize: "16px",
      margin: "10px 0",
      cursor: "pointer",
      borderRadius: "4px",
      width: "100%",
    },
    clearButton: {
      backgroundColor: "#999",
      border: "none",
      color: "white",
      padding: "6px 10px",
      textAlign: "center",
      fontSize: "12px",
      margin: "5px 0",
      cursor: "pointer",
      borderRadius: "4px",
      alignSelf: "flex-end",
    },
    wordItem: {
      padding: "10px",
      borderBottom: "1px solid #eee",
      position: "relative",
    },
    wordTitle: {
      fontWeight: "bold",
      marginBottom: "3px",
    },
    wordDefinition: {
      fontSize: "13px",
      color: "#333",
    },
    timestamp: {
      fontSize: "11px",
      color: "#999",
      marginTop: "3px",
    },
    removeBtn: {
      position: "absolute",
      right: "8px",
      top: "8px",
      background: "none",
      border: "none",
      color: "#999",
      cursor: "pointer",
      fontSize: "16px",
    },
    footer: {
      marginTop: "15px",
      fontSize: "12px",
      color: "#666",
      textAlign: "center",
    },
    instructions: {
      fontSize: "14px",
      lineHeight: "1.4",
      marginBottom: "15px",
    },
    wordOfDay: {
      background: "#f5f5f5",
      padding: "12px",
      borderRadius: "5px",
      marginBottom: "15px",
    },
    wodTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      marginBottom: "8px",
      color: "#4285f4",
    },
    wodWord: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "5px",
    },
    wodPos: {
      fontSize: "12px",
      color: "#666",
      fontStyle: "italic",
      marginBottom: "5px",
    },
    emptyState: {
      color: "#999",
      textAlign: "center",
      marginTop: "30px",
      fontStyle: "italic",
    },
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>WordWise</div>
        <div style={styles.status}>{status}</div>
      </div>

      <div style={styles.tabs}>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "main" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("main")}
        >
          Home
        </div>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "history" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("history")}
        >
          History
        </div>
        <div
          style={{
            ...styles.tab,
            ...(activeTab === "favorites" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("favorites")}
        >
          Favorites
        </div>
      </div>

      <div style={styles.tabContent}>
        {activeTab === "main" && (
          <>
            {wordOfTheDay && (
              <div style={styles.wordOfDay}>
                <div style={styles.wodTitle}>Word of the Day</div>
                <div style={styles.wodWord}>{wordOfTheDay.word}</div>
                <div style={styles.wodPos}>{wordOfTheDay.partOfSpeech}</div>
                <div>{wordOfTheDay.definition}</div>
              </div>
            )}

            <div style={styles.instructions}>
              <p>
                Click on any word in YouTube subtitles to see definitions and
                synonyms.
              </p>
              <p>Make sure captions are turned on in the YouTube player.</p>
            </div>

            <button style={styles.button} onClick={toggleExtension}>
              {isEnabled ? "Disable" : "Enable"} Extension
            </button>
          </>
        )}

        {activeTab === "history" && (
          <>
            {wordHistory.length > 0 ? (
              <>
                <button style={styles.clearButton} onClick={clearHistory}>
                  Clear History
                </button>
                <div>
                  {wordHistory.map((item, index) => (
                    <div key={index} style={styles.wordItem}>
                      <button
                        style={styles.removeBtn}
                        onClick={() => removeFromHistory(index)}
                      >
                        ×
                      </button>
                      <div style={styles.wordTitle}>{item.word}</div>
                      {item.definitions && item.definitions[0] && (
                        <div style={styles.wordDefinition}>
                          {item.definitions[0].definition}
                        </div>
                      )}
                      <div style={styles.timestamp}>
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={styles.emptyState}>
                Your word history will appear here
              </div>
            )}
          </>
        )}

        {activeTab === "favorites" && (
          <>
            {favoriteWords.length > 0 ? (
              <div>
                {favoriteWords.map((item, index) => (
                  <div key={index} style={styles.wordItem}>
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeFromFavorites(index)}
                    >
                      ×
                    </button>
                    <div style={styles.wordTitle}>{item.word}</div>
                    {item.definitions && item.definitions[0] && (
                      <div style={styles.wordDefinition}>
                        {item.definitions[0].definition}
                      </div>
                    )}
                    <div style={styles.timestamp}>
                      Saved on {formatDate(item.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                Click the star icon on any word to save it to favorites
              </div>
            )}
          </>
        )}
      </div>

      <div style={styles.footer}>
        WordWise helps you learn new words while watching videos
      </div>
    </div>
  );
}

export default App;
