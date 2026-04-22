<?php

namespace App\Services;

use Greenter\Model\Client\Client;
use Greenter\Model\Company\Address;
use Greenter\Model\Company\Company;
use Greenter\Model\Sale\Invoice;
use Greenter\Model\Sale\Legend;
use Greenter\Model\Sale\Note;
use Greenter\Model\Sale\SaleDetail;
use Greenter\See;
use Greenter\Ws\Services\SunatEndpoints;
use Greenter\Xml\Exception\XmlException;

class GreenterService
{
    private See $see;
    private string $entorno;
    private string $rucEmpresa;

    public function __construct()
    {
        $this->entorno = $_ENV['APP_ENV'] ?? 'beta';
        $this->rucEmpresa = $_ENV['SUNAT_RUC'] ?? '00000000000';
        $this->see = $this->configurarSee();
    }

    private function configurarSee(): See
    {
        $see = new See();

        $certPath = $_ENV['CERT_PATH'] ?? '';
        $certPass = $_ENV['CERT_PASSWORD'] ?? '';

        if (!empty($certPath)) {
            if (!file_exists($certPath)) {
                if ($this->entorno !== 'beta') {
                    throw new \RuntimeException(
                        "Certificado digital no encontrado en: {$certPath}. " .
                        'Configura CERT_PATH correctamente antes de emitir en producción.'
                    );
                }
                error_log("[GreenterService] Advertencia: certificado no encontrado en {$certPath}. Operando sin certificado (solo válido en beta).");
            } elseif (!is_readable($certPath)) {
                throw new \RuntimeException(
                    "El certificado en {$certPath} no es legible. Verifica los permisos del archivo."
                );
            } else {
                $certContent = file_get_contents($certPath);
                if ($certContent === false || strlen($certContent) < 10) {
                    throw new \RuntimeException(
                        "El certificado en {$certPath} está vacío o corrupto."
                    );
                }
                $see->setCertificate($certContent, $certPass);
            }
        }

        $see->setService($this->getEndpoints());
        $see->getXmlSigner()->setXmlErrorRecovery(false);

        return $see;
    }

    private function getEndpoints(): string
    {
        return $this->entorno === 'beta' ? SunatEndpoints::FE_BETA : SunatEndpoints::FE_PRODUCCION;
    }

    public function generarFactura(array $datos): array
    {
        $invoice = new Invoice();
        $invoice
            ->setUblVersion('2.1')
            ->setTipoOperacion('0101')
            ->setTipoDoc('01')
            ->setSerie($datos['serie'])
            ->setCorrelativo($datos['correlativo'])
            ->setFechaEmision(new \DateTime())
            ->setTipoMoneda($datos['moneda'] ?? 'PEN')
            ->setClient($this->buildCliente($datos['cliente']))
            ->setMtoOperGravadas($datos['subtotal'])
            ->setMtoIGV($datos['igv'])
            ->setTotalImpuestos($datos['igv'])
            ->setValorVenta($datos['subtotal'])
            ->setSubTotal($datos['subtotal'] + $datos['igv'])
            ->setMtoImpVenta($datos['total'])
            ->setCompany($this->buildEmpresa($datos['empresa']))
            ->setDetails($this->buildDetalles($datos['items']))
            ->setLegends($this->buildLeyenda($datos['total']));

        return $this->enviarComprobante($invoice, $datos['serie'], (string) $datos['correlativo']);
    }

