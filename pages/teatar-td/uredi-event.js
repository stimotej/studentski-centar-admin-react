import EventEditorLayout from "../../components/EventEditorLayout";
import { teatarTdCategoryId } from "../../lib/constants";

const EventEditorPage = () => {
  return (
    <EventEditorLayout location="Teatar &TD" categoryId={teatarTdCategoryId} />
  );
};

export default EventEditorPage;
