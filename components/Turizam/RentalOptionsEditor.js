import { Button, Divider, TextField } from "@mui/material";
import clsx from "clsx";

export default function RentalOptionsEditor({ value, onChange, className }) {
  return (
    <div className="bg-secondary border border-gray-400 rounded-lg w-full p-4">
      {value?.map((option, index) => (
        <div key={index}>
          {index !== 0 && <Divider className="!my-6" />}
          <TextField
            variant="outlined"
            label="Naziv opcije"
            className="w-full"
            value={option.title || ""}
            onChange={(e) => {
              onChange(
                value.map((o, i) =>
                  i === index ? { ...o, title: e.target.value } : o
                )
              );
            }}
          />
          <TextField
            variant="outlined"
            label="Podnaslov opcije"
            className="w-full !mt-3"
            value={option.subtitle || ""}
            onChange={(e) => {
              onChange(
                value.map((o, i) =>
                  i === index ? { ...o, subtitle: e.target.value } : o
                )
              );
            }}
          />
          <p className="text-sm font-medium !mb-2 !mt-3">Cijene</p>
          <div>
            {option.items?.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className={clsx(
                  // "pl-4 border-l-2 border-primary",
                  "border border-gray-400 p-4 rounded-lg",
                  itemIndex !== 0 && "!mt-4"
                )}
              >
                <TextField
                  variant="outlined"
                  label="Naslov"
                  className="w-full"
                  value={item.title || ""}
                  onChange={(e) => {
                    onChange(
                      value.map((o, i) =>
                        i === index
                          ? {
                              ...o,
                              items: o.items.map((_item, j) =>
                                j === itemIndex
                                  ? {
                                      ..._item,
                                      title: e.target.value,
                                    }
                                  : _item
                              ),
                            }
                          : o
                      )
                    );
                  }}
                />
                <TextField
                  variant="outlined"
                  label="Cijena"
                  className="w-full !mt-3"
                  value={item.price || ""}
                  onChange={(e) => {
                    onChange(
                      value.map((o, i) =>
                        i === index
                          ? {
                              ...o,
                              items: o.items.map((_item, j) =>
                                j === itemIndex
                                  ? {
                                      ..._item,
                                      price: e.target.value,
                                    }
                                  : _item
                              ),
                            }
                          : o
                      )
                    );
                  }}
                />
                <Button
                  className="!mt-3"
                  color="error"
                  onClick={() => {
                    onChange(
                      value.map((o, i) =>
                        i === index
                          ? {
                              ...o,
                              items: o.items.filter((_, j) => j !== itemIndex),
                            }
                          : o
                      )
                    );
                  }}
                >
                  Ukloni
                </Button>
              </div>
            ))}

            <Button
              className="!mt-3"
              onClick={() => {
                onChange(
                  value.map((o, i) =>
                    i === index
                      ? {
                          ...o,
                          items: [
                            ...o.items,
                            {
                              title: "",
                              price: "",
                            },
                          ],
                        }
                      : o
                  )
                );
              }}
            >
              Dodaj cijenu
            </Button>
          </div>
        </div>
      ))}
      <Button
        variant="outlined"
        className="!mt-3"
        onClick={() => {
          onChange([
            ...value,
            {
              title: "",
              subtitle: "",
              items: [
                {
                  title: "",
                  price: "",
                },
              ],
            },
          ]);
        }}
      >
        Dodaj opciju
      </Button>
    </div>
  );
}
