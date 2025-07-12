import MediaLayout from "../../components/MediaLayout";
import {
  mediaUncategorizedFolderTeatarTd,
  teatarTdCategoryId,
} from "../../lib/constants";

const MediaPage = () => {
  return (
    <MediaLayout
      from="teatar-td"
      categoryId={teatarTdCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderTeatarTd}
    />
  );
};

export default MediaPage;
