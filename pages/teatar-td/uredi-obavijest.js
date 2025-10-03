import ObavijestEditorLayout from "../../components/ObavijestEditorLayout";
import { teatarTdCategoryId } from "../../lib/constants";

const EditorPage = () => {
  return (
    <ObavijestEditorLayout categoryId={teatarTdCategoryId} from="teatar-td" />
  );
};

export default EditorPage;
