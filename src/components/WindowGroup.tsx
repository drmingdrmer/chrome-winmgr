import React, { useState, useCallback, useMemo } from 'react';
import { ChromeWindow } from '../types';
import { TabItem } from './TabItem';

interface WindowGroupProps {
    window: ChromeWindow;
    onTabChange?: () => void;
    isActive?: boolean;
    searchText?: string;
}

// Utility function to highlight search text - memoized
const highlightText = (text: string, searchText: string) => {
    if (!searchText || !text) return text;

    const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
        if (part.toLowerCase() === searchText.toLowerCase()) {
            return (
                <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
                    {part}
                </mark>
            );
        }
        return part;
    });
};

export const WindowGroup: React.FC<WindowGroupProps> = React.memo(({ window, onTabChange, isActive = false, searchText = '' }) => {
    const [collapsed, setCollapsed] = useState(false);

    // Memoize expensive calculations
    const windowTitle = useMemo(() => {
        const activeTab = window.tabs.find(tab => tab.active);
        if (activeTab) {
            return activeTab.title;
        }
        return `Window ${window.id}`;
    }, [window.tabs, window.id]);

    const highlightedWindowTitle = useMemo(() => {
        return highlightText(windowTitle, searchText);
    }, [windowTitle, searchText]);

    const windowTypeIcon = useMemo(() => {
        if (window.incognito) {
            return (
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
            );
        }
        return (
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4H5c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H5V8h14v10z" />
            </svg>
        );
    }, [window.incognito]);

    const cardClasses = useMemo(() => {
        let classes = 'window-card rounded-lg';
        if (isActive) classes += ' active';
        else if (window.focused) classes += ' focused';
        else if (window.state === 'minimized') classes += ' minimized';
        return classes;
    }, [isActive, window.focused, window.state]);

    const statusBadgeClasses = useMemo(() => {
        if (window.tabs.length > 10) return 'status-badge red';
        if (window.tabs.length > 5) return 'status-badge yellow';
        return 'status-badge green';
    }, [window.tabs.length]);

    // Memoize event handlers
    const handleToggleCollapse = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed]);

    return (
        <div className={cardClasses}>
            {/* Card Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={handleToggleCollapse}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {windowTypeIcon}
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate text-gray-900 mb-1">
                            {highlightedWindowTitle}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium">{window.tabs.length} tabs</span>
                            <span>•</span>
                            <span>Window {window.id}</span>
                            {window.incognito && (
                                <>
                                    <span>•</span>
                                    <span className="text-purple-600 font-medium">Incognito</span>
                                </>
                            )}
                            {window.state === 'minimized' && (
                                <>
                                    <span>•</span>
                                    <span className="text-orange-600 font-medium">Minimized</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={statusBadgeClasses}>
                        {window.tabs.length}
                    </span>
                    <svg
                        className={`w-4 h-4 text-gray-400 ${collapsed ? '-rotate-90' : ''}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* Card Content */}
            {!collapsed && (
                <div className="px-4 pb-4">
                    <div className="space-y-2">
                        {window.tabs.map((tab) => (
                            <TabItem
                                key={tab.id}
                                tab={tab}
                                onTabChange={onTabChange}
                                compact={true}
                                searchText={searchText}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}); 