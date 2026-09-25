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
    <div className="flex flex-col items-center h-screen text-white text-xl text-shadow-black text-shadow-md">
      <div className="fixed top-0 w-full z-50">
        <NavBar toggleSidebar={toggleSidebar} />
      </div>
      <div className="pt-14 w-full h-full flex flex-row">
        {showSidebar && (
          <div className="absolute z-50 w-1/8 h-full">
            <SideBar />
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
