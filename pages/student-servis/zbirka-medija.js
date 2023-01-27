import MediaLayout from "../../components/MediaLayout";
import { studentskiServisCategoryId } from "../../lib/constants";

const MediaPage = () => {
  return (
    <MediaLayout
      from="student-servis"
      categoryId={studentskiServisCategoryId}
      includeBanners
    />
  );
};

export default MediaPage;
