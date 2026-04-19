<?php
namespace App\Controllers;

use App\Services\GreenterService;
use App\Services\SunatService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class NotaCreditoController
{
    private GreenterService $greenter;
    private SunatService $sunat;

    public function __construct()
    {
        $this->greenter = new GreenterService();
        $this->sunat = new SunatService();
    }

    public function emitir(Request $req, Response $res): Response
    {
        $body = $req->getParsedBody() ?? [];

        try {
            $empresaId = (int) ($body['empresa_id'] ?? 0);
            $comprobanteRef = $this->sunat->obtenerComprobante((int) ($body['comprobante_id'] ?? 0));
            if (!$comprobanteRef) return $this->error($res, 'Comprobante de referencia no encontrado', 404);

            $serie = $comprobanteRef['tipo'] === 'factura' ? 'FC01' : 'BC01';
            $correlativo = $this->sunat->getSiguienteCorrelativo($empresaId, $serie);
            $numero = "{$serie}-" . str_pad((string)$correlativo, 8, '0', STR_PAD_LEFT);
            $empresa = $this->sunat->getEmpresa($empresaId);

            $items = $this->calcularIgvItems($body['items'] ?? []);
            $subtotal = array_sum(array_column($items, 'subtotal_sin_igv'));
            $igv = array_sum(array_column($items, 'igv_item'));
            $total = $subtotal + $igv;

            $datos = [
                'serie' => $serie, 'correlativo' => (string)$correlativo, 'moneda' => 'PEN',
                'subtotal' => $subtotal, 'igv' => $igv, 'total' => $total, 'items' => $items,
                'tipo_doc_afectado' => $comprobanteRef['tipo'] === 'factura' ? '01' : '03',
                'num_doc_afectado' => $comprobanteRef['numero'],
                'motivo' => $body['motivo'] ?? 'Anulacion de comprobante',
                'cliente' => [
                    'ruc' => $comprobanteRef['ruc_cliente'],
                    'razon_social' => $comprobanteRef['razon_social'],
                    'direccion' => $comprobanteRef['direccion'],
                ],
                'empresa' => [
                    'ruc' => $_ENV['SUNAT_RUC'] ?? ($empresa['ruc'] ?? ''),
                    'razon_social' => $empresa['nombre'] ?? 'EMPRESA',
                    'direccion' => $empresa['direccion'] ?? 'Lima, Peru',
                    'ubigeo' => '150101', 'departamento' => 'LIMA', 'provincia' => 'LIMA', 'distrito' => 'LIMA'
                ],
            ];

            $resultado = $this->greenter->generarNotaCredito($datos);
            $estado = $resultado['success'] ? 'aceptado' : 'rechazado';

            $comprobanteId = $this->sunat->guardarComprobante([
                'empresa_id' => $empresaId,
                'venta_id' => $comprobanteRef['venta_id'],
                'tipo' => 'nota_credito',
                'serie' => $serie,
                'correlativo' => $correlativo,
                'numero' => $numero,
                'ruc_cliente' => $comprobanteRef['ruc_cliente'],
                'razon_social' => $comprobanteRef['razon_social'],
                'direccion' => $comprobanteRef['direccion'],
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'moneda' => 'PEN',
                'estado' => $estado,
                'sunat_estado' => $resultado['codigo'],
                'sunat_descripcion' => $resultado['descripcion'],
                'xml_path' => $resultado['xml_path'],
                'cdr_path' => $resultado['cdr_path'],
                'pdf_path' => null,
                'hash' => $resultado['hash'],
                'entorno' => $_ENV['APP_ENV'] ?? 'beta',
            ]);

            return $this->json($res, [
                'success' => $resultado['success'], 'comprobante_id' => $comprobanteId,
                'numero' => $numero, 'estado' => $estado, 'descripcion' => $resultado['descripcion'],
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

    private function calcularIgvItems(array $items): array
    {
        return array_map(function ($item) {
            $precioConIgv = (float)$item['precio_unitario'];
            $precioSinIgv = round($precioConIgv / 1.18, 10);
            $subtotalSinIgv = round($precioSinIgv * (float)$item['cantidad'], 10);
            $igvItem = round($precioConIgv * (float)$item['cantidad'] - $subtotalSinIgv, 2);
            return [
                'codigo' => $item['codigo'] ?? 'P001', 'descripcion' => $item['descripcion'] ?? 'Producto',
                'cantidad' => (float)$item['cantidad'], 'unidad' => 'NIU', 'precio_unitario' => $precioConIgv,
                'precio_unitario_sin_igv' => $precioSinIgv, 'subtotal_sin_igv' => $subtotalSinIgv, 'igv_item' => $igvItem,
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
