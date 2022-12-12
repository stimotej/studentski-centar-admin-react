import MediaLayout from "../../components/MediaLayout";
import { eventsCategoryId } from "../../lib/constants";

const MediaPage = () => {
  return <MediaLayout from="kultura" categoryId={eventsCategoryId} />;
};

export default MediaPage;
