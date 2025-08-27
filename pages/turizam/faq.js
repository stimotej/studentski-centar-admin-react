import FAQLayout from "../../components/FAQLayout";
import { useUser } from "../../features/auth";
import {
  faqTurizamCategoryId,
  TURIZAM_ROLE,
  turizamCategoryId,
} from "../../lib/constants";

const FAQPage = () => {
  const { data: user } = useUser();

  const userHasTurizamRole =
    !!user?.data?.roles &&
    (Array.isArray(user.data.roles)
      ? user.data.roles.includes(TURIZAM_ROLE)
      : Object.values(user.data.roles).includes(TURIZAM_ROLE));

  return (
    <FAQLayout
      faqPageCategoryId={faqTurizamCategoryId}
      mediaCategoryId={turizamCategoryId}
      from="turizam"
      disabled={!userHasTurizamRole}
    />
  );
};

export default FAQPage;
