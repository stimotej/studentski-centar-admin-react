import React from "react";
import FAQLayout from "../../components/FAQLayout";
import { faqPrehranaCategoryId, prehranaCategoryId } from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      faqPageCategoryId={faqPrehranaCategoryId}
      mediaCategoryId={prehranaCategoryId}
      from="prehrana"
    />
  );
};

export default FAQPage;
