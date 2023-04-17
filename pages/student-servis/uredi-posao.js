import { LoadingButton } from "@mui/lab";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { Button, MenuItem, TextField } from "@mui/material";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { MdArrowBack } from "react-icons/md";
import Layout from "../../components/Layout";
import { Controller, useForm } from "react-hook-form";
import { useCreateJob, useJob, useUpdateJob } from "../../features/jobs";
import {
  jobTypesCategoryId,
  studentskiServisCategoryId,
} from "../../lib/constants";
import { useAdminCategories } from "../../features/posts";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import DisplayFiles from "../../components/Elements/DisplayFiles";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const UrediPosao = () => {
  const router = useRouter();
  const jobId = router.query?.id;

  const { data: categories, isLoading: isLoadingCategories } =
    useAdminCategories({
      parent: jobTypesCategoryId,
    });

  const [fromHome, setFromHome] = useState(false);

  const [files, setFiles] = useState([]);
  const [image, setImage] = useState("");

  const formOptions = {
    mode: "onChange",
    defaultValues: {
      company_name: "",
      company_oib: "",
      long_island_id: "",
      title: "",
      description: "",
      whyme: "",
      other_description: "",
      type: 0,
      skills: "",
      labels: "",
      city: "",
      positions: 1,
      work_start: "",
      work_end: "",
      work_hours: "",
      payment_rate: "",
      payment_other: "",
      active_until: null,
      contact_student: "",
      contact_sc: "",
    },
  };

  const {
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { isValid, errors },
  } = useForm(formOptions);

  const { data: job } = useJob(jobId, {
    enabled: !!jobId,
  });

  useEffect(() => {
    if (job) {
      reset({
        ...job,
        city: job.city === "FROM_HOME" ? "" : job.city,
        type: job.categories[0],
      });
      setFromHome(job.city === "FROM_HOME");
      setFiles(job.documents || []);
      setImage(job.image || "");
    }
  }, [job]);

  useEffect(() => {
    if (categories) {
      setValue("type", categories[0].id);
    }
  }, [categories]);

  const { mutate: createJob, isLoading: isCreating } = useCreateJob();
  const { mutate: updateJob, isLoading: isUpdating } = useUpdateJob();

  const onSubmit = async (data) => {
    if (jobId) {
      updateJob(
        {
          id: jobId,
          job: {
            ...data,
            city: fromHome ? "FROM_HOME" : data.city,
            categories: data.type,
            content: `${data.long_island_id} | ${data.company_name}`,
            image,
            documents:
              files.length > 0 &&
              files.map((file) => ({
                id: file.id,
                title: file.title,
                media_type: file.mediaType || file.media_type,
                mime_type: file.mimeType || file.mime_type,
                source_url: file.src || file.source_url,
              })),
          },
        },
        {
          onSuccess: () => {
            toast.success("Posao je uspješno spremljen");
          },
        }
      );
    } else {
      createJob(
        {
          ...data,
          city: fromHome ? "FROM_HOME" : data.city,
          categories: data.type,
          allowed_sc: false,
          featured: false,
          content: `${data.long_island_id} | ${data.company_name}`,
          image,
          documents:
            files.length > 0 &&
            files.map((file) => ({
              id: file.id,
              title: file.title,
              media_type: file.mediaType || file.media_type,
              mime_type: file.mimeType || file.mime_type,
              source_url: file.src || file.source_url,
            })),
        },
        {
          onSuccess: () => {
            router.back();
          },
        }
      );
    }
  };

  const [mediaDialog, setMediaDialog] = useState(false);

  const handleSelectMedia = (media) => {
    setFiles((files) => [...files, media]);
  };

  return (
    <Layout>
      <MediaSelectDialog
        opened={!!mediaDialog}
        onClose={() => setMediaDialog(false)}
        onSelect={handleSelectMedia}
        categoryId={studentskiServisCategoryId}
        mediaType="application"
      />

      <div className="px-5 md:w-2/3 lg:w-1/2 mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center font-semibold pt-12 mb-8"
        >
          <MdArrowBack className="mr-2" />
          Povratak
        </button>
        <h1 className="text-3xl font-semibold pb-10">
          {Object.keys(router.query).length > 0
            ? "Uredi posao"
            : "Dodaj novi posao"}
        </h1>
        <div className="flex flex-col gap-6 mx-auto pb-8">
          {/* LONG ISLAND ID */}
          <Controller
            control={control}
            name="long_island_id"
            render={({ field }) => (
              <TextField
                {...field}
                label="Broj narudžbe"
                error={!!errors.long_island_id}
                helperText={
                  errors.long_island_id && errors.long_island_id.message
                }
              />
            )}
          />

          {/* TVRTKA */}
          <Controller
            control={control}
            name="company_name"
            render={({ field }) => (
              <TextField
                {...field}
                label="Naručitelj (poslodavac)"
                error={!!errors.company_name}
                helperText={errors.company_name && errors.company_name.message}
              />
            )}
          />

          {/* COMPANY OIB */}
          <Controller
            control={control}
            name="company_oib"
            render={({ field }) => (
              <TextField
                {...field}
                label="Šifra ili OIB naručitelja"
                error={!!errors.company_oib}
                helperText={errors.company_oib && errors.company_oib.message}
              />
            )}
          />

          {/* NAZIV */}
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextField
                {...field}
                label="Naziv posla"
                error={!!errors.title}
                helperText={errors.title && errors.title.message}
              />
            )}
          />

          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Vrsta posla"
                error={!!errors.type}
                helperText={errors.type && errors.type.message}
              >
                {isLoadingCategories ? (
                  <MenuItem value={0}>Učitavanje...</MenuItem>
                ) : (
                  categories?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}
          />

          {/* MJESTO */}
          <div className="flex flex-col">
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Adresa obavljanja posla"
                  disabled={fromHome}
                  error={!!errors.city}
                  helperText={errors.city && errors.city.message}
                />
              )}
            />
          </div>

          {/* POČETAK I KRAJ RADA */}
          <div className="flex gap-4">
            <div className="flex flex-col flex-1">
              <Controller
                control={control}
                name="work_start"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Početak rada"
                    error={!!errors.work_start}
                    helperText={errors.work_start && errors.work_start.message}
                  />
                )}
              />
            </div>
            <div className="flex flex-col flex-1">
              <Controller
                control={control}
                name="work_end"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Očekivano trajanje posla"
                    error={!!errors.work_end}
                    helperText={errors.work_end && errors.work_end.message}
                  />
                )}
              />
            </div>
          </div>

          {/* SATNICA */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col flex-1">
              <Controller
                control={control}
                name="payment_rate"
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={
                      "Neto cijena sata ili količina posla (za redoviti rad)"
                    }
                    error={!!errors.payment_rate}
                    helperText={
                      errors.payment_rate && errors.payment_rate.message
                    }
                  />
                )}
              />
            </div>
            <div className="flex flex-col flex-1">
              <Controller
                control={control}
                name="positions"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Potreban broj izvođača (studenata/ica)"
                    type={"number"}
                    inputProps={{ min: 1 }}
                    error={!!errors.positions}
                    helperText={errors.positions && errors.positions.message}
                  />
                )}
              />
            </div>
          </div>

          {/* DRUGE NAKNADE */}
          <Controller
            control={control}
            name="payment_other"
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={"Druge naknade (putni troškovi, hrana, smještaj i dr.)"}
                error={!!errors.payment_other}
                helperText={
                  errors.payment_other && errors.payment_other.message
                }
              />
            )}
          />

          <Controller
            control={control}
            name="work_hours"
            render={({ field }) => (
              <TextField
                {...field}
                label="Radno vrijeme"
                error={!!errors.work_hours}
                helperText={errors.work_hours && errors.work_hours.message}
              />
            )}
          />

          {/* TRAJANJE PRIJAVA */}
          <Controller
            control={control}
            name="active_until"
            render={({ field }) => (
              <MobileDatePicker
                {...field}
                label="Trajanje prijava do"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!!errors.active_until}
                    helperText={
                      errors.active_until && errors.active_until.message
                    }
                  />
                )}
              />
            )}
          />

          {/* OPIS POSLA */}
          <div>
            <h3 className="mb-2">Opis posla</h3>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <QuillTextEditor {...field} placeholder="Unesi opis posla..." />
              )}
            />
            {!!errors.description && (
              <span className="text-sm text-error pl-2 mt-1">
                {errors.description.message}
              </span>
            )}
          </div>

          {/* WHY ME */}
          <div>
            <h3 className="mb-2">Zašto tražimo tebe?</h3>
            <Controller
              control={control}
              name="whyme"
              render={({ field }) => (
                <QuillTextEditor
                  {...field}
                  placeholder="Unesi zašto tražimo tebe..."
                />
              )}
            />
            {!!errors.whyme && (
              <span className="text-sm text-error pl-2 mt-1">
                {errors.whyme.message}
              </span>
            )}
          </div>

          {/* OTHER DESCRIPTION */}
          <div>
            <h3 className="mb-2">Ostale napomene i uvjeti</h3>
            <Controller
              control={control}
              name="other_description"
              render={({ field }) => (
                <QuillTextEditor
                  {...field}
                  placeholder="Unesi ostale napomene i uvjete..."
                />
              )}
            />
            {!!errors.other_description && (
              <span className="text-sm text-error pl-2 mt-1">
                {errors.other_description.message}
              </span>
            )}
          </div>

          {/* SLIKA */}
          <div>
            <h3>Slika</h3>
            <SelectMediaInput
              defaultValue={image}
              onChangeSrc={setImage}
              mediaCategoryId={studentskiServisCategoryId}
            />
            {!!image && (
              <Button className="!mt-1" onClick={() => setImage("")}>
                Obriši odabir
              </Button>
            )}
          </div>

          {/* DATOTEKE */}
          <div>
            <h3>Datoteke</h3>
            <button
              className="mt-2 w-full p-4 bg-secondary rounded-lg border border-black/20 hover:border-black text-black/60"
              onClick={() => setMediaDialog(true)}
            >
              Odaberi datoteku
            </button>
            <DisplayFiles files={files} setFiles={setFiles} className="mt-2" />
          </div>

          {/* SKILLS */}
          <Controller
            control={control}
            name="skills"
            render={({ field }) => (
              <TextField
                {...field}
                label="Obavezna znanja"
                error={!!errors.skills}
                helperText={errors.skills && errors.skills.message}
              />
            )}
          />

          {/* LABELS */}
          <Controller
            control={control}
            name="labels"
            render={({ field }) => (
              <TextField
                {...field}
                label="Poželjne vještine"
                error={!!errors.labels}
                helperText={errors.labels && errors.labels.message}
              />
            )}
          />

          <div>
            <h3 className="mb-2">Način i kontakt za prijavu studenata</h3>
            <Controller
              control={control}
              name="contact_student"
              render={({ field }) => (
                <QuillTextEditor {...field} placeholder="Unesi kontakt..." />
              )}
            />
            {!!errors.contact_student && (
              <span className="text-sm text-error pl-2 mt-1">
                {errors.contact_student.message}
              </span>
            )}
          </div>

          <Controller
            control={control}
            name="contact_sc"
            render={({ field }) => (
              <TextField
                {...field}
                label="Kontakt za Student servis (osoba, tel./e-mail)"
                error={!!errors.contact_sc}
                helperText={errors.contact_sc && errors.contact_sc.message}
              />
            )}
          />

          <LoadingButton
            variant="contained"
            size="large"
            className={clsx(
              "self-end bg-primary"
              // !loading &&
              //   "!border-primary/50 hover:!border-primary hover:!bg-primary/5 !text-primary"
            )}
            loading={isCreating || isUpdating}
            disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
          >
            {Object.keys(router.query).length > 0 ? "Spremi" : "Objavi posao"}
          </LoadingButton>
        </div>
      </div>
    </Layout>
  );
};

export default UrediPosao;
