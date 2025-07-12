import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useWindowsData } from '../hooks/useWindowsData';
import { WindowGroup } from '../components/WindowGroup';

const STORAGE_KEY = 'chrome-winmgr-layout-mode';
const OLD_STORAGE_KEY = 'chrome-winmgr-column-count';

export const WindowManagerApp: React.FC = () => {
    const { windows, loading, error, refreshData } = useWindowsData();

    // Layout modes: compact/medium/large for size-based, or 1-6 for fixed columns
    const [layoutMode, setLayoutMode] = useState<string>(() => {
        try {
            // Check for new layout mode first
            let saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                // Try to migrate from old column count system
                const oldSaved = localStorage.getItem(OLD_STORAGE_KEY);
                if (oldSaved) {
                    const oldColumnCount = parseInt(oldSaved, 10);
                    if (oldColumnCount === 0) {
                        saved = 'medium'; // Auto mode becomes medium
                    } else {
                        saved = oldColumnCount.toString(); // Keep fixed column counts
                    }

                    // Save migrated value and remove old key
                    localStorage.setItem(STORAGE_KEY, saved);
                    localStorage.removeItem(OLD_STORAGE_KEY);
                }
            }

            return saved || 'medium'; // Default to medium size
        } catch {
            return 'medium';
        }
    });

    const [searchText, setSearchText] = useState<string>('');
    const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');

    // Debounce search text to reduce expensive filtering operations
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 150); // 150ms debounce

        return () => clearTimeout(timer);
    }, [searchText]);

    // Save layout mode to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, layoutMode);
        } catch {
            // Silently fail if localStorage is not available
        }
    }, [layoutMode]);

    // Memoize layout configuration
    const layoutConfig = useMemo(() => {
        if (layoutMode === 'compact') {
            return { className: 'masonry-container-compact', style: {} };
        } else if (layoutMode === 'medium') {
            return { className: 'masonry-container-medium', style: {} };
        } else if (layoutMode === 'large') {
            return { className: 'masonry-container-large', style: {} };
        } else {
            // Fixed column count (1-6)
            const columnCount = parseInt(layoutMode, 10);
            return {
                className: 'masonry-container-custom',
                style: { columnCount }
            };
        }
    }, [layoutMode]);

    // Filter windows and tabs based on debounced search text for better performance
    const filteredWindows = useMemo(() => {
        if (!debouncedSearchText.trim()) {
            return windows;
        }

        const searchLower = debouncedSearchText.toLowerCase();

        return windows.map(window => {
            // Filter tabs that match the search
            const filteredTabs = window.tabs.filter(tab => {
                const titleMatch = tab.title?.toLowerCase().includes(searchLower);
                const urlMatch = tab.url?.toLowerCase().includes(searchLower);
                return titleMatch || urlMatch;
            });

            // Include window if it has matching tabs or if window title matches
            if (filteredTabs.length > 0) {
                return {
                    ...window,
                    tabs: filteredTabs
                };
            }

            return null;
        }).filter(Boolean) as typeof windows;
    }, [windows, debouncedSearchText]);

    // Memoize tab counts
    const totalTabs = useMemo(() =>
        windows.reduce((sum, window) => sum + window.tabs.length, 0),
        [windows]
    );

    const filteredTotalTabs = useMemo(() =>
        filteredWindows.reduce((sum, window) => sum + window.tabs.length, 0),
        [filteredWindows]
    );

    // Memoize event handlers
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchText('');
    }, []);

    const handleLayoutModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setLayoutMode(e.target.value);
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                    <div className="flex items-center gap-3 mb-4">
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-lg font-semibold text-gray-900">Error Loading Windows</h2>
                    </div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={refreshData}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Compact Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-full mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-6 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">Chrome Window Manager</h1>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                    </svg>
                                    <span className="font-medium text-gray-700">
                                        {debouncedSearchText ? filteredWindows.length : windows.length}
                                        {debouncedSearchText && filteredWindows.length !== windows.length && (
                                            <span className="text-gray-400">/{windows.length}</span>
                                        )}
                                    </span>
                                    <span className="text-gray-500">windows</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45.5a2.5 2.5 0 11-3.9-3 2.5 2.5 0 013.9 3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-gray-700">
                                        {debouncedSearchText ? filteredTotalTabs : totalTabs}
                                        {debouncedSearchText && filteredTotalTabs !== totalTabs && (
                                            <span className="text-gray-400">/{totalTabs}</span>
                                        )}
                                    </span>
                                    <span className="text-gray-500">tabs</span>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search tabs and windows..."
                                    value={searchText}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {searchText && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Layout Mode Selector */}
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                            </svg>
                            <select
                                value={layoutMode}
                                onChange={handleLayoutModeChange}
                                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="compact">Compact Cards</option>
                                <option value="medium">Medium Cards</option>
                                <option value="large">Large Cards</option>
                                <option value="1">1 Column</option>
                                <option value="2">2 Columns</option>
                                <option value="3">3 Columns</option>
                                <option value="4">4 Columns</option>
                                <option value="5">5 Columns</option>
                                <option value="6">6 Columns</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Masonry Layout */}
            <main className="max-w-full mx-auto px-4 py-4">
                {filteredWindows.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center max-w-md mx-auto">
                        {debouncedSearchText ? (
                            <>
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
                                <p className="text-gray-600 mb-4">
                                    No tabs or windows match "<span className="font-medium">{debouncedSearchText}</span>"
                                </p>
                                <button
                                    onClick={handleClearSearch}
                                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                                >
                                    Clear Search
                                </button>
                            </>
                        ) : (
                            <>
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Windows Found</h2>
                                <p className="text-gray-600">It looks like there are no Chrome windows open.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div
                        className={layoutConfig.className}
                        style={layoutConfig.style}
                    >
                        {filteredWindows.map((window) => (
                            <div key={window.id} className="masonry-item">
                                <WindowGroup
                                    window={window}
                                    onTabChange={refreshData}
                                    isActive={window.focused}
                                    searchText={debouncedSearchText}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}; 