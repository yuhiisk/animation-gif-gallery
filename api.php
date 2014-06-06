<?php

$player = $_GET['player'];
$type = $_GET['type'];
$list = array('popular', 'debuts', 'everyone');

if ($player) {
	if (in_array(strtolower($player), $list)) {
		$data = file_get_contents('http://api.dribbble.com/shots/' . $player);
	} else {
        $data = file_get_contents('http://api.dribbble.com/players/' . $player . '/shots/likes');
	}

    header('Content-type: application/json');
    echo $data;
    exit;
}

echo 0;

?>
