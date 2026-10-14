import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../context/UserAuthContext";
import UserAvatar from "../components/useravatar";
import PlanList from "../components/planlist";
import { useProfilePlans } from "../hooks/useProfilePlans";

const inputClass =
  "p-2 rounded border-2 border-themedBorder bg-surface-raised text-content focus:outline-none focus:border-cyan-500 " +
  "read-only:border-themedBorder read-only:cursor-default read-only:focus:border-themedBorder " +
  "disabled:border-themedBorder disabled:cursor-default disabled:opacity-100";

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

  const { profilePlans, loadingProfilePlans } = useProfilePlans(
    userID,
    isOwnProfile,
  );

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
    } catch (error) {
      console.error("Kunde inte ändra profil: ", error);
      setEditingProfile(false);
    }
  };

  if (loadingProfile || !profile || loadingProfilePlans) {
    return <h1>Loading profile</h1>;
  }

  return (
    <div className="h-full p-4">
      <form onSubmit={handleSave} className="flex flex-row items-start gap-8">
        <div className="flex flex-col items-center">
          {editingProfile ? (
            <label
              className="relative group block w-100 h-100 cursor-pointer rounded-full overflow-hidden"
              title="Byt profilbild"
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Förhandsvisning"
                  className="size-full object-cover rounded-full"
                />
              ) : (
                <UserAvatar
                  userID={userID || ""}
                  pictureSize="w-100 h-100"
                  showTooltip={false}
                  isOwner={true}
                />
              )}

              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white text-xl font-semibold opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                Byt bild
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          ) : (
            <UserAvatar
              userID={userID || ""}
              pictureSize="w-100 h-100"
              showTooltip={false}
              isOwner={true}
            />
          )}
        </div>

        <div className="flex flex-col gap-4 mt-12">
          <div className="flex flex-col gap-1">
            <label className="text-base text-neutral-500">Användarnamn</label>
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
            <label className="text-base text-neutral-500">E-post</label>
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
              <label className="text-base text-neutral-500">
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
            <label className="text-base text-neutral-500">Program</label>
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
                  className="border-2 border-themedBorder bg-surface-raised text-content p-2 rounded-xl hover:cursor-pointer hover:bg-surface-hover w-fit"
                >
                  Edit profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    key="save"
                    className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 hover:cursor-pointer"
                  >
                    Spara ändringar
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="p-2 rounded-xl border-2 border-themedBorder bg-surface-raised hover:bg-surface-hover hover:cursor-pointer"
                  >
                    Avbryt
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </form>
      <div className="mt-10">
        <PlanList
          plans={profilePlans}
          numberOfCols={4}
          primaryPlanID={profile.primaryPlanID || ""}
        />
      </div>
    </div>
  );
}

export default ProfilePage;
