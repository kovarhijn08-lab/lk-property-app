import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const OccupancyChart = ({ occupied, total }) => {
    const data = [
        { name: 'Occupied', value: occupied },
        { name: 'Vacant', value: total - occupied },
    ];
    const COLORS = ['var(--accent-success)', 'var(--bg-secondary)'];

    return (
        <div style={{ width: '100%', height: 100, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={40}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none', fontSize: '0.8rem', fontWeight: 600
            }}>
                {Math.round((occupied / total) * 100)}%
            </div>
        </div>
    );
};

export default OccupancyChart;
