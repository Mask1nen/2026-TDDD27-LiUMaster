import { Link } from "react-router-dom";
import UserAvatar from "./useravatar";
import { useAuth } from "../context/UserAuthContext";
import ThemeButton from "./themebutton";

type ExternalSideBarLinkProps = {
  href: string;
  contentText: string;
};

function ExternalSideBarLink({ href, contentText }: ExternalSideBarLinkProps) {
  return (
    <a
      className="p-3 w-full hover:bg-surface-hover flex items-center justify-center"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {contentText}
    </a>
  );
}

type SideBarLinkProps = {
  destinationPage: string;
  contentText: string;
};

function SideBarLink({ destinationPage, contentText }: SideBarLinkProps) {
  return (
    <Link
      className="p-3 w-full hover:bg-surface-hover flex items-center justify-center"
      to={destinationPage}
    >
      {contentText}
    </Link>
  );
}

// Sidebarkomponent, här ska det finnas länkar till diverse sidor, till exempel utforskning av masterplaner, forum, nyhetssidor osv
function SideBar() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col justify-between h-full bg-surface-raised items-center border-2 border-themedBorder">
      <div className="flex flex-col w-full flex-1 min-h-0 overflow-y-auto">
        {user && (
          <div className="flex flex-row items-center w-full justify-center bg-surface p-1">
            <UserAvatar
              userID={user.uid}
              pictureSize="h-10 w-10"
              showTooltip={false}
              isOwner={true}
            />
            <h1 className="font-bold">{user.displayName}</h1>
          </div>
        )}
        <SideBarLink destinationPage="/dashboard" contentText="Dashboard" />
        <SideBarLink destinationPage="/about" contentText="Om oss" />
        <SideBarLink destinationPage="/faq" contentText="FAQ" />
        <ExternalSideBarLink
          href="https://gitlab.liu.se/marmo607/tddd27_2026_liumaster"
          contentText="GitLab"
        />
      </div>
      <div className="flex flex-col items-center">
        <ThemeButton />
      </div>
      <div className="flex flex-col shrink-0 p-2 text-center text-sm">
        <h1>Copyright TDDD27</h1>
        <h1>marmo607 LiU</h1>
      </div>
    </div>
  );
}

export default SideBar;
