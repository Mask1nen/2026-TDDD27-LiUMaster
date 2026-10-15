import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
  type UserCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logoutUser: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<UserCredential>;
  registerUser: (
    email: string,
    password: string,
    displayName: string,
    program: string,
  ) => Promise<void>;
  updateUserEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updateUserPassword: (
    newPassword: string,
    currentPassword: string,
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

//UserAuthContext, detta hanterar all inloggning, authentication och skapande av användare i firebase. Detta används bland annat för att routa användare till rätt sidor
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logoutUser = () => signOut(auth);
  const loginUser = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);
  const registerUser = async (
    email: string,
    password: string,
    displayName: string,
    program: string,
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    await updateProfile(user, {
      displayName: displayName,
    });
    console.log("User created with ID: ", user.uid);
    await setDoc(doc(db, "users", user.uid), {
      userID: user.uid,
      displayName: displayName,
      email: email,
      program: program,
    });
  };

  const updateUserEmail = async (newEmail: string, currentPassword: string) => {
    if (!user || !user.email) {
      throw new Error("Ingen inloggad användare");
    }
    const credentials = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credentials);
    await updateEmail(user, newEmail).then(() => {
      console.log("User email update to:", { newEmail });
    });
    await setDoc(
      doc(db, "users", user.uid),
      { email: newEmail },
      { merge: true },
    );
  };

  const updateUserPassword = async (
    newPassword: string,
    currentPassword: string,
  ) => {
    if (!user || !user.email) {
      throw new Error("Ingen inloggad användare");
    }
    const credentials = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credentials);
    await updatePassword(user, newPassword).then(() => {
      console.log("User password updated!");
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logoutUser,
        loginUser,
        registerUser,
        updateUserEmail,
        updateUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
