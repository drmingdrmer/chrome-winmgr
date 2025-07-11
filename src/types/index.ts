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