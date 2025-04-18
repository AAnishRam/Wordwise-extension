import React, { useState, useEffect } from "react";

function App() {
  const [status, setStatus] = useState("Ready");
  const [isEnabled, setIsEnabled] = useState(true);

  // Toggle extension functionality
  const toggleExtension = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "TOGGLE_EXTENSION",
        enabled: newState,
      });
    });
    setStatus(newState ? "Active" : "Disabled");
  };

  // Apply styles with inline CSS for simplicity
  const styles = {
    container: {
      width: "300px",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px",
    },
    logo: {
      fontWeight: "bold",
      fontSize: "20px",
    },
    status: {
      fontSize: "14px",
      color: isEnabled ? "green" : "gray",
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
      margin: "4px 2px",
      cursor: "pointer",
      borderRadius: "4px",
    },
    footer: {
      marginTop: "20px",
      fontSize: "12px",
      color: "#666",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>WordWise</div>
        <div style={styles.status}>{status}</div>
      </div>

      <p>Click on any word in YouTube subtitles to see synonyms.</p>

      <button style={styles.button} onClick={toggleExtension}>
        {isEnabled ? "Disable" : "Enable"} Extension
      </button>

      <div style={styles.footer}>
        WordWise helps you learn new words while watching videos
      </div>
    </div>
  );
}

export default App;
