import { useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  MdDeleteOutline,
  MdContentCopy,
  MdEdit,
  MdMoreVert,
  MdOutlineScheduleSend,
  MdSend,
} from "react-icons/md";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import Tabs, { Content, Tab } from "../../components/Elements/Tabs/Tabs";
import {
  useDeleteNewsletterBroadcast,
  useDeleteNewsletterContact,
  useCreateNewsletterContacts,
  useDuplicateNewsletterBroadcast,
  useNewsletterBroadcasts,
  useNewsletterContacts,
  useSendNewsletterBroadcast,
  useUpdateNewsletterContact,
} from "../../features/newsletter";
import { useRouter } from "next/router";

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("hr-HR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const canEditBroadcast = (status) => !["sent"].includes(status);
const canDuplicateBroadcast = () => true;
const canSendBroadcast = (status) => ["draft"].includes(status);
const canDeleteBroadcast = (status) => ["draft", "scheduled"].includes(status);
const hasBroadcastActions = (status) =>
  canDuplicateBroadcast(status) ||
  canEditBroadcast(status) ||
  canSendBroadcast(status) ||
  canDeleteBroadcast(status);

const statusBadgeStyles = {
  draft: {
    dot: "bg-gray-400",
    container: "bg-gray-100 text-gray-700",
    label: "Skica",
  },
  scheduled: {
    dot: "bg-gray-400",
    container: "bg-gray-100 text-gray-700",
    label: "Zakazano",
  },
  queued: {
    dot: "bg-blue-500",
    container: "bg-blue-50 text-blue-700",
    label: "Slanje",
  },
  sent: {
    dot: "bg-green-500",
    container: "bg-green-50 text-green-700",
    label: "Poslano",
  },
  failed: {
    dot: "bg-blue-500",
    container: "bg-blue-50 text-blue-700",
    label: "Neuspjelo",
  },
};

const BroadcastStatusBadge = ({ status }) => {
  const statusKey = String(status || "").toLowerCase();
  const badge = statusBadgeStyles[statusKey] || {
    dot: "bg-gray-400",
    container: "bg-gray-100 text-gray-700",
    label: status || "-",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${badge.container}`}
    >
      <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
      {badge.label}
    </span>
  );
};

const ContactStatusBadge = ({ unsubscribed }) => {
  const badge = unsubscribed
    ? {
        dot: "bg-gray-400",
        container: "bg-gray-100 text-gray-700",
        label: "Odjavljen",
      }
    : {
        dot: "bg-green-500",
        container: "bg-green-50 text-green-700",
        label: "Aktivan",
      };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${badge.container}`}
    >
      <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
      {badge.label}
    </span>
  );
};

