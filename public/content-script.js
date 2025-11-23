// Simple state to avoid multiple popups
let highlightPopup = null;

function removePopup() {
    if (highlightPopup && highlightPopup.parentNode) {
        highlightPopup.parentNode.removeChild(highlightPopup);
        highlightPopup = null;
    }
}

function createPopup(x, y, selectedText) {
    removePopup();

    highlightPopup = document.createElement("div");
    highlightPopup.innerText = "Save highlight?";
    highlightPopup.style.position = "fixed";
    highlightPopup.style.top = y + "px";
    highlightPopup.style.left = x + "px";
    highlightPopup.style.transform = "translateX(-50%)"; // Center the popup
    highlightPopup.style.zIndex = 999999;
    highlightPopup.style.background = "#111827"; 
    highlightPopup.style.color = "white";
    highlightPopup.style.padding = "6px 10px";
    highlightPopup.style.borderRadius = "9999px";
    highlightPopup.style.fontSize = "12px";
    highlightPopup.style.cursor = "pointer";
    highlightPopup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
    highlightPopup.style.userSelect = "none";

    // Prevent the popup from triggering the document mousedown/mouseup logic
    highlightPopup.addEventListener("mousedown", (e) => e.stopPropagation());
    highlightPopup.addEventListener("mouseup", (e) => e.stopPropagation());

    highlightPopup.addEventListener("click", async (e) => {
        e.stopPropagation();

        const url = window.location.href;
        const title = document.title;
        const timestamp = Date.now();

        const newHighlight = {
            id: timestamp,
            text: selectedText,
            url,
            title,
            createdAt: timestamp
        };

        chrome.storage.local.get(["highlights"], (result) => {
            const current = result.highlights || [];
            const updated = [newHighlight, ...current];
            chrome.storage.local.set({ highlights: updated }, () => {
                // Simple feedback
                if (highlightPopup) {
                    highlightPopup.innerText = "Saved!";
                    setTimeout(removePopup, 800);
                }
            });
        });
    });

    document.body.appendChild(highlightPopup);
}

// Listen for mouseup (user finishes selection)
document.addEventListener("mouseup", (e) => {
    // If we clicked inside the popup, do nothing (handled by stopPropagation above, but good safety)
    if (highlightPopup && highlightPopup.contains(e.target)) return;

    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";

    if (!text) {
        removePopup();
        return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const x = rect.left + rect.width / 2;
    let y = rect.top - 40; // slightly above the selection

    // Prevent popup from going off-screen at the top
    if (y < 10) y = rect.bottom + 10;

    createPopup(x, y, text);
});

// Remove popup if user scrolls or clicks elsewhere
document.addEventListener("scroll", () => {
    // Optional: You might want to keep it visible on scroll, but removing is safer for positioning
    removePopup();
}, true);

document.addEventListener("mousedown", (e) => {
    // If clicking outside the popup, remove it
    if (highlightPopup && !highlightPopup.contains(e.target)) {
        removePopup();
    }
});
