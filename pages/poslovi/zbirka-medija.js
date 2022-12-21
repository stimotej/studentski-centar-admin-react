import MediaLayout from "../../components/MediaLayout";
import { studentskiServisCategoryId } from "../../lib/constants";

const MediaPage = () => {
  return <MediaLayout from="poslovi" categoryId={studentskiServisCategoryId} />;
};

export default MediaPage;
