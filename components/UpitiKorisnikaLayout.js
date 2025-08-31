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
import { LoadingButton } from "@mui/lab";
import { Fragment, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/pro-regular-svg-icons";
import {
  useContactMails,
  useDeleteContactMail,
} from "../features/contact-mails";
import Layout from "./Layout";
import Header from "./Header";
import clearHtmlFromString from "../lib/clearHtmlFromString";

const UpitiKorisnikaLayout = ({ adminCategoryId, disabled }) => {
  const [deleteContactMailDialog, setDeleteContactMailDialog] = useState(null);

  const {
    data: contactMails,
    isLoading: isLoadingContactMails,
    isError: isContactMailsError,
    refetch: refetchContactMails,
    isRefetching: isRefetchingContactMails,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useContactMails({
    categoryId: adminCategoryId,
  });

  const { mutate: deleteContactMail, isLoading: isDeletingContactMail } =
    useDeleteContactMail();

  const handleDeleteContactMail = () => {
    if (disabled) return;
    deleteContactMail(
      { id: deleteContactMailDialog },
      {
        onSuccess: () => {
          setDeleteContactMailDialog(null);
        },
      }
    );
  };

  return (
    <Layout>
      <Header title="Upiti Korisnika" />
      <div className="px-5 md:px-10 pb-6">
        {isLoadingContactMails ? (
          <div className="flex items-center justify-center mt-6">
            <CircularProgress size={32} />
          </div>
        ) : isContactMailsError ? (
          <div className="flex flex-col items-start text-error my-2">
            Greška kod učitavanja kontakt mailova
            <LoadingButton
              variant="outlined"
              className="mt-4"
              onClick={() => refetchContactMails()}
              loading={isRefetchingContactMails}
            >
              Pokušaj ponovno
            </LoadingButton>
          </div>
        ) : contactMails?.pages?.length <= 0 ? (
          <div className="text-gray-500 mt-4">
            Nema kontakt mailova za prikaz
          </div>
        ) : (
          contactMails?.pages?.map((contactMail) => (
            <Fragment key={contactMail.id}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
                >
                  <div>
                    <p className="font-medium">
                      {contactMail.email || contactMail.phone}
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      {new Date(contactMail.date).toLocaleDateString("hr", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      h • {contactMail.name}
                    </p>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <p>{clearHtmlFromString(contactMail.message ?? "")}</p>
                  <div className="flex items-center gap-2 mt-4">
                    {!!contactMail.email && (
                      <Button
                        color="success"
                        link
                        openInNewTab
                        href={`mailto:${contactMail.email}`}
                      >
                        Odgovori
                      </Button>
                    )}
                    <Button
                      color="error"
                      onClick={() => setDeleteContactMailDialog(contactMail.id)}
                    >
                      Obriši
                    </Button>
                  </div>
                </AccordionDetails>
              </Accordion>
            </Fragment>
          ))
        )}
        {hasNextPage ? (
          <div className="flex items-center justify-center w-full py-4">
            <LoadingButton
              loading={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              variant="outlined"
              size="large"
            >
              Učitaj više
            </LoadingButton>
          </div>
        ) : null}
      </div>

      <Dialog
        open={!!deleteContactMailDialog}
        onClose={() => setDeleteContactMailDialog(null)}
      >
        <DialogTitle>Brisanje kontakt maila</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovime se briše kontakt mail. Radnja se ne može poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteContactMailDialog(null)}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton
            color="error"
            onClick={handleDeleteContactMail}
            loading={isDeletingContactMail}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default UpitiKorisnikaLayout;
