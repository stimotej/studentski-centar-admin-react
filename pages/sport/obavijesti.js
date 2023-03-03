import ObavijestiLayout from "../../components/ObavijestiLayout";
import { sportCategoryId } from "../../lib/constants";

const ObavijestiPage = () => {
  return <ObavijestiLayout categoryId={sportCategoryId} from="sport" />;
};

export default ObavijestiPage;
