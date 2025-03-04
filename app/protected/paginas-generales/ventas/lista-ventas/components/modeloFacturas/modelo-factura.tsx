import React from 'react';


import { Preventa } from '@/app/utils/types';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Modal, ModalContent } from '@heroui/modal';
import { format } from 'date-fns';
import { Button } from '@heroui/button';
import { Image } from '@heroui/image';

interface DetallesVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  preventa: Preventa | null;
  empresaInfo: any;
}

export default function DetallesVentaModalFactura({
  isOpen,
  onClose,
  preventa,
  empresaInfo,
}: DetallesVentaModalProps) {
  if (!preventa) return null;


  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content');
    const originalContent = document.body.innerHTML;
    
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #invoice-content, #invoice-content * {
          visibility: visible;
        }
        #invoice-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100vh;
        }
        .no-print {
          display: none !important;
        }
        @page {
          size: A4;
          
        }
        .invoice-container {
          min-height: 100vh !important;
        }
      }
    `;
    document.head.appendChild(style);

    window.print();

    document.head.removeChild(style);
  };


  return (

    
    <Modal
    isOpen={isOpen}
    onOpenChange={onClose}
    classNames={{
      base: "max-w-[900px] w-full",
    }}
    scrollBehavior="inside"
  >
    <ModalContent>
      {(onClose) => (
        <div className="p-8 bg-white">
          <div id="invoice-content">
            <div className="invoice-container min-h-[1123px] flex flex-col">
              {/* Header Section - Fixed at top */}
              <div className="flex-none">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-6">
                  <div className="w-1/3">
                    <Image
                      alt="Logo empresa"
                      src={empresaInfo.logoUrl}
                      width={150}
                      height={150}
                      className="object-contain"
                    />
                  </div>
                  
                  <div className="w-1/3 text-center space-y-1">
                    <h1 className="text-2xl font-bold text-gray-800">{empresaInfo.razonSocial}</h1>
                    <div className="text-sm text-gray-600 space-y-0.5">
                      <p>{empresaInfo.direccionFiscal}</p>
                      <p>{empresaInfo.ubigeo}</p>
                      <p className="font-semibold">RUC: {empresaInfo.ruc}</p>
                    </div>
                  </div>

                  <div className="w-1/3 flex justify-end">
                    <div className="border-2 border-blue-600 rounded-lg p-4 w-64">
                      <h2 className="text-xl font-bold text-center text-blue-600 mb-2">FACTURA ELECTRÓNICA</h2>
                      <div className="text-center space-y-1">
                        <p className="text-lg font-semibold">
                          {preventa.serieDocumento?.serie}-{String(preventa.serieDocumento?.ultimoCorrelativo).padStart(8, '0')}
                        </p>
                        <div className="text-sm text-gray-600">
                          <p>Fecha de Emisión:</p>
                          <p className="font-medium">{format(preventa.fecha, 'dd/MM/yyyy')}</p>
                          <p>{format(preventa.fecha, 'HH:mm:ss')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="border rounded-lg bg-gray-50">
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Cliente:</span>
                        <span className="col-span-2">{preventa.cliente?.nombre || "Sin nombre"}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">RUC:</span>
                        <span className="col-span-2">{preventa.cliente?.numeroDocumento || "Sin RUC"}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Dirección:</span>
                        <span className="col-span-2">{preventa.cliente?.direccion || "Sin dirección"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg bg-gray-50">
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Teléfono:</span>
                        <span className="col-span-2">{preventa.cliente?.telefono || "-"}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Email:</span>
                        <span className="col-span-2">{preventa.cliente?.email || "-"}</span>
                      </div>
                      <div className="grid grid-cols-3">
                        <span className="font-semibold">Vendedor:</span>
                        <span className="col-span-2">Juan Diego</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Products Table */}
              <div className="flex-grow mt-6">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="py-3 px-4 text-left font-semibold text-blue-600">Descripción</th>
                        <th className="py-3 px-4 text-center font-semibold text-blue-600 w-24">Cantidad</th>
                        <th className="py-3 px-4 text-right font-semibold text-blue-600 w-32">Precio Unit.</th>
                        <th className="py-3 px-4 text-right font-semibold text-blue-600 w-32">Total</th>
                      </tr>

                    </thead>
                    <tbody>
                      {preventa.detallePreventas.map((detalle, index) => (
                        <tr 
                          key={detalle.id} 
                          className={`
                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            ${index !== preventa.detallePreventas.length - 1 ? 'border-b' : ''}
                          `}
                        >
                          <td className="py-3 px-4">{detalle.producto?.nombre || "N/A"}</td>
                          <td className="py-3 px-4 text-center">{detalle.cantidad}</td>
                          <td className="py-3 px-4 text-right">S/ {detalle.precioUnitario.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">S/ {detalle.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Section - Fixed at bottom */}
              <div className="flex-none mt-6">
                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-72 border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4 bg-blue-50 font-semibold text-blue-600">Subtotal:</td>
                          <td className="py-3 px-4 text-right">S/ {preventa.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 bg-blue-50 font-semibold text-blue-600">IGV:</td>
                          <td className="py-3 px-4 text-right">S/ {preventa.impuesto.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 bg-blue-50 font-semibold text-blue-600">Total:</td>
                          <td className="py-3 px-4 text-right font-bold text-lg">S/ {preventa.total.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* QR Code and Footer Info */}
                <div className="flex justify-between items-end">
                  <div className="w-32 h-32 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm text-center">Código QR</span>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    <p>Representación impresa de la Factura Electrónica</p>
                    <p>Consulte en: {empresaInfo.websiteConsulta || 'www.sunat.gob.pe'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-4 no-print">
            <Button 
              color="danger" 
              variant="light" 
              onPress={onClose}
              className="px-6"
            >
              Cerrar
            </Button>
            <Button 
              color="primary" 
              onPress={handlePrint}
              className="px-6"
            >
              Imprimir Factura
            </Button>
          </div>
        </div>
      )}
    </ModalContent>
  </Modal>
  );
}