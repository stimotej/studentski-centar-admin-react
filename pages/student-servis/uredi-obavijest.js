import ObavijestEditorLayout from "../../components/ObavijestEditorLayout";
import { studentskiServisCategoryId } from "../../lib/constants";

const EditorPage = () => {
  return (
    <ObavijestEditorLayout
      categoryId={studentskiServisCategoryId}
      from="student-servis"
    />
  );
};

export default EditorPage;
