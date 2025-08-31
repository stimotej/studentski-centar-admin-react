import MediaLayout from "../../components/MediaLayout";
import { useUser } from "../../features/auth";
import {
  EVENTI_ROLE,
  mediaUncategorizedFolderEventi,
  eventiCategoryId,
} from "../../lib/constants";

const MediaPage = () => {
  const { data: user } = useUser();

  const userHasEventRole =
    !!user?.data?.roles &&
    (Array.isArray(user.data.roles)
      ? user.data.roles.includes(EVENTI_ROLE)
      : Object.values(user.data.roles).includes(EVENTI_ROLE));

  return (
    <MediaLayout
      from="event"
      categoryId={eventiCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderEventi}
      disabled={!userHasEventRole}
    />
  );
};

export default MediaPage;
