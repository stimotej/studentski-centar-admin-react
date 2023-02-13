import React from "react";
import FAQLayout from "../../components/FAQLayout";
import {
  faqStudentServisCategoryId,
  studentskiServisCategoryId,
} from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      faqPageCategoryId={faqStudentServisCategoryId}
      mediaCategoryId={studentskiServisCategoryId}
      from="student-servis"
    />
  );
};

export default FAQPage;
