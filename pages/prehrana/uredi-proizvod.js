import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import ProductForm from "../../components/Prehrana/ProductForm";

const UrediProizvod = () => {
  const router = useRouter();

  return (
    <Layout>
      <ProductForm product={router.query} />
    </Layout>
  );
};

export default UrediProizvod;
