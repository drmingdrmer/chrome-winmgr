import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { ChromeTab } from '../types';
import { switchToTab, closeTab } from '../utils/chrome-api';

interface TabItemProps {
    tab: ChromeTab;
    onTabChange?: () => void;
    compact?: boolean;
    searchText?: string;
}

// Utility function to highlight search text - optimized with early return
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

// Favicon cache to avoid duplicate requests
const faviconCache = new Map<string, string>();

// Debug: Add a console log to confirm the updated component is loaded
console.log('[TabItem] Component loaded with simple URL tooltip - v2.0');

export const TabItem: React.FC<TabItemProps> = React.memo(({ tab, onTabChange, compact = false, searchText = '' }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [faviconLoaded, setFaviconLoaded] = useState(false);

    // Debug: Log when component mounts
    useEffect(() => {
        console.log('[TabItem] Component mounted for tab:', tab.title, 'URL:', tab.url);
    }, []);

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: '50px' // Load slightly before coming into view
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Memoize event handlers to prevent unnecessary re-renders
    const handleTabClick = useCallback(async () => {
        try {
            await switchToTab(tab.id);
            onTabChange?.();
        } catch (error) {
            console.error('Failed to switch to tab:', error);
        }
    }, [tab.id, onTabChange]);

    const handleCloseTab = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await closeTab(tab.id);
            onTabChange?.();
        } catch (error) {
            console.error('Failed to close tab:', error);
        }
    }, [tab.id, onTabChange]);

    // Optimized favicon URL with caching
    const faviconUrl = useMemo(() => {
        if (tab.favIconUrl) {
            return tab.favIconUrl;
        }

        if (tab.url.startsWith('http')) {
            const hostname = new URL(tab.url).hostname;
            const cacheKey = `favicon-${hostname}`;

            if (faviconCache.has(cacheKey)) {
                return faviconCache.get(cacheKey);
            }

            const url = `https://www.google.com/s2/favicons?domain=${hostname}&sz=16`;
            faviconCache.set(cacheKey, url);
            return url;
        }
        return null;
    }, [tab.favIconUrl, tab.url]);

    // Memoize domain extraction with better performance
    const domainFromUrl = useMemo(() => {
        try {
            return new URL(tab.url).hostname.replace('www.', '');
        } catch {
            return tab.url.length > 30 ? tab.url.substring(0, 30) + '...' : tab.url;
        }
    }, [tab.url]);

    // Memoize CSS classes to avoid string concatenation on every render
    const tabItemClasses = useMemo(() => {
        const classes = ['tab-item', 'cursor-pointer', 'group'];
        if (compact) classes.push('compact');
        if (tab.active) classes.push('active');
        return classes.join(' ');
    }, [compact, tab.active]);

    // Memoize highlighted text to avoid regex processing on every render
    const highlightedTitle = useMemo(() => {
        return highlightText(tab.title, searchText);
    }, [tab.title, searchText]);

    const highlightedDomain = useMemo(() => {
        return highlightText(domainFromUrl, searchText);
    }, [domainFromUrl, searchText]);

    // Optimized favicon component with lazy loading
    const faviconElement = useMemo(() => {
        // Don't load favicon until visible
        if (!isVisible) {
            return <div className={`bg-gray-300 rounded-sm ${compact ? "w-3 h-3" : "w-4 h-4"}`}></div>;
        }

        if (faviconUrl) {
            return (
                <img
                    src={faviconUrl}
                    alt=""
                    className={compact ? "w-3 h-3" : "w-4 h-4"}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setFaviconLoaded(true)}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                    style={{
                        opacity: faviconLoaded ? 1 : 0.7,
                        transition: 'opacity 0.1s ease'
                    }}
                />
            );
        }
        return <div className={`bg-gray-300 rounded-sm ${compact ? "w-3 h-3" : "w-4 h-4"}`}></div>;
    }, [faviconUrl, compact, isVisible, faviconLoaded]);

    // Static pinned icon to avoid re-creating SVG
    const pinnedIcon = useMemo(() => (
        <svg className={`text-orange-500 flex-shrink-0 ${compact ? "w-2.5 h-2.5" : "w-3 h-3"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
        </svg>
    ), [compact]);

    // Static close button SVG to avoid re-creating
    const closeIcon = useMemo(() => (
        <svg className={`text-gray-400 hover:text-red-500 ${compact ? "w-2.5 h-2.5" : "w-3 h-3"}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    ), [compact]);

    if (compact) {
        return (
            <div
                ref={elementRef}
                className={`${tabItemClasses} flex items-center gap-2 p-1.5`}
                onClick={handleTabClick}
                title={tab.url}
            >
                <div className="flex-shrink-0 w-3 h-3">
                    {faviconElement}
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-1">
                    <div className={`text-sm truncate ${tab.active ? 'font-semibold text-blue-700' : 'font-medium text-gray-700'}`}>
                        {highlightedTitle}
                    </div>
                    {tab.pinned && pinnedIcon}
                </div>

                <button
                    onClick={handleCloseTab}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded"
                    title="Close tab"
                >
                    {closeIcon}
                </button>
            </div>
        );
    }

    return (
        <div
            ref={elementRef}
            className={`${tabItemClasses} flex items-center gap-3 p-3`}
            onClick={handleTabClick}
            title={tab.url}
        >
            <div className="flex-shrink-0 w-4 h-4">
                {faviconElement}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`text-sm truncate flex-1 ${tab.active ? 'font-bold text-blue-700' : 'font-semibold text-gray-900'}`}>
                        {highlightedTitle}
                    </div>
                    {tab.pinned && (
                        <div className="flex-shrink-0">
                            {pinnedIcon}
                        </div>
                    )}
                </div>
                <div className="text-xs text-gray-500 truncate font-medium">
                    {highlightedDomain}
                </div>
            </div>

            <button
                onClick={handleCloseTab}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded"
                title="Close tab"
            >
                {closeIcon}
            </button>
        </div>
    );
}); 