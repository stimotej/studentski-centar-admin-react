import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MdArrowBack } from "react-icons/md";
import InputLabel from "../Elements/InputLabel";
import AlergeniDialog from "./AlergeniDialog";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, InputAdornment, MenuItem, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useCreateProduct, useUpdateProduct } from "../../features/products";
import { useCreateMedia } from "../../features/media";
import { prehranaCategoryId, userGroups } from "../../lib/constants";
import MediaSelectDialog from "../MediaSelectDialog";
import Image from "next/image";

const schema = yup.object().shape({
  name: yup.string().required("Ovo polje je obavezno"),
  price: yup
    .number()
    .typeError("Mora biti broj")
    .required("Ovo polje je obavezno"),
});

const ProductForm = ({ product }) => {
  const formOptions = {
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      image:
        !!product?.image && product?.image !== "false"
          ? { src: product?.image }
          : "",
      price: product?.price || "",
      stockStatus: product?.stock || "instock",
      allergens: product?.allergens || "",
      weight: product?.weight || "",
    },
  };

  const {
    handleSubmit,
    control,
    formState: { isValid, errors },
    setValue,
    watch,
  } = useForm(formOptions);

  const image = watch("image");

  const [mediaDialog, setMediaDialog] = useState(false);

  const handleSelectMedia = (value) => {
    setValue("image", value, { shouldValidate: true });
  };

  const [showAlergeniDialog, setShowAlergeniDialog] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, [router]);

  const { mutate: createMedia, isLoading: isCreatingMedia } = useCreateMedia();
  const { mutate: createProduct, isLoading: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isLoading: isUpdating } = useUpdateProduct();

  const onSubmit = async (data) => {
    const newProduct = {
      ...data,
      stock: data.stockStatus,
      allergens: data.allergens,
      price: data.price.toString(),
      weight: data.weight.toString(),
      image: image.id ?? undefined,
    };

    if (product) {
      updateProduct(
        { id: product.id, ...newProduct },
        {
          onSuccess: () => {
            router.push("/prehrana/proizvodi");
          },
        }
      );
    } else {
      createProduct(newProduct, {
        onSuccess: () => {
          router.push("/prehrana/proizvodi");
        },
      });
    }
  };

  return (
    <div className="px-5 md:w-2/3 lg:w-1/2 mx-auto">
      <Link
        href="/prehrana/proizvodi"
        passHref
        className="flex items-center font-semibold pt-12 mb-8"
      >
        <MdArrowBack className="mr-2" />
        Povratak
      </Link>
      <h1 className="text-3xl font-semibold pb-10">
        {product ? "Uredi proizvod" : "Dodaj novi proizvod"}
      </h1>
      <div className="flex flex-col gap-6 mx-auto pb-8">
        {/* NAZIV */}
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              {...field}
              label="Naziv"
              error={!!errors.name}
              helperText={errors.name && errors.name.message}
            />
          )}
        />

        {/* OPIS */}
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              {...field}
              label="Opis"
              multiline
              minRows={3}
              error={!!errors.description}
              helperText={errors.description && errors.description.message}
            />
          )}
        />

        {/* SLIKA */}
        <MediaSelectDialog
          opened={mediaDialog}
          onClose={() => setMediaDialog(false)}
          value={image}
          onSelect={handleSelectMedia}
          categoryId={prehranaCategoryId}
        />
        <div className="flex flex-col gap-1">
          <InputLabel text="Slika" />
          <button
            className="w-full bg-secondary rounded-lg border border-black/20 hover:border-black text-black/60"
            onClick={() => setMediaDialog("featuredImage")}
          >
            {image?.src ? (
              <Image
                src={image?.src}
                alt={image?.alt}
                width={image?.width || 50}
                height={image?.height || 50}
                layout="responsive"
                className="rounded-lg"
                objectFit="cover"
              />
            ) : (
              <div className="py-4">Odaberi sliku</div>
            )}
          </button>
        </div>

        {/* SLIKA */}
        {/* <div className="flex flex-col gap-1">
          <InputLabel text="Slika" />
          {/* <MediaFileInput value={image} onChange={(value) => setImage(value)} /> *}
          <Controller
            control={control}
            name="image"
            render={({ field }) => <MediaFileInput {...field} />}
          />
        </div> */}

        {/* CIJENA */}
        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <TextField
              {...field}
              label="Cijena"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">€</InputAdornment>,
              }}
              error={!!errors.price}
              helperText={errors.price && errors.price.message}
            />
          )}
        />

        {/* STATUS ZALIHE */}
        <Controller
          control={control}
          name="stockStatus"
          render={({ field }) => (
            <TextField {...field} label="Status zalihe" select>
              <MenuItem value="instock">Na zalihi</MenuItem>
              <MenuItem value="outofstock">Nema na zalihi</MenuItem>
            </TextField>
          )}
        />

        {/* ALERGENI */}
        <div className="flex flex-col gap-2">
          <Controller
            control={control}
            name="allergens"
            render={({ field }) => (
              <TextField
                {...field}
                label="Alergeni"
                helperText="Unesite alergene odvojene zarezom"
              />
            )}
          />
          <Button
            type="button"
            className="text-sm !text-primary hover:!bg-primary/5 self-end"
            onClick={() => setShowAlergeniDialog(true)}
          >
            Popis alergena
          </Button>
          <AlergeniDialog
            showAlergeniDialog={showAlergeniDialog}
            setShowAlergeniDialog={setShowAlergeniDialog}
          />
        </div>

        {/* TEŽINA */}
        <Controller
          control={control}
          name="weight"
          render={({ field }) => (
            <TextField
              {...field}
              label="Težina"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">g</InputAdornment>,
              }}
              error={!!errors.weight}
              helperText={errors.weight && errors.weight.message}
            />
          )}
        />

        <LoadingButton
          size="large"
          variant="contained"
          className="self-end bg-primary"
          loading={isCreating || isCreatingMedia || isUpdating}
          disabled={!isValid}
          onClick={handleSubmit(onSubmit)}
        >
          {product ? "Spremi" : "Dodaj"}
        </LoadingButton>
      </div>
    </div>
  );
};

export default ProductForm;
