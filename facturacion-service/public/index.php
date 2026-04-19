<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

$app = AppFactory::create();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

$allowedOrigins = array_map('trim', explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:5173'));

$app->add(function ($request, $handler) use ($allowedOrigins) {
    $origin = $request->getHeaderLine('Origin');
    $corsOrigin = in_array($origin, $allowedOrigins, true) ? $origin : ($allowedOrigins[0] ?? '*');
    
    $requestId = $request->getHeaderLine('x-request-id') ?: bin2hex(random_bytes(8));

    if ($request->getMethod() === 'OPTIONS') {
        $response = new \Slim\Psr7\Response();
    } else {
        $response = $handler->handle($request);
    }

    return $response
        ->withHeader('Access-Control-Allow-Origin', $corsOrigin)
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-request-id')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Credentials', 'true')
        ->withHeader('x-request-id', $requestId);
});

require __DIR__ . '/../src/Routes/api.php';

$app->run();
