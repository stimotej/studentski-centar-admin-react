import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Početna stranica</title>
      </Head>
      <Login from="pocetna-stranica" />
    </>
  );
};

export default login;
