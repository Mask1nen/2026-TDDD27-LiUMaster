import profileIcon from "../assets/icons8-profile-96.png";
import { useUserProfile } from "../hooks/useUserProfile";

type userAvatarProps = {
  userID: string;
  onClick?: () => void;
  pictureSize: string;
  showTooltip: boolean;
  isOwner: boolean;
};

export function UserAvatar({
  userID,
  onClick,
  pictureSize,
  showTooltip,
  isOwner,
}: userAvatarProps) {
  const { profile } = useUserProfile(userID);
  return (
    <div className="relative group inline-flex items-center">
      <img
        src={profile?.profilePicture || profileIcon}
        className={`${pictureSize} rounded-full aspect-square object-cover ${
          showTooltip ? "border-2" : ""
        } ${isOwner ? "border-blue-500" : "border-green-500"}
        ${onClick ? "hover:cursor-pointer" : ""}
        }`}
        onClick={onClick}
        alt="Avatar"
      />

      {/* Tooltip-rutan som visas vid hover */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-surface-raised text-content text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-neutral-700">
          {profile?.displayName || "Användare"}
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
