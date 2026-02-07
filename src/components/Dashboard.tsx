import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';

const Dashboard: React.FC = () => {
    return (
        <Tabs defaultActiveKey="curation" id="dashboard-tabs">
            <Tab eventKey="curation" title="Exercise Curation">
                <div>
                    {/* Content for Exercise Curation */}
                </div>
            </Tab>
            <Tab eventKey="progress" title="Neural Progress Tracking">
                <div>
                    {/* Content for Neural Progress Tracking */}
                </div>
            </Tab>
            <Tab eventKey="history" title="History">
                <div>
                    {/* Content for History */}
                </div>
            </Tab>
        </Tabs>
    );
};

export default Dashboard;