import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AIChat from './AIChat';

export default function StoreLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <AIChat />
    </>
  );
}
