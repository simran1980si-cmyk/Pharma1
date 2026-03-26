/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import TokenManagement from './components/TokenManagement';
import Pharmacy from './components/Pharmacy';
import Warehouse from './components/Warehouse';
import Reports from './components/Reports';

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
        return <Pharmacy />;
      case 'warehouse':
        return <Warehouse />;
      case 'reports':
        return <Reports />;
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

