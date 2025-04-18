// Global state
let extensionEnabled = true;

function getCurrentSubtitle() {
  const segments = document.querySelectorAll(".ytp-caption-segment");
  return Array.from(segments)
    .map((s) => s.innerText)
    .join(" ");
}

// Create a tooltip to show word information
function showWordInfoTooltip(word, synonyms, definitions, x, y) {
  const existing = document.getElementById("wordwise-tooltip");
  if (existing) existing.remove();

  const tooltip = document.createElement("div");
  tooltip.id = "wordwise-tooltip";
  tooltip.style.position = "fixed";
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
  tooltip.style.background = "#ffffff";
  tooltip.style.color = "#000000";
  tooltip.style.padding = "10px";
  tooltip.style.borderRadius = "5px";
  tooltip.style.zIndex = 10000;
  tooltip.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  tooltip.style.maxWidth = "350px";
  tooltip.style.maxHeight = "400px";
  tooltip.style.overflowY = "auto";
  tooltip.style.fontSize = "14px";

  // Word header
  const header = document.createElement("h3");
  header.innerText = word;
  header.style.margin = "0 0 10px 0";
  header.style.padding = "0 0 5px 0";
  header.style.borderBottom = "1px solid #eee";
  tooltip.appendChild(header);

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.innerText = "★ Save";
  saveBtn.style.position = "absolute";
  saveBtn.style.top = "10px";
  saveBtn.style.right = "35px";
  saveBtn.style.background = "#f0f0f0";
  saveBtn.style.border = "none";
  saveBtn.style.borderRadius = "3px";
  saveBtn.style.padding = "2px 8px";
  saveBtn.style.cursor = "pointer";
  saveBtn.style.fontSize = "12px";
  saveBtn.onclick = () => {
    saveWordToFavorites(word, synonyms, definitions);
    saveBtn.innerText = "✓ Saved";
    saveBtn.style.background = "#deffde";
    saveBtn.disabled = true;
  };
  tooltip.appendChild(saveBtn);

  // Definitions section
  if (definitions && definitions.length > 0) {
    const definitionsContainer = document.createElement("div");
    definitionsContainer.style.marginBottom = "15px";

    const defTitle = document.createElement("h4");
    defTitle.innerText = "Definitions";
    defTitle.style.margin = "0 0 5px 0";
    defTitle.style.fontWeight = "bold";
    definitionsContainer.appendChild(defTitle);

    definitions.forEach((def, index) => {
      if (index > 2) return; // Limit to 3 definitions

      const defItem = document.createElement("div");
      defItem.style.marginBottom = "8px";

      const partOfSpeech = document.createElement("em");
      partOfSpeech.innerText = def.partOfSpeech || "";
      partOfSpeech.style.color = "#666";
      partOfSpeech.style.marginRight = "5px";
      defItem.appendChild(partOfSpeech);

      const definition = document.createElement("span");
      definition.innerText = def.definition;
      defItem.appendChild(definition);

      if (def.example) {
        const example = document.createElement("div");
        example.innerText = `"${def.example}"`;
        example.style.fontStyle = "italic";
        example.style.color = "#666";
        example.style.marginTop = "3px";
        example.style.fontSize = "13px";
        defItem.appendChild(example);
      }

      definitionsContainer.appendChild(defItem);
    });

    tooltip.appendChild(definitionsContainer);
  }

  // Synonyms section
  if (synonyms && synonyms.length > 0) {
    const synonymsContainer = document.createElement("div");

    const synTitle = document.createElement("h4");
    synTitle.innerText = "Synonyms";
    synTitle.style.margin = "0 0 5px 0";
    synTitle.style.fontWeight = "bold";
    synonymsContainer.appendChild(synTitle);

    const list = document.createElement("div");
    list.style.display = "flex";
    list.style.flexWrap = "wrap";
    list.style.gap = "5px";

    synonyms.slice(0, 8).forEach((synonym) => {
      const item = document.createElement("div");
      item.innerText = synonym;
      item.style.padding = "3px 8px";
      item.style.background = "#f0f0f0";
      item.style.borderRadius = "3px";
      item.style.cursor = "pointer";
      item.style.fontSize = "13px";
      item.onclick = () => {
        // Copy to clipboard
        navigator.clipboard.writeText(synonym);
        item.innerText = `${synonym} ✓`;
        item.style.background = "#deffde";
        setTimeout(() => {
          item.innerText = synonym;
          item.style.background = "#f0f0f0";
        }, 1000);
      };
      list.appendChild(item);
    });

    synonymsContainer.appendChild(list);
    tooltip.appendChild(synonymsContainer);
  } else if (!definitions || definitions.length === 0) {
    const noResults = document.createElement("div");
    noResults.innerText = "No information found for this word.";
    noResults.style.fontStyle = "italic";
    noResults.style.color = "#666";
    tooltip.appendChild(noResults);
  }

  // Close button
  const closeBtn = document.createElement("div");
  closeBtn.innerText = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "5px";
  closeBtn.style.right = "10px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "18px";
  closeBtn.onclick = () => tooltip.remove();
  tooltip.appendChild(closeBtn);

  document.body.appendChild(tooltip);

  // Adjust position if tooltip would go off screen
  const tooltipRect = tooltip.getBoundingClientRect();
  if (tooltipRect.right > window.innerWidth) {
    tooltip.style.left = window.innerWidth - tooltipRect.width - 10 + "px";
  }
  if (tooltipRect.bottom > window.innerHeight) {
    tooltip.style.top = window.innerHeight - tooltipRect.height - 10 + "px";
  }

  // Close on click outside
  document.addEventListener(
    "click",
    (e) => {
      if (e.target !== tooltip && !tooltip.contains(e.target)) {
        tooltip.remove();
      }
    },
    { once: true }
  );
}

