import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { siteConfig } from '@/config/site';

// Fontes Helvetica/Helvetica-Bold são nativas do @react-pdf/renderer, não
// precisam ser registradas.

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 50,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottom: '2px solid #333333',
    paddingBottom: 12,
  },
  clinicBlock: { flexDirection: 'column' },
  clinicLabel: { fontSize: 9, color: '#666666', marginBottom: 1, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold' },
  clinicName: { fontSize: 15, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: '#1a1a1a' },
  clinicDetail: { fontSize: 9, color: '#444444', marginBottom: 2 },
  clinicInfo: { textAlign: 'right', flexDirection: 'column', alignItems: 'flex-end' },
  clinicInfoLabel: { fontSize: 9, color: '#888888', marginBottom: 2 },
  clinicInfoValue: { fontSize: 10, color: '#1a1a1a', marginBottom: 3 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 20, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  patientInfo: { marginBottom: 20, padding: 10, backgroundColor: '#F3F3F3', borderRadius: 5 },
  patientLabel: { fontSize: 9, color: '#666666', textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  patientName: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 5 },
  table: { width: '100%', display: 'flex', flexDirection: 'column' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#333333', color: '#FFFFFF', padding: 8, fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #E0E0E0', padding: 8, alignItems: 'center' },
  colDate: { width: '50%' },
  colStatus: { width: '30%', textAlign: 'center' },
  colValue: { width: '20%', textAlign: 'right' },
  summary: { marginTop: 20, paddingTop: 10, borderTop: '2px solid #333333', textAlign: 'right' },
  summaryText: { fontSize: 12, marginBottom: 5 },
  total: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  observacaoSection: {
    marginTop: 16, paddingTop: 12, paddingBottom: 12, paddingLeft: 10, paddingRight: 10,
    borderTop: '1px solid #E0E0E0', backgroundColor: '#FFFBF0', borderLeft: '3px solid #F59E0B',
  },
  observacaoTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#92400E', marginBottom: 4, textTransform: 'uppercase' },
  observacaoText: { fontSize: 10, color: '#44403C', lineHeight: 1.5 },
  footer: {
    position: 'absolute', bottom: 20, left: 40, right: 40, textAlign: 'center',
    fontSize: 8, color: '#AAAAAA', borderTop: '1px solid #E0E0E0', paddingTop: 6,
  },
});

interface InvoiceItem {
  data: string;
  status: string;
  valor: number;
}

interface ProfessionalData {
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

interface InvoiceProps {
  patientName: string;
  patientCpf?: string | null;
  patientEmail?: string | null;
  itens: InvoiceItem[];
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  valorTotal: number;
  professional?: ProfessionalData;
  observacao?: string | null;
}

const InvoicePDF = ({ patientName, patientCpf, patientEmail, itens, invoiceNumber, issueDate, dueDate, valorTotal, professional, observacao }: InvoiceProps) => {
  const nome = professional?.nome || siteConfig.professionalName;
  const telefone = professional?.telefone || siteConfig.contact.phone;
  const email = professional?.email || siteConfig.contact.email;
  const endereco = professional?.endereco || siteConfig.contact.addressPlain;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.clinicBlock}>
            <Text style={styles.clinicLabel}>De</Text>
            <Text style={styles.clinicName}>{nome}</Text>
            <Text style={styles.clinicDetail}>Tel: {telefone}</Text>
            <Text style={styles.clinicDetail}>E-mail: {email}</Text>
            {!!endereco && <Text style={styles.clinicDetail}>{endereco}</Text>}
          </View>
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicInfoLabel}>Fatura</Text>
            <Text style={styles.clinicInfoValue}>#{invoiceNumber}</Text>
            <Text style={styles.clinicInfoLabel}>Emissão</Text>
            <Text style={styles.clinicInfoValue}>{issueDate}</Text>
            <Text style={styles.clinicInfoLabel}>Vencimento</Text>
            <Text style={styles.clinicInfoValue}>{dueDate}</Text>
          </View>
        </View>

        <Text style={styles.title}>Fatura de Serviços</Text>

        <View style={styles.patientInfo}>
          <Text style={styles.patientLabel}>Para</Text>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text>CPF: {patientCpf || 'Não informado'}</Text>
          <Text>Email: {patientEmail || 'Não informado'}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDate}>Data da Consulta</Text>
            <Text style={styles.colStatus}>Status</Text>
            <Text style={styles.colValue}>Valor (R$)</Text>
          </View>
          {itens.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.colDate}><Text>{item.data}</Text></View>
              <View style={styles.colStatus}><Text>{item.status}</Text></View>
              <View style={styles.colValue}><Text>{item.valor.toFixed(2)}</Text></View>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>Quantidade de Consultas: {itens.length}</Text>
          <Text style={styles.total}>Total a Pagar: R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        </View>

        {observacao && observacao.trim().length > 0 && (
          <View style={styles.observacaoSection}>
            <Text style={styles.observacaoTitle}>Observações</Text>
            <Text style={styles.observacaoText}>{observacao}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>{nome} · {telefone} · {email}</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function generateInvoicePdf(data: InvoiceProps): Promise<Buffer> {
  return await renderToBuffer(<InvoicePDF {...data} />);
}
