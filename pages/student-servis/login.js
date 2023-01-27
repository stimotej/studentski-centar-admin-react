import Head from "next/head";
import Login from "../../components/Login";

const login = () => {
  return (
    <>
      <Head>
        <title>Login | Student servis</title>
      </Head>
      <Login from="student-servis" />
    </>
  );
};

export default login;
