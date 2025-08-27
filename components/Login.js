import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MdArrowBack } from "react-icons/md";
import { TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import clsx from "clsx";
import { useLogin, useResetPassword } from "../features/auth";
import MyDialog from "./Elements/MyDialog";

const Login = ({ from, title }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    if (token) router.push(`/${from}`);
  }, [router, from]);

  const { login, isLoading } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();

    login({ from, username, password })
      .then((res) => {
        if (res) router.push(`/${from}`);
      })
      .catch((err) => {
        console.log("kaka err", err.message);
        setError(err.message);
      });
  };

  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [email, setEmail] = useState("");

  const { mutate: resetPassword } = useResetPassword();

  const handleResetPassword = () => {
    resetPassword(email, {
      onSuccess: () => {
        setResetPasswordModal(false);
        setEmail("");
      },
    });
  };

  return (
    <section
      className={`flex flex-col items-center justify-center my-8 w-full ${
        "theme-" + from
      }`}
    >
      <MyDialog
        opened={resetPasswordModal}
        setOpened={setResetPasswordModal}
        title="Resetiranje lozinke"
        content={
          <>
            <span>
              Na email adresu će vam biti poslan link za resetiranje lozinke.
            </span>
            <TextField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              label="Email"
              className="mt-4"
              fullWidth
            />
          </>
        }
        actionTitle="Pošalji"
        loading={isLoading}
        onClick={handleResetPassword}
        onClose={() => setResetPasswordModal(false)}
      />

      <div className="flex flex-col items-center justify-center p-5">
        <h3 className="uppercase tracking-widest font-semibold text-md">
          Studentski centar
        </h3>
        <h1 className="font-bold text-5xl mt-2 text-primary capitalize">
          {title || from}
        </h1>
      </div>
      <div className="flex flex-col w-full md:w-1/2 xl:w-2/5 p-10 mt-6 rounded-lg">
        {/* <h4 className="uppercase tracking-wide font-medium mb-8">
          Admin prijava
        </h4> */}
        {error && <span className="text-error mb-4">{error}</span>}
        <form className="flex flex-col gap-4 w-full" onSubmit={handleLogin}>
          {/* <InputLabel text="Korisničko ime" /> */}
          <TextField
            placeholder="Korisničko ime"
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused": {
                "& > fieldset": {
                  borderColor:
                    "rgba(var(--color-primary), var(--tw-bg-opacity))",
                },
              },
            }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!error}
            required
          />
          {/* <InputLabel text="Lozinka" /> */}
          <TextField
            placeholder="Lozinka"
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused": {
                "& > fieldset": {
                  borderColor:
                    "rgba(var(--color-primary), var(--tw-bg-opacity))",
                },
              },
            }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            required
          />
          <button
            className="text-primary mb-4 hover:underline"
            onClick={() => setResetPasswordModal(true)}
            type="button"
          >
            Zaboravljena lozinka?
          </button>
          <LoadingButton
            variant="contained"
            size="large"
            type="submit"
            color="primary"
            className={clsx(
              "!py-3 !rounded-lg",
              isLoading
                ? "!bg-gray-200 !shadow-none"
                : "!bg-primary hover:!bg-primary"
            )}
            loading={isLoading}
            // className="flex items-center justify-center uppercase text-sm text-white py-3 px-5 rounded-lg tracking-wide cursor-pointer shadow-md shadow-primary/50 hover:shadow-lg hover:shadow-primary/50 bg-primary transition-shadow"
          >
            Prijava
          </LoadingButton>
        </form>
      </div>

      <Link href="/" className="flex items-center font-semibold mt-8" passHref>
        <MdArrowBack className="mr-2" />
        Povratak na odabir kategorija
      </Link>
    </section>
  );
};

export default Login;