    public function generarBoleta(array $datos): array
    {
        $invoice = new Invoice();
        $invoice
            ->setUblVersion('2.1')
            ->setTipoOperacion('0101')
            ->setTipoDoc('03')
            ->setSerie($datos['serie'])
            ->setCorrelativo($datos['correlativo'])
            ->setFechaEmision(new \DateTime())
            ->setTipoMoneda($datos['moneda'] ?? 'PEN')
            ->setClient($this->buildClienteBoleta($datos['cliente']))
            ->setMtoOperGravadas($datos['subtotal'])
            ->setMtoIGV($datos['igv'])
            ->setTotalImpuestos($datos['igv'])
            ->setValorVenta($datos['subtotal'])
            ->setSubTotal($datos['subtotal'] + $datos['igv'])
            ->setMtoImpVenta($datos['total'])
            ->setCompany($this->buildEmpresa($datos['empresa']))
            ->setDetails($this->buildDetalles($datos['items']))
            ->setLegends($this->buildLeyenda($datos['total']));

        return $this->enviarComprobante($invoice, $datos['serie'], (string) $datos['correlativo']);
    }

    public function generarNotaCredito(array $datos): array
    {
        $note = new Note();
        $note
            ->setUblVersion('2.1')
            ->setTipoDoc('07')
            ->setSerie($datos['serie'])
            ->setCorrelativo($datos['correlativo'])
            ->setFechaEmision(new \DateTime())
            ->setTipoMoneda($datos['moneda'] ?? 'PEN')
            ->setTipDocAfectado($datos['tipo_doc_afectado'])
            ->setNumDocAfectado($datos['num_doc_afectado'])
            ->setCodMotivo('01')
            ->setDesMotivo($datos['motivo'] ?? 'Anulacion de comprobante')
            ->setClient($this->buildCliente($datos['cliente']))
            ->setMtoOperGravadas($datos['subtotal'])
            ->setMtoIGV($datos['igv'])
            ->setTotalImpuestos($datos['igv'])
            ->setValorVenta($datos['subtotal'])
            ->setSubTotal($datos['subtotal'] + $datos['igv'])
            ->setMtoImpVenta($datos['total'])
            ->setCompany($this->buildEmpresa($datos['empresa']))
            ->setDetails($this->buildDetalles($datos['items']));

        return $this->enviarComprobante($note, $datos['serie'], (string) $datos['correlativo']);
    }

    private function enviarComprobante($comprobante, string $serie, string $correlativo): array
    {
        try {
            $result = $this->see->send($comprobante);
            $xml = $this->see->getFactory()->getLastXml();
            $xmlPath = $this->guardarXml($xml, $serie, $correlativo);

            if (!$result->isAccepted()) {
                return [
                    'success' => false,
                    'codigo' => $result->getCode(),
                    'descripcion' => $result->getDescription(),
                    'xml_path' => $xmlPath,
                    'cdr_path' => null,
                    'hash' => null,
                ];
            }

            $cdrPath = $this->guardarCdr($result->getCdrZip(), $serie, $correlativo);

            return [
                'success' => true,
                'codigo' => $result->getCode(),
                'descripcion' => $result->getDescription(),
                'hash' => $result->getHash(),
                'xml_path' => $xmlPath,
                'cdr_path' => $cdrPath,
            ];
        } catch (XmlException $e) {
            return [
                'success' => false,
                'codigo' => 'XML_ERROR',
                'descripcion' => $e->getMessage(),
                'xml_path' => null,
                'cdr_path' => null,
                'hash' => null,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'codigo' => 'ERROR',
                'descripcion' => $e->getMessage(),
                'xml_path' => null,
                'cdr_path' => null,
                'hash' => null,
            ];
        }
    }

    private function buildEmpresa(array $datos): Company
    {
        $address = (new Address())
            ->setUbigueo($datos['ubigeo'] ?? '150101')
            ->setDepartamento($datos['departamento'] ?? 'LIMA')
            ->setProvincia($datos['provincia'] ?? 'LIMA')
            ->setDistrito($datos['distrito'] ?? 'LIMA')
            ->setUrbanizacion('-')
            ->setDireccion($datos['direccion'] ?? '');

        return (new Company())
            ->setRuc($datos['ruc'])
            ->setRazonSocial($datos['razon_social'])
            ->setNombreComercial($datos['nombre_comercial'] ?? $datos['razon_social'])
            ->setAddress($address);
    }

