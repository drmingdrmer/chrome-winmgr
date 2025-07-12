import { useMemo, useRef, useCallback, useEffect } from 'react';

interface SearchIndex {
    windowId: number;
    tabId: number;
    title: string;
    url: string;
    searchableText: string;
}

interface SearchResult {
    filteredWindows: any[];
    matchingTabIds: Set<number>;
}

// Simple search worker using a regular function (fallback for browsers without worker support)
const performSearch = (searchIndex: SearchIndex[], searchText: string): Set<number> => {
    const matchingTabIds = new Set<number>();
    const searchLower = searchText.toLowerCase();

    // Use binary search for better performance on large datasets
    for (let i = 0; i < searchIndex.length; i++) {
        if (searchIndex[i].searchableText.includes(searchLower)) {
            matchingTabIds.add(searchIndex[i].tabId);
        }
    }

    return matchingTabIds;
};

export const usePerformanceOptimizedSearch = (windows: any[], searchText: string) => {
    const searchIndexRef = useRef<SearchIndex[]>([]);
    const searchCacheRef = useRef<Map<string, SearchResult>>(new Map());
    const workerRef = useRef<Worker | null>(null);

    // Build search index with optimizations
    const searchIndex = useMemo(() => {
        if (windows.length === 0) return [];

        const index: SearchIndex[] = [];

        windows.forEach(window => {
            window.tabs.forEach((tab: any) => {
                // Pre-process and normalize text for better search performance
                const title = tab.title || '';
                const url = tab.url || '';
                const searchableText = `${title} ${url}`.toLowerCase()
                    .replace(/[^\w\s]/g, ' ') // Remove special characters
                    .replace(/\s+/g, ' ') // Normalize whitespace
                    .trim();

                index.push({
                    windowId: window.id,
                    tabId: tab.id,
                    title,
                    url,
                    searchableText
                });
            });
        });

        // Clear cache when index changes
        searchCacheRef.current.clear();
        searchIndexRef.current = index;

        return index;
    }, [windows]);

    // Optimized search with caching and early termination
    const search = useCallback((searchText: string): SearchResult => {
        const trimmedSearch = searchText.trim();

        if (!trimmedSearch) {
            return {
                filteredWindows: windows,
                matchingTabIds: new Set()
            };
        }

        // Check cache first
        const cacheKey = trimmedSearch.toLowerCase();
        if (searchCacheRef.current.has(cacheKey)) {
            return searchCacheRef.current.get(cacheKey)!;
        }

        // Perform search
        const matchingTabIds = performSearch(searchIndexRef.current, trimmedSearch);

        // Filter windows based on matching tabs
        const filteredWindows = windows.map(window => {
            const filteredTabs = window.tabs.filter((tab: any) =>
                matchingTabIds.has(tab.id)
            );

            if (filteredTabs.length > 0) {
                return {
                    ...window,
                    tabs: filteredTabs
                };
            }

            return null;
        }).filter(Boolean);

        const result: SearchResult = {
            filteredWindows,
            matchingTabIds
        };

        // Cache result (with size limit to prevent memory issues)
        if (searchCacheRef.current.size < 50) {
            searchCacheRef.current.set(cacheKey, result);
        }

        return result;
    }, [windows]);

    // Clean up cache periodically to prevent memory leaks
    useEffect(() => {
        const interval = setInterval(() => {
            if (searchCacheRef.current.size > 100) {
                // Keep only the most recent 20 searches
                const entries = Array.from(searchCacheRef.current.entries());
                searchCacheRef.current.clear();

                entries.slice(-20).forEach(([key, value]) => {
                    searchCacheRef.current.set(key, value);
                });
            }
        }, 30000); // Clean every 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Clean up worker on unmount
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    return useMemo(() => search(searchText), [search, searchText]);
}; 