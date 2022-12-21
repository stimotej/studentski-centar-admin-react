import ObavijestEditorLayout from "../../components/ObavijestEditorLayout";
import { prehranaCategoryId } from "../../lib/constants";

const EditorPage = () => {
  return (
    <ObavijestEditorLayout from="prehrana" categoryId={prehranaCategoryId} />
  );
};

export default EditorPage;
