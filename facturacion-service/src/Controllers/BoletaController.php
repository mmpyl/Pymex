<?php
namespace App\Controllers;

use App\Services\GreenterService;
use App\Services\SunatService;
use App\Services\PdfService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class BoletaController
{
    private GreenterService $greenter;
    private SunatService $sunat;
    private PdfService $pdf;

    public function __construct()
    {
        $this->greenter = new GreenterService();
        $this->sunat = new SunatService();
        $this->pdf = new PdfService();
    }

    public function emitir(Request $req, Response $res): Response
    {
        $body = $req->getParsedBody() ?? [];

        try {
            $empresaId = (int) ($body['empresa_id'] ?? 0);
            $serie = $body['serie'] ?? 'B001';
            $empresa = $this->sunat->getEmpresa($empresaId);
            if (!$empresa) return $this->error($res, 'Empresa no encontrada', 404);

            $items = $this->calcularIgvItems($body['items'] ?? []);
            $subtotal = array_sum(array_column($items, 'subtotal_sin_igv'));
            $igv = array_sum(array_column($items, 'igv_item'));
            $total = $subtotal + $igv;

            $correlativo = $this->sunat->getSiguienteCorrelativo($empresaId, $serie);
            $numero = "{$serie}-" . str_pad((string)$correlativo, 8, '0', STR_PAD_LEFT);

            $datos = [
                'serie' => $serie,
                'correlativo' => (string)$correlativo,
                'moneda' => $body['moneda'] ?? 'PEN',
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'items' => $items,
                'cliente' => $body['cliente'] ?? [],
                'empresa' => [
                    'ruc' => $_ENV['SUNAT_RUC'] ?? ($empresa['ruc'] ?? ''),
                    'razon_social' => $empresa['nombre'],
                    'direccion' => $empresa['direccion'] ?? 'Lima, Peru',
                    'ubigeo' => '150101', 'departamento' => 'LIMA', 'provincia' => 'LIMA', 'distrito' => 'LIMA'
                ],
            ];

            $resultado = $this->greenter->generarBoleta($datos);
            $estado = $resultado['success'] ? 'aceptado' : 'rechazado';

            $comprobanteId = $this->sunat->guardarComprobante([
                'empresa_id' => $empresaId,
                'venta_id' => $body['venta_id'] ?? null,
                'tipo' => 'boleta',
                'serie' => $serie,
                'correlativo' => $correlativo,
                'numero' => $numero,
                'ruc_cliente' => $body['cliente']['dni'] ?? null,
                'razon_social' => $body['cliente']['nombre'] ?? 'CLIENTE VARIOS',
                'direccion' => '',
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'moneda' => $datos['moneda'],
                'estado' => $estado,
                'sunat_estado' => $resultado['codigo'],
                'sunat_descripcion' => $resultado['descripcion'],
                'xml_path' => $resultado['xml_path'],
                'cdr_path' => $resultado['cdr_path'],
                'pdf_path' => null,
                'hash' => $resultado['hash'],
                'entorno' => $_ENV['APP_ENV'] ?? 'beta',
            ]);

            if ($resultado['success']) {
                $pdfPath = $this->pdf->generarFacturaPdf($datos, $numero, $comprobanteId, $resultado['hash']);
                $this->sunat->actualizarPdfPath($comprobanteId, $pdfPath);
            }

            return $this->json($res, [
                'success' => $resultado['success'], 'comprobante_id' => $comprobanteId,
                'numero' => $numero, 'estado' => $estado, 'sunat_codigo' => $resultado['codigo'],
                'descripcion' => $resultado['descripcion'], 'hash' => $resultado['hash'],
                'pdf_url' => "/api/boletas/{$comprobanteId}/pdf", 'xml_url' => "/api/boletas/{$comprobanteId}/xml",
            ]);
        } catch (\Exception $e) {
            return $this->error($res, $e->getMessage(), 500);
        }
    }

    public function obtener(Request $req, Response $res, array $args): Response
    {
        $c = $this->sunat->obtenerComprobante((int)$args['id']);
        return $c ? $this->json($res, $c) : $this->error($res, 'No encontrado', 404);
    }

    public function descargarPdf(Request $req, Response $res, array $args): Response
    {
        $c = $this->sunat->obtenerComprobante((int)$args['id']);
        if (!$c || !$c['pdf_path']) return $this->error($res, 'PDF no disponible', 404);
        $res->getBody()->write(file_get_contents($c['pdf_path']));
        return $res->withHeader('Content-Type', 'application/pdf')->withHeader('Content-Disposition', "attachment; filename={$c['numero']}.pdf");
    }

    public function reenviar(Request $req, Response $res, array $args): Response
    {
        return $this->json($res, ['mensaje' => 'Reenvio en proceso', 'id' => $args['id']]);
    }

    private function calcularIgvItems(array $items): array
    {
        return array_map(function ($item) {
            $precioConIgv = (float)$item['precio_unitario'];
            $precioSinIgv = round($precioConIgv / 1.18, 10);
            $subtotalSinIgv = round($precioSinIgv * (float)$item['cantidad'], 10);
            $igvItem = round($precioConIgv * (float)$item['cantidad'] - $subtotalSinIgv, 2);
            return [
                'codigo' => $item['codigo'] ?? 'P001', 'descripcion' => $item['descripcion'] ?? 'Producto',
                'cantidad' => (float)$item['cantidad'], 'unidad' => $item['unidad'] ?? 'NIU',
                'precio_unitario' => $precioConIgv, 'precio_unitario_sin_igv' => $precioSinIgv,
                'subtotal_sin_igv' => $subtotalSinIgv, 'igv_item' => $igvItem,
            ];
        }, $items);
    }

    private function json(Response $res, array $data, int $status = 200): Response
    {
        $res->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $res->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    private function error(Response $res, string $msg, int $status = 500): Response
    {
        return $this->json($res, ['error' => $msg], $status);
    }
}
