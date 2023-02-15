import MediaLayout from "../../components/MediaLayout";
import {
  mediaUncategorizedFolderSmjestaj,
  smjestajCategoryId,
} from "../../lib/constants";

const Media = () => {
  return (
    <MediaLayout
      from="smjestaj"
      categoryId={smjestajCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderSmjestaj}
    />
  );
};

export default Media;
