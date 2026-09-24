import MediaLayout from "../../components/MediaLayout";
import {
  kulturaCategoryId,
  mediaUncategorizedFolderKultura,
} from "../../lib/constants";

const MediaPage = () => {
  return (
    <MediaLayout
      from="kultura"
      categoryId={kulturaCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderKultura}
    />
  );
};

export default MediaPage;
