import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase.ts";
import { collection, doc, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import CourseViewer from "./courseviewer.tsx";
import PlanViewer from "./planviewer.tsx";
import { useUserPlan } from "../helpers/useUserPlan.ts";
import { useAuth } from "../context/UserAuthContext.tsx";

import type { Course, Year } from "../types.ts";
import UserAvatar from "./useravatar.tsx";

function CoursePlanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { planID } = useParams<{ planID: string }>();
  const {
    deleteMasterPlan,
    selectedPlan,
    loadingPlan,
    updatePlan,
    addCourse,
    removeCourse,
    addCollaborator,
    removeCollaborator,
  } = useUserPlan(planID);
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

  const isPublished = !!selectedPlan?.publishedAt;
  useEffect(() => {
    if (!user || !selectedPlan || !isPublished) return;

    addCollaborator(user.uid, selectedPlan.id);

    return () => {
      if (!selectedPlan.private) {
        removeCollaborator(user.uid, selectedPlan.id);
      }
    };
  }, [user, selectedPlan?.id, isPublished]);

  const isOwner = selectedPlan?.authorId == user?.uid;

  const deletePlan = async () => {
    if (!planID) return;
    await deleteMasterPlan(planID);
    navigate("/dashboard");
  };

  if (loadingPlan) {
    return <div className="text-white p-6">Laddar plan...</div>;
  }

  if (!selectedPlan) {
    return (
      <div className="flex flex-col items-center gap-4 text-white p-6">
        <h1 className="text-3xl font-bold">404</h1>
        <p>Planen hittades inte, eller så har du inte åtkomst till den.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 bg-neutral-800 border-2 border-neutral-700 rounded-md cursor-pointer hover:bg-neutral-700"
        >
          Tillbaka till dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full items-end bg-neutral-900 p-2">
      <div className="flex flex-row w-full justify-end mr-2">
        {selectedPlan.collaborators &&
          selectedPlan.collaborators
            .filter((userID) => userID !== user?.uid)
            .map((userID) => (
              <UserAvatar
                key={userID}
                userID={userID}
                pictureSize="w-10 h-10"
                showTooltip={true}
                isOwner={userID == selectedPlan.authorId}
                onClick={() => navigate(`/profile/${userID}`)}
              />
            ))}
      </div>
      <div className="flex flex-row justify-between size-full">
        {/* VÄNSTER SIDA: Användarens Planering */}
        <div className="w-1/2">
          <PlanViewer
            selectedPlan={selectedPlan}
            years={years}
            handleRemoveCourse={removeCourse}
            isOwner={isOwner}
            onDelete={deletePlan}
            onUpdatePlan={updatePlan}
          />
        </div>

        {/* HÖGER SIDA: Alla kurser */}
        <div className="relative h-max w-1/2 pl-5 border-l-2 border-neutral-500">
          <CourseViewer
            selectedPlan={selectedPlan}
            years={years}
            handleAddCourse={addCourse}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
}

export default CoursePlanner;
