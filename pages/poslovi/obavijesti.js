import ObavijestiLayout from "../../components/ObavijestiLayout";
import { studentskiServisCategoryId } from "../../lib/constants";

const Obavijesti = () => {
  return (
    <ObavijestiLayout categoryId={studentskiServisCategoryId} from="poslovi" />
  );
};

export default Obavijesti;