function saveWordToFavorites(word, synonyms, definitions) {
  chrome.storage.local.get(["favoriteWords"], function (result) {
    const favorites = result.favoriteWords || [];

    // Check if word already exists in favorites
    const existingIndex = favorites.findIndex(
      (item) => item.word.toLowerCase() === word.toLowerCase()
    );

    if (existingIndex === -1) {
      // Add to favorites
      favorites.push({
        word,
        synonyms,
        definitions,
        timestamp: new Date().toISOString(),
      });

      // Save updated favorites
      chrome.storage.local.set({ favoriteWords: favorites });

      console.log(`Word "${word}" added to favorites`);
    }
  });
}

// Render your custom UI with clickable words
function renderSubtitleOverlay(text) {
  const existing = document.getElementById("wordwise-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "wordwise-overlay";
  overlay.style.position = "fixed";
  overlay.style.bottom = "100px";
  overlay.style.left = "50%";
  overlay.style.transform = "translateX(-50%)";
  overlay.style.background = "#000000aa";
  overlay.style.color = "white";
  overlay.style.padding = "10px";
  overlay.style.borderRadius = "8px";
  overlay.style.zIndex = 9999;
  overlay.style.fontSize = "20px";

  // Split by spaces but keep punctuation with the words
  const words = text.match(/[\w']+|[.,!?;]/g) || [];

  words.forEach((part) => {
    // Skip punctuation-only parts
    if (/^[.,!?;]$/.test(part)) {
      const span = document.createElement("span");
      span.innerText = part + " ";
      overlay.appendChild(span);
      return;
    }

    const span = document.createElement("span");
    span.innerText = part + " ";
    span.style.cursor = "pointer";
    span.style.borderBottom = "1px dotted #ffffff";
    span.style.transition = "color 0.2s";
    span.style.padding = "0 2px";

    span.onmouseover = () => {
      span.style.color = "#ffdd00";
    };

    span.onmouseout = () => {
      span.style.color = "white";
    };

    span.onclick = (e) => {
      e.stopPropagation();
      console.log("🔍 Clicked word:", part);

      // Send message to background script
      chrome.runtime.sendMessage({
        type: "FETCH_WORD_INFO",
        word: part.replace(/[^a-zA-Z]/g, ""), // Clean the word from punctuation
      });
    };

    overlay.appendChild(span);
  });

  document.body.appendChild(overlay);
}

// Listen for toggle messages from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TOGGLE_EXTENSION") {
    extensionEnabled = message.enabled;

    // Remove overlay if disabled
    if (!extensionEnabled) {
      const overlay = document.getElementById("wordwise-overlay");
      if (overlay) overlay.remove();

      const tooltip = document.getElementById("wordwise-tooltip");
      if (tooltip) tooltip.remove();
    }
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_WORD_INFO") {
    // Get the clicked word element position
    const wordElements = document.querySelectorAll("#wordwise-overlay span");
    let targetElement = null;

    for (const el of wordElements) {
      if (el.innerText.replace(/[^a-zA-Z]/g, "") === message.word) {
        targetElement = el;
        break;
      }
    }

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      showWordInfoTooltip(
        message.word,
        message.synonyms,
        message.definitions,
        rect.left,
        rect.top - 10
      );
    } else {
      // Fallback position if element not found
      showWordInfoTooltip(
        message.word,
        message.synonyms,
        message.definitions,
        window.innerWidth / 2,
        window.innerHeight / 2
      );
    }
  }
});

// Keep checking for updated subtitles (with optimized interval)
let lastSubtitle = "";
let checkInterval = setInterval(() => {
  if (!extensionEnabled) return;

  const subtitle = getCurrentSubtitle();
  if (subtitle && subtitle !== lastSubtitle) {
    lastSubtitle = subtitle;
    renderSubtitleOverlay(subtitle);
  }
}, 1000);

// Initialize when script is loaded
console.log("WordWise extension initialized");
