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
      title="Informacije"
      actionText="Dodaj informaciju"
      from="pocetna-stranica"
    />
  );
};

export default FAQPage;
