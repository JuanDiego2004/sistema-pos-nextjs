import { create } from "xmlbuilder2";

// Tipos asumidos para Preventa y EmpresaInfo (ajusta según tu proyecto)
interface Preventa {
  numeroFactura: string;
  fecha: Date;
  cliente: {
    ruc: string;
    razonSocial: string;
    direccion: string;
    ubigeo?: string;
  };
  detalles: {
    codigo: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    unspsc?: string;
  }[];
  subtotal: number;
  igv: number;
  total: number;
}

interface EmpresaInfo {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  ubigeo: string;
  urbanizacion?: string;
  provincia: string;
  departamento: string;
  distrito: string;
}

export function generarXML(preventa: Preventa, empresaInfo: EmpresaInfo): string {
  // Crear el documento XML con los namespaces requeridos
  const xml = create({ version: "1.0", encoding: "utf-8" })
    .ele("Invoice", {
      xmlns: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
      "xmlns:cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
      "xmlns:cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
      "xmlns:ds": "http://www.w3.org/2000/09/xmldsig#",
      "xmlns:ext": "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2",
    });

  // UBLExtensions (para la firma digital, vacía por ahora)
  xml
    .ele("ext:UBLExtensions")
    .ele("ext:UBLExtension")
    .ele("ext:ExtensionContent")
    .txt("<!-- Aqui ira la firma digital -->")
    .up()
    .up()
    .up();

  // Versiones
  xml.ele("cbc:UBLVersionID").txt("2.1").up();
  xml.ele("cbc:CustomizationID").txt("2.0").up();

  // Número de la factura
  xml.ele("cbc:ID").txt(preventa.numeroFactura).up();

  // Fecha de emisión (formato YYYY-MM-DD)
  xml.ele("cbc:IssueDate").txt(preventa.fecha.toISOString().split("T")[0]).up();

  // Tipo de comprobante (01 = Factura)
  xml
    .ele("cbc:InvoiceTypeCode", {
      listID: "0101",
      listAgencyName: "PE:SUNAT",
      listName: "Tipo de Documento",
      listURI: "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo01",
    })
    .txt("01")
    .up();

  // Leyenda (importe total en letras)
  const totalEnLetras = convertirNumeroALetras(preventa.total); // Debes implementar esta función
  xml.ele("cbc:Note", { languageLocaleID: "1000" }).dat(totalEnLetras).up();

  // Moneda
  xml
    .ele("cbc:DocumentCurrencyCode", {
      listID: "ISO 4217 Alpha",
      listName: "Currency",
      listAgencyName: "United Nations Economic Commission for Europe",
    })
    .txt("PEN")
    .up();

  // Firma
  const signature = xml.ele("cac:Signature");
  signature.ele("cbc:ID").txt(empresaInfo.ruc).up();
  const signatoryParty = signature.ele("cac:SignatoryParty");
  signatoryParty
    .ele("cac:PartyIdentification")
    .ele("cbc:ID")
    .txt(empresaInfo.ruc)
    .up()
    .up();
  signatoryParty
    .ele("cac:PartyName")
    .ele("cbc:Name")
    .dat(empresaInfo.razonSocial)
    .up()
    .up();
  signature
    .ele("cac:DigitalSignatureAttachment")
    .ele("cac:ExternalReference")
    .ele("cbc:URI")
    .txt("#EMPRESA-SIGN")
    .up()
    .up()
    .up();

  // Datos del emisor
  const supplierParty = xml.ele("cac:AccountingSupplierParty").ele("cac:Party");
  supplierParty
    .ele("cac:PartyIdentification")
    .ele("cbc:ID", {
      schemeID: "6",
      schemeName: "Documento de Identidad",
      schemeAgencyName: "PE:SUNAT",
      schemeURI: "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06",
    })
    .txt(empresaInfo.ruc)
    .up()
    .up();
  supplierParty
    .ele("cac:PartyName")
    .ele("cbc:Name")
    .dat(empresaInfo.nombreComercial)
    .up()
    .up();
  const legalEntity = supplierParty.ele("cac:PartyLegalEntity");
  legalEntity.ele("cbc:RegistrationName").dat(empresaInfo.razonSocial).up();
  const address = legalEntity.ele("cac:RegistrationAddress");
  address
    .ele("cbc:ID", { schemeName: "Ubigeos", schemeAgencyName: "PE:INEI" })
    .txt(empresaInfo.ubigeo)
    .up();
  address
    .ele("cbc:AddressTypeCode", {
      listName: "Establecimientos anexos",
      listAgencyName: "PE:SUNAT",
    })
    .txt("0000")
    .up();
  address.ele("cbc:CitySubdivisionName").txt(empresaInfo.urbanizacion || "").up();
  address.ele("cbc:CityName").txt(empresaInfo.provincia).up();
  address.ele("cbc:CountrySubentity").txt(empresaInfo.departamento).up();
  address.ele("cbc:District").txt(empresaInfo.distrito).up();
  address.ele("cac:AddressLine").ele("cbc:Line").dat(empresaInfo.direccion).up().up();
  address
    .ele("cac:Country")
    .ele("cbc:IdentificationCode", {
      listID: "ISO 3166-1",
      listName: "Country",
      listAgencyName: "United Nations Economic Commission for Europe",
    })
    .txt("PE")
    .up()
    .up();

  // Datos del receptor
  const customerParty = xml.ele("cac:AccountingCustomerParty").ele("cac:Party");
  customerParty
    .ele("cac:PartyIdentification")
    .ele("cbc:ID", {
      schemeID: "6",
      schemeName: "Documento de Identidad",
      schemeAgencyName: "PE:SUNAT",
      schemeURI: "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06",
    })
    .txt(preventa.cliente.ruc)
    .up()
    .up();
  const customerLegalEntity = customerParty.ele("cac:PartyLegalEntity");
  customerLegalEntity
    .ele("cbc:RegistrationName")
    .dat(preventa.cliente.razonSocial)
    .up();
  const customerAddress = customerLegalEntity.ele("cac:RegistrationAddress");
  customerAddress
    .ele("cbc:ID")
    .txt(preventa.cliente.ubigeo || "150101")
    .up();
  customerAddress
    .ele("cac:AddressLine")
    .ele("cbc:Line")
    .dat(preventa.cliente.direccion)
    .up()
    .up();
  customerAddress
    .ele("cac:Country")
    .ele("cbc:IdentificationCode", {
      listID: "ISO 3166-1",
      listName: "Country",
      listAgencyName: "United Nations Economic Commission for Europe",
    })
    .txt("PE")
    .up()
    .up();

  // Forma de pago
  const paymentTerms = xml.ele("cac:PaymentTerms");
  paymentTerms.ele("cbc:ID").txt("FormaPago").up();
  paymentTerms.ele("cbc:PaymentMeansID").txt("Contado").up();

  // Totales de impuestos
  const taxTotal = xml.ele("cac:TaxTotal");
  taxTotal
    .ele("cbc:TaxAmount", { currencyID: "PEN" })
    .txt(preventa.igv.toFixed(2))
    .up();
  const taxSubtotal = taxTotal.ele("cac:TaxSubtotal");
  taxSubtotal
    .ele("cbc:TaxableAmount", { currencyID: "PEN" })
    .txt(preventa.subtotal.toFixed(2))
    .up();
  taxSubtotal
    .ele("cbc:TaxAmount", { currencyID: "PEN" })
    .txt(preventa.igv.toFixed(2))
    .up();
  const taxCategory = taxSubtotal.ele("cac:TaxCategory");
  const taxScheme = taxCategory.ele("cac:TaxScheme");
  taxScheme
    .ele("cbc:ID", {
      schemeName: "Codigo de tributos",
      schemeAgencyName: "PE:SUNAT",
      schemeURI: "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo05",
    })
    .txt("1000")
    .up();
  taxScheme.ele("cbc:Name").txt("IGV").up();
  taxScheme.ele("cbc:TaxTypeCode").txt("VAT").up();

  // Totales monetarios
  const legalMonetaryTotal = xml.ele("cac:LegalMonetaryTotal");
  legalMonetaryTotal
    .ele("cbc:LineExtensionAmount", { currencyID: "PEN" })
    .txt(preventa.subtotal.toFixed(2))
    .up();
  legalMonetaryTotal
    .ele("cbc:TaxInclusiveAmount", { currencyID: "PEN" })
    .txt(preventa.total.toFixed(2))
    .up();
  legalMonetaryTotal
    .ele("cbc:PayableAmount", { currencyID: "PEN" })
    .txt(preventa.total.toFixed(2))
    .up();

  // Detalles de la factura (líneas)
  preventa.detalles.forEach((detalle, index) => {
    const invoiceLine = xml.ele("cac:InvoiceLine");
    invoiceLine.ele("cbc:ID").txt((index + 1).toString()).up();
    invoiceLine
      .ele("cbc:InvoicedQuantity", {
        unitCode: "NIU",
        unitCodeListID: "UN/ECE rec 20",
        unitCodeListAgencyName: "United Nations Economic Commission for Europe",
      })
      .txt(detalle.cantidad.toString())
      .up();
    invoiceLine
      .ele("cbc:LineExtensionAmount", { currencyID: "PEN" })
      .txt((detalle.cantidad * detalle.precioUnitario).toFixed(2))
      .up();

    const pricingReference = invoiceLine.ele("cac:PricingReference");
    const alternativeConditionPrice = pricingReference.ele(
      "cac:AlternativeConditionPrice"
    );
    alternativeConditionPrice
      .ele("cbc:PriceAmount", { currencyID: "PEN" })
      .txt((detalle.precioUnitario * 1.18).toFixed(2)) // Precio con IGV
      .up();
    alternativeConditionPrice
      .ele("cbc:PriceTypeCode", {
        listName: "Tipo de Precio",
        listURI: "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo16",
        listAgencyName: "PE:SUNAT",
      })
      .txt("01")
      .up();

    // Impuestos del detalle
    const detalleTaxTotal = invoiceLine.ele("cac:TaxTotal");
    const igvDetalle = detalle.cantidad * detalle.precioUnitario * 0.18; // IGV 18%
    detalleTaxTotal
      .ele("cbc:TaxAmount", { currencyID: "PEN" })
      .txt(igvDetalle.toFixed(2))
      .up();
    const detalleTaxSubtotal = detalleTaxTotal.ele("cac:TaxSubtotal");
    detalleTaxSubtotal
      .ele("cbc:TaxableAmount", { currencyID: "PEN" })
      .txt((detalle.cantidad * detalle.precioUnitario).toFixed(2))
      .up();
    detalleTaxSubtotal
      .ele("cbc:TaxAmount", { currencyID: "PEN" })
      .txt(igvDetalle.toFixed(2))
      .up();
    const detalleTaxCategory = detalleTaxSubtotal.ele("cac:TaxCategory");
    detalleTaxCategory.ele("cbc:Percent").txt("18").up();
    detalleTaxCategory
      .ele("cbc:TaxExemptionReasonCode", {
        listName: "Afectacion del IGV",
        listURI: "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo07",
        listAgencyName: "PE:SUNAT",
      })
      .txt("10")
      .up();
    const detalleTaxScheme = detalleTaxCategory.ele("cac:TaxScheme");
    detalleTaxScheme
      .ele("cbc:ID", {
        schemeName: "Codigo de tributos",
        schemeAgencyName: "PE:SUNAT",
        schemeURI: "urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo05",
      })
      .txt("1000")
      .up();
    detalleTaxScheme.ele("cbc:Name").txt("IGV").up();
    detalleTaxScheme.ele("cbc:TaxTypeCode").txt("VAT").up();

    // Item
    const item = invoiceLine.ele("cac:Item");
    item.ele("cbc:Description").dat(detalle.descripcion).up();
    item
      .ele("cac:SellersItemIdentification")
      .ele("cbc:ID")
      .txt(detalle.codigo)
      .up()
      .up();
    item
      .ele("cac:CommodityClassification")
      .ele("cbc:ItemClassificationCode", {
        listID: "UNSPSC",
        listAgencyName: "GS1 US",
        listName: "Item Classification",
      })
      .txt(detalle.unspsc || "44121618")
      .up()
      .up();

    // Precio unitario (sin IGV)
    invoiceLine
      .ele("cac:Price")
      .ele("cbc:PriceAmount", { currencyID: "PEN" })
      .txt(detalle.precioUnitario.toFixed(2))
      .up()
      .up();
  });

  // Convertir a string con formato legible
  const xmlString = xml.end({ prettyPrint: true });

  return xmlString;
}

// Función auxiliar para convertir número a letras (placeholder)
function convertirNumeroALetras(numero: number): string {
  // Aquí deberías implementar la lógica real para convertir el número a letras
  // Por ahora, usamos un valor fijo basado en tu ejemplo
  return "CIENTO DIECIOCHO CON 00 /100 SOLES";
}