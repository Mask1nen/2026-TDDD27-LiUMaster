import profileIcon from "../assets/icons8-profile-96.png";
import { useUserProfile } from "../helpers/useUserProfile";
import { useNavigate } from "react-router-dom";

type userAvatarProps = {
  userID: string;
  onClick?: () => void;
  pictureSize: string;
  inNavBar: boolean;
};

export function UserAvatar({
  userID,
  onClick,
  pictureSize,
  inNavBar,
}: userAvatarProps) {
  const { profile } = useUserProfile(userID);
  const navigate = useNavigate();
  return (
    <div className="relative group inline-flex items-center">
      <img
        src={profile?.profilePicture || profileIcon}
        className={`${pictureSize} rounded-full hover:cursor-pointer m-1 aspect-square object-cover`}
        onClick={inNavBar ? onClick : () => navigate(`/profile/${userID}`)}
        alt="Avatar"
      />

      {/* Tooltip-rutan som visas vid hover */}
      {!inNavBar && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-neutral-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-neutral-700">
          {profile?.displayName || "Användare"}
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
