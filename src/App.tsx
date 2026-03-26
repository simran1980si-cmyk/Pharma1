/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import TokenManagement from './components/TokenManagement';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'tokens':
        return <TokenManagement />;
      case 'pharmacy':
        return (
          <div className="p-8 flex flex-col items-center justify-center min-h-screen text-gray-500 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pharmacy Module</h2>
            <p>This module is currently under development.</p>
          </div>
        );
      case 'warehouse':
        return (
          <div className="p-8 flex flex-col items-center justify-center min-h-screen text-gray-500 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Warehouse Module</h2>
            <p>This module is currently under development.</p>
          </div>
        );
      case 'reports':
        return (
          <div className="p-8 flex flex-col items-center justify-center min-h-screen text-gray-500 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports Module</h2>
            <p>This module is currently under development.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto h-screen">
        {renderContent()}
      </main>
    </div>
  );
}

