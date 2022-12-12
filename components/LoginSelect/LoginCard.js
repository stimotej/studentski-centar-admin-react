import Link from "next/link";

const LoginCart = ({ title, theme, text, link }) => {
  return (
    <Link
      href={link}
      passHref
      className={`relative transition-colors inline-block w-full py-8 border rounded-lg p-5 hover:border-primary hover:bg-primary/5 ${theme}`}
    >
      <h2 className={`text-2xl font-semibold mb-2 text-primary`}>{title}</h2>
      <h2 className="">{text}</h2>
    </Link>
  );
};

export default LoginCart;
