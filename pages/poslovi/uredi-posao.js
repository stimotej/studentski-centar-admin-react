import { LoadingButton } from "@mui/lab";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useState } from "react";
import { MdArrowBack } from "react-icons/md";
import Layout from "../../components/Layout";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useJobs } from "../../lib/api/jobs";
import { useSkills } from "../../lib/api/skills";
import { useCompanies } from "../../lib/api/companies";
import { toast } from "react-toastify";
import axios from "axios";

const options = {
  ALL_JOBS: "Svi Poslovi",
  NEW_JOBS: "Novi Poslovi",
  JOBS_FOR_ME: "Za mene",
  MY_JOBS: "Moji Poslovi",

  XP_REQUIRED: "Potrebno iskustvo",
  NO_XP_REQUIRED: "Nije potrebno iskustvo",
  LONG_TERM: "Dugoročni posao",
  SHORT_TERM: "Kratkoročni posao",
  DRIVING_LICENSE: "Vozačka dozvola",
  FOREIGN_LANGUAGE: "Znanje stranog jezika",
  IT_KNOWLEDGE: "Informatičko znanje",
  FIXED_HOURS: "Fiksno radno vrijeme",
  FLEXIBLE_HOURS: "Fleksibilno radno vrijeme",
  EXPERIENCES_OF_WORKING_WITH_CHILDREN_WITH_DISABILITIES:
    "Iskustva rada s djecom s teškoćama",

  ADMIN_OFFICE: "Administrativni i uredski poslovi",
  PHYSICAL: "Fizički poslovi",
  IT: "IT poslovi",
  PRODUCTION_WAREHOUSE: "Proizvodnja i rad u skladištu",
  TRAFFIC_TRANSPORT: "Promet i transport",
  CARE_SOCIAL_SERVICE: "Skrb i socijalne usluge",
  COMMERCE: "Trgovina",
  TOURISM_CATERING: "Turizam i ugostiteljstvo",
  PROMOTION_SALES: "Promidžba i prodaja",
  OTHER: "Ostali poslovi",

  JOB_CREATE_SUCCESS: "Posao uspješno objavljen",
  JOB_CREATE_ERROR: "Dogodila se greška u objavi posla",

  JOB_START: "Početak rada",
  JOB_END: "Kraj rada",
  EST_PAYMANT: "Očekivana zarada",
  ABOUT_EMPLOYE: "O poslodavcu",
  DETAILS: "Detalji",
  DAYS: "dana",
  DAY: "dan",

  APP_ACTIVE: "Prijava čeka odgovor",
  APP_INACTIVE: "Prijava nije aktivna",
  APP_ACCEPTED: "Prijava prihvaćena",
  APP_REJECTED: "Prijava odbijena",
};

