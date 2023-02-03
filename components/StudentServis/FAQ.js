import { faAdd, faChevronDown } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import {
  useCreatePageFAQ,
  useDeletePageFAQ,
  usePage,
  useUpdatePageFAQ,
} from "../../features/page";
import { scPageId, studentskiServisCategoryId } from "../../lib/constants";

const FAQ = () => {
  const {
    data: pageSC,
    isLoading: isLoadingPage,
    isError: isPageError,
  } = usePage(scPageId);

  const [page, setPage] = useState("faq");

  const [mediaDialogOpened, setMediaDialogOpened] = useState(false);

  const [image, setImage] = useState(null);
  const [banners, setBanners] = useState([]);

  const [faqId, setFaqId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [addFAQModal, setAddFAQModal] = useState(false);

  const { mutate: createPageFAQ } = useCreatePageFAQ();
  const { mutate: updatePageFAQ } = useUpdatePageFAQ();
  const { mutate: deletePageFAQ } = useDeletePageFAQ();

  const handleAddFAQ = () => {
    if (!pageSC) return;

    if (faqId)
      updatePageFAQ(
        {
          id: scPageId,
          faqId: faqId,
          question,
          answer,
        },
        {
          onSuccess: () => {
            setAddFAQModal(false);
            setFaqId("");
            setQuestion("");
            setAnswer("");
          },
        }
      );
    else
      createPageFAQ(
        {
          id: scPageId,
          question,
          answer,
        },
        {
          onSuccess: () => {
            setAddFAQModal(false);
            setFaqId("");
            setQuestion("");
            setAnswer("");
          },
        }
      );
  };

  const handleOpenEditFAQDialog = (faq) => {
    setAddFAQModal(true);
    setFaqId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  const handleDeleteFAQ = (faqId) => {
    if (!confirm("Jeste li sigurni da želite obrisati ovo pitanje?")) return;

    deletePageFAQ(
      { id: scPageId, faqId },
      {
        onSuccess: () => {
          setAddFAQModal(false);
          setQuestion("");
          setAnswer("");
        },
      }
    );
  };

  return (
    <Layout>
      <Header title="Početna" />
      <div className="px-5 md:px-10 pb-6">
        <div className="flex gap-10 flex-wrap md:flex-nowrap">
          <div>
            <Paper sx={{ minWidth: 260 }}>
              <MenuList>
                <MenuItem
                  selected={page === "faq"}
                  onClick={() => setPage("faq")}
                >
                  <ListItemText>Često postavljena pitanja</ListItemText>
                </MenuItem>
              </MenuList>
            </Paper>
          </div>
          {page === "faq" && (
            <div className="flex flex-col gap-5 items-start">
              <div>
                {pageSC?.meta?.faq?.map((faq, index) => (
                  <Fragment key={index}>
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
                      >
                        <Typography>{faq.question}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{faq.answer}</Typography>
                        <div className="flex gap-2 mt-2">
                          <Button onClick={() => handleOpenEditFAQDialog(faq)}>
                            Uredi
                          </Button>
                          <Button
                            color="error"
                            onClick={() => handleDeleteFAQ(faq.id)}
                          >
                            Obriši
                          </Button>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </Fragment>
                ))}
              </div>
              <Button
                onClick={() => setAddFAQModal(true)}
                startIcon={<FontAwesomeIcon icon={faAdd} />}
              >
                Dodaj pitanje
              </Button>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={!!addFAQModal}
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
          <DialogContentText>
            {faqId
              ? "Uređivanjem često postavljenog pitanja, promjene će biti vidljive na web stranici."
              : "Dodavanjem često postavljenog pitanja, pitanje će biti vidljivo na web stranici."}
          </DialogContentText>
          <TextField
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            margin="dense"
            label="Pitanje"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            margin="dense"
            label="Odgovor"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={8}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFAQModal(false)} className="!text-black">
            Odustani
          </Button>
          <Button onClick={handleAddFAQ}>{faqId ? "Spremi" : "Dodaj"}</Button>
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
        categoryId={studentskiServisCategoryId}
      />
    </Layout>
  );
};

export default FAQ;
