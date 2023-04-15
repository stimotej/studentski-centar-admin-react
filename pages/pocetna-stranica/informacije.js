import React from "react";
import FAQLayout from "../../components/FAQLayout";
import {
  faqPocetnaCategoryId,
  pocetnaStranicaCategoryId,
} from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      faqPageCategoryId={faqPocetnaCategoryId}
      mediaCategoryId={pocetnaStranicaCategoryId}
      from="pocetna-stranica"
    />
  );
};

export default FAQPage;
