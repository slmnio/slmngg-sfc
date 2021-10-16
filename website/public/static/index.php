<?php

// Any requests from crawlers or unfurls get redirected to this file.
// This means you can render meta tags here on the server side

$_URL = $_SERVER['REQUEST_URI'];
if (strpos($_URL,"?") !== false) $_URL = substr_replace($_URL, "", strpos($_URL, "?"));
if (strpos($_URL,"#") !== false) $_URL = substr_replace($_URL, "", strpos($_URL, "#"));
$args = array_values(array_filter(explode("/", $_URL), function ($e) {
    return $e !== "";
}));


function fetch($url) {
    return json_decode(file_get_contents($url));
}
// function urlencode3986($string) {
//     $entities = array('%21', '%2A', '%27', '%28', '%29', '%3B', '%3A', '%40', '%26', '%3D', '%2B', '%24', '%2C', '%2F', '%3F', '%25', '%23', '%5B', '%5D');
//     $replacements = array('!', '*', "'", "(", ")", ";", ":", "@", "&", "=", "+", "$", ",", "/", "?", "%", "#", "[", "]");
//     return str_replace($entities, $replacements, urlencode($string));
// }
function getMeta($url) {
    $url = substr($url, 1);
    $data = fetch("https://data.slmn.gg/meta/" . urlencode($url));
    return $data;
}
$__meta = getMeta($_URL);

$meta = (object)[
    "title" => " | SLMN.GG",
    "image" => (object)[
        "url" => "https://preds.slmn.io/media/gigabrain-square.png",
        "width" => 450,
        "height" => 450
    ],
    "description" => " \nView this and other SLMN-affiliated events, teams and matches on SLMN.GG",
    "color" => "#111111",
    "card_type" => "summary"
];

if (!$__meta->error) {
    $meta = $__meta;
}


?>
<html>
    <head>
        <title><?= $__meta->title ?></title>

        <meta property="og:image" content="<?= $meta->image->url ?>" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="<?= $meta->image->width ?>" />
        <meta property="og:image:height" content="<?= $meta->image->height ?>" />
        <meta property="twitter:card" content="<?= $meta->card_type ?>" />
        <meta property="twitter:site" content="@slmnio" />
        <meta property="twitter:creator" content="@slmnio" />
        <meta property="twitter:image" content="<?= $meta->image->url ?>" />

        <meta property="og:title" content="<?= $meta->title ?>" />
        <meta property="twitter:title" content="<?= $meta->title ?>" />
        <meta name="apple-mobile-web-app-title" content="<?= $meta->title ?>">
        <meta name="application-name" content="<?= $meta->title ?>">

        <meta property="og:description" content="<?= $meta->description ?>" />
        <meta property="twitter:description" content="<?= $meta->description ?>" />
        <meta name="description" content="<?= $meta->description ?>"/>
        <meta name="msapplication-TileColor" content="<?= $meta->color ?>">
        <meta name="theme-color" content="<?= $meta->color ?>">
    </head>
</html>
