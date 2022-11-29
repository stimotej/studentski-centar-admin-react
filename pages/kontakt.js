import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import Button from "../components/Elements/Button";
import { MdArrowBack } from "react-icons/md";
import axios from "axios";

const Contact = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/contact", {
        subject: "Kontakt form sa admin stranice",
        user: username,
        message: message,
      });

      setUsername("");
      setMessage("");
      setError(null);
      toast.success("Uspješno poslano!");
    } catch (error) {
      setError(error);
      toast.error("Greška kod slanja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mb-10">
      <h1 className="text-4xl sm:text-5xl font-semibold mt-12 mb-5 px-5">
        Kontaktirajte nas
      </h1>
      <div className="flex flex-col w-full md:w-2/3 lg:w-1/2 py-10 px-5 sm:px-10 rounded-lg">
        <form className="flex flex-col w-full" onSubmit={handleSend}>
          {/* <InputLabel text="Korisničko ime" /> */}
          <input
            type="text"
            className={`px-4 py-2 rounded-lg mb-6 border border-black/50 ${
              error && "border border-error"
            }`}
            placeholder="Korisničko ime"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {/* <InputLabel text="Lozinka" /> */}
          <textarea
            className={`px-4 py-2 rounded-lg mb-6 border border-black/50 ${
              error && "border border-error"
            }`}
            rows={6}
            placeholder="Poruka"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <Button type="submit" text="POŠALJI" loading={loading} primary />
        </form>
      </div>
      <Link href="/" passHref className="flex items-center font-semibold mt-8">
        <MdArrowBack className="mr-2" />
        Povratak na odabir kategorija
      </Link>
    </div>
  );
};

export default Contact;
