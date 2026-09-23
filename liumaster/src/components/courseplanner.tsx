import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.ts";
import { doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import CourseViewer from "./courseviewer";
import { useUserPlan } from "../helpers/useUserPlan";
import { useAuth } from "../context/UserAuthContext";
import CourseCard from "./coursecard";

import type { Course } from "../types";

//Parentkomponent för kursplanering
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
    <div className="flex flex-col w-full items-end">
      <div className="flex flex-row justify-between size-full">
        <div className="size-1/3">
          <div className="flex flex-row justify-between text-2xl bg-blue-950 p-2">
            <h1>{selectedPlan.name}</h1>
            <h1>{selectedPlan.specialization}</h1>
          </div>
          {selectedPlan?.courses && selectedPlan.courses.length > 0 ? (
            <div className="h-fit w-full p-4 grid grid-cols-4 gap-2 items-start">
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
            <div className="size-full">
              <h1 className="text-white">Inga kurser tillagda i denna plan!</h1>
            </div>
          )}
        </div>
        <div className="relative h-max w-2/3 pl-5 border-l-2 border-black">
          <CourseViewer
            selectedPlan={selectedPlan}
            handleAddCourse={handleAddCourse}
          />
          <button
            onClick={deletePlan}
            className="absolute top-0 right-0 z-0 p-2 bg-neutral-800 text-white border-2 border-neutral-700 shadow-xl rounded-md cursor-pointer w-40 hover:bg-blue-500/50"
          >
            Delete Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default CoursePlanner;
