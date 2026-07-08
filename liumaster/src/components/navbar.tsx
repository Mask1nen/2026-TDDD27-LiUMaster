import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";

function NavBar() {
	const { user, logoutUser } = useAuth();

	return (
		<nav className="flex text-white text-xl justify-between size-11/12 p-1 m-2 border-2 border-neutral-600 rounded-4xl bg-[#98E5EB]">
			<div id="leftItems">
				<button className="hover:bg-black/25 p-2 hover:cursor-pointer rounded-4xl text-shadow-black text-shadow-md">
					<Link to="/">
						<b>LiuMaster</b>
					</Link>
				</button>
			</div>
			<div id="rightItems">
				{user && (
					<button
						className="hover:bg-black/25 p-2 hover:cursor-pointer rounded-4xl text-shadow-black text-shadow-md"
						onClick={logoutUser}
					>
						<b>Log out</b>
					</button>
				)}
			</div>
		</nav>
	);
}

export default NavBar;
