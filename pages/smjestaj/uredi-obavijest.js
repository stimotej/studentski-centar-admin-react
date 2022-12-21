import ObavijestEditorLayout from "../../components/ObavijestEditorLayout";
import { smjestajCategoryId } from "../../lib/constants";

const EditorPage = () => {
  return (
    <ObavijestEditorLayout from="smjestaj" categoryId={smjestajCategoryId} />
  );
};

export default EditorPage;
