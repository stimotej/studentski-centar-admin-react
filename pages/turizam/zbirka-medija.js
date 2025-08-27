import MediaLayout from "../../components/MediaLayout";
import { useUser } from "../../features/auth";
import {
  mediaUncategorizedFolderTurizam,
  TURIZAM_ROLE,
  turizamCategoryId,
} from "../../lib/constants";

const MediaPage = () => {
  const { data: user } = useUser();

  const userHasTurizamRole =
    !!user?.data?.roles &&
    (Array.isArray(user.data.roles)
      ? user.data.roles.includes(TURIZAM_ROLE)
      : Object.values(user.data.roles).includes(TURIZAM_ROLE));

  return (
    <MediaLayout
      from="turizam"
      categoryId={turizamCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderTurizam}
      disabled={!userHasTurizamRole}
    />
  );
};

export default MediaPage;
