export interface ChromeWindow {
    id: number;
    type: string;
    state: string;
    focused: boolean;
    incognito: boolean;
    tabs: ChromeTab[];
}

export interface ChromeTab {
    id: number;
    windowId: number;
    title: string;
    url: string;
    favIconUrl?: string;
    active: boolean;
    pinned: boolean;
    index: number;
}

export interface WindowsData {
    windows: ChromeWindow[];
    loading: boolean;
    error: string | null;
}

export interface TabWindowChangeMessage {
    type: 'TAB_WINDOW_CHANGE';
    eventType: 'TAB_CREATED' | 'TAB_REMOVED' | 'TAB_UPDATED' | 'TAB_MOVED' | 'TAB_ACTIVATED' |
    'WINDOW_CREATED' | 'WINDOW_REMOVED' | 'WINDOW_FOCUSED';
    details?: any;
} 