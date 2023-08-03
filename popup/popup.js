document.addEventListener('DOMContentLoaded', function () {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Get the tab ID and URL
        const tabId = tabs[0].id;
        const tabUrl = tabs[0].url;
        const tabHostName = new URL(tabUrl).hostname;

        // Get the reference to the buttons
        const customButton = document.getElementById("custom-button");

        // Add click event listeners to the buttons
        customButton.addEventListener('click', function () {
            const colorPicker = document.getElementById("highlight-color-picker");
            const selectedColor = colorPicker.value;

            // Send a message to the content script to highlight text in yellow
            chrome.tabs.sendMessage(tabs[0].id, { action: "highlight", color: selectedColor });
        });

        // Function to retrieve the stored selected texts from the storage
        function getSelectedTexts() {
            chrome.storage.local.get({ selectedTexts: [] }, function (result) {
                const { selectedTexts } = result;
                displaySelectedTexts(selectedTexts);
            });
        }

        // Function to display the selected texts in the popup
        function displaySelectedTexts(texts) {
            const selectedTextsElement = document.getElementById('selectedText');

            // Clear the existing content
            selectedTextsElement.innerHTML = '';

            // Loop through the selected texts array and create a list item for each text
            for (let i = 0; i < texts.length; i++) {
                const listItem = document.createElement('li');
                listItem.textContent = texts[i];
                selectedTextsElement.appendChild(listItem);
            }
        }

        // Receive messages from content.js
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if (message.text) {
                // Add the selected text to the array
                chrome.storage.local.get({ selectedTexts: [] }, function (result) {
                    const { selectedTexts } = result;
                    selectedTexts.push(message.text);
                    chrome.storage.local.set({ selectedTexts }, function () {
                        // Update the displayed selected texts in the popup
                        displaySelectedTexts(selectedTexts);
                    });
                });
            }
        });

        // Call the function to retrieve and display the stored selected texts
        getSelectedTexts();

        // Add a click event listener to the download button
        const downloadButton = document.getElementById('downloadButton');
        downloadButton.addEventListener('click', downloadSelectedText);


        // Function to download the selected text as a .txt file
        function downloadSelectedText() {
            // Retrieve the selected texts from the storage
            chrome.storage.local.get({ selectedTexts: [] }, function (result) {
                const { selectedTexts } = result;

                // Create a blob with the selected texts
                const orderedList = selectedTexts.map((text, index) => `${index + 1}. ${text}`);
                const textContent = `Site: ${tabHostName}\nURL: ${tabUrl}\n\n${orderedList.join('\n')}`
                const blob = new Blob([textContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'keep_in_mind.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            })
        }

        // Track the current index of the selected text
        let currentIndex = 0;

        // Add a click event listener to the read button
        const readButton = document.getElementById('readButton');
        readButton.addEventListener('click', readSelectedText);

        // Function to read the selected text one by one
        function readSelectedText() {
            // Retrieve the selected texts from the storage
            chrome.storage.local.get({ selectedTexts: [] }, function (result) {
                const { selectedTexts } = result;
                if (selectedTexts.length === 0) {
                    return; // No selected texts to read
                }

                while (currentIndex != selectedTexts.length) {
                    // Get the current selected text
                    const currentText = selectedTexts[currentIndex];

                    // Create a new speech synthesis utterance with the current selected text
                    const utterance = new SpeechSynthesisUtterance(currentText);

                    // Speak the current selected text
                    speechSynthesis.speak(utterance);
                    currentIndex += 1;

                    // Increment the current index or reset to 0 if it exceeds the array length
                    // currentIndex = (currentIndex + 1) % selectedTexts.length;
                }
            })
        }

        // add event listener to the "Delete All" button
        const deleteAllButton = document.getElementById('deleteAllButton');
        deleteAllButton.addEventListener('click', handleDeleteAllClick);

        // Function to handle the click on the "Delete All" button
        function handleDeleteAllClick() {
            // Clear the selectedTexts list in the storage
            chrome.storage.local.set({ selectedTexts: [] }, function () {
                // Update the displayed selected texts in the popup
                displaySelectedTexts([]);
            });
        }
    })
    
});
