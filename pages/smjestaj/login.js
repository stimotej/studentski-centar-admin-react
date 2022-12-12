import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Smjestaj</title>
      </Head>
      <Login from="smjestaj" title="Smještaj" />
    </>
  );
};

export default login;
