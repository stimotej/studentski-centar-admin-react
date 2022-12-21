import React from "react";
import {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "./public/fonts/Roboto-Regular.ttf", fontWeight: 400 },
    { src: "./public/fonts/Roboto-Bold.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Roboto",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#00000090",
    lineHeight: 1.3,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  logoImg: {
    width: 50,
    height: "auto",
    marginRight: 12,
  },
  uppercase: {
    textTransform: "uppercase",
  },
  bold: {
    fontWeight: 600,
    color: "black",
  },
  underline: {
    textDecoration: "underline",
  },
  headerRight: {
    textAlign: "center",
    alignItems: "center",
  },
  boxesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  box: {
    width: 25,
    height: 30,
    marginLeft: -1,
    borderWidth: 1,
    marginTop: -32,
    marginBottom: 24,
    borderColor: "black",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
    marginTop: 24,
    textAlign: "center",
  },
  rowsContainer: {
    marginTop: 16,
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    marginTop: 8,
  },
  rowValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#00000080",
    borderBottomStyle: "dotted",
    fontWeight: "bold",
    paddingLeft: 12,
  },
  textUnder: {
    fontSize: 10,
    color: "#00000095",
    marginTop: 14,
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 32,
  },
  signatureImg: {
    width: 120,
    height: "auto",
  },
  signatureColumn: {
    flex: 1,
  },
  signatureTitle: {
    fontWeight: "bold",
    fontSize: 12,
  },
  signature: {
    padding: 6,
    borderTopWidth: 1,
    borderTopStyle: "dotted",
    borderTopColor: "#00000080",
    color: "#00000080",
    fontSize: 10,
    marginTop: 42,
  },
  textStar: {
    fontSize: 10,
    marginTop: 32,
    lineHeight: 1.3,
    textAlign: "justify",
  },
});

const CompanyDocument = ({ userData }) => {
  return (
    <Document title="Obrazac za prijavu poslodavaca">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image
              src="./public/logo.png"
              alt="sc_logo"
              style={styles.logoImg}
            />
            <View>
              <Text style={styles.uppercase}>Sveučilište u Zagrebu</Text>
              <Text style={styles.uppercase}>Studentski centar u Zagrebu</Text>
              <Text>Zagreb, Savska 25</Text>
              <Text>OIB: 22597784145</Text>
              <Text style={styles.bold}>
                Studentski servis - Odjel za zapošljavanje studenata
              </Text>
              <Text style={styles.bold}>
                e-adresa: <Text style={styles.underline}>referada@sczg.hr</Text>
              </Text>
              <Text style={[styles.bold, styles.underline]}>www.sczg.hr</Text>
              <Text style={styles.bold}>
                Telefon: 01/4593-673 ili 01/4593-674
              </Text>
              <Text style={styles.bold}>Faks: 01/4843-505 ili 4593-560</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.boxesContainer}>
              <View style={styles.box} />
              <View style={styles.box} />
              <View style={styles.box} />
              <View style={styles.box} />
              <View style={styles.box} />
              <View style={styles.box} />
            </View>
            <Text style={[styles.bold, styles.uppercase]}>
              Šifra poslodavca
            </Text>
            <Text>(Popunjava Student servis)</Text>
            <Text style={[styles.bold, { marginTop: 12 }]}>U Zagrebu:</Text>
          </View>
        </View>
        <Text style={styles.title}>
          Obrazac za upis u Upisnik poslodavaca (tvrtki) Student servisa u
          Zagrebu
        </Text>
        <View style={styles.rowsContainer}>
          <View style={styles.row}>
            <Text>Naziv poslodavca / tvrtke:</Text>
            <Text style={styles.rowValue}>{userData?.name}</Text>
          </View>
          <View style={styles.row}>
            <Text>OIB:</Text>
            <Text style={styles.rowValue}>{userData?.oib_company}</Text>
          </View>
          <View style={styles.row}>
            <Text>Matični broj tvrtke:</Text>
            <Text style={styles.rowValue}>{userData?.id_number}</Text>
          </View>
          <View style={styles.row}>
            <Text>MBG vlasnika obrta:</Text>
            <Text style={styles.rowValue}>{userData?.mbg}</Text>
          </View>
          <View style={styles.row}>
            <Text>Skraćeni naziv poslodavca / tvrtke:</Text>
            <Text style={styles.rowValue}>{userData.short_name}</Text>
          </View>
          <View style={styles.row}>
            <Text>Adresa sjedišta (ulica i broj):</Text>
            <Text style={styles.rowValue}>{userData.address}</Text>
          </View>
          <View style={styles.row}>
            <Text>Poštanski broj i mjesto:</Text>
            <Text style={styles.rowValue}>{userData.location}</Text>
          </View>
          <View style={styles.row}>
            <Text>IBAN:</Text>
            <Text style={styles.rowValue}>{userData.iban}</Text>
          </View>
          <View style={styles.row}>
            <Text>Telefon:</Text>
            <Text style={styles.rowValue}>{userData.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text>Mobitel:</Text>
            <Text style={styles.rowValue}>{userData.mobile}</Text>
          </View>
          <View style={styles.row}>
            <Text>Telefaks:</Text>
            <Text style={styles.rowValue}>{userData.telefax}</Text>
          </View>
          <View style={styles.row}>
            <Text>E-mail:</Text>
            <Text style={styles.rowValue}>{userData.email}</Text>
          </View>
          <View style={styles.row}>
            <Text>Osoba za kontakt:</Text>
            <Text style={styles.rowValue}>{userData.contact_person}</Text>
          </View>
        </View>
        <Text style={styles.textUnder}>
          Poštovani, ovaj obrazac obvezni ste bez odgađanja u izvorniku
          dostaviti u Student servis kao i sve nastupe nakon zaprimanja ovog
          izvornika.
        </Text>
        <Text style={styles.textUnder}>
          (Nepotpune i nečitke obrasce ne prihvaćamo!)
        </Text>
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureColumn}>
            <Text style={styles.signatureTitle}>Za Student servis:</Text>
            <Image
              src="./public/signature.png"
              alt="sc_logo"
              style={styles.signatureImg}
            />
          </View>
          <View style={styles.signatureColumn}>
            <Text style={styles.signatureTitle}>Pečat poslodavca:</Text>
          </View>
          <View style={styles.signatureColumn}>
            <Text style={styles.signatureTitle}>Potpis poslodavca:</Text>
            <View style={styles.signature}>
              <Text>*(Potpis ovlaštene osobe)</Text>
            </View>
          </View>
        </View>
        <Text style={styles.textStar}>
          * Ovjerom i potpisom ovoga obrasca poslodavac ujedno potvrđuje da je
          upoznat s Općim uvjetima poslovanja Student servisa i dopušta Student
          servisu objavu potražnje studenata za rad (OGLAS) na mrežnim
          stranicama oglašivača s kojima Studentski centar u Zagrebu ima
          potpisan sporazum. (24.07.2017.)
        </Text>
      </Page>
    </Document>
  );
};

export default CompanyDocument;
