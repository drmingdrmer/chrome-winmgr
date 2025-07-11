// Background service worker for Chrome Window Manager

// Basic installation handler
chrome.runtime.onInstalled.addListener(() => {
    console.log('Chrome Window Manager installed');
});

// Handle extension icon click - open window manager in new tab
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Check if window manager tab is already open
        const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('window-manager.html') });

        if (tabs.length > 0) {
            // If already open, switch to it
            await chrome.tabs.update(tabs[0].id!, { active: true });
            await chrome.windows.update(tabs[0].windowId!, { focused: true });
        } else {
            // Create new tab with window manager
            await chrome.tabs.create({
                url: chrome.runtime.getURL('window-manager.html')
            });
        }
    } catch (error) {
        console.error('Error opening window manager:', error);
    }
});

// Export empty object to make this a module
export { }; 