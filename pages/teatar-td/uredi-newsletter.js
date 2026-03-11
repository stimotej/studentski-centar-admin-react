import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { LoadingButton } from "@mui/lab";
import { Alert, Paper, TextField } from "@mui/material";
import { MdArrowBack } from "react-icons/md";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import { teatarTdCategoryId } from "../../lib/constants";
import {
  useCreateNewsletterBroadcast,
  useNewsletterBroadcast,
  useUpdateNewsletterBroadcast,
} from "../../features/newsletter";

const EmailEditor = dynamic(() => import("react-email-editor"), {
  ssr: false,
});

const canEditBroadcast = (status) => !["sent"].includes(status);
const resendMergeTags = {
  first_name: {
    name: "Ime",
    value: "{{{FIRST_NAME|}}}",
    sample: "Ana",
  },
  last_name: {
    name: "Prezime",
    value: "{{{LAST_NAME|}}}",
    sample: "Anić",
  },
  email: {
    name: "Email",
    value: "{{{EMAIL}}}",
    sample: "ana@example.com",
  },
  unsubscribe_url: {
    name: "Link za odjavu",
    value: "{{{RESEND_UNSUBSCRIBE_URL}}}",
    sample: "https://resend.dev/unsubscribe/example",
  },
};

const NewsletterEditorPage = () => {
  const router = useRouter();
  const broadcastId = router.query?.id;
  const emailEditorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const designLoadedRef = useRef(false);
  const imageDoneRef = useRef(null);

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subject: "",
  });

  const {
    data: broadcast,
    isInitialLoading: isLoadingBroadcast,
    isError: isBroadcastError,
    refetch: refetchBroadcast,
  } = useNewsletterBroadcast(broadcastId);

  const { mutate: createBroadcast, isLoading: isCreating } =
    useCreateNewsletterBroadcast();
  const { mutate: updateBroadcast, isLoading: isUpdating } =
    useUpdateNewsletterBroadcast();
  const isReadOnly =
    !!broadcastId && !!broadcast && !canEditBroadcast(broadcast.status);

  useEffect(() => {
    if (!broadcast) return;

    setForm({
      name: broadcast.name || "",
      subject: broadcast.subject || "",
    });
  }, [broadcast]);

  useEffect(() => {
    if (!broadcastId) {
      designLoadedRef.current = false;
    }
  }, [broadcastId]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (!broadcast?.design) return;
    if (designLoadedRef.current) return;

    editorInstanceRef.current?.loadDesign(broadcast.design);
    designLoadedRef.current = true;
  }, [broadcast, isEditorReady]);

  const handleSelectImage = (media) => {
    if (isReadOnly) return;

    const url = media?.src || media?.source_url;
    if (!url) return;

    imageDoneRef.current?.({ url });
    imageDoneRef.current = null;
    setMediaDialogOpen(false);
  };

  const handleSave = () => {
    if (isReadOnly) return;

    if (!editorInstanceRef.current) {
      toast.error("Email editor još nije spreman.");
      return;
    }

    editorInstanceRef.current.exportHtml((data) => {
      const payload = {
        ...form,
        html: data.html,
        design: data.design,
      };

      if (broadcastId) {
        updateBroadcast(
          {
            id: broadcastId,
            ...payload,
          },
          {
            onSuccess: () => {
              router.push("/teatar-td/newsletter");
            },
          },
        );
      } else {
        createBroadcast(payload, {
          onSuccess: () => {
            router.push("/teatar-td/newsletter");
          },
        });
      }
    });
  };

  const onLoad = (editor) => {
    editorInstanceRef.current = editor;
    if (!isReadOnly) {
      editor.registerCallback("selectImage", (data, done) => {
        imageDoneRef.current = done;
        setMediaDialogOpen(true);
      });
    }
  };

  const onReady = () => {
    setIsEditorReady(true);
  };

  return (
    <Layout>
      <MediaSelectDialog
        opened={mediaDialogOpen}
        onClose={() => {
          setMediaDialogOpen(false);
          imageDoneRef.current = null;
        }}
        onSelect={handleSelectImage}
        categoryId={teatarTdCategoryId}
      />

      <div className="px-5 md:px-10 py-10">
        <button
          onClick={() => router.push("/teatar-td/newsletter")}
          className="flex items-center font-semibold mb-8"
        >
          <MdArrowBack className="mr-2" />
          Povratak na newsletter
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">
            {broadcastId
              ? isReadOnly
                ? "Detalji newslettera"
                : "Uredi newsletter"
              : "Novi newsletter"}
          </h1>
          {!isReadOnly ? (
            <LoadingButton
              onClick={handleSave}
              loading={isCreating || isUpdating}
              variant="contained"
              color="primary"
              disabled={isLoadingBroadcast || !isEditorReady || !form.subject}
              className={
                isCreating ||
                isUpdating ||
                isLoadingBroadcast ||
                !isEditorReady ||
                !form.subject
                  ? "!bg-gray-200 !shadow-none"
                  : "!bg-primary hover:!bg-primary"
              }
            >
              Spremi email
            </LoadingButton>
          ) : null}
        </div>

        {isBroadcastError ? (
          <div className="mb-6">
            <Alert
              severity="error"
              action={
                <LoadingButton onClick={() => refetchBroadcast()}>
                  Pokušaj ponovno
                </LoadingButton>
              }
            >
              Greška kod učitavanja newsletter emaila.
            </Alert>
          </div>
        ) : null}

        <div className="mb-6">
          <Alert severity="info">
            {isReadOnly
              ? "Ovaj newsletter nije moguće uređivati. Prikazan je samo za pregled."
              : "U editoru možete koristiti varijable za ime, prezime, email i link za odjavu pretplate."}
          </Alert>
        </div>

        <Paper className="p-5 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <TextField
              label="Interni naziv"
              value={form.name}
              disabled={isReadOnly}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
            <TextField
              label="Predmet"
              value={form.subject}
              required
              disabled={isReadOnly}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
            />
          </div>
        </Paper>

        <Paper className="overflow-hidden">
          {isLoadingBroadcast && !!broadcastId ? (
            <div className="p-6">Učitavanje newsletter editora...</div>
          ) : isReadOnly ? (
            <iframe
              title="Pregled newslettera"
              srcDoc={broadcast?.html || ""}
              className="min-h-[75vh] w-full border-0 bg-white"
            />
          ) : (
            <EmailEditor
              ref={emailEditorRef}
              onLoad={onLoad}
              onReady={onReady}
              minHeight="75vh"
              options={{
                features: {
                  preview: true,
                },
                mergeTags: resendMergeTags,
              }}
            />
          )}
        </Paper>
      </div>
    </Layout>
  );
};

export default NewsletterEditorPage;
