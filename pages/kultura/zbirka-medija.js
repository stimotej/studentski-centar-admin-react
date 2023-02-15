import MediaLayout from "../../components/MediaLayout";
import {
  eventsCategoryId,
  mediaUncategorizedFolderKultura,
} from "../../lib/constants";

const MediaPage = () => {
  return (
    <MediaLayout
      from="kultura"
      categoryId={eventsCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderKultura}
    />
  );
};

export default MediaPage;
