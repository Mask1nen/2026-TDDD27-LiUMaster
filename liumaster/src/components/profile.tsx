import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../context/UserAuthContext";
import UserAvatar from "./useravatar";

const inputClass =
  "p-2 rounded border-2 border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:border-cyan-500 " +
  "read-only:bg-neutral-900 read-only:border-neutral-900 read-only:cursor-default read-only:focus:border-neutral-900 " +
  "disabled:bg-neutral-900 disabled:border-neutral-900 disabled:cursor-default disabled:opacity-100";

function ProfilePage() {
  const { userID } = useParams<{ userID: string }>();
  const { profile, updateProfile, loadingProfile } = useUserProfile(userID);
  const { user, updateUserEmail } = useAuth();
  const [chosenProgram, setChosenProgram] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [editingProfile, setEditingProfile] = useState<boolean>(false);

  const isOwnProfile = user?.uid === userID;
  const emailChanged = email !== (user?.email ?? "");

  function resetForm() {
    if (!profile) return;
    setChosenProgram(profile.program || "");
    setDisplayName(profile.displayName || "");
    setEmail(profile.email || "");
    setProfilePicture(profile.profilePicture || "");
    setPassword("");
  }

  useEffect(() => {
    resetForm();
  }, [profile, user?.email]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfilePicture(reader.result);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  function handleCancel() {
    resetForm();
    setEditingProfile(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (emailChanged) {
        await updateUserEmail(email, password);
      }
      await updateProfile({
        program: chosenProgram,
        displayName: displayName,
        profilePicture: profilePicture,
      });
      setPassword("");
      setEditingProfile(false);
      alert("Sparat!");
    } catch (error) {
      console.error("Kunde inte ändra profil: ", error);
      setEditingProfile(false);
    }
  };

  if (loadingProfile || !profile) {
    return <h1>Loading profile</h1>;
  }

  return (
    <div className="bg-neutral-900 h-full p-4">
      <form onSubmit={handleSave} className="flex flex-row items-start gap-8">
        <div className="flex flex-col items-center gap-2">
          {editingProfile && profilePicture ? (
            <img
              src={profilePicture}
              alt="Förhandsvisning"
              className="w-100 h-100 object-cover rounded-full"
            />
          ) : (
            <UserAvatar
              userID={userID || ""}
              pictureSize="w-100 h-100"
              showTooltip={false}
              isOwner={true}
            />
          )}
          {editingProfile && (
            <label className="p-2 rounded border-2 border-neutral-700 bg-neutral-800 hover:bg-neutral-700 hover:cursor-pointer text-base">
              Ändra profilbild
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex flex-col gap-4 w-96">
          <div className="flex flex-col gap-1">
            <label className="text-base text-neutral-400">Användarnamn</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              readOnly={!editingProfile}
              placeholder="Användarnamn"
              className={`${inputClass} text-3xl font-bold`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base text-neutral-400">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!editingProfile}
              placeholder="E-post"
              className={inputClass}
            />
          </div>

          {editingProfile && emailChanged && (
            <div className="flex flex-col gap-1">
              <label className="text-base text-neutral-400">
                Nuvarande lösenord (krävs för att byta e-post)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-base text-neutral-400">Program</label>
            <select
              value={chosenProgram}
              onChange={(e) => setChosenProgram(e.target.value)}
              disabled={!editingProfile}
              className={`${inputClass} enabled:cursor-pointer`}
            >
              <option value="6CDDD">Civilingenjör Datateknik</option>
              <option value="6CMMM">Civilingenjör Maskinteknik</option>
            </select>
          </div>

          {isOwnProfile && (
            <div className="flex flex-row gap-2">
              {!editingProfile ? (
                <button
                  type="button"
                  key="edit"
                  onClick={() => setEditingProfile(true)}
                  className="border-2 border-neutral-700 bg-neutral-800 p-2 rounded-xl hover:cursor-pointer hover:text-cyan-500 w-fit"
                >
                  Edit profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    key="save"
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 hover:cursor-pointer"
                  >
                    Spara ändringar
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="p-2 rounded-xl border-2 border-neutral-700 bg-neutral-800 hover:bg-neutral-700 hover:cursor-pointer"
                  >
                    Avbryt
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
