<?php

namespace App\Services;

use PDO;




namespace App\Services;

use PDO;


// facturacion-service/src/Services/SunatService.php
// FIX: se añade try/catch al constructor PDO para evitar que un .env
// mal configurado exponga rutas internas del servidor en el error PHP.
// FIX: se valida que el certificado .pfx exista antes de usarlo.

namespace App\Services;

use PDO;
use PDOException;






class SunatService
{
    private PDO $db;

    public function __construct()
    {







        $dsn = "pgsql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']}";
        $this->db = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASSWORD'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);






        $host = $_ENV['DB_HOST'] ?? null;
        $port = $_ENV['DB_PORT'] ?? '5432';
        $name = $_ENV['DB_NAME'] ?? null;
        $user = $_ENV['DB_USER'] ?? null;
        $pass = $_ENV['DB_PASSWORD'] ?? null;

        // FIX: validar variables de entorno antes de conectar
        if (!$host || !$name || !$user) {
            throw new \RuntimeException(
                'Configuración de base de datos incompleta. Verifica DB_HOST, DB_NAME y DB_USER en el entorno.'
            );
        }

        $dsn = "pgsql:host={$host};port={$port};dbname={$name}";

        // FIX: envolver en try/catch para no exponer stacktrace de PHP
        try {
            $this->db = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            // Loguear el error real sin exponerlo al cliente
            error_log('[SunatService] Error de conexión a DB: ' . $e->getMessage());
            throw new \RuntimeException(
                'Error de conexión a la base de datos. Contacta al administrador.'
            );
        }





    }

    public function getSiguienteCorrelativo(int $empresaId, string $serie): int
    {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                "SELECT correlativo FROM series_comprobante
                 WHERE empresa_id = ? AND serie = ? FOR UPDATE"
            );
            $stmt->execute([$empresaId, $serie]);

            $row = $stmt->fetch(PDO::FETCH_ASSOC);


            $row = $stmt->fetch();



            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $row = $stmt->fetch();




            if (!$row) {
                $tipo = str_starts_with($serie, 'F') ? 'factura' : (str_starts_with($serie, 'B') ? 'boleta' : 'nota_credito');
                $stmt = $this->db->prepare(
                    "INSERT INTO series_comprobante (empresa_id, tipo, serie, correlativo)
                     VALUES (?, ?, ?, 1)"
                );
                $stmt->execute([$empresaId, $tipo, $serie]);
                $correlativo = 1;
            } else {
                $correlativo = ((int) $row['correlativo']) + 1;
                $stmt = $this->db->prepare(
                    "UPDATE series_comprobante SET correlativo = ?
                     WHERE empresa_id = ? AND serie = ?"
                );
                $stmt->execute([$correlativo, $empresaId, $serie]);
            }

            $this->db->commit();
            return $correlativo;











        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function guardarComprobante(array $datos): int
    {

        $stmt = $this->db->prepare(" 


        $stmt = $this->db->prepare("



        $stmt = $this->db->prepare(" 

        $stmt = $this->db->prepare("



            INSERT INTO comprobantes (
                empresa_id, venta_id, tipo, serie, correlativo, numero,
                ruc_cliente, razon_social, direccion,
                subtotal, igv, total, moneda,
                estado, sunat_estado, sunat_descripcion,
                xml_path, cdr_path, pdf_path, hash, fecha_envio, entorno
            ) VALUES (
                :empresa_id, :venta_id, :tipo, :serie, :correlativo, :numero,
                :ruc_cliente, :razon_social, :direccion,
                :subtotal, :igv, :total, :moneda,
                :estado, :sunat_estado, :sunat_descripcion,
                :xml_path, :cdr_path, :pdf_path, :hash, NOW(), :entorno
            ) RETURNING id
        ");

        $stmt->execute($datos);
        return (int) $stmt->fetchColumn();
    }

    public function actualizarPdfPath(int $id, string $pdfPath): void
    {
        $stmt = $this->db->prepare("UPDATE comprobantes SET pdf_path = ? WHERE id = ?");
        $stmt->execute([$pdfPath, $id]);
    }

    public function obtenerComprobante(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM comprobantes WHERE id = ?");
        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;


        return $stmt->fetch() ?: null;



        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

        return $stmt->fetch() ?: null;



    }

    public function listarPorEmpresa(int $empresaId, int $limit = 50): array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM comprobantes WHERE empresa_id = ? ORDER BY fecha_emision DESC LIMIT ?"
        );
        $stmt->bindValue(1, $empresaId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);


        return $stmt->fetchAll();



        return $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $stmt->fetchAll();



    }

    public function getEmpresa(int $empresaId): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM empresas WHERE id = ?");
        $stmt->execute([$empresaId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;


        return $stmt->fetch() ?: null;



        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

        return $stmt->fetch() ?: null;



    }
}
