import { Link } from "react-router-dom";

type SideBarLinkProps = {
	destinationPage: string;
	contentText: string;
};

function SideBar() {
	return (
		<div className="flex flex-col w-1/6 h-fit m-2 p-1 bg-black/25 items-center border-2 border-neutral-600">
			<SideBarLink destinationPage="/" contentText="Friends"></SideBarLink>
			<SideBarLink destinationPage="/" contentText="Friends"></SideBarLink>
			<SideBarLink destinationPage="/" contentText="Friends"></SideBarLink>
			<SideBarLink destinationPage="/" contentText="Friends"></SideBarLink>
			<SideBarLink destinationPage="/" contentText="Friends"></SideBarLink>
			<SideBarLink destinationPage="/" contentText="Friends"></SideBarLink>
			<SideBarLink destinationPage="/" contentText="Friends"></SideBarLink>
			<SideBarLink destinationPage="/" contentText="Friends"></SideBarLink>
		</div>
	);
}

function SideBarLink({ destinationPage, contentText }: SideBarLinkProps) {
	return (
		<div className="p-5 w-4/5 hover:bg-black/25 flex items-center justify-center rounded-4xl">
			<Link to={destinationPage}>{contentText}</Link>
		</div>
	);
}

export default SideBar;
