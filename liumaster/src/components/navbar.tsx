import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";
import { useState, useEffect, useRef } from "react";
import ProfileDropDown from "./profiledropdown.tsx";

function NavBar() {
	const { user } = useAuth();
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

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
		<nav className="flex justify-between h-1/14 w-full p-1 border-b-2 border-neutral-600 bg-[#98E5EB]">
			<Link to="/" className="hover:bg-black/25 p-2 hover:cursor-pointer		">
				LiuMaster
			</Link>
			{user && (
				<div className="relative" ref={dropdownRef}>
					<button
						className="hover:bg-black/25 p-2 hover:cursor-pointer text-shadow-md text-shadow-black"
						onClick={() => setShowProfileDropdown(!showProfileDropdown)}
					>
						Profile
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
