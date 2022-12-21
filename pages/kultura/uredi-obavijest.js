import ObavijestEditorLayout from "../../components/ObavijestEditorLayout";
import { kulturaCategoryId } from "../../lib/constants";

const EditorPage = () => {
  return (
    <ObavijestEditorLayout categoryId={kulturaCategoryId} from="kultura" />
  );
};

export default EditorPage;
