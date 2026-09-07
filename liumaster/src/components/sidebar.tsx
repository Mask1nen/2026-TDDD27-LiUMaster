import { Link } from "react-router-dom";

type SideBarLinkProps = {
	destinationPage: string;
	contentText: string;
};

function SideBar() {
	return (
		<div className="flex flex-col w-full h-full bg-gray-900 items-center">
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
		<Link
			className="p-3 w-full hover:bg-black/25 flex items-center justify-center"
			to={destinationPage}
		>
			{contentText}
		</Link>
	);
}

export default SideBar;
