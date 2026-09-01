import { Outlet } from "react-router-dom";
import { useState } from "react";
import NavBar from "./navbar.tsx";
import SideBar from "./sidebar.tsx";

function Layout() {
	const [showSidebar, setShowSidebar] = useState(false);

	function toggleSidebar() {
		setShowSidebar(!showSidebar);
	}
	return (
		<div className="flex flex-col items-center h-screen text-white text-xl text-shadow-black text-shadow-md font-bold">
			<div className="fixed top-0 w-full">
				<NavBar toggleSidebar={toggleSidebar} />
			</div>
			<div  className="pt-14 w-full h-full flex flex-row">
			{showSidebar && (
				<div className="w-1/8 h-full">
					<SideBar />
			</div>
			)}
				<main className="flex-1 overflow-y-auto p-2">
					<Outlet />
				</main>
			</div>
			</div>
	);
}

export default Layout;
