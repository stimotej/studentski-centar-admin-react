import React from "react";
import FAQLayout from "../../components/FAQLayout";
import {
  adminSmjestajCategory,
  faqSmjestajCategoryId,
  smjestajCategoryId,
} from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      adminCategoryId={adminSmjestajCategory}
      faqCategoryId={faqSmjestajCategoryId}
      mediaCategoryId={smjestajCategoryId}
      from="smjestaj"
    />
  );
};

export default FAQPage;
