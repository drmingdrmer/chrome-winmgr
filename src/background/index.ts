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

// Function to broadcast changes to window manager tabs
async function broadcastTabWindowChange(eventType: string, details?: any) {
    try {
        // Find all window manager tabs
        const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('window-manager.html') });

        // Send message to each window manager tab
        for (const tab of tabs) {
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'TAB_WINDOW_CHANGE',
                    eventType,
                    details
                }).catch(() => {
                    // Silently ignore errors (tab might not have content script loaded)
                });
            }
        }
    } catch (error) {
        console.error('Error broadcasting tab/window change:', error);
    }
}

// Tab event listeners
chrome.tabs.onCreated.addListener((tab) => {
    broadcastTabWindowChange('TAB_CREATED', { tabId: tab.id, windowId: tab.windowId });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    broadcastTabWindowChange('TAB_REMOVED', { tabId, windowId: removeInfo.windowId });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only broadcast for significant changes (title, url, status)
    if (changeInfo.title || changeInfo.url || changeInfo.status === 'complete') {
        broadcastTabWindowChange('TAB_UPDATED', { tabId, changeInfo, tab });
    }
});

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
    broadcastTabWindowChange('TAB_MOVED', { tabId, moveInfo });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    broadcastTabWindowChange('TAB_ACTIVATED', { tabId: activeInfo.tabId, windowId: activeInfo.windowId });
});

// Window event listeners
chrome.windows.onCreated.addListener((window) => {
    broadcastTabWindowChange('WINDOW_CREATED', { windowId: window.id });
});

chrome.windows.onRemoved.addListener((windowId) => {
    broadcastTabWindowChange('WINDOW_REMOVED', { windowId });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        broadcastTabWindowChange('WINDOW_FOCUSED', { windowId });
    }
});

// Export empty object to make this a module
export { }; 