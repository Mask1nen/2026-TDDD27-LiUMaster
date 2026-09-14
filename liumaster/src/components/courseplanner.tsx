import { useParams } from "react-router-dom";
import CourseViewer from "./courseviewer";

//Parentkomponent för courseviewer, tanken är att flytta ut planering komponent av courseviewer till denna så att courseviewer enbart visar kurserna från databasen.
function CoursePlanner() {
    // Hämtar planID från URL
    const { planID } = useParams<{ planID: string }>();

    return (
        <div>
            <CourseViewer planID={planID} />
        </div>
    );
}

export default CoursePlanner;