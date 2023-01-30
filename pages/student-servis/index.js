import { faAdd, faChevronDown } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
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
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import Loader from "../../components/Elements/Loader";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import { usePage, useUpdatePage } from "../../features/page";
import {
  scPageId,
  studentskiServisCategoryId,
  userGroups,
} from "../../lib/constants";

const Poslovi = () => {
  const router = useRouter();

  const {
    data: pageSC,
    isLoading: isLoadingPage,
    isError: isPageError,
  } = usePage(scPageId);

  console.log("pageSC", pageSC);

  const [page, setPage] = useState("faq");

  const [mediaDialogOpened, setMediaDialogOpened] = useState(false);

  const [image, setImage] = useState(null);
  const [banners, setBanners] = useState([]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [addFAQModal, setAddFAQModal] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["student-servis"].includes(username))
      router.push("/student-servis/login");
  }, [router]);

  const { mutate: updatePageSC } = useUpdatePage();

  const handleAddFAQ = () => {
    if (!pageSC) return;

    updatePageSC(
      {
        id: scPageId,
        data: {
          meta: { faq: [...(pageSC.meta.faq || []), { question, answer }] },
        },
      },
      {
        onSuccess: () => {
          setAddFAQModal(false);
          setQuestion("");
          setAnswer("");
        },
      }
    );
  };

  if (isPageError)
    return (
      <Layout>
        <Header title="Početna" />
        <div className="px-5 md:px-10 pb-6">
          <div className="text-error py-10">Greška kod dohvaćanja podataka</div>
        </div>
      </Layout>
    );

  if (isLoadingPage)
    return (
      <Layout>
        <Header title="Početna" />
        <div className="flex items-center justify-center py-10">
          <Loader className="w-10 h-10 border-primary" />
        </div>
      </Layout>
    );

  return (
    <Layout>
      <Header title="Početna" />
      <div className="px-5 md:px-10 pb-6">
        {/* <Alert severity="info" className="mb-5">Početna stranica u izradi</Alert> */}
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
            <div>
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
                        {/* <div className="flex gap-2 mt-2">
                          <Button>Uredi</Button>
                          <Button color="error">Obriši</Button>
                        </div> */}
                      </AccordionDetails>
                    </Accordion>
                  </Fragment>
                ))}
              </div>
              {/* <Button
                onClick={() => setAddFAQModal(true)}
                className="!mt-5"
                startIcon={<FontAwesomeIcon icon={faAdd} />}
              >
                Dodaj pitanje
              </Button> */}
            </div>
          )}
        </div>
      </div>
      <Dialog open={addFAQModal} onClose={() => setAddFAQModal(false)}>
        <DialogTitle>Dodaj često postavljeno pitanje</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Dodavanjem često postavljenog pitanja, pitanje će biti vidljivo na
            web stranici.
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
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFAQModal(false)} className="!text-black">
            Odustani
          </Button>
          <Button onClick={handleAddFAQ}>Dodaj</Button>
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

export default Poslovi;
