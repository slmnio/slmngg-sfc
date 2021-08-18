<?php

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);


    function fetch($url) {
        $ch = curl_init();
        $timeout = 3;

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

        $result = curl_exec($ch);
        curl_close($ch);
        return json_decode($result);
    }
    function getRedirectData($pathData) {
        try {
            $data = fetch("http://localhost:8901/redirect?path=" . $pathData["path"] . "&subdomain=" . $pathData["subdomain"]);
            $redirect = $data->redirect;
            if (!$redirect) {
                // no redirect found
                return null;
                // just go to normal page and let the site handle or 404 it
            } else {
                return $redirect->outgoing_url;
            }
        } catch (Exception $e) {
//            echo "error: " . json_encode($e);
            return null;
        }
    }

    function getURLdata() {
        $domain = $_SERVER["SERVER_NAME"];
        $subdomain = explode(".", $domain)[0];

        $fullPath = $_SERVER["REQUEST_URI"];

        return [
            "subdomain" => $subdomain,
            "path" => $fullPath
        ];
    }

    $r = getRedirectData(getURLdata());
    if ($r) {
        header("Location: " . $r, true, 301);
        exit();
    } else {
        include "./index.html";
    }
