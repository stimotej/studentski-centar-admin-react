import MediaLayout from "../../components/MediaLayout";
import {
  mediaUncategorizedFolderTurizam,
  turizamCategoryId,
} from "../../lib/constants";

const MediaPage = () => {
  return (
    <MediaLayout
      from="turizam"
      categoryId={turizamCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderTurizam}
    />
  );
};

export default MediaPage;