const schema = yup.object().shape({
  company_name: yup.string().required("Ovo polje je obavezno"),
  title: yup.string().required("Ovo polje je obavezno"),
  description: yup.string().required("Ovo polje je obavezno"),
  type: yup.number("Mora biti broj").required("Ovo polje je obavezno"),
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
    .min(29.3, "Mora biti barem 29.30 kn/sat")
    .required("Ovo polje je obavezno"),
  payment_rate_max: yup
    .number()
    .typeError("Mora biti broj")
    .min(29.3, "Mora biti barem 29.30 kn/sat")
    .required("Ovo polje je obavezno"),
  active_until: yup
    .date()
    .typeError("Mora biti datum")
    .required("Ovo polje je obavezno"),
});
const UrediPosao = () => {
  const router = useRouter();
  const job = router.query?.job;

  const { skills, loading: loadingSkills } = useSkills();
  const { companies, loading: loadingCompanies } = useCompanies();

  const [type, setType] = useState(0);
  const [fromHome, setFromHome] = useState(false);
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(false);

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      company_name: (job?.company?.short_name || job?.company_name) ?? "",
      title: job?.title ?? "",
      description: job?.description ?? "",
      whyme: job?.whyme ?? "",
      type: job?.type ?? 1,
      skills: job?.skills ?? [],
      labels: job?.labels ?? [],
      city: job?.city ?? "",
      positions: job?.positions ?? 1,
      work_start: job?.work_start ?? null,
      work_end: job?.work_end ?? null,
      work_hours: job?.work_hours ?? "",
      payment_rate: job?.payment_rate ?? "",
      payment_rate_max: job?.payment_rate_max ?? "",
      active_until: job?.active_until ?? null,
    },
  };

  const {
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { isValid, errors },
  } = useForm(formOptions);

  const values = watch();

  const { setJobs } = useJobs();

  const onSubmit = async (data) => {
    console.log("onSubit data", data);
    setLoading(true);
    try {
      const newJob = await axios.post(
        "https://api.spajalica.hr/v2/jobs/admin",
        { ...data, city: data.city || "FROM_HOME" }
      );
      console.log("New job: ", newJob);
      setJobs();
      router.back();
    } catch (err) {
      console.log("err", err.response);
      toast.error("Greška prilikom objave posla");
    } finally {
      setLoading(false);
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
                    label="Poslodavac"
                    error={!!errors.company_name}
                    helperText={
                      errors.company_name && errors.company_name.message
                    }
                  />
                )}
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
                label="Naziv"
                error={!!errors.title}
                helperText={errors.title && errors.title.message}
              />
            )}
          />

          {/* KATEGORIJA */}
          {/* <Controller
            control={control}
            name="type"
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

          {/* VRSTA POSLA */}
          <div>
            <span className="ml-1 mt-3">Vrsta posla</span>
            <div className="flex mt-1 gap-2 flex-wrap">
              <button
                onClick={() => setType(0)}
                className={clsx(
                  "border-[#ebebeb] border-[1px] py-2 px-4 rounded-[24px] transition",
                  type === 0 && "bg-primary text-white"
                )}
              >
                <span className="body">Privremeni posao</span>
              </button>
              <button
                onClick={() => setType(1)}
                className={clsx(
                  "border-[#ebebeb] border-[1px] py-2 px-4 rounded-[24px] transition",
                  type === 1 && "bg-primary text-white"
                )}
              >
                <span className="body">Stalni posao</span>
              </button>
              <button
                onClick={() => setType(2)}
                className={clsx(
                  "border-[#ebebeb] border-[1px] py-2 px-4 rounded-[24px] transition",
                  type === 2 && "bg-primary text-white"
                )}
              >
                <span className="body">Praksa</span>
              </button>
              <button
                onClick={() => setType(3)}
                className={clsx(
                  "border-[#ebebeb] border-[1px] py-2 px-4 rounded-[24px] transition",
                  type === 3 && "bg-primary text-white"
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
                  label="Mjesto"
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
            <div className="flex mt-3 gap-4">
              <div className="flex-1 flex flex-col">
                <Controller
                  control={control}
                  name="payment_rate"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue("payment_rate_max", e.target.value);
                      }}
                      label={rate === 0 ? "Satnica" : "Minimalna satnica"}
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
              <div className="flex-1 flex flex-col">
                <Controller
                  control={control}
                  name="work_hours"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Broj sati"
                      error={!!errors.work_hours}
                      helperText={
                        errors.work_hours && errors.work_hours.message
                      }
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* BROJ OTVORENIH POZICIJA */}
          <Controller
            control={control}
            name="positions"
            render={({ field }) => (
              <TextField
                {...field}
                label="Broj otvorenih pozicija"
                error={!!errors.positions}
                helperText={errors.positions && errors.positions.message}
              />
            )}
          />

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

          {/* LABELS */}
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
                    placeholder="Favorites"
                  />
                )}
              />
            )}
          />

          {/* SKILLS */}
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
                    placeholder="Favorites"
                  />
                )}
              />
            )}
          />

          <LoadingButton
            variant="outlined"
            className={clsx(
              "self-end",
              !loading &&
                "!border-primary/50 hover:!border-primary hover:!bg-primary/5 !text-primary"
            )}
            loading={loading}
            disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
          >
            {Object.keys(router.query).length > 0 ? "Spremi" : "Objavi"}
          </LoadingButton>
        </div>
      </div>
    </Layout>
  );
};

export default UrediPosao;
