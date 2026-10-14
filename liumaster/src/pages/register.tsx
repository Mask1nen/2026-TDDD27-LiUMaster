import { useState } from "react";
import { useAuth } from "../context/UserAuthContext.tsx";
import { Link } from "react-router-dom";

//Registerkomponenten, är inte del av layout och visar därför inte sidebar eller navbar
function RegisterPage() {
  const [emailRef, setEmailRef] = useState("");
  const [passwordRef, setPasswordRef] = useState("");
  const [displayNameRef, setDisplayNameRef] = useState("");
  const [programRef, setProgramRef] = useState("");
  const [error, setError] = useState("");
  const { registerUser } = useAuth();

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    try {
      await registerUser(emailRef, passwordRef, displayNameRef, programRef);
    } catch (err) {
      setError(error);
    }
  }
  return (
    <div className="flex justify-center items-center flex-col h-screen w-screen">
      <div className="text-7xl mb-20 font-extrabold flex flex-row">
        <p className="text-cyan-500 text-shadow-black text-shadow-sm">LiU</p>
        <p>Master</p>
      </div>
      <form onSubmit={handleRegister}>
        <div className="flex flex-col bg-surface-raised text-content p-5 rounded-2xl text-xl gap-5 w-100">
          {error && <p className="text-red-400 text-sm px-2">{error}</p>}
          <label className="text-3xl font-bold">Registrera</label>
          <div className="flex flex-col gap-2">
            <label className="text-md" htmlFor="displayName">
              <b>Display Name: </b>
            </label>
            <input
              className="p-2 bg-surface-raised border-2 border-themedBorder rounded-md"
              onChange={(e) => {
                setDisplayNameRef(e.target.value);
              }}
              type="string"
              placeholder="Mossberg"
              id="displayName"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-md" htmlFor="email">
              <b>Email: </b>
            </label>
            <input
              className="p-2 bg-surface-raised border-2 border-themedBorder rounded-md"
              onChange={(e) => {
                setEmailRef(e.target.value);
              }}
              type="email"
              placeholder="name@example.com"
              id="email"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-md" htmlFor="password">
              <b>Password:</b>
            </label>
            <input
              className="p-2 bg-surface-raised border-2 border-themedBorder rounded-md"
              onChange={(e) => {
                setPasswordRef(e.target.value);
              }}
              type="password"
              placeholder="************"
              id="password"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-md" htmlFor="program">
              <b>Program:</b>
            </label>
            <select
              onChange={(e) => setProgramRef(e.target.value)}
              value={programRef || ""}
              className="p-1 bg-surface-raised text-content border-2 border-themedBorder rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
              required
            >
              <option value="" selected disabled hidden>
                Välj program
              </option>
              <option value={"6CDDD"}>Civilingenjör Datateknik</option>
              <option value={"6CMMM"}>Civilingenjör Maskinteknik</option>
            </select>
          </div>

          <button
            className="bg-green-600 rounded-md p-2 hover:bg-green-700 mt-2 text-white"
            type="submit"
          >
            <b>Create account</b>
          </button>
          <Link
            to="/login"
            className="p-2 hover:text-cyan-500 text-sm text-center"
          >
            <b>I already have an account</b>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
