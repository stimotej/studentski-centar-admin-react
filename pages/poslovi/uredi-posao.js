import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { MdArrowBack } from "react-icons/md";
import Layout from "../../components/Layout";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object().shape({
  title: yup.string().required("Ovo polje je obavezno"),
  location: yup.string().required("Ovo polje je obavezno"),
});

const UrediPosao = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      title: router.query?.title || "",
      location: router.query?.title || "",
    },
  };

  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { isValid, isSubmitting, errors },
  } = useForm(formOptions);

  const onSubmit = async (data) => {
    console.log("onSubit data", data);
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

          {/* OPIS */}
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <TextField
                {...field}
                label="Lokacija"
                error={!!errors.location}
                helperText={errors.location && errors.location.message}
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
