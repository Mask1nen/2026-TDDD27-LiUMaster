import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUserProfile } from "../helpers/useUserProfile";

function ProfilePage() {
  const { userID } = useParams<{ userID: string }>();
  const { profile, updateProfileTextField } = useUserProfile(userID);
  const [chosenProgram, setChosenProgram] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string>("");

  useEffect(() => {
    if (profile) {
      setChosenProgram(profile.program || "");
      setDisplayName(profile.displayName || "");
      setProfilePicture(profile.profilePicture || "");
    }
  }, [profile]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        // reader.result är nu en lång textsträng som representerar bilden
        if (typeof reader.result === "string") {
          setProfilePicture(reader.result);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileTextField("program", chosenProgram);
    await updateProfileTextField("displayName", displayName);
    await updateProfileTextField("profilePicture", profilePicture);
    alert("Sparat!");
  };
  return (
    <div className="bg-black/50 flex flex-col w-fit p-2">
      <form onSubmit={handleSave} className="flex flex-col gap-10">
        <div className="flex flex-col">
          <label className="text-white text-md">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ändra display name..."
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-white text-md">Change program</label>
          <select
            onChange={(e) => setChosenProgram(e.target.value)}
            value={chosenProgram || ""}
            className="bg-white text-black"
          >
            <option value={"6CDDD"}>Civilingenjör Datateknik</option>
            <option value={"6CMMM"}>Civilingenjör Maskinteknik</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="p-2 rounded bg-gray-700 border border-gray-600 text-white hover:bg-gray-600 hover:cursor-pointer">
            Ändra profilbild
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {profilePicture && (
            <div>
              <img
                src={profilePicture}
                alt="Preview"
                style={{ width: "200px" }}
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 hover:cursor-pointer"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
export default ProfilePage;
