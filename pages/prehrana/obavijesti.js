import ObavijestiLayout from "../../components/ObavijestiLayout";
import { prehranaCategoryId } from "../../lib/constants";

const Obavijesti = () => {
  return <ObavijestiLayout categoryId={prehranaCategoryId} from="prehrana" />;
};

export default Obavijesti;
