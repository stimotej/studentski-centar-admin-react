import { LoadingButton } from "@mui/lab";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import {
  Autocomplete,
  Checkbox,
  createFilterOptions,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { MdArrowBack } from "react-icons/md";
import Layout from "../../components/Layout";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import {
  useCompanies,
  useCreateJob,
  useJob,
  useSkills,
  useUpdateJob,
} from "../../features/jobs";

const schema = yup.object().shape({
  company_name: yup.string().required("Ovo polje je obavezno"),
  company_oib: yup.string().required("Ovo polje je obavezno"),
  title: yup.string().required("Ovo polje je obavezno"),
  type: yup.number("Mora biti broj").required("Ovo polje je obavezno"),
  description: yup.string().required("Ovo polje je obavezno"),
  positions: yup
    .number()
    .typeError("Mora biti broj")
    .min(1, "Mora biti barem jedna otvorena pozicija")
    .required("Ovo polje je obavezno"),
  work_start: yup
    .date()
    .typeError("Mora biti datum")
    .required("Ovo polje je obavezno"),
  work_end: yup
    .date()
    .typeError("Mora biti datum")
    .required("Ovo polje je obavezno"),
  work_hours: yup
    .number()
    .typeError("Mora biti broj")
    .min(1, "Mora biti barem 1 sat")
    .required("Ovo polje je obavezno"),
  payment_rate: yup
    .number()
    .typeError("Mora biti broj")
    .min(4.38, "Mora biti barem 4.38 €/sat")
    .required("Ovo polje je obavezno"),
  payment_rate_max: yup
    .number()
    .typeError("Mora biti broj")
    .min(4.38, "Mora biti barem 4.38 €/sat")
    .required("Ovo polje je obavezno"),
  active_until: yup
    .date()
    .typeError("Mora biti datum")
    .required("Ovo polje je obavezno"),
});

const jobTypeList = [
  { value: "1", label: "Administrativni poslovi" },
  { value: "2", label: "Fizički poslovi" },
  { value: "3", label: "Poslovi čišćenja" },
  { value: "4", label: "Promidžba; Marketing" },
  { value: "5", label: "Rad u proizvodnji" },
  { value: "6", label: "Razni poslovi" },
  { value: "7", label: "Skladišni poslovi" },
  { value: "8", label: "Trgovina; Ugostiteljstvo" },
];

const UrediPosao = () => {
  const router = useRouter();
  const jobId = router.query?.id;

  const { data: skills, isLoading: loadingSkills } = useSkills();
  const { data: companies, isLoading: loadingCompanies } = useCompanies();

  const [jobType, setJobType] = useState(1);
  const [fromHome, setFromHome] = useState(false);
  const [rate, setRate] = useState(0);

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      company_name: "",
      company_oib: "",
      title: "",
      description: "",
      whyme: "",
      other_description: "",
      type: 1,
      skills: [],
      labels: [],
      city: "",
      positions: 1,
      work_start: null,
      work_end: null,
      work_hours: "",
      payment_rate: "",
      payment_rate_max: "",
      active_until: null,
      contact_student: "",
      contact_sc: "",
    },
  };

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { isValid, errors },
  } = useForm(formOptions);

  const values = watch();

  const { data: job, isInitialLoading: isLoadingJob } = useJob(jobId, {
    enabled: !!jobId,
  });

  useEffect(() => {
    if (job) {
      reset({ ...job, city: job.city === "FROM_HOME" ? "" : job.city });
      setJobType(job.job_type);
      setFromHome(job.city === "FROM_HOME");
      setRate(job.payment_rate !== job.payment_rate_max ? 1 : 0);
    }
  }, [job]);

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
            job_type: jobType,
          },
        },
        {
          onSuccess: () => {
            router.back();
          },
        }
      );
    } else {
      createJob(
        {
          ...data,
          city: fromHome ? "FROM_HOME" : data.city,
          job_type: jobType,
        },
        {
          onSuccess: () => {
            router.back();
          },
        }
      );
    }
  };

  return (
    <Layout>
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
          {/* TVRTKA */}
          <Controller
            control={control}
            name="company_name"
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={undefined}
                onInputChange={(_, value) => field.onChange(value)}
                getOptionLabel={(option) => option || ""}
                filterOptions={createFilterOptions({
                  limit: 20,
                })}
                freeSolo
                options={companies?.map((company) => company.short_name) ?? []}
                loading={loadingCompanies}
                renderOption={(props, option) => (
                  <li {...props} key={option + Math.random().toString()}>
                    {option}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Naručitelj (poslodavac)"
                    error={!!errors.company_name}
                    helperText={
                      errors.company_name && errors.company_name.message
                    }
                  />
                )}
              />
            )}
          />

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

          {/* KATEGORIJA */}
          {/* <Controller
            control={control}
            name="jobType"
            render={({ field }) => (
              <TextField select label="Kategorija">
                {types.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {options[option.name]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          /> */}

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
                {jobTypeList.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {/* VRSTA POSLA */}
          <div>
            <div className="flex mt-1 gap-2 flex-wrap">
              <button
                onClick={() => setJobType(1)}
                className={clsx(
                  "border-[#ebebeb] border-[1px] py-2 px-4 rounded-[24px] transition",
                  jobType === 1 && "bg-primary text-white"
                )}
              >
                <span className="body">Privremeni posao</span>
              </button>
              <button
                onClick={() => setJobType(2)}
                className={clsx(
                  "border-[#ebebeb] border-[1px] py-2 px-4 rounded-[24px] transition",
                  jobType === 2 && "bg-primary text-white"
                )}
              >
                <span className="body">Projekt</span>
              </button>
            </div>
          </div>

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
            <FormControlLabel
              className="!ml-1 mt-1"
              control={<Checkbox />}
              checked={fromHome}
              onChange={(e) => setFromHome(e.target.checked)}
              label="Rad na daljinu"
            />
          </div>

          {/* POČETAK I KRAJ RADA */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col">
                <Controller
                  control={control}
                  name="work_start"
                  render={({ field }) => (
                    <MobileDatePicker
                      {...field}
                      onChange={(date) => {
                        field.onChange(date);
                        setValue("work_end", date, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setValue("active_until", date, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      label="Početak rada"
                      minDate={dayjs().startOf("day")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errors.work_start}
                          helperText={
                            errors.work_start && errors.work_start.message
                          }
                        />
                      )}
                    />
                  )}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <Controller
                  control={control}
                  name="work_end"
                  render={({ field }) => (
                    <MobileDatePicker
                      {...field}
                      label="Kraj rada"
                      minDate={values.work_start || dayjs().startOf("day")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errors.work_end}
                          helperText={
                            errors.work_end && errors.work_end.message
                          }
                        />
                      )}
                    />
                  )}
                />
              </div>
            </div>
          </LocalizationProvider>

          {/* SATNICA */}
          <div>
            <span className="ml-1 mt-3">Satnica</span>
            <div className="flex mt-1 gap-2 flex-wrap">
              <button
                onClick={() => setRate(0)}
                className={clsx(
                  "border-[#ebebeb] border-[1px] py-2 px-4 rounded-[24px] transition",
                  rate === 0 && "bg-primary text-white"
                )}
              >
                <span className="body">Fiksna satnica</span>
              </button>
              <button
                onClick={() => setRate(1)}
                className={clsx(
                  "border-[#ebebeb] border-[1px] py-2 px-4 rounded-[24px] transition",
                  rate === 1 && "bg-primary text-white"
                )}
              >
                <span className="body">Raspon satnice</span>
              </button>
            </div>
            <div className="flex mt-4 gap-4 flex-wrap">
              <div className="flex-1 flex flex-col">
                <Controller
                  control={control}
                  name="payment_rate"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        rate === 0 &&
                          setValue("payment_rate_max", e.target.value);
                      }}
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">€</InputAdornment>
                        ),
                      }}
                      label={
                        rate === 0
                          ? "Neto cijena sata ili količina posla (za redoviti rad)"
                          : "Minimalna satnica"
                      }
                      error={!!errors.payment_rate}
                      helperText={
                        errors.payment_rate && errors.payment_rate.message
                      }
                    />
                  )}
                />
              </div>
              {rate === 1 && (
                <div className="flex-1 flex flex-col">
                  <Controller
                    control={control}
                    name="payment_rate_max"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Maksimalna satnica"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">€</InputAdornment>
                          ),
                        }}
                        error={!!errors.payment_rate_max}
                        helperText={
                          errors.payment_rate_max &&
                          errors.payment_rate_max.message
                        }
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col flex-1">
              <Controller
                control={control}
                name="work_hours"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Broj sati"
                    error={!!errors.work_hours}
                    helperText={errors.work_hours && errors.work_hours.message}
                  />
                )}
              />
            </div>

            {/* BROJ OTVORENIH POZICIJA */}
            <div className="flex-1">
              <div className="flex flex-col flex-1">
                <Controller
                  control={control}
                  name="positions"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Potreban broj izvođača (studenata/ica)"
                      error={!!errors.positions}
                      helperText={errors.positions && errors.positions.message}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* TRAJANJE PRIJAVA */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
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
          </LocalizationProvider>

          {/* OPIS POSLA */}
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                minRows={5}
                label="Opis posla"
                error={!!errors.description}
                helperText={errors.description && errors.description.message}
              />
            )}
          />

          {/* WHY ME */}
          <Controller
            control={control}
            name="whyme"
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                minRows={5}
                label="Zašto tražimo tebe?"
                error={!!errors.whyme}
                helperText={errors.whyme && errors.whyme.message}
              />
            )}
          />

          <Controller
            control={control}
            name="other_description"
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                minRows={5}
                label="Ostale napomene i uvjeti"
                error={!!errors.other_description}
                helperText={
                  errors.other_description && errors.other_description.message
                }
              />
            )}
          />

          {/* SKILLS */}
          <Controller
            control={control}
            name="skills"
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={(_, value) => field.onChange(value)}
                multiple
                options={skills ?? []}
                loading={loadingSkills}
                filterSelectedOptions
                freeSolo
                renderOption={(props, option) => (
                  <li {...props} key={option + Math.random().toString()}>
                    {option}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Obavezna znanja"
                    placeholder="Unesi znanje"
                  />
                )}
              />
            )}
          />

          {/* LABELS */}
          <Controller
            control={control}
            name="labels"
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={(_, value) => field.onChange(value)}
                multiple
                options={skills ?? []}
                loading={loadingSkills}
                filterSelectedOptions
                freeSolo
                renderOption={(props, option) => (
                  <li {...props} key={option + Math.random().toString()}>
                    {option}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Poželjne vještine"
                    placeholder="Unesi vještinu"
                  />
                )}
              />
            )}
          />

          <Controller
            control={control}
            name="contact_student"
            render={({ field }) => (
              <TextField
                {...field}
                label="Način i kontakt za prijavu studenata"
                error={!!errors.contact_student}
                helperText={
                  errors.contact_student && errors.contact_student.message
                }
              />
            )}
          />

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
