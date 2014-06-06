<?php

$player = $_GET['player'];
$page = $_GET['page'];
$per_page = $_GET['per_page'];
$list = array('popular', 'debuts', 'everyone');

if ($player) {
	if (in_array(strtolower($player), $list)) {
		$url = 'http://api.dribbble.com/shots/' . $player;
	} else {
        $url = 'http://api.dribbble.com/players/' . $player . '/shots/likes';
	}

	if ($page) {
		$url = $url .'&'. $page;
	}
	if ($per_page) {
		$url = $url .'&'. $per_page;
	}
	$data = file_get_contents($url);

    header('Content-type: application/json');
    echo $data;
    exit;
}

echo 0;

?>
