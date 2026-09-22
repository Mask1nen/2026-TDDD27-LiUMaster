import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.ts";
import { doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import CourseViewer from "./courseviewer";
import { useUserPlan } from "../helpers/useUserPlan";
import { useAuth } from "../context/UserAuthContext";
import CourseCard from "./coursecard";

import type { Course } from "../types";

//Parentkomponent för courseviewer, tanken är att flytta ut planering komponent av courseviewer till denna så att courseviewer enbart visar kurserna från databasen.
function CoursePlanner() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hämtar planID från URL
  const { planID } = useParams<{ planID: string }>();
  const { deleteMasterPlan, selectedPlan, loading } = useUserPlan(planID);

  if (loading || !selectedPlan) {
    console.log("loading");
    return <div className="text-white p-6">Laddar plan...</div>;
  }

  const deletePlan = async () => {
    if (!planID) return;

    await deleteMasterPlan(planID);
    navigate("/dashboard");
  };

  async function handleRemoveCourse(course: Course) {
    const uid = user?.uid;
    if (!uid || !selectedPlan?.id) return;

    const planRef = doc(db, "users", uid, "plans", selectedPlan.id);
    await updateDoc(planRef, {
      courses: arrayRemove(course),
    });
  }

  async function handleAddCourse(course: Course) {
    const uid = user?.uid;
    if (!uid || !selectedPlan) return;
    const planRef = doc(db, "users", uid, "plans", selectedPlan.id);
    await updateDoc(planRef, {
      courses: arrayUnion(course),
    });
    console.log(`Kursen sparad till plan: ${selectedPlan.id}`);
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={deletePlan}
        className="bg-black items-end w-50 h-10 hover:cursor-pointer hover:bg-blue-500/50 text-white"
      >
        Delete Plan
      </button>
      <div className="flex flex-row justify-between mt-4 size-full">
        {selectedPlan?.courses && selectedPlan.courses.length > 0 ? (
          <div className="h-fit w-1/3 p-4 grid grid-cols-2 gap-2 items-start">
            {selectedPlan.courses.map((course, idx) => (
              <div key={`${course.courseCode}-${idx}`} className="h-auto">
                {course.offerings.map((offering, offeringindex) => (
                  <CourseCard
                    course={course}
                    courseIndex={offeringindex}
                    inPlan={true}
                    onButtonClick={handleRemoveCourse}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-1/3 p-4">
            <h1 className="text-white">Inga kurser tillagda i denna plan!</h1>
          </div>
        )}
        <div className="h-max w-2/3 pl-5 border-l-2 border-black">
          <CourseViewer
            selectedPlan={selectedPlan}
            handleAddCourse={handleAddCourse}
          />
        </div>
      </div>
    </div>
  );
}

export default CoursePlanner;
