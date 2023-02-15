import MediaLayout from "../../components/MediaLayout";
import {
  mediaUncategorizedFolderSS,
  studentskiServisCategoryId,
} from "../../lib/constants";

const MediaPage = () => {
  return (
    <MediaLayout
      from="student-servis"
      categoryId={studentskiServisCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderSS}
      includeBanners
    />
  );
};

export default MediaPage;
