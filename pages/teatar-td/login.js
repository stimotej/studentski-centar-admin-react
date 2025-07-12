import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Teatar &TD</title>
      </Head>
      <Login from="teatar-td" title="Teatar &TD" />
    </>
  );
};

export default login;
