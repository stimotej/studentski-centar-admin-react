import { faEye } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, TableCell, Tooltip } from "@mui/material";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect } from "react";
import MyTable from "../../components/Elements/Table";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { useOrders } from "../../lib/api/orders";

const Orders = () => {
  const { orders, loading } = useOrders();

  useEffect(() => {
    console.log("orders: ", orders);
  }, [orders]);

  const displayStatus = (status) => {
    const defaultStyle = "py-2 px-4 rounded-full text-center font-semibold";

    switch (status) {
      case "pending":
        return (
          <div className={clsx(defaultStyle, "bg-gray-100 text-gray-600")}>
            Obrada uplate
          </div>
        );
      case "processing":
        return (
          <div className={clsx(defaultStyle, "bg-green-100 text-green-600")}>
            U obradi
          </div>
        );
      case "on-hold":
        return (
          <div className={clsx(defaultStyle, "bg-orange-100 text-orange-600")}>
            Na čekanju
          </div>
        );
      case "completed":
        return (
          <div className={clsx(defaultStyle, "bg-green-100 text-green-600")}>
            Završeno
          </div>
        );
      case "cancelled":
        return (
          <div className={clsx(defaultStyle, "bg-gray-100 text-gray-600")}>
            Otkazano
          </div>
        );
      case "refunded":
        return (
          <div className={clsx(defaultStyle, "bg-gray-100 text-gray-600")}>
            Refundirano
          </div>
        );
      case "failed ":
        return (
          <div className={clsx(defaultStyle, "bg-red-100 text-red-600")}>
            Neuspješno
          </div>
        );
      case "trash":
        return (
          <div className={clsx(defaultStyle, "bg-red-100 text-red-600")}>
            Obrisano
          </div>
        );
      default:
        return (
          <div className={clsx(defaultStyle, "bg-gray-100 text-gray-600")}>
            Skica
          </div>
        );
    }
  };

  const headCells = [
    {
      id: "number",
      sort: false,
      label: "Nardužba",
    },
    {
      id: "date_created",
      sort: true,
      label: "Datum",
    },
    {
      id: "total",
      sort: true,
      label: "Sve ukupno",
    },
    {
      id: "action",
      sort: false,
      label: "Radnje",
    },
    {
      id: "status",
      sort: false,
      label: "Status",
    },
  ];
  return (
    <Layout>
      <Header title="Narudžbe" />
      <div className="px-5 md:px-10">
        <MyTable
          title="Narudžbe"
          headCells={headCells}
          rows={orders || []}
          defaultOrder="desc"
          defaultOrderBy="date_created"
          noDataText="Nema narudžbi za prikaz"
          loading={loading}
          //   selectedAction={(nSelected) => (
          //     <div className="flex gap-3 mr-3">
          //       <Tooltip
          //         title={
          //           nSelected > 1
          //             ? `Obriši proizvode (${nSelected})`
          //             : "Obriši proizvod"
          //         }
          //         arrow
          //       >
          //         <IconButton onClick={() => setDeleteModal(true)}>
          //           <FontAwesomeIcon icon={faTrash} />
          //         </IconButton>
          //       </Tooltip>
          //       {nSelected === 1 && (
          //         <Link
          //           href={{
          //             pathname: "/prehrana/uredi-proizvod",
          //             query: products?.filter(
          //               (item) => item.id === selectedProducts[0]
          //             )[0],
          //           }}
          //         >
          //           <Tooltip title="Uredi proizvod" arrow>
          //             <IconButton>
          //               <FontAwesomeIcon icon={faPen} />
          //             </IconButton>
          //           </Tooltip>
          //         </Link>
          //       )}
          //       <Tooltip title="Uredi stanje" arrow>
          //         <IconButton onClick={() => setStockModal(true)}>
          //           <FontAwesomeIcon icon={faClipboardListCheck} />
          //         </IconButton>
          //       </Tooltip>
          //     </div>
          //   )}
          rowCells={(row) => (
            <>
              <TableCell>#{row.number}</TableCell>
              <TableCell>
                <Tooltip
                  title={dayjs(row.date_created).format("DD.MM.YYYY HH:MM:ss")}
                  arrow
                >
                  <div>{dayjs(row.date_created).format("DD.MM.YYYY")}</div>
                </Tooltip>
              </TableCell>
              <TableCell>
                <strong>
                  {row.total} {row.currency_symbol}
                </strong>
              </TableCell>
              <TableCell>
                <Tooltip title="Pregledaj narudžbu" arrow>
                  <IconButton className="text-[18px] aspect-square">
                    <FontAwesomeIcon icon={faEye} />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell className="flex items-start">
                {displayStatus(row.status)}
              </TableCell>
            </>
          )}
        />
      </div>
    </Layout>
  );
};

export default Orders;
