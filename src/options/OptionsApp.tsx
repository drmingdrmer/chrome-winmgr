import React from 'react';

export const OptionsApp: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Chrome Window Manager Settings
                    </h1>

                    <div className="space-y-6">
                        <div className="border-b border-gray-200 pb-4">
                            <h2 className="text-lg font-medium text-gray-700 mb-2">
                                About
                            </h2>
                            <p className="text-gray-600">
                                Chrome Window Manager helps you view and manage all your Chrome windows and tabs in one place.
                            </p>
                        </div>

                        <div className="border-b border-gray-200 pb-4">
                            <h2 className="text-lg font-medium text-gray-700 mb-2">
                                Features
                            </h2>
                            <ul className="text-gray-600 space-y-1">
                                <li>• View all Chrome windows grouped together</li>
                                <li>• See all tabs within each window</li>
                                <li>• Click on tabs to switch to them</li>
                                <li>• Close tabs directly from the popup</li>
                                <li>• Identify incognito windows and pinned tabs</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-700 mb-2">
                                How to Use
                            </h2>
                            <ol className="text-gray-600 space-y-1">
                                <li>1. Click the extension icon in the toolbar</li>
                                <li>2. Browse your windows and tabs in the popup</li>
                                <li>3. Click on any tab to switch to it</li>
                                <li>4. Use the close button (×) to close tabs</li>
                                <li>5. Use the refresh button to update the list</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 