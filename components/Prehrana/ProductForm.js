import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MdArrowBack } from "react-icons/md";
import InputLabel from "../Elements/InputLabel";
import AlergeniDialog from "./AlergeniDialog";
import MediaFileInput from "../Elements/MediaFileInput";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, InputAdornment, MenuItem, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useCreateProduct, useUpdateProduct } from "../../features/products";
import { useCreateMedia } from "../../features/media";
import { userGroups } from "../../lib/constants";

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
      image: !!product?.image && product?.image !== "0" ? product?.image : "",
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
  } = useForm(formOptions);

  const [showAlergeniDialog, setShowAlergeniDialog] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, []);

  const { mutate: createMedia, isLoading: isCreatingMedia } = useCreateMedia();
  const { mutate: createProduct, isLoading: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isLoading: isUpdating } = useUpdateProduct();

  const onSubmit = async (data) => {
    if (!!data.image && data.image !== product?.image) {
      var reader = new FileReader();
      reader.onloadend = async () => {
        createMedia(
          {
            body: reader.result,
            type: data.image.type,
            name: data.image.name,
          },
          {
            onSuccess: (media) => {
              const newProduct = {
                ...data,
                stock: data.stockStatus,
                allergens: data.allergens,
                price: data.price.toString(),
                weight: data.weight.toString(),
                image: media.id,
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
            },
          }
        );
      };
      reader.readAsArrayBuffer(data.image);
    } else {
      const newProduct = {
        ...data,
        allergens: data.allergens,
        price: data.price.toString(),
        weight: data.weight.toString(),
      };
      delete newProduct.image;

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
        <div className="flex flex-col gap-1">
          <InputLabel text="Slika" />
          {/* <MediaFileInput value={image} onChange={(value) => setImage(value)} /> */}
          <Controller
            control={control}
            name="image"
            render={({ field }) => <MediaFileInput {...field} />}
          />
        </div>

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
                endAdornment: (
                  <InputAdornment position="end">HRK</InputAdornment>
                ),
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
