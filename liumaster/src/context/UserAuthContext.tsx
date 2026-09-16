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
  signOut,
  type User,
  type UserCredential,
} from "firebase/auth";
import {
  doc,
  getDocs,
  setDoc,
  addDoc,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

import type { MasterPlan } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logoutUser: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<UserCredential>;
  registerUser: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  createNewMasterPlan: (planName: string, planSpec: string) => Promise<string>;
  deleteMasterPlan: (planID: string) => Promise<void>;
  fetchMasterPlans: () => Promise<MasterPlan[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

//UserAuthContext, detta hanterar all inloggning, authentication och skapande av användare i firebase. Detta används bland annat för att routa användare till rätt sidor
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // was useState() with no type
  const [loading, setLoading] = useState(true);

  const logoutUser = () => signOut(auth);
  const loginUser = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);
  const registerUser = async (
    email: string,
    password: string,
    username: string,
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    console.log("User created with ID: ", user.uid);
    await setDoc(doc(db, "users", user.uid), {
      userID: user.uid,
      username: username,
      email: email,
    });
  };

  const createNewMasterPlan = async (planName: string, planSpec: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return "";
    const docRef = await addDoc(collection(db, "users", uid, "plans"), {
      createdAt: new Date(),
      planName: planName,
      planSpec: planSpec,
    });
    console.log("created new plan with ID: ", docRef.id);
    return docRef.id;
  };

  const deleteMasterPlan = async (planID: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "plans", planID));
    return;
  };

  const fetchMasterPlans = async (): Promise<MasterPlan[]> => {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const querySnapshot = await getDocs(collection(db, "users", uid, "plans"));
    const plans: MasterPlan[] = querySnapshot.docs.map((doc) => ({
      planID: doc.id,
      ...doc.data(),
    })) as MasterPlan[];
    return plans;
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
        createNewMasterPlan,
        deleteMasterPlan,
        fetchMasterPlans,
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
