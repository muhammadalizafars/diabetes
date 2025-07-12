<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Ambil data dari body
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['timestamp']) || !isset($data['score']) || !isset($data['answers'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
    exit;
}

$answers = $data['answers'];

// Mapping jawaban
$questionMap = [
    'q1' => ['Di bawah 40 tahun', '40-49 tahun', '50-59 tahun', '60 tahun ke atas'],
    'q2' => ['Pria', 'Wanita'],
    'q3' => ['Tidak', 'Ya'],
    'q4' => ['Tidak', 'Ya'],
    'q5' => ['Tidak aktif', 'Aktif'], // Karena 1 = tidak aktif
    'q6' => ['Tidak', 'Ya'],
    'q7' => ['Tidak', 'Ya'],
    'q8' => ['<200 mg/dl', '>200 mg/dl'],
    'q9' => ['< 25', '25 - 29.9', '≥ 30']
];

// Ubah jawaban ke bentuk teks
$formattedAnswers = [];
foreach (['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'] as $qid) {
    if (!isset($answers[$qid])) continue;
    $value = $answers[$qid];

    if (isset($questionMap[$qid])) {
        $mapped = $questionMap[$qid];
        if (is_numeric($value) && isset($mapped[$value])) {
            $formattedAnswers[] = $mapped[$value];
        } else {
            $formattedAnswers[] = $value;
        }
    } else {
        $formattedAnswers[] = $value;
    }
}

$csvFile = 'data.csv';
$writeHeader = !file_exists($csvFile);
$fp = fopen($csvFile, 'a');

if ($writeHeader) {
    fputcsv($fp, ['Timestamp', 'Score', 'Jawaban']);
}

fputcsv($fp, [
    $data['timestamp'],
    $data['score'],
    implode(" | ", $formattedAnswers)
]);

fclose($fp);

echo json_encode(["status" => "success", "message" => "Data berhasil disimpan ke CSV"]);
