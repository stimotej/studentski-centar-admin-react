import React from "react";
import FAQLayout from "../../components/FAQLayout";
import {
  adminStudentServisCategory,
  faqStudentServisCategoryId,
  studentskiServisCategoryId,
} from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      adminCategoryId={adminStudentServisCategory}
      faqCategoryId={faqStudentServisCategoryId}
      mediaCategoryId={studentskiServisCategoryId}
      from="student-servis"
    />
  );
};

export default FAQPage;
