import React from "react";
import FAQLayout from "../../components/FAQLayout";
import {
  adminPrehranaCategory,
  faqPrehranaCategoryId,
  prehranaCategoryId,
} from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      adminCategoryId={adminPrehranaCategory}
      faqCategoryId={faqPrehranaCategoryId}
      mediaCategoryId={prehranaCategoryId}
      from="prehrana"
    />
  );
};

export default FAQPage;
