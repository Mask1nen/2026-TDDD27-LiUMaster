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
      <div className="text-7xl mb-20 font-extrabold flex flex-row">
        <p className="text-cyan-500 text-shadow-black text-shadow-sm">LiU</p>
        <p>Master</p>
      </div>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col bg-surface-raised text-content p-5 rounded-2xl text-xl gap-5 w-100">
          <label className="text-2xl font-bold">Logga in</label>
          {error && <p className="text-red-400 text-sm px-2">{error}</p>}
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
            ></input>
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
            ></input>
          </div>

          <button
            className="bg-green-700 rounded-md p-2 hover:bg-green-600 mt-2 text-white"
            type="submit"
          >
            <b>Sign in</b>
          </button>
          <Link
            to="/register"
            className="p-2 hover:text-cyan-500 flex justify-center items-center text-sm text-center"
          >
            <b>Register</b>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
