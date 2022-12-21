import MediaLayout from "../../components/MediaLayout";
import { sportCategoryId } from "../../lib/constants";

const Media = () => {
  return <MediaLayout from="sport" categoryId={sportCategoryId} />;
};

export default Media;
