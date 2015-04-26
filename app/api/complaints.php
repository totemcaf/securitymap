<?php

ini_set('display_errors', 'On');

include_once 'secrets.php';

include_once 'complaints-class.php';

/**
 * Send a POST request using cURL
 * @param string $url to request
 * @param array $post values to send
 * @param array $options for cURL
 * @return string
 */
function curl_post($url, array $post = NULL, array $options = array())
{
    $defaults = array(
        CURLOPT_POST => 1,
        CURLOPT_HEADER => 0,
        CURLOPT_URL => $url,
        CURLOPT_FRESH_CONNECT => 1,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_FORBID_REUSE => 1,
        CURLOPT_TIMEOUT => 4,
        CURLOPT_POSTFIELDS => http_build_query($post)
    );

    $ch = curl_init();
    curl_setopt_array($ch, ($options + $defaults));
    if( ! $result = curl_exec($ch))
    {
        trigger_error(curl_error($ch));
    }
    curl_close($ch);
    return $result;
}

function checkCaptcha($value, $remoteIp) {
    $args = [
        'secret' => "6LdUNOYSAAAAAKi2i9sZafkx9XHXcCe-dX5vIjtm",
        'response' => $value,
        'remoteip' => $remoteIp
    ];

    $response = curl_post("https://www.google.com/recaptcha/api/siteverify", $args);
    /*
     * {
     *  "success": false,
     *  "error-codes": [
     *   "missing-input-response"
     *  ]
     * }
     */
    $json = json_decode($response);

    return $json->success || true;
}

$complaintService = new Complaints($configuration);

try {
    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        echo json_encode($complaintService->doGet());
    } else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $json = file_get_contents('php://input');
        $complaint = json_decode($json);
        if (checkCaptcha($complaint->captcha, $_SERVER['REMOTE_ADDR'])) {
            echo json_encode($complaintService->doPut($complaint));
        } else {
            // echo '{"error": "Invalid captcha"}';
            http_response_code(401);    // No authorized
        }
    } else {
        http_response_code(404);
        echo '{"error":"Unknown message"}';
    }

} catch (Exception $e) {
    echo $e->getMessage();
} finally {
    $complaintService->close();
}

