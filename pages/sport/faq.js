import React from "react";
import FAQLayout from "../../components/FAQLayout";
import {
  adminSportCategory,
  faqSportCategoryId,
  sportCategoryId,
} from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      adminCategoryId={adminSportCategory}
      faqCategoryId={faqSportCategoryId}
      mediaCategoryId={sportCategoryId}
      from="sport"
    />
  );
};

export default FAQPage;
