import { useUser } from "../../features/auth";
import { adminEventiCategoryId, EVENTI_ROLE } from "../../lib/constants";
import UpitiKorisnikaLayout from "../../components/UpitiKorisnikaLayout";

const UpitiKorisnikaPage = () => {
  const { data: user } = useUser();

  const userHasEventRole =
    !!user?.data?.roles &&
    (Array.isArray(user.data.roles)
      ? user.data.roles.includes(EVENTI_ROLE)
      : Object.values(user.data.roles).includes(EVENTI_ROLE));

  return (
    <UpitiKorisnikaLayout
      adminCategoryId={adminEventiCategoryId}
      disabled={!userHasEventRole}
    />
  );
};

export default UpitiKorisnikaPage;
