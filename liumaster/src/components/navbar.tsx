import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";

function NavBar() {
	const { user, loading, logout } = useAuth();

	return (
		<nav className="flex bg-black/50 border-black border-2 text-white text-xl justify-between">
			<div id="leftItems">
				<button className="hover:bg-black/25 px-2 py-1 hover:cursor-pointer">
					<Link to="/">
						<b>Home</b>
					</Link>
				</button>
			</div>
			<div id="rightItems">
				{user && (
					<button
						className="hover:bg-black/25 px-2 py-1 hover:cursor-pointer"
						onClick={logout}
					>
						<b>Log out</b>
					</button>
				)}
			</div>
		</nav>
	);
}

export default NavBar;
