import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Sport</title>
      </Head>
      <Login from="sport" title="Sport" />
    </>
  );
};

export default login;
