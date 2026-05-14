import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.ts";

function LoginPage() {
	const [emailRef, setEmailRef] = useState("");
	const [passwordRef, setPasswordRef] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	async function loginUser(e) {
		e.preventDefault();
		setError("");
		try {
			if (emailRef == "") {
				throw new Error("Email cannot be blank.");
			}
			if (passwordRef == "") {
				throw new Error("Password cannot be blank.");
			}
			const userCredential = await signInWithEmailAndPassword(
				auth,
				emailRef,
				passwordRef
			);
			const user = userCredential.user;
			console.log("Logged in user ", user);
			navigate("/");
		} catch (err) {
			setError(err.message);
			alert(error);
		}
	}

	return (
		<div className="flex justify-center items-center flex-col h-screen w-screen bg-[#98E5EB]">
			<form onSubmit={loginUser}>
				<div className="flex flex-col bg-[#000F08]/75 text-white p-5 rounded-2xl text-2xl">
					<label className="p-2" htmlFor="email">
						<b>Email: </b>
					</label>
					<input
						className="p-2"
						onChange={(e) => {
							setEmailRef(e.target.value);
						}}
						type="email"
						placeholder="Email"
						id="email"
						required
					></input>

					<label className="p-2" htmlFor="password">
						<b>Password</b>
					</label>
					<input
						className="p-2"
						onChange={(e) => {
							setPasswordRef(e.target.value);
						}}
						type="password"
						placeholder="Password"
						id="password"
						required
					></input>

					<button className="p-2 hover:bg-black/25" type="submit">
						<b>Login</b>
					</button>
					<Link
						to="/Register"
						className="p-2 hover:bg-black/25 flex justify-center items-center"
					>
						<b>Register</b>
					</Link>
				</div>
			</form>
		</div>
	);
}

export default LoginPage;
