import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";

function RegisterPage() {
  const [emailRef, setEmailRef] = useState("");
  const [passwordRef, setPasswordRef] = useState("");
  const [displayNameRef, setdisplayNameRef] = useState("");
  const [error, setError] = useState("");

  async function registerUser(e) {
    e.preventDefault();
    setError("");
    try {
      if (emailRef == "") {
        throw new Error("Email cannot be blank.");
      }
      if (passwordRef == "") {
        throw new Error("Password cannot be blank.");
      }
      if (displayNameRef == "") {
        throw new Error("Display Name cannot be blank.");
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailRef,
        passwordRef
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        userID: user.uid,
        displayName: displayNameRef,
        email: emailRef,
      });
      console.log("User created with ID: ", user.uid);
      alert("Welcome " + displayNameRef);
    } catch (err) {
      setError(err.message);
      alert(err);
    }
  }
  return (
    <div className="flex justify-center items-center flex-col h-screen w-screen border-4 bg-[#98E5EB]">
      <form onSubmit={registerUser}>
        <div className="flex flex-col bg-[#000F08]/75 text-white p-5 rounded-2xl text-2xl">
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
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
