import { Outlet } from "react-router-dom";
import NavBar from "./navbar.tsx";
import SideBar from "./sidebar.tsx";

function Layout() {
	return (
		<div className="flex flex-col items-center h-screen text-white text-xl text-shadow-black text-shadow-md font-bold">
			<NavBar />
			<div className="flex size-full overflow-hidden gap-2 p-2 bg-black/50">
				<SideBar />
				<main className="flex-1 overflow-y-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

export default Layout;
