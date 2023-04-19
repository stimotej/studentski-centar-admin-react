import MediaLayout from "../../components/MediaLayout";
import {
  mediaUncategorizedFolderPocetnaStranica,
  pocetnaStranicaCategoryId,
} from "../../lib/constants";

const MediaPage = () => {
  return (
    <MediaLayout
      from="pocetna-stranica"
      categoryId={pocetnaStranicaCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderPocetnaStranica}
    />
  );
};

export default MediaPage;
