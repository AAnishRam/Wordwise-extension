function getCurrentSubtitle() {
  const segments = document.querySelectorAll(".ytp-caption-segment");
  return Array.from(segments)
    .map((s) => s.innerText)
    .join(" ");
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

  text.split(" ").forEach((word) => {
    const span = document.createElement("span");
    span.innerText = word + " ";
    span.style.cursor = "pointer";
    span.onclick = () => {
      console.log("🔍 Clicked word:", word);
      // TODO: Fetch synonyms here
    };
    overlay.appendChild(span);
  });

  document.body.appendChild(overlay);
}

// Keep checking for updated subtitles
setInterval(() => {
  const subtitle = getCurrentSubtitle();
  if (subtitle) renderSubtitleOverlay(subtitle);
}, 1000);
