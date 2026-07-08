import { useState } from "react";
import { useAuth } from "../context/UserAuthContext.tsx";

function RegisterPage() {
	const [emailRef, setEmailRef] = useState("");
	const [passwordRef, setPasswordRef] = useState("");
	const [displayNameRef, setdisplayNameRef] = useState("");
	const [error, setError] = useState("");
	const { registerUser } = useAuth();

	async function handleRegister(e) {
		e.preventDefault();
		setError("");
		try {
			await registerUser(emailRef, passwordRef, displayNameRef);
			alert("Welcome " + displayNameRef);
		} catch (err) {
			setError(err.message);
		}
	}
	return (
		<div className="flex justify-center items-center flex-col h-screen w-screen">
			<form onSubmit={handleRegister}>
				<div className="flex flex-col bg-[#000F08]/75 text-white p-5 rounded-2xl text-2xl">
					{error && <p className="text-red-400 text-sm px-2">{error}</p>}
					<label className="p-2" htmlFor="displayName">
						<b>Display Name: </b>
					</label>
					<input
						className="p-2"
						onChange={(e) => {
							setdisplayNameRef(e.target.value);
						}}
						type="string"
						placeholder="Mossberg"
						id="displayName"
						required
					></input>
					<label className="p-2" htmlFor="email">
						<b>Email: </b>
					</label>
					<input
						className="p-2"
						onChange={(e) => {
							setEmailRef(e.target.value);
						}}
						type="email"
						placeholder="coolname@email.com"
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
						placeholder="********"
						id="password"
						required
					></input>

					<button className="p-2 hover:bg-black/25" type="submit">
						<b>Register</b>
					</button>
				</div>
			</form>
		</div>
	);
}

export default RegisterPage;
