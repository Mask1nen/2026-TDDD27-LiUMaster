import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";

// Dropdownlistan som visas när man klickar på profilbilden i navbar
function ProfileDropDown() {
  const { logoutUser } = useAuth();
  return (
    <div className="flex flex-col bg-gray-900 p-3 rounded-md gap-2">
      <Link to="profile" className="hover:bg-white/50 p-2 rounded-md">
        Profile
      </Link>
      <Link to="settings" className="hover:bg-white/50 p-2 rounded-md">
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
