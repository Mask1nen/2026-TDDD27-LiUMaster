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
    <div className="flex justify-center items-center flex-col h-screen w-screen bg-neutral-900">
      <form onSubmit={handleRegister}>
        <div className="flex flex-col bg-neutral-700 text-white p-5 rounded-2xl text-2xl gap-1">
          {error && <p className="text-red-400 text-sm px-2">{error}</p>}
          <label className="p-2" htmlFor="displayName">
            <b>Display Name: </b>
          </label>
          <input
            className="p-2 bg-neutral-800 border-2 border-neutral-700 rounded-md"
            onChange={(e) => {
              setDisplayNameRef(e.target.value);
            }}
            type="string"
            placeholder="Display Name"
            id="displayName"
            required
          ></input>
          <label className="p-2" htmlFor="email">
            <b>Email: </b>
          </label>
          <input
            className="p-2 bg-neutral-800 border-2 border-neutral-700 rounded-md"
            onChange={(e) => {
              setEmailRef(e.target.value);
            }}
            type="email"
            placeholder="name@example.com"
            id="email"
            required
          ></input>

          <label className="p-2" htmlFor="password">
            <b>Password:</b>
          </label>
          <input
            className="p-2 bg-neutral-800 border-2 border-neutral-700 rounded-md"
            onChange={(e) => {
              setPasswordRef(e.target.value);
            }}
            type="password"
            placeholder="********"
            id="password"
            required
          ></input>

          <label className="p-2" htmlFor="program">
            <b>Program:</b>
          </label>
          <select
            onChange={(e) => setProgramRef(e.target.value)}
            value={programRef || ""}
            className="p-1 bg-neutral-800 text-white border-2 border-neutral-700 rounded-md cursor-pointer focus:outline-none focus:border-neutral-500"
            required
          >
            <option value="" selected disabled hidden>
              Välj program
            </option>
            <option value={"6CDDD"}>Civilingenjör Datateknik</option>
            <option value={"6CMMM"}>Civilingenjör Maskinteknik</option>
          </select>

          <button
            className="bg-green-700 rounded-md p-2 hover:bg-green-600 mt-2"
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
