import { Preventa } from "@/app/utils/types";
import { saveAs } from "file-saver";

export const generarXML = (preventa: Preventa, empresaInfo: any) => {
  // Datos de la empresa
  const empresa = empresaInfo || {
    ruc: "20123456789",
    razonSocial: "Nombre de la Empresa",
    direccionFiscal: "CASUARINAS",
    ubigeo: "150101",
    nombreComercial: "Nombre Comercial",
  };

  // Datos del cliente
  const cliente = preventa.cliente || {
    numeroDocumento: "20603343710",
    nombre: "Nombre del Cliente",
    razonSocial: "Razón Social del Cliente",
    direccion: "Dirección del Cliente",
    direccionFiscal: "Dirección Fiscal del Cliente",
  };

  // Detalles de los productos
  const detallesProductos = preventa.detallePreventas.map((detalle, index) => `
    <cac:InvoiceLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="NIU">${detalle.cantidad}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="PEN">${(detalle.precioUnitario * detalle.cantidad).toFixed(2)}</cbc:LineExtensionAmount>
      <cac:PricingReference>
        <cac:AlternativeConditionPrice>
          <cbc:PriceAmount currencyID="PEN">${detalle.precioUnitario.toFixed(2)}</cbc:PriceAmount>
          <cbc:PriceTypeCode>01</cbc:PriceTypeCode>
        </cac:AlternativeConditionPrice>
      </cac:PricingReference>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="PEN">${(detalle.total * 0.18).toFixed(2)}</cbc:TaxAmount>
        <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="PEN">${detalle.total.toFixed(2)}</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="PEN">${(detalle.total * 0.18).toFixed(2)}</cbc:TaxAmount>
          <cac:TaxCategory>
            <cac:TaxScheme>
              <cbc:ID>IGV</cbc:ID>
              <cbc:Name>VAT</cbc:Name>
            </cac:TaxScheme>
          </cac:TaxCategory>
        </cac:TaxSubtotal>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Description>${detalle.producto?.nombre || "Producto Desconocido"}</cbc:Description>
        <cbc:Name>${detalle.producto?.nombre || "Producto Desconocido"}</cbc:Name>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="PEN">${detalle.precioUnitario.toFixed(2)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>
  `).join("");

  // Generar el XML completo
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${preventa.serieDocumento?.serie || "F001"}-${preventa.id.slice(-4)}</cbc:ID>
  <cbc:IssueDate>${new Date(preventa.fecha).toISOString().split("T")[0]}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>${preventa.tipoComprobante || "01"}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${preventa.moneda || "PEN"}</cbc:DocumentCurrencyCode>
  <cac:Signature>
    <cbc:ID>#EMPRESA-SIGN</cbc:ID>
    <cac:SignatoryParty>
      <cac:PartyIdentification>
        <cbc:ID>${empresa.ruc}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${empresa.razonSocial}</cbc:Name>
      </cac:PartyName>
    </cac:SignatoryParty>
  </cac:Signature>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID>${empresa.ruc}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${empresa.razonSocial}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:ID>${empresa.ubigeo}</cbc:ID>
        <cbc:StreetName>${empresa.direccionFiscal}</cbc:StreetName>
        <cbc:CitySubdivisionName>LIMA</cbc:CitySubdivisionName>
        <cbc:CityName>LIMA</cbc:CityName>
        <cbc:CountrySubentity>LIMA</cbc:CountrySubentity>
        <cac:Country>
          <cbc:IdentificationCode>PE</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID>${cliente.numeroDocumento}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${cliente.razonSocial || cliente.nombre}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
      <cac:PostalAddress>
        <cbc:StreetName>${cliente.direccionFiscal || cliente.direccion}</cbc:StreetName>
        <cbc:CitySubdivisionName>LIMA</cbc:CitySubdivisionName>
        <cbc:CityName>LIMA</cbc:CityName>
        <cbc:CountrySubentity>LIMA</cbc:CountrySubentity>
        <cac:Country>
          <cbc:IdentificationCode>PE</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:PaymentTerms>
    <cbc:ID>FormaPago</cbc:ID>
    <cbc:PaymentMeansID>${preventa.metodoPago || "Contado"}</cbc:PaymentMeansID>
  </cac:PaymentTerms>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="PEN">${preventa.impuesto.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="PEN">${preventa.subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="PEN">${preventa.impuesto.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:ID>IGV</cbc:ID>
          <cbc:Name>VAT</cbc:Name>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="PEN">${preventa.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxInclusiveAmount currencyID="PEN">${preventa.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="PEN">${preventa.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${detallesProductos}
</Invoice>
`;

  // Crear un archivo XML y descargarlo
  const blob = new Blob([xmlContent], { type: "application/xml" });
  saveAs(blob, `factura-${preventa.serieDocumento?.serie || "F001"}-${preventa.id.slice(-4)}.xml`);
};