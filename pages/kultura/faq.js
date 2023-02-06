import React from "react";
import FAQLayout from "../../components/FAQLayout";
import {
  adminKulturaCategory,
  faqKulturaCategoryId,
  kulturaCategoryId,
} from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      adminCategoryId={adminKulturaCategory}
      faqCategoryId={faqKulturaCategoryId}
      mediaCategoryId={kulturaCategoryId}
      from="kultura"
    />
  );
};

export default FAQPage;
