import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex grow">
        <Sidebar />
        <main className="grow p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
