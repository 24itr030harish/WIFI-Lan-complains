import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar toggleSidebar={toggleSidebar} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar isOpen={sidebarOpen} closeMobileSidebar={closeMobileSidebar} />
        <main
          style={{
            flex: 1,
            padding: '1.75rem',
            maxWidth: '1440px',
            margin: '0 auto',
            width: '100%',
            overflowX: 'hidden'
          }}
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .netcare-sidebar {
            position: fixed !important;
            left: -280px;
            top: 64px;
            bottom: 0;
            transition: left 0.25s ease-in-out;
            z-index: 50;
          }
          .netcare-sidebar.open {
            left: 0 !important;
          }
          .logout-text {
            display: none;
          }
        }
        @media (min-width: 769px) {
          .sidebar-toggle-btn {
            display: none !important;
          }
          .sidebar-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
