import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/UserAuthContext.tsx";

//Loginkomponenten, är inte en del av layout och visar därför varken sidebar eller navbar.
function LoginPage() {
  const [emailRef, setEmailRef] = useState("");
  const [passwordRef, setPasswordRef] = useState("");
  const [error, setError] = useState("");
  const { loginUser } = useAuth();

  //Skapar en användare i firebase med hjälp av UserAuthContext
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await loginUser(emailRef, passwordRef);
      const user = userCredential.user;
      console.log("Logged in user ", user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ett okänt fel inträffade");
      }
    }
  }

  return (
    <div className="flex justify-center items-center flex-col h-screen w-screen">
      <form onSubmit={handleLogin}>
        <div className="flex flex-col bg-[#000F08]/75 text-white p-5 rounded-2xl text-2xl gap-1">
          {error && <p className="text-red-400 text-sm px-2">{error}</p>}
          <label className="p-2" htmlFor="email">
            <b>Email: </b>
          </label>
          <input
            className="p-2 border-2 border-neutral-500 rounded-md inset-shadow-xs inset-shadow-black"
            onChange={(e) => {
              setEmailRef(e.target.value);
            }}
            type="email"
            placeholder="Email"
            id="email"
            required
          ></input>

          <label className="p-2" htmlFor="password">
            <b>Password:</b>
          </label>
          <input
            className="p-2 border-2 border-neutral-500 rounded-md inset-shadow-xs inset-shadow-black"
            onChange={(e) => {
              setPasswordRef(e.target.value);
            }}
            type="password"
            placeholder="Password"
            id="password"
            required
          ></input>

          <button
            className="bg-green-500 rounded-md p-2 hover:bg-green-700 mt-2"
            type="submit"
          >
            <b>Sign in</b>
          </button>
          <Link
            to="/register"
            className="p-2 hover:bg-black/25 flex justify-center items-center text-sm text-center"
          >
            <b>Register</b>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
