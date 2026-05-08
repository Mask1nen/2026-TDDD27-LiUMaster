import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.ts";

function NavBar() {
	const navigate = useNavigate();

	async function logout() {
		try {
			signOut(auth);
			console.log("User signed out.");
			navigate("/Login");
		} catch (err) {
			console.log(err);
		}
	}

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
				<button
					className="hover:bg-black/25 px-2 py-1 hover:cursor-pointer"
					onClick={logout}
				>
					<b>Log out</b>
				</button>
			</div>
		</nav>
	);
}

export default NavBar;
