import MediaLayout from "../../components/MediaLayout";
import { useUser } from "../../features/auth";
import {
  CATERING_ROLE,
  mediaUncategorizedFolderCatering,
  cateringCategoryId,
} from "../../lib/constants";

const MediaPage = () => {
  const { data: user } = useUser();

  const userHasCateringRole =
    !!user?.data?.roles &&
    (Array.isArray(user.data.roles)
      ? user.data.roles.includes(CATERING_ROLE)
      : Object.values(user.data.roles).includes(CATERING_ROLE));

  return (
    <MediaLayout
      from="catering"
      categoryId={cateringCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderCatering}
      disabled={!userHasCateringRole}
    />
  );
};

export default MediaPage;
