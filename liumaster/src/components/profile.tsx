import { useState, useEffect } from "react";
import { useUserProfile } from "../helpers/useUserProfile";

function ProfilePage() {
  const { profile, updateProfileTextField } = useUserProfile();
  const [chosenProgram, setChosenProgram] = useState<string>("");

  useEffect(() => {
    if (profile?.program) {
      setChosenProgram(profile.program);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    await updateProfileTextField("program", chosenProgram);
  };
  return (
    <div className="bg-black/50 flex flex-col w-fit p-2 gap-2">
      <select
        onChange={(e) => setChosenProgram(e.target.value)}
        value={chosenProgram || ""}
        className="bg-white text-black"
      >
        <option value={"6CDDD"}>Civilingenjör Datateknik</option>
        <option value={"6CMMM"}>Civilingenjör Maskinteknik</option>
      </select>
      <button onClick={handleSave} className="bg-blue-500">
        Save changes
      </button>
    </div>
  );
}
export default ProfilePage;
