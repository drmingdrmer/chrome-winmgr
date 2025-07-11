import { useState, useEffect } from 'react';
import { ChromeWindow, WindowsData } from '../types';
import { getAllWindowsWithTabs } from '../utils/chrome-api';

export function useWindowsData(): WindowsData & {
    refreshData: () => void;
} {
    const [data, setData] = useState<WindowsData>({
        windows: [],
        loading: true,
        error: null
    });

    const loadData = async () => {
        try {
            setData(prev => ({ ...prev, loading: true, error: null }));
            const windows = await getAllWindowsWithTabs();
            setData({
                windows,
                loading: false,
                error: null
            });
        } catch (error) {
            setData({
                windows: [],
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        ...data,
        refreshData: loadData
    };
} 