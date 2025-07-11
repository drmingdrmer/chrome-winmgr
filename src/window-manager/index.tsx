import React from 'react';
import { createRoot } from 'react-dom/client';
import { WindowManagerApp } from './WindowManagerApp';
import './window-manager.css';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<WindowManagerApp />);
} 