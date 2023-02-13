import React from "react";
import FAQLayout from "../../components/FAQLayout";
import { faqSmjestajCategoryId, smjestajCategoryId } from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      faqPageCategoryId={faqSmjestajCategoryId}
      mediaCategoryId={smjestajCategoryId}
      from="smjestaj"
    />
  );
};

export default FAQPage;
