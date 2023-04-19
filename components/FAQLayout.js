import { faChevronDown, faPlus } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Fragment, useState } from "react";
import Header from "./Header";
import Layout from "./Layout";
import MediaSelectDialog from "./MediaSelectDialog";
import { faqCategoryId } from "../lib/constants";
import dynamic from "next/dynamic";
import {
  useCreatePost,
  useDeletePost,
  usePosts,
  useUpdatePost,
} from "../features/posts";
import { LoadingButton } from "@mui/lab";
const QuillTextEditor = dynamic(() => import("./Elements/QuillTextEditor"), {
  ssr: false,
});

const FAQLayout = ({
  faqPageCategoryId,
  mediaCategoryId,
  title,
  actionText,
}) => {
  const [addFAQModal, setAddFAQModal] = useState(false);

  return (
    <Layout>
      <Header
        title={title || "Često postavljana pitanja"}
        text={actionText || "Dodaj pitanje"}
        icon={<FontAwesomeIcon icon={faPlus} />}
        onClick={() => setAddFAQModal(true)}
      />
      <div className="px-5 md:px-10 pb-6">
        <FAQList
          faqPageCategoryId={faqPageCategoryId}
          mediaCategoryId={mediaCategoryId}
          addFAQModal={addFAQModal}
          setAddFAQModal={setAddFAQModal}
        />
      </div>
    </Layout>
  );
};

export const FAQList = ({
  faqPageCategoryId,
  mediaCategoryId,
  addFAQModal,
  setAddFAQModal,
}) => {
  const {
    data: faqList,
    isLoading: isLoadingFaq,
    isError: isFaqError,
    refetch: refetchFaq,
    isRefetching: isRefetchingFaq,
  } = usePosts({
    categories: faqPageCategoryId,
  });

  const [deleteFaqDialog, setDeleteFaqDialog] = useState(false);
  const [mediaDialogOpened, setMediaDialogOpened] = useState(false);

  const [image, setImage] = useState(null);
  const [banners, setBanners] = useState([]);

  const [faqId, setFaqId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const { mutate: createFAQPost, isLoading: isCreatingFaq } = useCreatePost();
  const { mutate: updateFAQPost, isLoading: isUpdatingFaq } = useUpdatePost();
  const { mutate: deleteFAQPost, isLoading: isDeletingFaq } = useDeletePost();

  const handleAddFAQ = () => {
    const newFaq = {
      id: faqId,
      title: question,
      content: answer,
      status: "publish",
      categories: [faqCategoryId, faqPageCategoryId],
    };

    if (faqId)
      updateFAQPost(newFaq, {
        onSuccess: () => {
          setAddFAQModal(false);
          setFaqId("");
          setQuestion("");
          setAnswer("");
        },
      });
    else
      createFAQPost(newFaq, {
        onSuccess: () => {
          setAddFAQModal(false);
          setFaqId("");
          setQuestion("");
          setAnswer("");
        },
      });
  };

  const handleOpenEditFAQDialog = (faq) => {
    setAddFAQModal(true);
    setFaqId(faq.id);
    setQuestion(faq.title);
    setAnswer(faq.content);
  };

  const handleDeletePostFaq = () => {
    deleteFAQPost(
      { id: deleteFaqDialog },
      {
        onSuccess: () => {
          setDeleteFaqDialog(false);
          setQuestion("");
          setAnswer("");
        },
      }
    );
  };

  return (
    <>
      {isLoadingFaq ? (
        <div className="flex items-center justify-center mt-6">
          <CircularProgress size={32} />
        </div>
      ) : isFaqError ? (
        <div className="flex flex-col items-start text-error my-2">
          Greška kod učitavanja često postavljanih pitanja
          <LoadingButton
            variant="outlined"
            className="mt-4"
            onClick={() => refetchFaq()}
            loading={isRefetchingFaq}
          >
            Pokušaj ponovno
          </LoadingButton>
        </div>
      ) : faqList.length <= 0 ? (
        <div className="text-gray-500 mt-4">
          Nema često postavljanih pitanja za prikaz
        </div>
      ) : (
        faqList?.map((faq, index) => (
          <Fragment key={index}>
            <Accordion>
              <AccordionSummary
                expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
              >
                <QuillTextEditor
                  value={faq.title}
                  className="[&>div>div>p]:hover:cursor-pointer"
                  formats={[]}
                  includeStyles={false}
                  readOnly
                />
              </AccordionSummary>
              <AccordionDetails>
                <QuillTextEditor
                  value={faq.content}
                  containerClassName="bg-white border-none"
                  className="[&>div>div]:p-0 [&>div>div]:pb-4 [&>div>div]:!min-h-fit"
                  readOnly
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => handleOpenEditFAQDialog(faq)}>
                    Uredi
                  </Button>
                  <Button
                    color="error"
                    onClick={() => setDeleteFaqDialog(faq.id)}
                  >
                    Obriši
                  </Button>
                </div>
              </AccordionDetails>
            </Accordion>
          </Fragment>
        ))
      )}
      <Dialog
        open={!!addFAQModal}
        maxWidth="md"
        fullWidth
        scroll="body"
        onClose={() => {
          setAddFAQModal(false);
          setFaqId("");
          setQuestion("");
          setAnswer("");
        }}
      >
        <DialogTitle>
          {faqId ? "Uredi" : "Dodaj"} često postavljeno pitanje
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="mb-2">
            {faqId
              ? "Uređivanjem često postavljenog pitanja, promjene će biti vidljive na web stranici."
              : "Dodavanjem često postavljenog pitanja, pitanje će biti vidljivo na web stranici."}
          </DialogContentText>
          {/* <TextField
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            margin="dense"
            label="Pitanje"
            type="text"
            fullWidth
            variant="outlined"
          /> */}
          <QuillTextEditor
            value={question}
            onChange={setQuestion}
            formats={[]}
            className="[&>div>div]:!min-h-fit"
            useToolbar={false}
            placeholder="Pitanje"
          />
          <QuillTextEditor
            containerClassName="mt-2"
            value={answer}
            onChange={setAnswer}
            mediaCategoryId={mediaCategoryId}
            // files={files}
            // setFiles={setFiles}
            placeholder="Odgovor"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddFAQModal(false);
              setFaqId("");
              setQuestion("");
              setAnswer("");
            }}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton
            onClick={handleAddFAQ}
            loading={isCreatingFaq || isUpdatingFaq}
          >
            {faqId ? "Spremi" : "Dodaj"}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <MediaSelectDialog
        opened={mediaDialogOpened}
        onClose={() => setMediaDialogOpened(false)}
        value={image}
        onSelect={(val) => {
          setImage(val);
          setBanners([...banners, val.src]);
          handlePublishBanners([...banners, val.src]);
        }}
        categoryId={mediaCategoryId}
      />

      <Dialog
        open={!!deleteFaqDialog}
        onClose={() => setDeleteFaqDialog(false)}
      >
        <DialogTitle>Brisanje često postavljenog pitanja</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovime se briše često postavljeno pitanje. Radnja se ne može
            poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteFaqDialog(false)}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton
            color="error"
            onClick={handleDeletePostFaq}
            loading={isDeletingFaq}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FAQLayout;
