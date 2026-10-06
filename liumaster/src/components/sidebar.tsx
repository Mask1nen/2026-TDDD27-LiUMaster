import { Link } from "react-router-dom";
import UserAvatar from "./useravatar";
import { useAuth } from "../context/UserAuthContext";

type SideBarLinkProps = {
  destinationPage: string;
  contentText: string;
};

// Sidebarkomponent, här ska det finnas länkar till diverse sidor, till exempel utforskning av masterplaner, forum, nyhetssidor osv
function SideBar() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col justify-between h-full bg-neutral-800 items-center border-2 border-neutral-700">
      <div className="flex flex-col w-full flex-1 min-h-0 overflow-y-auto">
        {user && (
          <div className="flex flex-row items-center w-full justify-center bg-neutral-900 p-1">
            <UserAvatar
              userID={user.uid}
              pictureSize="h-10 w-10"
              showTooltip={false}
              isOwner={true}
            />
            <h1 className="font-bold">{user.displayName}</h1>
          </div>
        )}
        <SideBarLink
          destinationPage="/dashboard"
          contentText="Dashboard"
        ></SideBarLink>
        <SideBarLink
          destinationPage="/about"
          contentText="Om oss"
        ></SideBarLink>
        <SideBarLink destinationPage="/faq" contentText="FAQ"></SideBarLink>
        <SideBarLink
          destinationPage="/github"
          contentText="GitHub"
        ></SideBarLink>
      </div>
      <div className="flex flex-col shrink-0 p-2 text-center text-sm">
        <h1>Copyright TDDD27</h1>
        <h1>marmo607 LiU</h1>
      </div>
    </div>
  );
}

function SideBarLink({ destinationPage, contentText }: SideBarLinkProps) {
  return (
    <Link
      className="p-3 w-full hover:bg-black/25 flex items-center justify-center"
      to={destinationPage}
    >
      {contentText}
    </Link>
  );
}

export default SideBar;
