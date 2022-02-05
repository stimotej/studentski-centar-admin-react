import React from "react";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/router";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <h1 className="text-9xl font-bold">404</h1>
      <h3 className="text-2xl mt-2">Nije pronađena stranica</h3>
      <button
        className="flex items-center font-semibold mt-12"
        onClick={() => router.back()}
      >
        <MdArrowBack className="mr-2" />
        Povratak
      </button>
    </div>
  );
};

export default NotFound;
