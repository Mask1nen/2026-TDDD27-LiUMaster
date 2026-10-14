import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";
import { useState, useEffect, useRef } from "react";
import ProfileDropDown from "./profiledropdown.tsx";
import hamburgerMenu from "../assets/icons8-hamburger-menu-50.png";
import messageIcon from "../assets/icons8-message.svg";
import UserAvatar from "./useravatar.tsx";

interface SidebarProps {
  toggleSidebar: () => void;
}

//Navbar, visas på alla sidor som routas via layout komponenten.
function NavBar({ toggleSidebar }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    <nav className="grid grid-cols-[1fr_auto_1fr] items-center h-14 w-full p-1 bg-black text-white]">
      <div className="relative flex justify-start" ref={sideBarVisible}>
        <img
          src={hamburgerMenu}
          className="scale-65 hover:cursor-pointer h-full"
          onClick={toggleSidebar}
        />
      </div>

      <Link
        to="/"
        className="p-2 hover:cursor-pointer hover:text-cyan-500 font-bold text-white"
      >
        LiuMaster
      </Link>
      {user && (
        <div className="flex flex-row items-center gap-2 justify-end">
          <img
            src={messageIcon}
            className="scale-60 cursor-pointer"
            onClick={() => navigate(`/conversations`)}
          ></img>
          <div className="size-fit relative items-center" ref={dropdownRef}>
            <UserAvatar
              userID={user.uid}
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              pictureSize="h-10 w-10"
              showTooltip={false}
              isOwner={true}
            />
            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <ProfileDropDown
                  onClick={() => setShowProfileDropdown(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
