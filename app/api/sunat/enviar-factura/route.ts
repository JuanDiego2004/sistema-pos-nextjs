import { NextResponse } from "next/server";

import { Reference, SignedXml } from "xml-crypto";
import * as forge from "node-forge";
import { createClientAsync } from "soap";
import prisma from "@/lib/prisma";

// Definir interfaz para la respuesta de SUNAT
interface SunatResponse {
  applicationResponse?: string;
  [key: string]: any;
}

// Extender el tipo SignedXml para incluir keyInfoProvider
interface ExtendedSignedXml extends SignedXml {
  keyInfoProvider: {
    get: () => string[];
  };
  addReference: ({ xpath, transforms, digestAlgorithm, uri, digestValue, inclusiveNamespacesPrefixList, isEmptyUri }: Partial<Reference> & Pick<Reference, "xpath">) => void;
}

export async function POST(request: Request) {
  let preventaId: string | undefined;
  
  try {
    const data = await request.json();
    preventaId = data.preventaId;
    console.log("ID de preventa recibido:", preventaId);

    if (!preventaId) {
      return NextResponse.json(
        { message: "Se requiere el ID de la preventa" },
        { status: 400 }
      );
    }

    // Obtener la preventa desde la base de datos
    const preventa = await prisma.preventa.findUnique({
      where: { id: preventaId },
      select: { xml: true, firmaDigital: true },
    });

    if (!preventa || !preventa.xml) {
      return NextResponse.json(
        { message: "Preventa o XML no encontrado" },
        { status: 404 }
      );
    }

    let signedXml = preventa.firmaDigital || preventa.xml;

    // Firmar el XML si no está firmado
    if (!preventa.firmaDigital) {
      const empresa = await prisma.infoEmpresa.findFirst({
        select: {
          ruc: true,
          certificadoDigital: true,
          clavePrivada: true,
          certificadoPassword: true,
        },
      });

      if (!empresa || !empresa.certificadoDigital) {
        return NextResponse.json(
          { message: "No se encontró un certificado digital en InfoEmpresa" },
          { status: 400 }
        );
      }

      let privateKeyPem: string;
      let certPem: string;

      try {
        // Si ya tenemos la clave privada separada
        if (empresa.clavePrivada) {
          // Usamos casting explícito a Buffer para evitar errores de TypeScript
          certPem = (empresa.certificadoDigital as Buffer).toString('utf8');
          privateKeyPem = (empresa.clavePrivada as Buffer).toString('utf8');
          
          // Verificar que tienen el formato correcto con encabezados y pie de página
          if (!privateKeyPem.includes('-----BEGIN PRIVATE KEY-----') && 
              !privateKeyPem.includes('-----BEGIN RSA PRIVATE KEY-----')) {
            throw new Error("La clave privada no está en formato PEM válido");
          }
          
          if (!certPem.includes('-----BEGIN CERTIFICATE-----')) {
            throw new Error("El certificado no está en formato PEM válido");
          }
        } else {
          // Si tenemos un archivo PFX, extraemos clave y certificado
          console.log("Extrayendo certificado y clave privada del archivo PFX...");
          
          // Asegurarnos de que el buffer es correcto
          if (!Buffer.isBuffer(empresa.certificadoDigital)) {
            console.log("Convirtiendo certificado a Buffer...");
            empresa.certificadoDigital = Buffer.from(empresa.certificadoDigital);
          }
          
          const pfxBuffer = empresa.certificadoDigital;
          console.log("Tamaño del buffer PFX:", pfxBuffer.length);
          
          // Usar una forma más directa de trabajar con el PFX en memoria
          const p12Der = forge.asn1.fromDer(forge.util.createBuffer(pfxBuffer.toString('binary')));
          const p12 = forge.pkcs12.pkcs12FromAsn1(p12Der, empresa.certificadoPassword || "");
          
          // Extraer clave privada - Corregido para manejar posibles indefinidos
          const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
          const keyBagArray = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag] || [];
          const keyBag = keyBagArray[0];
          
          if (!keyBag || !keyBag.key) {
            throw new Error("No se pudo extraer la clave privada del certificado");
          }
          privateKeyPem = forge.pki.privateKeyToPem(keyBag.key);
          
          // Extraer certificado - Corregido para manejar posibles indefinidos
          const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
          const certBagArray = certBags[forge.pki.oids.certBag] || [];
          const certBagItem = certBagArray[0];
          
          if (!certBagItem || !certBagItem.cert) {
            throw new Error("No se pudo extraer el certificado");
          }
          certPem = forge.pki.certificateToPem(certBagItem.cert);
          
          console.log("Certificado y clave privada extraídos correctamente");
        }
        
        console.log("Longitud de la clave privada:", privateKeyPem.length);
        console.log("Longitud del certificado:", certPem.length);
      } catch (certError) {
        console.error("Error procesando el certificado:", certError);
        throw new Error(`Error al procesar el certificado: ${certError instanceof Error ? certError.message : 'Error desconocido'}`);
      }

      try {
        console.log("Creando objeto SignedXml...");
        // Usar casting para extender SignedXml con las propiedades que necesitamos
        const sig = new SignedXml({
          privateKey: privateKeyPem,
          publicCert: certPem,
          canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#",
          signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
        }) as ExtendedSignedXml;

        console.log("Añadiendo referencias para la firma...");
        // Usar la interfaz extendida para acceder a addReference con múltiples argumentos
        sig.addReference({
          xpath: "//*[local-name(.)='Invoice']",
          transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", "http://www.w3.org/2001/10/xml-exc-c14n#"],
          digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256"
        });

        console.log("Configurando keyInfoProvider...");
        // Usar la interfaz extendida para acceder a keyInfoProvider
        sig.keyInfoProvider = {
          get: () => [
            `<X509Data><X509Certificate>${certPem.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n/g, "")}</X509Certificate></X509Data>`,
          ],
        };

        console.log("Firmando XML...");
        console.log("Longitud del XML original:", preventa.xml.length);
        
        try {
          sig.computeSignature(preventa.xml, {
            prefix: "ds",
            location: { reference: "//*[local-name(.)='ExtensionContent']", action: "append" },
          });
          
          signedXml = sig.getSignedXml();
          console.log("XML firmado exitosamente. Longitud:", signedXml.length);
          
          await prisma.preventa.update({
            where: { id: preventaId },
            data: { firmaDigital: signedXml },
          });
        } catch (signError) {
          console.error("Error específico al firmar XML:", signError);
          if (signError instanceof Error) {
            throw new Error(`Error al firmar XML: ${signError.message}`);
          } else {
            throw new Error("Error al firmar XML desconocido");
          }
        }
      } catch (xmlCryptoError) {
        console.error("Error con xml-crypto:", xmlCryptoError);
        if (xmlCryptoError instanceof Error) {
          throw new Error(`Error con xml-crypto: ${xmlCryptoError.message}`);
        } else {
          throw new Error("Error con xml-crypto desconocido");
        }
      }
    }

    console.log("Configurando conexión con SUNAT...");
    // Enviar a SUNAT (entorno de pruebas)
    const empresa = await prisma.infoEmpresa.findFirst({ select: { ruc: true } });
    const ruc = empresa?.ruc || "20000000001";
    const wsdlUrl = "https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl";
    const username = "20000000001MODDATOS";
    const password = "moddatos";

    try {
      console.log("Creando cliente SOAP...");
      const client = await createClientAsync(wsdlUrl, { 
        wsdl_options: { 
          timeout: 30000,  // Aumentar timeout
          strictSSL: false // Desactivar verificación estricta de SSL para pruebas
        } 
      });

      client.setSecurity({
        addOptions: (options: any) => {
          options.username = username;
          options.password = password;
        },
      });

      const fileName = `${ruc}-01-F001-${Date.now()}.xml`;
      const contentFile = Buffer.from(signedXml).toString("base64");

      const args = { fileName, contentFile };

      console.log("Enviando factura a SUNAT...");
      const sunatResponse = await new Promise<SunatResponse>((resolve, reject) => {
        client.sendBill(args, (err: any, result: SunatResponse) => {
          if (err) {
            console.error("Error en la respuesta de SUNAT:", err);
            reject(err);
          } else {
            console.log("Respuesta exitosa de SUNAT");
            resolve(result);
          }
        });
      });
      
      console.log("Respuesta de SUNAT:", sunatResponse);

      // Actualizar el estado en la base de datos según la respuesta de SUNAT
      const isSuccess = sunatResponse && sunatResponse.applicationResponse; // Verifica si SUNAT aceptó el envío
      await prisma.preventa.update({
        where: { id: preventaId },
        data: {
          estadoSunat: isSuccess ? "ENVIADO" : "ERROR",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Factura procesada por SUNAT",
        sunatResponse: sunatResponse, // Incluye la respuesta completa de SUNAT
      });
    } catch (soapError) {
      console.error("Error en la comunicación SOAP con SUNAT:", soapError);
      const soapErrorMessage = soapError instanceof Error ? soapError.message : "Error desconocido";
      throw new Error(`Error en la comunicación con SUNAT: ${soapErrorMessage}`);
    }
  } catch (error) {
    console.error("Error enviando factura a SUNAT:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    
    // Actualizar estado en caso de error solo si tenemos el ID de la preventa
    if (preventaId) {
      try {
        await prisma.preventa.update({
          where: { id: preventaId },
          data: { estadoSunat: "ERROR" },
        });
      } catch (updateError) {
        console.error("Error adicional al actualizar estado:", updateError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error al enviar la factura a SUNAT",
        error: errorMessage,
        sunatResponse: null,
      },
      { status: 500 }
    );
  }
}