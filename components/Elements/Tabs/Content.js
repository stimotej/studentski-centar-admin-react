const Content = ({ children, active }) => {
  return <div className={`py-8 ${!active && "hidden"}`}>{children}</div>;
};

Content.displayName = "Content";

export default Content;
