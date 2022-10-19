import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Poslovi</title>
      </Head>
      <Login from="poslovi" />
    </>
  );
};

export default login;
