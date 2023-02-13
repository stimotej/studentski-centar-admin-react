import React from "react";
import FAQLayout from "../../components/FAQLayout";
import { faqKulturaCategoryId, kulturaCategoryId } from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      faqPageCategoryId={faqKulturaCategoryId}
      mediaCategoryId={kulturaCategoryId}
      from="kultura"
    />
  );
};

export default FAQPage;
