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
		displayName: string
	) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null); // was useState() with no type
	const [loading, setLoading] = useState(true);

	const logoutUser = () => signOut(auth);
	const loginUser = (email: string, password: string) =>
		signInWithEmailAndPassword(auth, email, password);
	const registerUser = async (
		email: string,
		password: string,
		username: string
	) => {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;
		console.log("User created with ID: ", user.uid);
		await setDoc(doc(db, "users", user.uid), {
			userID: user.uid,
			username: username,
			email: email,
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
			value={{ user, loading, logoutUser, loginUser, registerUser }}
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
