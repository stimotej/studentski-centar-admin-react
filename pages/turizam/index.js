import Header from "../../components/Header";
import Layout from "../../components/Layout";

const PocetnaStranica = () => {
  return (
    <Layout>
      <Header title="Teatar &TD" />
      <div className="flex items-start gap-10 flex-wrap md:flex-nowrap px-5 md:px-10 pb-6">
        <div>bok</div>
        <div className="w-full">
          <div className="flex flex-col items-start gap-4 w-full">bok 2</div>
        </div>
      </div>
    </Layout>
  );
};

export default PocetnaStranica;
