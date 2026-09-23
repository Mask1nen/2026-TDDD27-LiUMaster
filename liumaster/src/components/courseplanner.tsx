import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.ts";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import CourseViewer from "./courseviewer";
import PlanViewer from "./planviewer";
import { useUserPlan } from "../helpers/useUserPlan";
import { useAuth } from "../context/UserAuthContext";

import type { Course, Year } from "../types";

function CoursePlanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { planID } = useParams<{ planID: string }>();
  const { deleteMasterPlan, selectedPlan, loading } = useUserPlan(planID);

  const [years, setYears] = useState<Year[]>([]);

  useEffect(() => {
    async function fetchCurriculum() {
      const programCode = selectedPlan?.program;
      if (!programCode) return;

      const programRef = doc(db, "programs", programCode);
      const yearsSnap = await getDocs(collection(programRef, "years"));

      const yearPromises = yearsSnap.docs.map(async (yearDoc) => {
        const coursesSnap = await getDocs(collection(yearDoc.ref, "courses"));
        const courses = coursesSnap.docs.map((c) => c.data() as Course);

        return { year: yearDoc.id, courses };
      });

      const yearData = await Promise.all(yearPromises);
      yearData.sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

      setYears(yearData);
    }

    if (selectedPlan) {
      fetchCurriculum();
    }
  }, [selectedPlan?.program, selectedPlan]);

  if (loading || !selectedPlan) {
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
    if (!selectedPlan.private) {
      const publicPlanRef = doc(db, "public_plans", selectedPlan.id);
      await updateDoc(publicPlanRef, {
        courses: arrayRemove(course),
      });
    }
  }

  async function handleAddCourse(course: Course) {
    const uid = user?.uid;
    if (!uid || !selectedPlan) return;

    const planRef = doc(db, "users", uid, "plans", selectedPlan.id);
    await updateDoc(planRef, {
      courses: arrayUnion(course),
    });
    if (!selectedPlan.private) {
      const publicPlanRef = doc(db, "public_plans", selectedPlan.id);
      await updateDoc(publicPlanRef, {
        courses: arrayUnion(course),
      });
    }
  }

  return (
    <div className="flex flex-col w-full items-end">
      <div className="flex flex-row justify-between size-full">
        {/* VÄNSTER SIDA: Användarens Planering */}
        <PlanViewer
          selectedPlan={selectedPlan}
          years={years}
          handleRemoveCourse={handleRemoveCourse}
        />

        {/* HÖGER SIDA: Alla kurser */}
        <div className="relative h-max w-1/2 pl-5 border-l-2 border-neutral-700">
          <CourseViewer
            selectedPlan={selectedPlan}
            years={years}
            handleAddCourse={handleAddCourse}
          />
          <button
            onClick={deletePlan}
            className="absolute top-0 right-0 z-10 p-2 bg-neutral-800 text-red-500 border-2 border-neutral-700 shadow-xl rounded-md cursor-pointer w-40 hover:bg-red-500/20 font-semibold"
          >
            Delete Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default CoursePlanner;
