import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MdArrowBack } from "react-icons/md";
import InputLabel from "../Elements/InputLabel";
import AlergeniDialog from "./AlergeniDialog";
import { toast } from "react-toastify";
import MediaFileInput from "../Elements/MediaFileInput";
import Link from "next/link";
import { createMedia } from "../../lib/api/media";
import {
  createProduct,
  updateProduct,
  useProducts,
} from "../../lib/api/products";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, InputAdornment, MenuItem, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import clsx from "clsx";

const schema = yup.object().shape({
  name: yup.string().required("Ovo polje je obavezno"),
  price: yup
    .number()
    .typeError("Mora biti broj")
    .required("Ovo polje je obavezno"),
});

const ProductForm = ({ product }) => {
  const { products, error, setProducts } = useProducts();

  const parseDescription = (description) => {
    const start = description.indexOf("<p>") + 3;
    const end = description.indexOf("</p>");
    return description.substring(start, end);
  };

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
    reset,
    watch,
    control,
    formState: { isValid, isSubmitting, errors },
  } = useForm(formOptions);

  const [allergens, setAllergens] = useState(
    (product && product.allergens?.toString()) || ""
  );
  const [weight, setWeight] = useState(product ? product.weight : "");

  const [loading, setLoading] = useState(false);
  const [showAlergeniDialog, setShowAlergeniDialog] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    // if (!token || !userGroups["prehrana"].includes(username))
    //   router.push("/prehrana/login");
  }, []);

  const formatAllergens = (allergensString) => {
    console.log("alergenii", allergensString);
    if (!allergensString) return;
    return allergensString
      .toUpperCase()
      .split(",")
      .map((item) => item.trim());
  };

  const onSubmit = async (data) => {
    setLoading(true);

    if (!!data.image && data.image !== product?.image) {
      var reader = new FileReader();
      reader.onloadend = async () => {
        setLoading(true);
        try {
          const imageId = await createMedia(
            reader.result,
            data.image.type,
            data.image.name
          );

          const createdProduct = {};
          const newProduct = {
            ...data,
            stock: data.stockStatus,
            allergens: data.allergens,
            price: data.price.toString(),
            weight: data.weight.toString(),
            image: imageId,
          };

          if (product) {
            createdProduct = await updateProduct(product.id, newProduct);
          } else {
            createdProduct = await createProduct(newProduct);
          }

          toast.success(
            product ? "Uspješno spremljene promjene" : "Uspješno dodan proizvod"
          );
          let productsCopy = [...products];
          if (product) {
            let index = productsCopy.findIndex(
              (item) => item.id === product.id
            );
            productsCopy[index] = createdProduct;
          } else {
            productsCopy.push(createdProduct);
          }
          console.log("copy", productsCopy);
          setProducts(productsCopy);
          router.push("/prehrana/proizvodi");
        } catch (error) {
          console.log(error.response);
          toast.error(
            product
              ? "Greška kod spremanja promjena"
              : "Greška kod dodavanja proizvoda"
          );
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(data.image);
    } else {
      setLoading(true);
      try {
        const createdProduct = {};
        const newProduct = {
          ...data,
          allergens: data.allergens,
          price: data.price.toString(),
          weight: data.weight.toString(),
        };
        delete newProduct.image;

        console.log("Poslano: ", newProduct);

        if (product) {
          createdProduct = await updateProduct(product.id, newProduct);
        } else {
          createdProduct = await createProduct(newProduct);
        }

        console.log("Response Data:", createdProduct);
        toast.success(
          product ? "Uspješno spremljene promjene" : "Uspješno dodan proizvod"
        );
        let productsCopy = [...products];
        if (product) {
          console.log("hihiii");
          let index = productsCopy.findIndex((item) => item.id === product.id);
          productsCopy[index] = createdProduct;
        } else {
          productsCopy.push(createdProduct);
        }
        console.log("copy", productsCopy);
        setProducts(productsCopy);
        router.push("/prehrana/proizvodi");
      } catch (error) {
        console.log(error);
        toast.error(
          product
            ? "Greška kod spremanja promjena"
            : "Greška kod dodavanja proizvoda"
        );
      } finally {
        setLoading(false);
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
          {product ? "Spremi" : "Dodaj"}
        </LoadingButton>
      </div>
    </div>
  );
};

export default ProductForm;
