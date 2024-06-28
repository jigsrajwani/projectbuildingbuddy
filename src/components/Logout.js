// Logout.js
import React from 'react';
import { Button } from 'react-bootstrap';

function Logout({ onLogout }) {
  return (
    <div className="mt-3 mx-3">
      <Button onClick={onLogout}>Logout</Button>
    </div>
  );
}

export default Logout;
