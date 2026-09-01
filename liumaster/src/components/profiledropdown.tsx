import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";

function ProfileDropDown() {
	const { logoutUser } = useAuth();
	return (
		<div className="flex flex-col bg-gray-900 p-3 rounded-md gap-2">
			<Link to="Profile" className="hover:bg-white/50 p-2 rounded-md">
				Profile
			</Link>
			<Link to="Settings" className="hover:bg-white/50 p-2 rounded-md">
				Settings
			</Link>
			<button
				onClick={logoutUser}
				className="hover:bg-white/50 p-2 rounded-md text-shadow-md text-shadow-black"
			>
				Log out
			</button>
		</div>
	);
}
export default ProfileDropDown;
