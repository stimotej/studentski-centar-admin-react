import { useEffect } from "react";
import Header from "./Header";
import Backdrop from "./Backdrop";
import Body from "./Body";
import Actions from "./Actions";

const Dialog = ({
  title,
  className,
  handleClose,
  children,
  small,
  cancelButton,
  cancelText,
  actionText,
  handleAction,
  secondActionText,
  handleSecondAction,
  loading,
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  return (
    <>
      <Backdrop handleClose={handleClose} />
      <div
        id="dialog"
        className={`fixed w-11/12 overflow-y-auto top-1/2 left-1/2 bg-white rounded z-50 max-h-90 transform -translate-x-1/2 -translate-y-1/2 ${
          small ? "lg:w-1/2" : "lg:w-3/4"
        } ${className}`}
      >
        <Header title={title} handleClose={handleClose} />
        <Body>{children}</Body>
        {(actionText || secondActionText) && (
          <Actions
            handleCancel={handleClose}
            cancelText={cancelText}
            cancelButton={cancelButton}
            actionText={actionText}
            handleAction={handleAction}
            secondActionText={secondActionText}
            handleSecondAction={handleSecondAction}
            loading={loading}
          />
        )}
      </div>
    </>
  );
};

export default Dialog;
