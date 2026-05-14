import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";

function LoginPage() {
	const [emailRef, setEmailRef] = useState("");
	const [passwordRef, setPasswordRef] = useState("");
	const [error, setError] = useState("");
	const { loginUser } = useAuth();

	async function handleLogin(e) {
		e.preventDefault();
		setError("");
		try {
			const userCredential = await loginUser(emailRef, passwordRef);
			const user = userCredential.user;
			console.log("Logged in user ", user);
		} catch (err) {
			setError(err.message);
		}
	}

	return (
		<div className="flex justify-center items-center flex-col h-screen w-screen bg-[#98E5EB]">
			<form onSubmit={handleLogin}>
				<div className="flex flex-col bg-[#000F08]/75 text-white p-5 rounded-2xl text-2xl">
					{error && <p className="text-red-400 text-sm px-2">{error}</p>}
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