const NewsletterPage = () => {
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState(0);
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [broadcastPendingDelete, setBroadcastPendingDelete] = useState(null);
  const [deleteBroadcastDialogOpen, setDeleteBroadcastDialogOpen] =
    useState(false);
  const [contactActionsAnchor, setContactActionsAnchor] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deleteContactId, setDeleteContactId] = useState(null);
  const [scheduleDialog, setScheduleDialog] = useState(null);
  const [scheduledAt, setScheduledAt] = useState(dayjs().add(1, "hour"));
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    unsubscribed: false,
  });
  const [createContactsDialogOpen, setCreateContactsDialogOpen] =
    useState(false);
  const [emailsInput, setEmailsInput] = useState("");

  const {
    data: broadcasts,
    isLoading: isLoadingBroadcasts,
    isError: isBroadcastsError,
    refetch: refetchBroadcasts,
    isRefetching: isRefetchingBroadcasts,
  } = useNewsletterBroadcasts();

  const {
    data: contacts,
    isLoading: isLoadingContacts,
    isError: isContactsError,
    refetch: refetchContacts,
    isRefetching: isRefetchingContacts,
  } = useNewsletterContacts();

  const { mutate: deleteBroadcast, isLoading: isDeletingBroadcast } =
    useDeleteNewsletterBroadcast();
  const { mutate: duplicateBroadcast, isLoading: isDuplicatingBroadcast } =
    useDuplicateNewsletterBroadcast();
  const { mutate: sendBroadcast, isLoading: isSendingBroadcast } =
    useSendNewsletterBroadcast();
  const { mutate: updateContact, isLoading: isUpdatingContact } =
    useUpdateNewsletterContact();
  const { mutate: deleteContact, isLoading: isDeletingContact } =
    useDeleteNewsletterContact();
  const { mutate: createContacts, isLoading: isCreatingContacts } =
    useCreateNewsletterContacts();

  const sortedBroadcasts = useMemo(
    () =>
      (broadcasts || []).slice().sort((first, second) => {
        return (
          new Date(second.createdAt || 0).getTime() -
          new Date(first.createdAt || 0).getTime()
        );
      }),
    [broadcasts],
  );

  const openContactDialog = (contact) => {
    setEditingContact(contact);
    setContactForm({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      unsubscribed: !!contact.unsubscribed,
    });
  };

  const handleSchedule = () => {
    if (!scheduleDialog || !scheduledAt) return;

    sendBroadcast(
      {
        id: scheduleDialog,
        scheduledAt: scheduledAt.toISOString(),
      },
      {
        onSuccess: () => {
          setScheduleDialog(null);
        },
      },
    );
  };

  const handleSendNow = (id) => {
    sendBroadcast({ id });
  };

  const handleDeleteBroadcast = () => {
    if (!broadcastPendingDelete?.id) return;

    deleteBroadcast(broadcastPendingDelete.id, {
      onSuccess: () => {
        setDeleteBroadcastDialogOpen(false);
      },
    });
  };

  const handleUpdateContact = () => {
    if (!editingContact) return;

    updateContact(
      {
        id: editingContact.id,
        ...contactForm,
      },
      {
        onSuccess: () => {
          setEditingContact(null);
        },
      },
    );
  };

  const handleOpenBroadcastActions = (event, broadcast) => {
    setActionsAnchor(event.currentTarget);
    setSelectedBroadcast(broadcast);
  };

  const handleCloseBroadcastActions = () => {
    setActionsAnchor(null);
  };

  const handleDeleteContact = () => {
    if (!deleteContactId) return;

    deleteContact(deleteContactId, {
      onSuccess: () => {
        setDeleteContactId(null);
      },
    });
  };

  const handleCreateContacts = () => {
    if (!emailsInput.trim()) return;

    createContacts(
      {
        emails: emailsInput,
      },
      {
        onSuccess: () => {
          setCreateContactsDialogOpen(false);
          setEmailsInput("");
        },
      },
    );
  };

  const handleOpenContactActions = (event, contact) => {
    setContactActionsAnchor(event.currentTarget);
    setSelectedContact(contact);
  };

  const handleCloseContactActions = () => {
    setContactActionsAnchor(null);
  };

  const handleDuplicateBroadcast = (id) => {
    duplicateBroadcast(id, {
      onSuccess: (data) => {
        router.push({
          pathname: "/teatar-td/uredi-newsletter",
          query: { id: data.id },
        });
      },
    });
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center py-10">
      <CircularProgress size={32} />
    </div>
  );

  const renderError = (onRetry, loading) => (
    <div className="flex flex-col items-start gap-4">
      <Alert severity="error">Greška kod učitavanja podataka.</Alert>
      <LoadingButton variant="outlined" onClick={onRetry} loading={loading}>
        Pokušaj ponovno
      </LoadingButton>
    </div>
  );

  return (
    <Layout>
      <Header
        title="Newsletter"
        text="Novi email"
        to="/teatar-td/uredi-newsletter"
        link
      />
      <div className="px-5 md:px-10 pb-10">
        <Tabs value={selectedTab} onTabChange={setSelectedTab}>
          <Tab>Emailovi</Tab>
          <Tab>Pretplatnici</Tab>

          <Content>
            {isLoadingBroadcasts ? (
              renderLoading()
            ) : isBroadcastsError ? (
              renderError(refetchBroadcasts, isRefetchingBroadcasts)
            ) : sortedBroadcasts?.length <= 0 ? (
              <div className="text-gray-500">Nema newsletter emailova.</div>
            ) : (
              <Paper className="overflow-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Naziv</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Kreirano</TableCell>
                      <TableCell>Zakazano</TableCell>
                      <TableCell>Poslano</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedBroadcasts.map((broadcast) => (
                      <TableRow key={broadcast.id}>
                        <TableCell>
                          <button
                            className="text-left text-primary hover:underline"
                            onClick={() =>
                              router.push({
                                pathname: "/teatar-td/uredi-newsletter",
                                query: { id: broadcast.id },
                              })
                            }
                          >
                            {broadcast.name || "Bez naziva"}
                          </button>
                        </TableCell>
                        <TableCell>
                          <BroadcastStatusBadge status={broadcast.status} />
                        </TableCell>
                        <TableCell>{formatDate(broadcast.createdAt)}</TableCell>
                        <TableCell>
                          {formatDate(broadcast.scheduledAt)}
                        </TableCell>
                        <TableCell>{formatDate(broadcast.sentAt)}</TableCell>
                        <TableCell align="right">
                          {hasBroadcastActions(broadcast.status) ? (
                            <IconButton
                              onClick={(event) =>
                                handleOpenBroadcastActions(event, broadcast)
                              }
                            >
                              <MdMoreVert />
                            </IconButton>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Content>

          <Content>
            {isLoadingContacts ? (
              renderLoading()
            ) : isContactsError ? (
              renderError(refetchContacts, isRefetchingContacts)
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <LoadingButton
                    variant="outlined"
                    onClick={() => setCreateContactsDialogOpen(true)}
                  >
                    Dodaj pretplatnike
                  </LoadingButton>
                </div>

                {contacts?.length <= 0 ? (
                  <div className="text-gray-500">
                    Nema pretplatnika za prikaz.
                  </div>
                ) : (
                  <Paper className="overflow-auto">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Email</TableCell>
                          <TableCell>Ime</TableCell>
                          <TableCell>Prezime</TableCell>
                          <TableCell>Kreirano</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right"></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>{contact.firstName || "-"}</TableCell>
                            <TableCell>{contact.lastName || "-"}</TableCell>
                            <TableCell>
                              {formatDate(contact.createdAt)}
                            </TableCell>
                            <TableCell>
                              <ContactStatusBadge
                                unsubscribed={contact.unsubscribed}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={(event) =>
                                  handleOpenContactActions(event, contact)
                                }
                              >
                                <MdMoreVert />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                )}
              </div>
            )}
          </Content>
        </Tabs>
      </div>

      <Menu
        anchorEl={actionsAnchor}
        open={!!actionsAnchor && !!selectedBroadcast}
        onClose={handleCloseBroadcastActions}
        TransitionProps={{
          onExited: () => setSelectedBroadcast(null),
        }}
      >
        {selectedBroadcast && canEditBroadcast(selectedBroadcast.status) && (
          <MenuItem
            onClick={() => {
              handleCloseBroadcastActions();
              router.push({
                pathname: "/teatar-td/uredi-newsletter",
                query: { id: selectedBroadcast.id },
              });
            }}
          >
            <ListItemIcon>
              <MdEdit />
            </ListItemIcon>
            <ListItemText>Uredi</ListItemText>
          </MenuItem>
        )}
        {selectedBroadcast && (
          <MenuItem
            disabled={isDuplicatingBroadcast}
            onClick={() => {
              handleCloseBroadcastActions();
              handleDuplicateBroadcast(selectedBroadcast.id);
            }}
          >
            <ListItemIcon>
              <MdContentCopy />
            </ListItemIcon>
            <ListItemText>Dupliciraj</ListItemText>
          </MenuItem>
        )}
        {selectedBroadcast && canSendBroadcast(selectedBroadcast.status) && (
          <MenuItem
            onClick={() => {
              handleCloseBroadcastActions();
              handleSendNow(selectedBroadcast.id);
            }}
          >
            <ListItemIcon>
              <MdSend />
            </ListItemIcon>
            <ListItemText>Pošalji</ListItemText>
          </MenuItem>
        )}
        {selectedBroadcast && canSendBroadcast(selectedBroadcast.status) && (
          <MenuItem
            onClick={() => {
              handleCloseBroadcastActions();
              setScheduleDialog(selectedBroadcast.id);
              setScheduledAt(dayjs().add(1, "hour"));
            }}
          >
            <ListItemIcon>
              <MdOutlineScheduleSend />
            </ListItemIcon>
            <ListItemText>Zakaži</ListItemText>
          </MenuItem>
        )}
        {selectedBroadcast && canDeleteBroadcast(selectedBroadcast.status) && (
          <MenuItem
            sx={{
              color: "error.main",
              "& .MuiListItemIcon-root": {
                color: "error.main",
              },
            }}
            onClick={() => {
              handleCloseBroadcastActions();
              setBroadcastPendingDelete(selectedBroadcast);
              setDeleteBroadcastDialogOpen(true);
            }}
          >
            <ListItemIcon>
              <MdDeleteOutline />
            </ListItemIcon>
            <ListItemText>Obriši</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={contactActionsAnchor}
        open={!!contactActionsAnchor && !!selectedContact}
        onClose={handleCloseContactActions}
        TransitionProps={{
          onExited: () => setSelectedContact(null),
        }}
      >
        {selectedContact && (
          <MenuItem
            onClick={() => {
              handleCloseContactActions();
              openContactDialog(selectedContact);
            }}
          >
            <ListItemIcon>
              <MdEdit />
            </ListItemIcon>
            <ListItemText>Uredi</ListItemText>
          </MenuItem>
        )}
        {selectedContact && (
          <MenuItem
            sx={{
              color: "error.main",
              "& .MuiListItemIcon-root": {
                color: "error.main",
              },
            }}
            onClick={() => {
              handleCloseContactActions();
              setDeleteContactId(selectedContact.id);
            }}
          >
            <ListItemIcon>
              <MdDeleteOutline />
            </ListItemIcon>
            <ListItemText>Obriši</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={deleteBroadcastDialogOpen}
        onClose={() => setDeleteBroadcastDialogOpen(false)}
        TransitionProps={{
          onExited: () => setBroadcastPendingDelete(null),
        }}
      >
        <DialogTitle>Brisanje newsletter emaila</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovim se briše odabrani newsletter email. Ako je email zakazan,
            zakazano slanje će biti otkazano.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={() => setDeleteBroadcastDialogOpen(false)}>
            Odustani
          </LoadingButton>
          <LoadingButton
            color="error"
            onClick={handleDeleteBroadcast}
            loading={isDeletingBroadcast}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!scheduleDialog} onClose={() => setScheduleDialog(null)}>
        <DialogTitle>Zakaži slanje</DialogTitle>
        <DialogContent className="!pt-4 !min-w-[320px]">
          <DateTimePicker
            inputFormat="DD/MM/YYYY HH:mm"
            label="Datum i vrijeme slanja"
            value={scheduledAt}
            onChange={(value) => setScheduledAt(value)}
            className="w-full"
            minDateTime={dayjs().add(1, "minute")}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={() => setScheduleDialog(null)}>
            Odustani
          </LoadingButton>
          <LoadingButton
            onClick={handleSchedule}
            loading={isSendingBroadcast}
            disabled={!scheduledAt}
          >
            Zakaži
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editingContact} onClose={() => setEditingContact(null)}>
        <DialogTitle>Uredi pretplatnika</DialogTitle>
        <DialogContent className="!pt-4 !min-w-[320px]">
          <div className="flex flex-col gap-4">
            <TextField
              label="Ime"
              value={contactForm.firstName}
              onChange={(event) =>
                setContactForm((current) => ({
                  ...current,
                  firstName: event.target.value,
                }))
              }
            />
            <TextField
              label="Prezime"
              value={contactForm.lastName}
              onChange={(event) =>
                setContactForm((current) => ({
                  ...current,
                  lastName: event.target.value,
                }))
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={contactForm.unsubscribed}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      unsubscribed: event.target.checked,
                    }))
                  }
                />
              }
              label="Odjavljen s newslettera"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={() => setEditingContact(null)}>
            Odustani
          </LoadingButton>
          <LoadingButton
            onClick={handleUpdateContact}
            loading={isUpdatingContact}
          >
            Spremi
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={createContactsDialogOpen}
        onClose={() => setCreateContactsDialogOpen(false)}
      >
        <DialogTitle>Dodaj pretplatnike</DialogTitle>
        <DialogContent className="!pt-4 !min-w-[420px]">
          <div className="flex flex-col gap-4">
            <DialogContentText>
              Unesite email adrese odvojene zarezom. Podržani su i novi redovi
              te točka-zarez.
            </DialogContentText>
            <TextField
              multiline
              minRows={6}
              label="Email adrese"
              placeholder="ime@example.com, prezime@example.com"
              value={emailsInput}
              onChange={(event) => setEmailsInput(event.target.value)}
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={() => setCreateContactsDialogOpen(false)}>
            Odustani
          </LoadingButton>
          <LoadingButton
            onClick={handleCreateContacts}
            loading={isCreatingContacts}
            disabled={!emailsInput.trim()}
          >
            Dodaj
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteContactId} onClose={() => setDeleteContactId(null)}>
        <DialogTitle>Otkaži pretplatu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovime se pretplatnik uklanja iz newsletter kontakata i više neće
            primati buduće newsletter emailove.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={() => setDeleteContactId(null)}>
            Odustani
          </LoadingButton>
          <LoadingButton
            color="error"
            onClick={handleDeleteContact}
            loading={isDeletingContact}
          >
            Otkaži pretplatu
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default NewsletterPage;
