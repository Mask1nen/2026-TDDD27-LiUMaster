import { ProgramCurriculum } from "./programcurriculum";
import { UploadPrograms } from "./uploadjson";

function Dashboard() {
	return (
		<div className="flex justify-center items-center flex-col h-screen w-screen bg-[#98E5EB]">
			<div id="topRight" className="absolute top-10 right-0">
				<UploadPrograms />
			</div>
			<div id="center">
				<ProgramCurriculum programCode="6CDDD" />
			</div>
		</div>
	);
}

export default Dashboard;
