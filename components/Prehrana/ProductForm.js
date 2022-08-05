import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MdArrowBack } from "react-icons/md";
import InputLabel from "../Elements/InputLabel";
import AlergeniDialog from "./AlergeniDialog";
import Select from "../Elements/Select";
import { toast } from "react-toastify";
import Button from "../Elements/Button";
import MediaFileInput from "../Elements/MediaFileInput";
import Link from "next/link";
import { createMedia } from "../../lib/api/media";
import {
  createProduct,
  updateProduct,
  useProducts,
} from "../../lib/api/products";

const ProductForm = ({ product }) => {
  const { products, error, setProducts } = useProducts();

  const parseDescription = (description) => {
    const start = description.indexOf("<p>") + 3;
    const end = description.indexOf("</p>");
    return description.substring(start, end);
  };

  const [name, setName] = useState(product ? product.name : "");
  const [description, setDescription] = useState(
    product?.description ? parseDescription(product.description) : ""
  );
  const [image, setImage] = useState(product?.image || "");
  const [price, setPrice] = useState(product ? product.price : "");
  const [stockStatus, setStockStatus] = useState(
    product ? product.stock : "instock"
  );
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (image && image !== product?.image) {
      var reader = new FileReader();
      reader.onloadend = async () => {
        setLoading(true);
        try {
          const imageId = await createMedia(
            reader.result,
            image.type,
            image.name
          );

          const createdProduct = {};

          if (product) {
            createdProduct = await updateProduct(product.id, {
              name: name,
              description: description,
              image: imageId,
              price: price,
              stock: stockStatus,
              allergens: formatAllergens(allergens),
              weight: weight,
            });
          } else {
            createdProduct = await createProduct({
              name: name,
              description: description,
              image: imageId,
              price: price,
              stock: stockStatus,
              allergens: formatAllergens(allergens),
              weight: weight,
            });
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
        } catch (error) {
          console.log(error.response);
          toast.error(
            product
              ? "Greška kod spremanja promjena"
              : "Greška kod dodavanja proizvoda"
          );
        } finally {
          setLoading(false);
          router.push("/prehrana/proizvodi");
        }
      };
      reader.readAsArrayBuffer(image);
    } else {
      setLoading(true);
      try {
        const createdProduct = {};

        if (product) {
          createdProduct = await updateProduct(product.id, {
            name: name,
            description: description,
            price: price,
            stock: stockStatus,
            allergens: formatAllergens(allergens),
            weight: weight,
          });
        } else {
          createdProduct = await createProduct({
            name: name,
            description: description,
            price: price,
            stock: stockStatus,
            allergens: formatAllergens(allergens),
            weight: weight,
          });
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
      } catch (error) {
        console.log(error);
        toast.error(
          product
            ? "Greška kod spremanja promjena"
            : "Greška kod dodavanja proizvoda"
        );
      } finally {
        setLoading(false);
        router.push("/prehrana/proizvodi");
      }
    }
  };

  const selectItems = [
    { text: "Na zalihi", value: "instock" },
    { text: "Nema na zalihi", value: "outofstock" },
  ];

  return (
    <div className="px-5 md:w-2/3 lg:w-1/2 mx-auto">
      <Link href="/prehrana/proizvodi">
        <a className="flex items-center font-semibold pt-12 mb-8">
          <MdArrowBack className="mr-2" />
          Povratak
        </a>
      </Link>
      <h1 className="text-3xl font-semibold pb-10">
        {product ? "Uredi proizvod" : "Dodaj novi proizvod"}
      </h1>
      <form className="flex flex-col mx-auto pb-8" onSubmit={handleSubmit}>
        {/* NAZIV */}
        <InputLabel text="Naziv" />
        <input
          type="text"
          className="px-4 py-2 rounded-lg mb-8 bg-secondary border-transparent"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></input>

        {/* OPIS */}
        <InputLabel text="Opis" />
        <textarea
          type="text"
          rows="6"
          className="px-4 py-2 rounded-lg mb-8 bg-secondary border-transparent"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        {/* SLIKA */}
        <InputLabel text="Slika" />
        <MediaFileInput
          className="mb-8"
          value={image}
          onChange={(value) => setImage(value)}
        />

        {/* CIJENA */}
        <InputLabel text="Cijena" />
        <div className="flex items-center mb-8">
          <input
            type="number"
            className="px-4 py-2 rounded-lg mr-3 flex-grow bg-secondary border-transparent"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          ></input>
          <span className="flex-shrink">kn</span>
        </div>

        {/* STATUS ZALIHE */}
        <InputLabel text="Status zalihe" />
        <Select
          items={selectItems}
          className="mb-8"
          value={stockStatus}
          onChange={(value) => setStockStatus(value)}
        />

        {/* ALERGENI */}
        <InputLabel text="Alergeni (Unesite alergene odvjene zarezom)" />
        <input
          type="text"
          rows="2"
          className="form-textarea px-4 py-2 rounded-lg bg-secondary border-transparent"
          value={allergens}
          onChange={(e) => setAllergens(e.target.value)}
        />
        <button
          type="button"
          className="self-start text-sm text-primary mt-2 hover:underline mb-8"
          onClick={() => setShowAlergeniDialog(true)}
        >
          Popis alergena
        </button>
        {showAlergeniDialog && (
          <AlergeniDialog handleClose={() => setShowAlergeniDialog(false)} />
        )}

        {/* TEŽINA */}
        <InputLabel text="Težina" />
        <div className="flex items-center">
          <input
            type="number"
            className="px-4 py-2 rounded-lg mr-3 flex-grow bg-secondary border-transparent"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          ></input>
          <span className="flex-shrink">g</span>
        </div>

        {/* SUBMIT */}
        <div className="self-end mt-8">
          <Button
            type="submit"
            text={product ? "Spremi" : "Dodaj"}
            disabled={loading}
            loading={loading}
            primary
          />
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
