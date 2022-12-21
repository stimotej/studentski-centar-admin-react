import ObavijestEditorLayout from "../../components/ObavijestEditorLayout";
import { studentskiServisCategoryId } from "../../lib/constants";

const EditorPage = () => {
  return (
    <ObavijestEditorLayout
      categoryId={studentskiServisCategoryId}
      from="poslovi"
    />
  );
};

export default EditorPage;
