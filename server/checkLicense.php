<?php

$key = $_REQUEST['userInput'];

 if(strlen($key) == 35){
    $sanitizedKey = filter_var($key, FILTER_SANITIZE_STRING);
    gumroad_licence($sanitizedKey);
} else{
    echo "Invalid key!";
}

//gumroad_licence($key);


function gumroad_licence($licence_key)
{
    $curl = curl_init();

    $post_data = array(
        'product_permalink' => 'zeqeh',
        'license_key' => $licence_key,
        'increment_uses_count' => 'false'
    );

    $url = "https://api.gumroad.com/v2/licenses/verify";

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_POST, 1);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $post_data);

    $result = curl_exec($curl);

    $array = json_decode($result, true);

    if ($array['success'] === true && $array['purchase']['refunded'] === false && $array['purchase']['subscription_ended_at'] === null) {
            echo "Key OK!";
    } else {
            echo "Invalid key!";
    }

    curl_close($curl);
}