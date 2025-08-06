import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Turizam</title>
      </Head>
      <Login from="turizam" title="Turizam" />
    </>
  );
};

export default login;
