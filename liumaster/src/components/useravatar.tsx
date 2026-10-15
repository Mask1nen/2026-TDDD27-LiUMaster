import profileSVG from "../assets/gemini-svg.svg";
import { useUserProfile } from "../hooks/useUserProfile";

type userAvatarProps = {
  userID: string;
  onClick?: () => void;
  pictureSize: string;
  showTooltip: boolean;
  borderColour?: string;
};

export function UserAvatar({
  userID,
  onClick,
  pictureSize,
  showTooltip,
  borderColour,
}: userAvatarProps) {
  const { profile } = useUserProfile(userID);
  return (
    <div className="relative group inline-flex items-center">
      <img
        src={profile?.profilePicture || profileSVG}
        className={`${pictureSize} rounded-full aspect-square object-cover ${borderColour ? `${borderColour} border-2` : ""}
        ${onClick ? "hover:cursor-pointer" : ""}
        }`}
        onClick={onClick}
        alt="Avatar"
      />

      {/* Tooltip-rutan som visas vid hover */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-surface-raised text-content text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-themedBorder">
          {profile?.displayName || "Användare"}
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
