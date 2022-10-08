import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Kultura</title>
      </Head>
      <Login from="kultura" />
    </>
  );
};

export default login;
