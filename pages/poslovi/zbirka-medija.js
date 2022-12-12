import MediaLayout from "../../components/MediaLayout";
import { jobsCategoryId } from "../../lib/constants";

const MediaPage = () => {
  return <MediaLayout from="poslovi" categoryId={jobsCategoryId} />;
};

export default MediaPage;
