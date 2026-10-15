import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";

type ProfileDropDownProps = {
  onClick: () => void;
};

// Dropdownlistan som visas när man klickar på profilbilden i navbar
function ProfileDropDown({ onClick }: ProfileDropDownProps) {
  const { user, logoutUser, loading } = useAuth();

  if (loading) {
    return <h1>Loading user</h1>;
  }

  return (
    <div className="flex flex-col w-35 bg-black p-3 rounded-md gap-2 text-white">
      <Link
        to={`profile/${user?.uid}`}
        className="hover:text-cyan-400 p-2"
        onClick={onClick}
      >
        Profil
      </Link>
      <Link
        to="admin"
        className="hover:text-cyan-400 p-2 rounded-md"
        onClick={onClick}
      >
        Admin
      </Link>
      <button
        onClick={logoutUser}
        className="hover:text-cyan-400 p-2 text-start hover:cursor-pointer"
      >
        Logga ut
      </button>
    </div>
  );
}
export default ProfileDropDown;
