import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Prehrana</title>
      </Head>
      <Login from="prehrana" />
    </>
  );
};

export default login;
