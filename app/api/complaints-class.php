<?php

class Complaints {

    private $configuration;
    private $prefix;
    private $select;

    function Complaints($configuration) {
        $this->configuration = $configuration;
        $this->prefix = $configuration->db_prefix;

        $this->conn = new mysqli($configuration->db_server, $configuration->db_user_name, $configuration->db_password, $configuration->db_database);

        if ($this->conn->connect_error) {
            die("Connection failed: " . $this->conn->connect_error);
        }
        $this->select = "select id, address, locality, pstate as `state`, country, pdate as `date`, ptime as `time`,"
            . " ptype as `type`, details, latitude, longitude, status, created"
        . " from " . $this->prefix . "complaint";
    }

    public function doGet() {
        $sql = $this->select . " order by pdate desc, ptime desc";

        $results = $this->conn->query($sql);

        $complaints = array();

        while ($row = $results->fetch_assoc()) {
            $complaints[] = $row;
        }

        return $complaints;
    }

    public function doPut($complaint) {
        $error = $this->validate($complaint);
        if (!is_null($error)) {
            return [ 'error' => $error];
        }

        $sql = "insert into " . $this->prefix . "complaint "
            . "(address, locality, pstate, country, pdate, ptime, ptype, details, latitude, longitude, status, created"
            . ", name, phone, email, comments)"
            . " values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        if (!($sentence = $this->conn->prepare($sql))) {
            return [ 'error' => 'Falló la preparación: (' . $this->conn->errno . ') ' . $this->conn->error ];
        }

        $status = 'Reported';
        $created = date('Y-m-d H:i:s');
        if (!$sentence->bind_param('ssssssssssssssss',
            $complaint->address,
            $complaint->locality,
            $complaint->state,
            $complaint->country,
            $complaint->date,
            $complaint->time,
            $complaint->type,
            $complaint->details,
            $complaint->location->latitude,
            $complaint->location->longitude,
            $status,
            $created,
            $complaint->complainant->name,
            $complaint->complainant->phone,
            $complaint->complainant->email,
            $complaint->comments
            )) {
            return ['error' => "Falló la vinculación de parámetros: (" . $sentence->errno . ") " . $sentence->error];
        }

        if (! $sentence->execute()) {
            return ['error' => "Falló la ejecución: (" . $sentence->errno . ") " . $sentence->error];
        }

        $newId = $sentence->insert_id;

        $sentence->close();

        // Get the last complaint created
        return $this->findById($newId);
    }

    function close() {
        $this->conn->close();
    }

    private function findById($newId) {
        $sql = $this->select . " where id=$newId";

        return $this->conn->query($sql)->fetch_assoc();
    }

    private function validate($complaint) {
        return NULL;
    }
}
