const Backdrop = ({ handleClose }) => {
  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen bg-black/60 z-50"
      onClick={handleClose}
    />
  );
};

export default Backdrop;
