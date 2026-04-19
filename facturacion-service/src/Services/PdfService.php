<?php
namespace App\Services;

class PdfService
{
    public function generarFacturaPdf(array $datos, string $numero, int $id, ?string $hash): string
    {
        $dir = $_ENV['STORAGE_PDF'] ?? 'storage/pdf/';
        if (!is_dir($dir)) mkdir($dir, 0755, true);

        $path = $dir . "{$numero}.pdf";
        $html = $this->buildHtml($datos, $numero, $hash, 'FACTURA ELECTRÓNICA');

        $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8');
        $pdf->SetCreator('SaaS PYMES');
        $pdf->SetAuthor($datos['empresa']['razon_social'] ?? 'SaaS PYMES');
        $pdf->SetTitle("Comprobante {$numero}");
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetMargins(10, 10, 10);
        $pdf->AddPage();
        $pdf->writeHTML($html, true, false, true, false, '');
        $pdf->Output($path, 'F');

        return $path;
    }

    private function buildHtml(array $datos, string $numero, ?string $hash, string $tipo): string
    {
        $empresa = $datos['empresa'];
        $cliente = $datos['cliente'];
        $items = $datos['items'];
        $subtotal = number_format((float) $datos['subtotal'], 2);
        $igv = number_format((float) $datos['igv'], 2);
        $total = number_format((float) $datos['total'], 2);
        $fecha = date('d/m/Y');
        $moneda = ($datos['moneda'] ?? 'PEN') === 'PEN' ? 'S/' : '$';

        $filas = '';
        foreach ($items as $item) {
            $filas .= "<tr>
                <td style='padding:6px;border:1px solid #e2e8f0'>{$item['descripcion']}</td>
                <td style='padding:6px;border:1px solid #e2e8f0;text-align:center'>{$item['cantidad']}</td>
                <td style='padding:6px;border:1px solid #e2e8f0;text-align:right'>{$moneda} " . number_format($item['precio_unitario'], 2) . "</td>
                <td style='padding:6px;border:1px solid #e2e8f0;text-align:right'>{$moneda} " . number_format($item['precio_unitario'] * $item['cantidad'], 2) . "</td>
            </tr>";
        }

        $hashCorto = $hash ? substr($hash, 0, 20) . '...' : 'Pendiente';

        return "
        <html><body style='font-family:Arial;font-size:11px;color:#1e1b4b'>
        <h2>{$tipo} - {$numero}</h2>
        <p><strong>Fecha:</strong> {$fecha}</p>
        <p><strong>Empresa:</strong> {$empresa['razon_social']} - RUC {$empresa['ruc']}</p>
        <p><strong>Cliente:</strong> " . ($cliente['razon_social'] ?? ($cliente['nombre'] ?? 'CLIENTE VARIOS')) . "</p>
        <table width='100%' style='border-collapse:collapse'>
            <tr style='background:#e2e8f0'>
                <th style='padding:6px'>Descripción</th>
                <th style='padding:6px'>Cant.</th>
                <th style='padding:6px'>P. Unit.</th>
                <th style='padding:6px'>Subtotal</th>
            </tr>
            {$filas}
        </table>
        <p><strong>Subtotal:</strong> {$moneda} {$subtotal}</p>
        <p><strong>IGV:</strong> {$moneda} {$igv}</p>
        <p><strong>Total:</strong> {$moneda} {$total}</p>
        <p style='font-size:9px;color:#64748b'>Hash: {$hashCorto}</p>
        </body></html>";
    }
}
