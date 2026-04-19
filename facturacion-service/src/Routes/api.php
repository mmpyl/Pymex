<?php
use App\Controllers\FacturaController;
use App\Controllers\BoletaController;
use App\Controllers\NotaCreditoController;
use Slim\Routing\RouteCollectorProxy;

$app->get('/', function ($req, $res) {
    $res->getBody()->write(json_encode([
        'servicio' => 'Facturacion Electronica SUNAT',
        'estado'   => 'activo',
        'entorno'  => $_ENV['APP_ENV'] ?? 'beta',
        'version'  => '1.0.0'
    ], JSON_UNESCAPED_UNICODE));

    return $res->withHeader('Content-Type', 'application/json');
});

$app->group('/api', function (RouteCollectorProxy $group) {

    $group->get('/health', function ($req, $res) {
        $res->getBody()->write(json_encode([
            'servicio' => 'Facturacion Electronica SUNAT',
            'estado' => 'ok',
            'entorno' => $_ENV['APP_ENV'] ?? 'beta'
        ], JSON_UNESCAPED_UNICODE));
        return $res->withHeader('Content-Type', 'application/json');
    });

    $group->post('/facturas/emitir',        [FacturaController::class, 'emitir']);
    $group->get('/facturas/{id}',           [FacturaController::class, 'obtener']);
    $group->get('/facturas/{id}/pdf',       [FacturaController::class, 'descargarPdf']);
    $group->get('/facturas/{id}/xml',       [FacturaController::class, 'descargarXml']);
    $group->post('/facturas/{id}/reenviar', [FacturaController::class, 'reenviar']);

    $group->post('/boletas/emitir',         [BoletaController::class, 'emitir']);
    $group->get('/boletas/{id}',            [BoletaController::class, 'obtener']);
    $group->get('/boletas/{id}/pdf',        [BoletaController::class, 'descargarPdf']);
    $group->post('/boletas/{id}/reenviar',  [BoletaController::class, 'reenviar']);

    $group->post('/notas-credito/emitir',   [NotaCreditoController::class, 'emitir']);
    $group->get('/notas-credito/{id}',      [NotaCreditoController::class, 'obtener']);

    $group->get('/comprobantes/empresa/{empresa_id}', [FacturaController::class, 'listarPorEmpresa']);
    $group->get('/comprobantes/empresa/{empresa_id}/correlativo/{serie}', [FacturaController::class, 'getSiguienteCorrelativo']);
});
