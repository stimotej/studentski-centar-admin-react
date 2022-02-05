import { HiExclamation } from "react-icons/hi";

const NotConnectedWarning = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-10 w-1/2 h-2/3">
        <HiExclamation className="w-20 h-20 text-error mb-10" />
        <h1 className="text-5xl font-semibold">Not connected</h1>
      </div>
    </div>
  );
};

export default NotConnectedWarning;
