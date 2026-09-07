import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";
import { useState, useEffect, useRef } from "react";
import ProfileDropDown from "./profiledropdown.tsx";
import profileIcon from "../assets/icons8-profile-96.png";
import hamburgerMenu from "../assets/icons8-hamburger-menu-50.png";

interface SidebarProps {
  toggleSidebar: () => void;
}

function NavBar( {toggleSidebar}: SidebarProps) {
	const { user } = useAuth();
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const sideBarVisible = useRef<HTMLDivElement>(null);

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
		<nav className="flex justify-between h-14 w-full p-1 bg-gray-900 text-white]">
				<div className="relative flex justify-center" ref={sideBarVisible}>
					<button
						className="hover:bg-black/25 hover:cursor-pointer text-shadow-md text-shadow-black h-full mr-2"
						onClick={toggleSidebar}
					>
						<img src={hamburgerMenu} className="h-3/5"></img>
					</button>
				</div>

			<Link to="/" className="hover:bg-black/25 p-2 hover:cursor-pointer		">
				LiuMaster
			</Link>
			{user && (
				<div className="relative flex justify-end" ref={dropdownRef}>
					<button
						className="hover:bg-black/25 hover:cursor-pointer text-shadow-md text-shadow-black h-full mr-2"
						onClick={() => setShowProfileDropdown(!showProfileDropdown)}
					>
						<img src={profileIcon} className="w-full h-full"></img>
					</button>
					{showProfileDropdown && (
						<div className="absolute right-0 top-full mt-1 z-50">
							<ProfileDropDown />
						</div>
					)}
				</div>
			)}
		</nav>
	);
}

export default NavBar;
