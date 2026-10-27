import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import Header from "./Header";
import Layout from "./Layout";
import { useChangePassword, useUser } from "../features/auth";

const MIN_PASSWORD_LENGTH = 10;

const ProfilePage = () => {
  const { data: user } = useUser();
  const { mutate: changePassword, isLoading } = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");

  const email = user?.data?.email;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Nova lozinka mora imati najmanje ${MIN_PASSWORD_LENGTH} znakova`
      );
      return;
    }
    if (newPassword !== repeatPassword) {
      setError("Nove lozinke se ne podudaraju");
      return;
    }
    if (newPassword === currentPassword) {
      setError("Nova lozinka mora biti različita od trenutne");
      return;
    }
    setError("");

    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setRepeatPassword("");
        },
      }
    );
  };

  return (
    <Layout>
      <Header title="Moj profil" />
      <div className="px-5 sm:px-10 pb-10 max-w-xl">
        <div className="mb-10">
          <span className="text-sm text-black/60">Email adresa</span>
          <p className="text-lg">{email || "..."}</p>
        </div>

        <h2 className="text-xl font-semibold mb-2">Promjena lozinke</h2>
        <p className="text-sm text-black/60 mb-6">
          Lozinku možete promijeniti u bilo kojem trenutku. Za potvrdu unesite
          trenutnu lozinku.
        </p>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <TextField
            label="Trenutna lozinka"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Nova lozinka"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText={`Najmanje ${MIN_PASSWORD_LENGTH} znakova`}
            required
            fullWidth
          />
          <TextField
            label="Ponovite novu lozinku"
            type="password"
            autoComplete="new-password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            error={!!repeatPassword && repeatPassword !== newPassword}
            required
            fullWidth
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading}
            disabled={!email}
            className="!self-start"
          >
            Promijeni lozinku
          </LoadingButton>
        </form>
      </div>
    </Layout>
  );
};

export default ProfilePage;
