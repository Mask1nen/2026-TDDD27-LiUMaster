import { useParams } from "react-router-dom";
import CourseViewer from "./courseviewer";

//Parentkomponent för courseviewer, tanken är att flytta ut planering komponent av courseviewer till denna så att courseviewer enbart visar kurserna från databasen.
function CoursePlanner() {
  // Hämtar planID från URL
  const { planID } = useParams<{ planID: string }>();

  return (
    <div className="flex flex-row size-full justify-between">
      <div className="w-1/3 bg-black/50">
        <h1>This is showing plan with ID {planID}</h1>
      </div>
      <div className="h-max w-2/3 pl-5 border-l-2 border-black">
        <CourseViewer />
      </div>
    </div>
  );
}

export default CoursePlanner;
