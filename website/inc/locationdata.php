<?php
include_once 'database_config.php';

	$fromdate = "2014-01-01";
	
	/* Prepare statement */
	$sql='SELECT count(id) as count, lat, lng, if(time>now() - INTERVAL 15 MINUTE,identifier,"0") as active 
			FROM location WHERE time > now() - INTERVAL 24 hour GROUP BY concat(lat,lng,active) ORDER BY ID desc;';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	$stmt->execute();
	$stmt->bind_result($count, $lat, $lng,$active);

	$jsonData  = array("areas" => array(), "users" => array());
	$countMax = 0;
	
	$v = array();
	$colors =  array("F00","0F0", "00F", "FF0","2AF","F0F","F8A","FA5","0Fa","83F","804");
	$i = 0;
	
	while ($stmt->fetch()) {
		$color = "F79F81";
		$color = "808080";
		$flag = 0;
		
		if ( $active ) {
			$flag = 1;
			if ( array_key_exists( $active, $v ) ) {
				$color = $v[$active];
			} else {
				$v[$active] = $colors[$i];
				$color = $v[$active];
				if ( ++$i > 10 ) $i = 0;
			}
		}

		$array = array(
			'bb' => array (
				array ($lat - 0.25, $lng - 0.5),
				array ($lat + 0.25, $lng + 0.5)
			),
			'a' => $flag,
			'c' => $color,
			'v' => $count,
		);

		array_push($jsonData["areas"], $array);
		
		if ( $countMax < $count ) $countMax = $count;
	}

	$stmt->close();

	/* Prepare statement */
	$sql='SELECT DISTINCT(`identifier`) FROM location WHERE time > now() - INTERVAL 15 MINUTE GROUP BY identifier';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	$stmt->execute();
	$stmt->store_result();
	$activeUsers = $stmt->num_rows;

	$stmt->close();
	
	/* Prepare statement */
	$sql='SELECT DISTINCT(`identifier`) FROM location WHERE time > now() - INTERVAL 24 hour GROUP BY identifier';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	$stmt->execute();
	$stmt->store_result();
	$activeTotal = $stmt->num_rows;	

	$stmt->close();
	$db->close();

	$array = array(
		'active' => $activeUsers,
		'total' => $activeTotal,
		'count' => $countMax,
	);
	
	array_push($jsonData["users"], $array);
	$json = json_encode($jsonData);

print_r($json);
?>