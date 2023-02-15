import MediaLayout from "../../components/MediaLayout";
import {
  mediaUncategorizedFolderSport,
  sportCategoryId,
} from "../../lib/constants";

const Media = () => {
  return (
    <MediaLayout
      from="sport"
      categoryId={sportCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderSport}
    />
  );
};

export default Media;
