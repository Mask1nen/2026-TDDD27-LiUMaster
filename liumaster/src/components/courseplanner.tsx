import { useParams, useNavigate } from "react-router-dom";
import CourseViewer from "./courseviewer";
import { useAuth } from "../context/UserAuthContext";

//Parentkomponent för courseviewer, tanken är att flytta ut planering komponent av courseviewer till denna så att courseviewer enbart visar kurserna från databasen.
function CoursePlanner() {
  const { deleteMasterPlan } = useAuth();
  const navigate = useNavigate();
  // Hämtar planID från URL
  const { planID } = useParams<{ planID: string }>();

  const deletePlan = async () => {
    if (!planID) return;

    await deleteMasterPlan(planID);
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={deletePlan}
        className=" bg-black items-end w-50 h-10 hover:cursor-pointer hover:bg-blue-500/50"
      >
        Delete Plan
      </button>
      <div className="flex flex-row size-full justify-between">
        <div className="w-1/3 bg-black/50">
          <h1>This is showing plan with ID {planID}</h1>
        </div>
        <div className="h-max w-2/3 pl-5 border-l-2 border-black">
          <CourseViewer />
        </div>
      </div>
    </div>
  );
}

export default CoursePlanner;
