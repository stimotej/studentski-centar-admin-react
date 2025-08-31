import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Najam prostora</title>
      </Head>
      <Login from="eventi" title="Najam prostora" />
    </>
  );
};

export default login;
