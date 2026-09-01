import { Link } from "react-router-dom";

type DashBoardCardProps = {
	destinationPage: string;
	contentText: string;
};

function DashBoardCard({ destinationPage, contentText }: DashBoardCardProps) {
	return (
		<Link
			to={destinationPage}
			className="flex items-center justify-center hover:bg-blue-500/50 bg-[#98E5EB] hover:cursor-pointer size-full border-2 border-neutral-600 shadow-sm shadow-black"
		>
			{contentText}
		</Link>
	);
}
function Dashboard() {
	return (
		<div className="flex items-center flex-col size-full gap-2">
			<div id="center" className="flex flex-row h-1/4 w-1/4 gap-2">
				<DashBoardCard
					destinationPage="/CourseViewer"
					contentText="Course Viewer"
				></DashBoardCard>
			</div>
		</div>
	);
}

export default Dashboard;
