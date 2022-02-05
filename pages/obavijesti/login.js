import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Obavijesti</title>
      </Head>
      <Login from="obavijesti" />
    </>
  );
};

export default login;
