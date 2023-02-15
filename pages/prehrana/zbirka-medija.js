import MediaLayout from "../../components/MediaLayout";
import {
  mediaUncategorizedFolderPrehrana,
  prehranaCategoryId,
} from "../../lib/constants";

const Media = () => {
  return (
    <MediaLayout
      from="prehrana"
      categoryId={prehranaCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderPrehrana}
    />
  );
};

export default Media;
