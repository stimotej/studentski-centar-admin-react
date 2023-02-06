import React from "react";
import FAQLayout from "../../components/FAQLayout";
import {
  adminStudentServisCategory,
  studentskiServisCategoryId,
} from "../../lib/constants";

const FAQPage = () => {
  return (
    <FAQLayout
      adminCategoryId={adminStudentServisCategory}
      mediaCategoryId={studentskiServisCategoryId}
    />
  );
};

export default FAQPage;
