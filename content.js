// adding font-awesome css to documets head 
let link = document.createElement("link");
link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
link.type = "text/css";
link.rel = "stylesheet";
document.head.appendChild(link);

// Create the floating element for highlighting options
const floatingElement = document.createElement('div');
floatingElement.style.position = 'absolute';
floatingElement.style.border = 'none';
floatingElement.style.display = 'none';
floatingElement.innerHTML = `
    <button 
    id="highlight" 
    class="fa-solid fa-highlighter fa-bounce fa-lg" 
    style="background:blue; color:white; height:30px; width:30px; border-radius:50px; border:none;">
    </button>
`;

// Append the floating element to the document body
document.body.appendChild(floatingElement);

// Event listener for mouseup (selection change) event
document.addEventListener('mouseup', handleSelection);

// Retrieve the selected text
function handleSelection() {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText) {
        showFloatingOptions();
    } else {
        hideFloatingOptions();
    }
}

function showFloatingOptions() {
    const selectionRange = window.getSelection().getRangeAt(0);
    const boundingRect = selectionRange.getBoundingClientRect();

    // Position the floating element near the selected text
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const floatingElementWidth = floatingElement.offsetWidth;
    const floatingElementHeight = floatingElement.offsetHeight;

    const topPosition = boundingRect.top + scrollTop - floatingElementHeight - 10;
    const leftPosition = boundingRect.left + scrollLeft + boundingRect.width;

    floatingElement.style.top = `${topPosition}px`;
    floatingElement.style.left = `${leftPosition}px`;

    // Show the floating element
    floatingElement.style.display = 'block';
}

function hideFloatingOptions() {
    // Hide the floating element
    floatingElement.style.display = 'none';
}

// Event listener for click events on the floating element
floatingElement.addEventListener('click', handleFloatingElementClick);

function handleFloatingElementClick(event) {
    const selectedText = window.getSelection().toString().trim();
    
    // Send the selected text to the popup
    // chrome.runtime.sendMessage({ text: selectedText });

    // Add the selected text to the selectedTexts list
    chrome.storage.local.get({ selectedTexts: [] }, function (result) {
        const { selectedTexts } = result;
        selectedTexts.push(selectedText);
        chrome.storage.local.set({ selectedTexts });
    });

    if (event.target.id === 'highlight') {
        highlightSelectedText('yellow');
    }

}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    const selectedText = window.getSelection().toString().trim();

    // Send the selected text to the popup
    chrome.runtime.sendMessage({ text: selectedText });

    if (message.action === 'highlight') {
        var color = message.color;
        highlightSelectedText(color);
    }
});


function highlightSelectedText(color) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const highlightedSpan = document.createElement('span');
    highlightedSpan.style.backgroundColor = color;

    // Surround the selected text with the highlighted span
    range.surroundContents(highlightedSpan);

    // Remove the selection to avoid visual artifacts
    selection.removeAllRanges();

    // Hide the floating element
    hideFloatingOptions();
}