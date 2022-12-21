import ObavijestEditorLayout from "../../components/ObavijestEditorLayout";
import { sportCategoryId } from "../../lib/constants";

const EditorPage = () => {
  return <ObavijestEditorLayout from="sport" categoryId={sportCategoryId} />;
};

export default EditorPage;
