import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";
import { useState, useEffect, useRef } from "react";
import ProfileDropDown from "./profiledropdown.tsx";
import hamburgerMenu from "../assets/icons8-hamburger-menu-50.png";
import UserAvatar from "./useravatar.tsx";

interface SidebarProps {
  toggleSidebar: () => void;
}

//Navbar, visas på alla sidor som routas via layout komponenten.
function NavBar({ toggleSidebar }: SidebarProps) {
  const { user } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sideBarVisible = useRef<HTMLDivElement>(null);

  // Gömmer profildropdown om man klickar någonstans på skärmen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    }

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  return (
    <nav className="flex justify-between h-14 w-full p-1 bg-black text-white]">
      <div className="relative flex justify-center ml-2" ref={sideBarVisible}>
        <button
          className="hover:cursor-pointer text-shadow-md text-shadow-black h-full mr-2"
          onClick={toggleSidebar}
        >
          <img src={hamburgerMenu} className="h-3/5"></img>
        </button>
      </div>

      <Link
        to="/"
        className="p-2 hover:cursor-pointer hover:text-cyan-500 font-bold"
      >
        LiuMaster
      </Link>
      {user && (
        <div className="size-fit" ref={dropdownRef}>
          <UserAvatar
            userID={user.uid}
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            pictureSize="h-10 w-10"
            showTooltip={false}
            isOwner={true}
          />
          <div className="relative flex justify-end">
            {showProfileDropdown && (
              <div className="absolute right-0 mt-1 top-full z-50">
                <ProfileDropDown />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
