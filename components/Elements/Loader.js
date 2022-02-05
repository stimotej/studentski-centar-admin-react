const Loader = ({ className }) => {
  return (
    <div
      className={`animate-spin rounded-full ${className}`}
      style={{
        borderStyle: "dotted",
        borderWidth: "3px",
        borderRightColor: "transparent",
        borderBottomColor: "transparent",
      }}
    />
  );
};

export default Loader;
