import React from 'react';

import './index.scss';
import MaintenanceBg from '../../assets/images/maintenance/maintenance_bg.png';

export default function MaintenancePage() {
    return (
        <div className="maintenance-container">
            <img src={MaintenanceBg} alt="MaintenanceBg" />
            <div className="text">Nervape.com is currently down for maintenance</div>
        </div>
    );
}
