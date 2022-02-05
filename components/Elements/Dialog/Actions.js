import { useRef } from "react";
import Button from "../Button";

const Actions = ({
  handleCancel,
  cancelText,
  cancelButton,
  actionText,
  handleAction,
  secondActionText,
  handleSecondAction,
  loading,
}) => {
  const actionLoading = useRef(null);

  return (
    <div className="flex items-center justify-end bg-background rounded-t-lg py-4 px-5 sm:px-10">
      {cancelButton !== false && (
        <Button
          text={cancelText || "Odustani"}
          className="mr-4"
          onClick={handleCancel}
        />
      )}
      {secondActionText && (
        <Button
          text={secondActionText}
          className="mr-4"
          loading={loading && actionLoading.current === "secondAction"}
          onClick={(e) => {
            handleSecondAction(e);
            actionLoading.current = "secondAction";
          }}
          error
        />
      )}
      {actionText && (
        <Button
          text={actionText}
          loading={loading && actionLoading.current === "mainAction"}
          onClick={(e) => {
            handleAction(e);
            actionLoading.current = "mainAction";
          }}
          primary
        />
      )}
    </div>
  );
};

export default Actions;
