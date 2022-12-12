import MediaLayout from "../../components/MediaLayout";
import { obavijestiCategoryId } from "../../lib/constants";

const MediaPage = () => {
  return <MediaLayout from="obavijesti" categoryId={obavijestiCategoryId} />;
};

export default MediaPage;
