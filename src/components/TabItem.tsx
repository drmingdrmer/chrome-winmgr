import React from 'react';
import { ChromeTab } from '../types';
import { switchToTab, closeTab } from '../utils/chrome-api';

interface TabItemProps {
    tab: ChromeTab;
    onTabChange?: () => void;
    compact?: boolean;
    searchText?: string;
}

// Utility function to highlight search text
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

export const TabItem: React.FC<TabItemProps> = ({ tab, onTabChange, compact = false, searchText = '' }) => {
    const handleTabClick = async () => {
        try {
            await switchToTab(tab.id);
            onTabChange?.();
        } catch (error) {
            console.error('Failed to switch to tab:', error);
        }
    };

    const handleCloseTab = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await closeTab(tab.id);
            onTabChange?.();
        } catch (error) {
            console.error('Failed to close tab:', error);
        }
    };

    const getFaviconUrl = () => {
        if (tab.favIconUrl) {
            return tab.favIconUrl;
        }
        // Default favicon for URLs without one
        if (tab.url.startsWith('http')) {
            const hostname = new URL(tab.url).hostname;
            return `https://www.google.com/s2/favicons?domain=${hostname}&sz=16`;
        }
        return null;
    };

    const getDomainFromUrl = (url: string) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url.length > 30 ? url.substring(0, 30) + '...' : url;
        }
    };

    const getTabItemClasses = () => {
        let classes = 'tab-item cursor-pointer group';
        if (compact) classes += ' compact';
        if (tab.active) classes += ' active';
        return classes;
    };

    if (compact) {
        return (
            <div
                className={`${getTabItemClasses()} flex items-center gap-2 p-1.5`}
                onClick={handleTabClick}
            >
                <div className="flex-shrink-0 w-3 h-3">
                    {getFaviconUrl() ? (
                        <img
                            src={getFaviconUrl()!}
                            alt=""
                            className="w-3 h-3"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                    )}
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-1">
                    <div className={`text-sm truncate ${tab.active ? 'font-semibold text-blue-700' : 'font-medium text-gray-700'}`}>
                        {highlightText(tab.title, searchText)}
                    </div>
                    {tab.pinned && (
                        <svg className="w-2.5 h-2.5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>

                <button
                    onClick={handleCloseTab}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded transition-opacity"
                    title="Close tab"
                >
                    <svg className="w-2.5 h-2.5 text-gray-400 hover:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div
            className={`${getTabItemClasses()} flex items-center gap-3 p-3`}
            onClick={handleTabClick}
        >
            <div className="flex-shrink-0 w-4 h-4">
                {getFaviconUrl() ? (
                    <img
                        src={getFaviconUrl()!}
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`text-sm truncate flex-1 ${tab.active ? 'font-bold text-blue-700' : 'font-semibold text-gray-900'}`}>
                        {highlightText(tab.title, searchText)}
                    </div>
                    {tab.pinned && (
                        <div className="flex-shrink-0">
                            <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="text-xs text-gray-500 truncate font-medium">
                    {highlightText(getDomainFromUrl(tab.url), searchText)}
                </div>
            </div>

            <button
                onClick={handleCloseTab}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded transition-opacity"
                title="Close tab"
            >
                <svg className="w-3 h-3 text-gray-400 hover:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}; 