<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Ambil input dari body
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['timestamp']) || !isset($data['score']) || !isset($data['answers'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
    exit;
}

$answers = $data['answers'];

// Mapping teks jawaban
$questionMap = [
    'q1' => ['Di bawah 40 tahun', '40-49 tahun', '50-59 tahun', '60 tahun ke atas'],
    'q2' => ['Pria', 'Wanita'],
    'q3' => ['Tidak', 'Ya'],
    'q4' => ['Tidak', 'Ya'],
    'q5' => ['Tidak aktif', 'Aktif'], // 0 = Tidak aktif, 1 = Aktif
    'q6' => ['Tidak', 'Ya'],
    'q7' => ['Tidak', 'Ya'],
    'q8' => ['<200 mg/dl', '>200 mg/dl'],
    'q9' => ['< 25', '25 - 29.9', '≥ 30']
];

// Urutan kolom jawaban
$order = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];

// Ubah ke bentuk teks per kolom
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

// Simpan ke file
$csvFile = 'data.csv';
$writeHeader = !file_exists($csvFile);
$fp = fopen($csvFile, 'a');

if ($writeHeader) {
    // Header CSV
    fputcsv($fp, array_merge(['Timestamp', 'Score'], $order));
}

// Data CSV
fputcsv($fp, array_merge([$data['timestamp'], $data['score']], $formattedAnswers));

fclose($fp);

echo json_encode(["status" => "success", "message" => "Data berhasil disimpan ke CSV"]);
