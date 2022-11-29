import Link from "next/link";

const LoginCart = ({ title, theme, text, link }) => {
  return (
    <Link
      href={link}
      passHref
      className={`w-full md:w-1/2 py-8 border rounded-lg p-5 mx-2 my-2 hover:shadow-lg hover:border-transparent transition-shadow ${theme}`}
    >
      <h2 className={`text-2xl font-semibold mb-2 text-primary`}>{title}</h2>
      <h2 className="">{text}</h2>
    </Link>
  );
};

export default LoginCart;
