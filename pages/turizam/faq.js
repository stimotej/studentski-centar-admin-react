import FAQLayout from "../../components/FAQLayout";
import { faqTurizamCategoryId, turizamCategoryId } from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      faqPageCategoryId={faqTurizamCategoryId}
      mediaCategoryId={turizamCategoryId}
      from="turizam"
    />
  );
};

export default FAQPage;
