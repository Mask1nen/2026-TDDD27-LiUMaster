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
  const { user, updateUserEmail, updateUserPassword } = useAuth();
  const [chosenProgram, setChosenProgram] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
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
      if (newPassword.length > 0) {
        if (confirmNewPassword == newPassword) {
          await updateUserPassword(newPassword, password);
        } else {
          setNewPassword("");
          setConfirmNewPassword("");
          setPassword("");
          throw new Error("Vänligen bekräfta ditt nya lösenord");
        }
      }
      await updateProfile({
        program: chosenProgram,
        displayName: displayName,
        profilePicture: profilePicture,
      });
      setEditingProfile(false);
      resetForm();
    } catch (error) {
      console.error("Kunde inte ändra profil: ", error);
      setError(`Kunde inte ändra profil: ${error}`);
      setEditingProfile(false);
    }
  };

  if (loadingProfile || !profile || loadingProfilePlans) {
    return <h1>Loading profile</h1>;
  }

  return (
    <div className="h-full p-4">
      <div className="flex flex-row gap-5">
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
                    className="size-full object-cover rounded-full border-2 border-neutral-700"
                  />
                ) : (
                  <UserAvatar
                    userID={userID || ""}
                    pictureSize="w-100 h-100"
                    showTooltip={false}
                    borderColour="border-neutral-700"
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
                borderColour="border-neutral-700"
              />
            )}
          </div>
          <div className="flex flex-row gap-10 mt-12">
            <div className="flex flex-col gap-4">
              {error && (
                <h1 className="text-white text-sm bg-red-500 p-2">{error}</h1>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-base text-neutral-500">
                  Användarnamn
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!editingProfile}
                  placeholder="Användarnamn"
                  className={`${inputClass} text-3xl font-bold disabled:cursor-default`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-base text-neutral-500">E-post</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editingProfile}
                  placeholder="E-post"
                  className={inputClass}
                />
              </div>

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
            {editingProfile && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-base text-neutral-500">
                    Nytt lösenord
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={!editingProfile}
                    placeholder="*********"
                    className={`${inputClass} disabled:cursor-default`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base text-neutral-500">
                    Bekräfta lösenord
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={!editingProfile}
                    placeholder="*********"
                    className={`${inputClass} disabled:cursor-default`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base text-neutral-500">
                    Nuvarande lösenord
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!editingProfile}
                    placeholder="*********"
                    required={newPassword.length > 0 || emailChanged}
                    className={`${inputClass} disabled:cursor-default`}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
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
