import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MdArrowBack } from "react-icons/md";
import Loader from "./Elements/Loader";
import { login } from "../lib/api/auth";
import { userGroups } from "../lib/constants";

const Login = ({ from }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (token && userGroups[from].includes(username)) router.push(`/${from}`);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(from, username, password);

      console.log("user: ", user);

      if (user?.wrongCategory) {
        setError(user?.message);
        setLoading(false);
        return;
      }

      router.push(`/${from}`);
    } catch (error) {
      console.log("error", error);
      if (error.response?.status === 400) {
        setError("Pogrešno korisničko ime ili lozinka");
      } else setError("Greška prilikom slanja zahtjeva");
    } finally {
      setLoading(false);
    }
  };

  const devLogin = (e) => {
    e.preventDefault();
    if (from.toLowerCase() === "obavijesti") {
      setUsername("obavijesti");
      setPassword("obavijestilozinka");
    }
    if (from.toLowerCase() === "prehrana") {
      setUsername("express");
      setPassword("restoranexpress");
    }
  };

  return (
    <section
      className={`flex flex-col items-center justify-center my-12 w-full ${
        "theme-" + from
      }`}
    >
      <div className="flex flex-col items-center justify-center p-5">
        <h3 className="uppercase tracking-widest font-semibold text-md">
          Studentski centar
        </h3>
        <h1 className="font-bold text-5xl mt-2 text-primary capitalize">
          {from}
        </h1>
      </div>
      <div className="flex flex-col w-full md:w-1/2 xl:w-2/5 p-10 mt-6 rounded-lg">
        {/* <h4 className="uppercase tracking-wide font-medium mb-8">
          Admin prijava
        </h4> */}
        {error && <span className="text-error mb-4">{error}</span>}
        <form className="flex flex-col w-full" onSubmit={handleLogin}>
          {/* <InputLabel text="Korisničko ime" /> */}
          <input
            type="text"
            className={`px-4 py-2 rounded-lg mb-6 border border-black/50 focus:border-transparent focus:ring-1 ring-primary ${
              error && "border border-error"
            }`}
            placeholder="Korisničko ime"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {/* <InputLabel text="Lozinka" /> */}
          <input
            type="password"
            className={`px-4 py-2 rounded-lg mb-6 border border-black/50 focus:border-transparent focus:ring-1 ring-primary ${
              error && "border border-error"
            }`}
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="text-primary mb-4 hover:underline"
            onClick={devLogin}
          >
            Ispuni automatski (za testiranje)
          </button>
          <button
            type="submit"
            className="flex items-center justify-center uppercase text-sm text-white py-3 px-5 rounded-lg tracking-wide cursor-pointer shadow-md shadow-primary/50 hover:shadow-lg hover:shadow-primary/50 bg-primary transition-shadow"
          >
            {loading && <Loader className="w-5 h-5 mr-3" />}
            Prijava
          </button>
        </form>
      </div>

      <Link href="/">
        <a className="flex items-center font-semibold mt-12">
          <MdArrowBack className="mr-2" />
          Povratak na odabir kategorija
        </a>
      </Link>
    </section>
  );
};

export default Login;