    private function buildCliente(array $datos): Client
    {
        return (new Client())
            ->setTipoDoc('6')
            ->setNumDoc($datos['ruc'] ?? '')
            ->setRznSocial($datos['razon_social'] ?? '')
            ->setAddress($datos['direccion'] ?? '');
    }

    private function buildClienteBoleta(array $datos): Client
    {
        $tipoDoc = !empty($datos['dni']) ? '1' : '0';
        $numDoc = !empty($datos['dni']) ? $datos['dni'] : '00000000';

        return (new Client())
            ->setTipoDoc($tipoDoc)
            ->setNumDoc($numDoc)
            ->setRznSocial($datos['nombre'] ?? 'CLIENTE VARIOS');
    }

    private function buildDetalles(array $items): array
    {
        $detalles = [];

        foreach ($items as $item) {
            $detalles[] = (new SaleDetail())
                ->setCodProducto($item['codigo'] ?? 'P001')
                ->setUnidad($item['unidad'] ?? 'NIU')
                ->setCantidad($item['cantidad'])
                ->setMtoValorUnitario($item['precio_unitario_sin_igv'])
                ->setDescripcion($item['descripcion'])
                ->setMtoBaseIgv($item['precio_unitario_sin_igv'] * $item['cantidad'])
                ->setPorcentajeIgv(18.00)
                ->setIgv($item['igv_item'])
                ->setTipAfeIgv('10')
                ->setTotalImpuestos($item['igv_item'])
                ->setMtoValorVenta($item['subtotal_sin_igv'])
                ->setMtoPrecioUnitario($item['precio_unitario']);
        }

        return $detalles;
    }

    private function buildLeyenda(float $total): array
    {
        return [
            (new Legend())
                ->setCode('1000')
                ->setValue($this->numeroALetras($total)),
        ];
    }

    private function guardarXml(string $xml, string $serie, string $correlativo): string
    {
        $dir = $_ENV['STORAGE_XML'] ?? 'storage/xml/';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filename = "{$this->rucEmpresa}-{$serie}-{$correlativo}.xml";
        $path = $dir . $filename;
        file_put_contents($path, $xml);

        return $path;
    }

    private function guardarCdr(string $cdrZip, string $serie, string $correlativo): string
    {
        $dir = $_ENV['STORAGE_CDR'] ?? 'storage/cdr/';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filename = "R-{$this->rucEmpresa}-{$serie}-{$correlativo}.zip";
        $path = $dir . $filename;
        file_put_contents($path, $cdrZip);

        return $path;
    }

    private function numeroALetras(float $numero): string
    {
        $entero = (int) $numero;
        $decimal = round(($numero - $entero) * 100);
        $centavos = str_pad((string) $decimal, 2, '0', STR_PAD_LEFT);
        $letras = $this->convertirEnteroALetras($entero);

        return strtoupper(trim($letras)) . " CON {$centavos}/100 SOLES";
    }

    private function convertirEnteroALetras(int $n): string
    {
        $unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
        $decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];

        if ($n < 20) {
            return $unidades[$n];
        }

        if ($n < 100) {
            return $decenas[intdiv($n, 10)] . ($n % 10 ? ' Y ' . $unidades[$n % 10] : '');
        }

        if ($n < 1000) {
            $c = intdiv($n, 100);
            $r = $n % 100;
            $centenas = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
            return ($c === 1 && $r > 0 ? 'CIENTO' : $centenas[$c]) . ($r ? ' ' . $this->convertirEnteroALetras($r) : '');
        }

        if ($n < 1000000) {
            $miles = intdiv($n, 1000);
            $resto = $n % 1000;
            return ($miles === 1 ? 'MIL' : $this->convertirEnteroALetras($miles) . ' MIL') . ($resto ? ' ' . $this->convertirEnteroALetras($resto) : '');
        }

        return (string) $n;
    }
}
