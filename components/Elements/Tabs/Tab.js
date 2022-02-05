const Tab = ({ children, onClick, active }) => {
  return (
    <button
      className={`px-4 py-2 border-b-2 ${
        active ? "border-primary" : "border-transparent"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

Tab.displayName = "Tab";

export default Tab;
