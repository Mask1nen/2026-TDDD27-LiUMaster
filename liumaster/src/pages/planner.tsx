import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import CourseViewer from "../components/courseviewer.tsx";
import PlanViewer from "../components/planviewer.tsx";
import { useUserPlan } from "../hooks/useUserPlan.ts";
import { useAuth } from "../context/UserAuthContext.tsx";

import UserAvatar from "../components/useravatar.tsx";

type CollaboratorDropDownProps = {
  userID: string;
  onClose: () => void;
  isEditor: boolean;
  canManage: boolean;
  handleEditorChange: (makeEditor: boolean) => void;
};

function CollaboratorDropDown({
  userID,
  onClose,
  isEditor,
  canManage,
  handleEditorChange,
}: CollaboratorDropDownProps) {
  return (
    <div className="flex flex-col bg-black p-3 rounded-md gap-2 text-white w-35">
      <Link
        to={`/profile/${userID}`}
        className="hover:text-cyan-400 p-2"
        onClick={onClose}
      >
        Visa profil
      </Link>
      {canManage && (
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isEditor}
            onChange={(e) => handleEditorChange(e.target.checked)}
          />
          <div className="relative w-9 h-5 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-disabled:peer-checked:bg-neutral-600"></div>
          <span className="select-none text-sm">Redigerare</span>
        </label>
      )}
    </div>
  );
}

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
    addEditor,
    removeEditor,
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

  const [openCollaboratorID, setOpenCollaboratorID] = useState<string | null>(
    null,
  );
  const collaboratorsRef = useRef<HTMLDivElement>(null);

  // Stäng dropdown vid klick utanför avatar-raden
  useEffect(() => {
    if (!openCollaboratorID) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        collaboratorsRef.current &&
        !collaboratorsRef.current.contains(e.target as Node)
      ) {
        setOpenCollaboratorID(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openCollaboratorID]);

  const isOwner = selectedPlan?.authorID == user?.uid;
  const canEdit =
    isOwner || (!!user && !!selectedPlan?.editors?.includes(user.uid));

  const handleDelete = async () => {
    if (!planID || !selectedPlan) return;
    deleteMasterPlan(planID, selectedPlan.isPrimary);
    navigate("/dashboard");
  };

  const handleEditorChange = async (userID: string, makeEditor: boolean) => {
    if (!planID || !isOwner) return;
    if (makeEditor) {
      await addEditor(userID, planID);
    } else {
      await removeEditor(userID, planID);
    }
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
          className="p-2 bg-surface-raised border-2 border-themedBorder rounded-md cursor-pointer hover:bg-surface-hover"
        >
          Tillbaka till dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full items-end p-2">
      <div className="flex flex-row w-full justify-end gap-2 shrink-0">
        {selectedPlan.collaborators
          ?.filter((userID) => userID !== user?.uid)
          .map((userID) => (
            <div key={userID} className="relative" ref={collaboratorsRef}>
              <UserAvatar
                userID={userID}
                pictureSize={isOwner ? "w-12 h-12" : "w-10 h-10"}
                showTooltip={openCollaboratorID !== userID}
                borderColour={isOwner ? "border-green-500" : ""}
                onClick={() =>
                  setOpenCollaboratorID(
                    openCollaboratorID === userID ? null : userID,
                  )
                }
              />
              {openCollaboratorID === userID && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <CollaboratorDropDown
                    userID={userID}
                    onClose={() => setOpenCollaboratorID(null)}
                    isEditor={!!selectedPlan.editors?.includes(userID)}
                    canManage={isOwner && userID != selectedPlan.authorID}
                    handleEditorChange={(makeEditor) =>
                      handleEditorChange(userID, makeEditor)
                    }
                  />
                </div>
              )}
            </div>
          ))}
      </div>
      <div className="flex flex-row w-full flex-1 min-h-0">
        <div className="w-1/2 min-h-0 overflow-auto">
          <PlanViewer
            selectedPlan={selectedPlan}
            handleRemoveCourse={removeCourse}
            isOwner={isOwner}
            canEdit={canEdit}
            onDelete={handleDelete}
            onUpdatePlan={updatePlan}
          />
        </div>

        <div className="relative w-1/2 min-h-0 overflow-auto pl-5 border-l-2 border-neutral-500">
          <CourseViewer
            selectedPlan={selectedPlan}
            handleAddCourse={addCourse}
            canEdit={canEdit}
          />
        </div>
      </div>
    </div>
  );
}

export default CoursePlanner;
