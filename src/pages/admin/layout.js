import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { List } from "@phosphor-icons/react";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile Hamburger Menu */}
      {/* <div className="md:hidden absolute right-0">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-fit p2 rounded-none"
        >
          <List size={32} weight="bold" />
        </button>
      </div> */}

      {/* Sidebar for larger screens and mobile dropdown */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="px-4 sm:px-10 py-6 sm:py-10 bg-white flex-1 overflow-y-scroll">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
