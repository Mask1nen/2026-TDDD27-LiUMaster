import { ProgramCurriculum } from "./programcurriculum";
import { UploadPrograms } from "./uploadjson";
import { Link } from "react-router-dom";
import SideBar from "./sidebar";

type DashBoardCardProps = {
	destinationPage: string;
	contentText: string;
};

function DashBoardCard({ destinationPage, contentText }: DashBoardCardProps) {
	return (
		<Link
			to={destinationPage}
			className="hover:bg-blue-500/50 bg-black/25 p-2 m-2 hover:cursor-pointer size-1/2 border-2 border-neutral-600 shadow-sm shadow-black"
		>
			{contentText}
		</Link>
	);
}

function Dashboard() {
	return (
		<div className="flex items-center flex-col h-screen w-screen bg-white">
			<div id="center" className="flex flex-row w-full h-fit">
				<SideBar></SideBar>
				<DashBoardCard destinationPage="/" contentText="Hello"></DashBoardCard>
				<DashBoardCard destinationPage="/" contentText="There"></DashBoardCard>
				{/* <ProgramCurriculum programCode="6CDDD" /> */}
			</div>
			<UploadPrograms></UploadPrograms>
		</div>
	);
}

export default Dashboard;
