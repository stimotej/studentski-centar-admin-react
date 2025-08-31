import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Catering</title>
      </Head>
      <Login from="catering" title="Catering" />
    </>
  );
};

export default login;
