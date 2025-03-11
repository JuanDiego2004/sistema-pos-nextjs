
import { SignedXml } from "xml-crypto";
import * as forge from "node-forge";
import { readFileSync } from "fs";
import { createClientAsync } from "soap";


const firmarXML = (xml: string, certificadoPath: string, password: string): string => {
  const p12Buffer = readFileSync(certificadoPath);
  const p12Der = forge.util.createBuffer(p12Buffer.toString("binary"));
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });

  const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0]?.key;
  const cert = certBags[forge.pki.oids.certBag]?.[0]?.cert;

  if (!privateKey || !cert) {
    throw new Error("Private key or certificate not found in the provided P12 file.");
  }

  const pemKey = forge.pki.privateKeyToPem(privateKey);
  const pemCert = forge.pki.certificateToPem(cert);

  // Cast to any to work around TypeScript definition issues
  const sig = new SignedXml({
    privateKey: pemKey,
    publicCert: pemCert,
    canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#",
    signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
  }) as any;

  // Use type assertion to work around TypeScript method signature mismatch
  sig.addReference(
    "//*[local-name(.)='Invoice']",
    ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", "http://www.w3.org/2001/10/xml-exc-c14n#"],
    "http://www.w3.org/2001/04/xmlenc#sha256"
  );

  // Use type assertion for keyInfoProvider as well
  sig.keyInfoProvider = {
    getKeyInfo: () => [`<X509Data><X509Certificate>${pemCert.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n/g, "")}</X509Certificate></X509Data>`],
    getKey: () => pemKey,
  };

  // Calculate signature
  sig.computeSignature(xml, {
    prefix: "ds",
    location: { reference: "//*[local-name(.)='ExtensionContent']", action: "append" },
  });

  return sig.getSignedXml();
};

export { firmarXML };

export const enviarASunat = async (signedXml: string, ruc: string): Promise<any> => {
    const wsdlUrl = "https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl";
    const username = process.env.SUNAT_USERNAME || "TU_USUARIO_SOL";
    const password = process.env.SUNAT_PASSWORD || "TU_CLAVE_SOL";
  
    const client = await createClientAsync(wsdlUrl, {
      wsdl_options: { timeout: 10000 },
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
  
    return new Promise((resolve, reject) => {
      client.sendBill(args, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };