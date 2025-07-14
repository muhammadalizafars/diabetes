<?php
// ====== CORS Preflight Handling ======
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Max-Age: 86400"); // 1 day
    http_response_code(200);
    exit();
}

// ====== Headers for Actual POST Request ======
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// ====== Handle Input Data ======
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['timestamp']) || !isset($data['score']) || !isset($data['answers'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
    exit;
}

$answers = $data['answers'];

// ====== Mapping Jawaban ke Teks ======
$questionMap = [
    'q1' => ['Di bawah 40 tahun', '40-49 tahun', '50-59 tahun', '60 tahun ke atas'],
    'q2' => ['Pria', 'Wanita'],
    'q3' => ['Tidak', 'Ya'],
    'q4' => ['Tidak', 'Ya'],
    'q5' => ['Tidak aktif', 'Aktif'],
    'q6' => ['Tidak', 'Ya'],
    'q7' => ['Tidak', 'Ya'],
    'q8' => ['<200 mg/dl', '>200 mg/dl'],
    'q9' => ['< 25', '25 - 29.9', '≥ 30']
];

$order = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];

$formattedAnswers = [];
foreach ($order as $qid) {
    if (!isset($answers[$qid])) {
        $formattedAnswers[] = '';
        continue;
    }

    $val = $answers[$qid];

    if (isset($questionMap[$qid])) {
        $mapped = $questionMap[$qid];
        if (is_numeric($val) && isset($mapped[$val])) {
            $formattedAnswers[] = $mapped[$val];
        } else {
            $formattedAnswers[] = $val;
        }
    } else {
        $formattedAnswers[] = $val;
    }
}

// ====== Simpan ke CSV ======
$csvFile = 'data.csv';
$writeHeader = !file_exists($csvFile);
$fp = fopen($csvFile, 'a');

if ($writeHeader) {
    fputcsv($fp, array_merge(['Timestamp', 'Score'], $order));
}

fputcsv($fp, array_merge([$data['timestamp'], $data['score']], $formattedAnswers));
fclose($fp);

// ====== Response ======
echo json_encode(["status" => "success", "message" => "Data berhasil disimpan ke CSV"]);
