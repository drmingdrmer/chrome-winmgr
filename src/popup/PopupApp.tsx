import React from 'react';
import { useWindowsData } from '../hooks/useWindowsData';
import { WindowGroup } from '../components/WindowGroup';

export const PopupApp: React.FC = () => {
    const { windows, loading, error, refreshData } = useWindowsData();

    if (loading) {
        return (
            <div className="w-96 h-64 flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-gray-600">Loading windows...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-96 p-4 bg-red-50 border border-red-200">
                <div className="text-red-700 text-sm mb-2">Error loading windows:</div>
                <div className="text-red-600 text-xs mb-3">{error}</div>
                <button
                    onClick={refreshData}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    const totalTabs = windows.reduce((sum, window) => sum + window.tabs.length, 0);

    return (
        <div className="w-96 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800">Chrome Windows</h1>
                    <p className="text-sm text-gray-500">
                        {windows.length} windows • {totalTabs} tabs
                    </p>
                </div>
                <button
                    onClick={refreshData}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh"
                >
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Windows List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {windows.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 4H5c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H5V8h14v10z" />
                        </svg>
                        <p>No windows found</p>
                    </div>
                ) : (
                    windows.map((window) => (
                        <WindowGroup
                            key={window.id}
                            window={window}
                            onTabChange={refreshData}
                        />
                    ))
                )}
            </div>
        </div>
    );
}; 