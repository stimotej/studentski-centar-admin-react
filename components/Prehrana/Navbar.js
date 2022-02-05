import Button from "../Elements/Button";

const Navbar = ({ title, actionText, loading, handleAction }) => {
  return (
    <div className="w-full p-5 py-8 sm:p-10 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center border-b-2">
      <div className="flex items-center">
        <h1 className="text-3xl font-semibold">{title}</h1>
      </div>
      {actionText && (
        <Button
          text={actionText}
          className="mt-5 sm:mt-0"
          loading={loading}
          onClick={handleAction}
          primary
        />
      )}
    </div>
  );
};

export default Navbar;
