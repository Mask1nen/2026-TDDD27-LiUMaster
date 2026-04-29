import { useState } from "react";

function LoginPage() {
  const [emailRef, setEmailRef] = useState("");
  const [passwordRef, setPasswordRef] = useState("");

  return (
    <div className="flex justify-center items-center flex-col h-screen w-screen border-4 bg-[#98E5EB]">
      <form>
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
          <button className="p-2 hover:bg-black/25" type="submit">
            <b>Register</b>
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
