import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import CourseViewer from "./courseviewer.tsx";
import PlanViewer from "./planviewer.tsx";
import { useUserPlan } from "../hooks/useUserPlan.ts";
import { useAuth } from "../context/UserAuthContext.tsx";

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

  const isPublic = !!selectedPlan?.publishedAt && !selectedPlan.private;
  useEffect(() => {
    if (!user || !selectedPlan || !isPublic) return;

    addCollaborator(user.uid, selectedPlan.id);

    return () => {
      if (!selectedPlan.private) {
        removeCollaborator(user.uid, selectedPlan.id);
      }
    };
  }, [user, selectedPlan?.id, isPublic]);

  const isOwner = selectedPlan?.authorID == user?.uid;
  const canEdit =
    isOwner || (!!user && !!selectedPlan?.editors?.includes(user.uid));

  const handleDelete = async () => {
    console.log("Beginning delete:");
    if (!planID || !selectedPlan) {
      console.error("Could not remove plan, no planID or selectedPlan");
      return;
    }
    deleteMasterPlan(planID, selectedPlan.isPrimary);
    navigate("/dashboard");
  };

  if (loadingPlan) {
    return <div className="text-white p-6">Laddar plan...</div>;
  }

  if (!selectedPlan) {
    return (
      <div className="flex flex-col items-center gap-4 text-content p-6">
        <h1 className="text-3xl font-bold">404</h1>
        <p>Planen hittades inte, eller så har du inte åtkomst till den.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 bg-surface-raised border-2 border-neutral-700 rounded-md cursor-pointer hover:bg-neutral-700"
        >
          Tillbaka till dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full items-end p-2">
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
                isOwner={userID == selectedPlan.authorID}
                onClick={() => navigate(`/profile/${userID}`)}
              />
            ))}
      </div>
      <div className="flex flex-row justify-between w-full flex-1">
        {/* VÄNSTER SIDA: Användarens Planering */}
        <div className="w-1/2">
          <PlanViewer
            selectedPlan={selectedPlan}
            handleRemoveCourse={removeCourse}
            isOwner={isOwner}
            canEdit={canEdit}
            onDelete={handleDelete}
            onUpdatePlan={updatePlan}
          />
        </div>

        {/* HÖGER SIDA: Alla kurser */}
        <div className="relative w-1/2 pl-5 border-l-2 border-neutral-500">
          <CourseViewer
            selectedPlan={selectedPlan}
            handleAddCourse={addCourse}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
}

export default CoursePlanner;
