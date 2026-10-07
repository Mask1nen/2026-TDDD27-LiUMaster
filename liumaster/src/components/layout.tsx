import { Outlet } from "react-router-dom";
import { useState } from "react";
import NavBar from "./navbar.tsx";
import SideBar from "./sidebar.tsx";

// Layout för sidan, garanterar att alla sidor har en navbar och sidebar. Outlet är komponenten som visar content, som till exempel dashboard.
function Layout() {
  const [showSidebar, setShowSidebar] = useState(false);

  function toggleSidebar() {
    setShowSidebar(!showSidebar);
  }

  return (
    <div className="flex flex-col h-screen text-content text-xl">
      <div className="w-full shrink-0 z-50">
        <NavBar toggleSidebar={toggleSidebar} />
      </div>

      <div className="relative w-full flex-1 min-h-0 flex flex-row h-screen">
        {showSidebar && (
          <div className="absolute inset-y-0 left-0 w-1/8 z-40 flex flex-col">
            <SideBar />
          </div>
        )}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
