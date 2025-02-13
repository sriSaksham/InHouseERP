import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 12 },
  section: { marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  text: { marginBottom: 5 },
  table: { display: "flex", width: "auto", marginBottom: 10 },
  tableRow: { flexDirection: "row" },
  tableCellHeader: { padding: 5, fontWeight: "bold", borderBottom: "1 solid black" },
  tableCell: { padding: 5, borderBottom: "1 solid gray" },
});

const RequestPDF = ({ requestData, masterId }: { requestData: any; masterId: number }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Request Details - Master ID: {masterId}</Text>

      {/* Requester Information */}
      <View style={styles.section}>
        <Text style={styles.text}>Requester Name: {requestData.requesterName}</Text>
        <Text style={styles.text}>Requester Comment: {requestData.requesterComment}</Text>
        <Text style={styles.text}>Scope of Material: {requestData.scopeOfMaterial}</Text>
      </View>

      {/* Table Header */}
      <View style={[styles.table, { border: "1 solid black" }]}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCellHeader, { width: "25%" }]}>Material Name</Text>
          <Text style={[styles.tableCellHeader, { width: "20%" }]}>Site Name</Text>
          <Text style={[styles.tableCellHeader, { width: "15%" }]}>Unit</Text>
          <Text style={[styles.tableCellHeader, { width: "15%" }]}>Quantity</Text>
          <Text style={[styles.tableCellHeader, { width: "25%" }]}>Description</Text>
        </View>

        {/* Table Data */}
        {requestData.quantityHistoryTables.map((item: any, index: number) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "25%" }]}>{item.materialName}</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>{item.siteName}</Text>
            <Text style={[styles.tableCell, { width: "15%" }]}>{item.unit}</Text>
            <Text style={[styles.tableCell, { width: "15%" }]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, { width: "25%" }]}>{item.materialDescription}</Text>
          </View>
        ))}
      </View>

      {/* Attached Bill Info */}
      {requestData.file && (
        <View style={styles.section}>
          <Text style={styles.text}>Attached Bill: {requestData.file.name}</Text>
        </View>
      )}
    </Page>
  </Document>
);

export default RequestPDF;
