import React from "react";
import FAQLayout from "../../components/FAQLayout";
import { faqSportCategoryId, sportCategoryId } from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      faqPageCategoryId={faqSportCategoryId}
      mediaCategoryId={sportCategoryId}
      from="sport"
    />
  );
};

export default FAQPage;
