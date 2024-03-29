import { Tooltip } from "@mui/material";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const MenuPreviewTable = ({ title, menu, className, fields }) => {
  const headers = ["Menu", "Vege menu", "Izbor", "Prilozi"];

  return (
    <div
      className={`flex flex-col w-full text-left shadow-md rounded-lg ${className}`}
    >
      <div className="theme-prehrana w-full p-2 rounded-t-lg bg-secondary text-primary font-bold">
        {title}
      </div>
      <div>
        <div className="flex">
          {headers.map((header, index) => (
            <div key={index} className="flex-1 p-2 bg-secondary font-bold">
              {header}
            </div>
          ))}
        </div>
        <div className="flex">
          {fields.map((field, index) => (
            <ul key={index} className="flex-1">
              {menu?.products?.[field.split("-")[0]]?.[
                field.split("-")[1]
              ]?.map((product, index) => (
                <li
                  className={`flex items-center justify-between p-2 border ${
                    product?.stock === "outofstock" && "bg-error/5 border-error"
                  }`}
                  key={index}
                >
                  {product?.title || (
                    <div className="text-error">Proizvod je uklonjen</div>
                  )}
                  {product?.stock === "outofstock" && (
                    <Tooltip title="Nema na stanju" arrow>
                      <span>
                        <HiOutlineExclamationCircle className="w-5 h-5 mr-1 text-error" />
                      </span>
                    </Tooltip>
                  )}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuPreviewTable;
