import MediaLayout from "../../components/MediaLayout";
import { prehranaCategoryId } from "../../lib/constants";

const Media = () => {
  return <MediaLayout from="prehrana" categoryId={prehranaCategoryId} />;
};

export default Media;
