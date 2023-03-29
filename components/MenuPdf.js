import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import dayjs from "dayjs";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/zaposlenici/fonts/Roboto-Regular.ttf", fontWeight: 400 },
    { src: "/zaposlenici/fonts/Roboto-Bold.ttf", fontWeight: 700 },
  ],
});

const MenuPdf = ({ restaurant, title, date, products }) => {
  const meals = [
    { field_name: "dorucak", title: "Doručak" },
    { field_name: "rucak", title: "Ručak" },
    { field_name: "vecera", title: "Večera" },
  ];

  const types = [
    { field_name: "menu", title: "Menu" },
    { field_name: "vege_menu", title: "Vegeterijanski menu" },
    { field_name: "izbor", title: "Izbor" },
    { field_name: "prilozi", title: "Prilozi" },
  ];

  return (
    <Document title="Obrazac za prijavu poslodavaca">
      {meals.map((meal) => {
        if (products[meal.field_name]) {
          return (
            <Page
              key={meal.field_name}
              size="A4"
              orientation="landscape"
              style={styles.page}
            >
              <View style={styles.textRow}>
                <Text style={styles.restaurantTitle}>
                  Restoran {restaurant}
                </Text>
                <Text>
                  <Text style={{ fontWeight: 700 }}>{title}</Text> -{" "}
                  {dayjs(date).format("DD.MM.YYYY")}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginTop: 18,
                    marginBottom: 24,
                    color: "#1ca5ff",
                  }}
                >
                  {meal.title}
                </Text>
                <View style={styles.tableCols}>
                  {types.map((type) =>
                    products[meal.field_name][type.field_name] ? (
                      <View key={type.field_name} style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            marginBottom: 12,
                          }}
                        >
                          {type.title}
                        </Text>
                        {products[meal.field_name][type.field_name].map(
                          (product, index) => (
                            <Text
                              key={product.id}
                              style={{
                                paddingVertical: 6,
                                borderBottom:
                                  index !== products.length - 1 ? 1 : 0,
                                borderColor: "#e5e7eb",
                                lineHeight: 1.3,
                              }}
                            >
                              {product.title}
                              {!!product.price && (
                                <Text style={styles.lightText}>
                                  {" "}
                                  | {product.price}€ |{" "}
                                  <Text style={styles.lightText}>
                                    {(+product.price * 7.5345).toFixed(2)}kn
                                  </Text>
                                </Text>
                              )}
                            </Text>
                          )
                        )}
                      </View>
                    ) : (
                      <View style={{ flex: 1 }}></View>
                    )
                  )}
                </View>
              </View>
            </Page>
          );
        }
      })}
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Roboto",
    fontSize: 14,
  },
  restaurantTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
  },
  textRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableCols: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    gap: 24,
  },
  lightText: {
    color: "#666666",
  },
});

export default MenuPdf;
