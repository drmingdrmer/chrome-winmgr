import { ChromeWindow, ChromeTab } from '../types';

export async function getAllWindowsWithTabs(): Promise<ChromeWindow[]> {
    try {
        const windows = await chrome.windows.getAll({ populate: true });

        return windows.map(window => ({
            id: window.id!,
            type: window.type || 'normal',
            state: window.state || 'normal',
            focused: window.focused || false,
            incognito: window.incognito || false,
            tabs: (window.tabs || []).map(tab => ({
                id: tab.id!,
                windowId: tab.windowId!,
                title: tab.title || 'Untitled',
                url: tab.url || '',
                favIconUrl: tab.favIconUrl,
                active: tab.active || false,
                pinned: tab.pinned || false,
                index: tab.index!
            }))
        }));
    } catch (error) {
        console.error('Error getting windows and tabs:', error);
        throw error;
    }
}

export async function switchToTab(tabId: number): Promise<void> {
    try {
        await chrome.tabs.update(tabId, { active: true });
        const tab = await chrome.tabs.get(tabId);
        if (tab.windowId) {
            await chrome.windows.update(tab.windowId, { focused: true });
        }
    } catch (error) {
        console.error('Error switching to tab:', error);
        throw error;
    }
}

export async function closeTab(tabId: number): Promise<void> {
    try {
        await chrome.tabs.remove(tabId);
    } catch (error) {
        console.error('Error closing tab:', error);
        throw error;
    }
} 