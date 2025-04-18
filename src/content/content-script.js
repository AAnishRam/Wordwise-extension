// Global state
let extensionEnabled = true;

function getCurrentSubtitle() {
  const segments = document.querySelectorAll(".ytp-caption-segment");
  return Array.from(segments)
    .map((s) => s.innerText)
    .join(" ");
}

// Create a tooltip to show synonyms
function showSynonymsTooltip(word, synonyms, x, y) {
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
  tooltip.style.maxWidth = "300px";

  const header = document.createElement("h3");
  header.innerText = word;
  header.style.margin = "0 0 10px 0";
  header.style.padding = "0 0 5px 0";
  header.style.borderBottom = "1px solid #eee";
  tooltip.appendChild(header);

  if (synonyms && synonyms.length > 0) {
    const list = document.createElement("div");
    synonyms.slice(0, 5).forEach((synonym) => {
      const item = document.createElement("div");
      item.innerText = synonym;
      item.style.padding = "3px 0";
      item.style.cursor = "pointer";
      item.onclick = () => {
        // Maybe copy to clipboard or replace in search?
        navigator.clipboard.writeText(synonym);
        item.innerText = `${synonym} ✓`;
        setTimeout(() => {
          item.innerText = synonym;
        }, 1000);
      };
      list.appendChild(item);
    });
    tooltip.appendChild(list);
  } else {
    const noResults = document.createElement("div");
    noResults.innerText = "No synonyms found";
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
        type: "FETCH_SYNONYMS",
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
  if (message.type === "SHOW_SYNONYMS") {
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
      showSynonymsTooltip(
        message.word,
        message.synonyms,
        rect.left,
        rect.top - 10
      );
    } else {
      // Fallback position if element not found
      showSynonymsTooltip(
        message.word,
        message.synonyms,
        window.innerWidth / 2,
        window.innerHeight / 2
      );
    }
  }
});

// Keep checking for updated subtitles
setInterval(() => {
  if (!extensionEnabled) return;

  const subtitle = getCurrentSubtitle();
  if (subtitle) renderSubtitleOverlay(subtitle);
}, 1000);

// Initialize when script is loaded
console.log("WordWise extension initialized");
