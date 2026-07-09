import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";

function NavBar() {
	const { user, logoutUser } = useAuth();

	return (
		<nav className="flex justify-between h-1/14 w-full p-1 border-b-2 border-neutral-600 bg-[#98E5EB]">
			<Link to="/" className="hover:bg-black/25 p-2 hover:cursor-pointerx">
				LiuMaster
			</Link>
			{user && (
				<button
					className="hover:bg-black/25 p-2 hover:cursor-pointer text-shadow-md text-shadow-black"
					onClick={logoutUser}
				>
					Log out
				</button>
			)}
		</nav>
	);
}

export default NavBar;
