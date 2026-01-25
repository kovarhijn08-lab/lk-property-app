import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CashFlowChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 100, marginTop: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent-success)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--accent-success)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                        labelStyle={{ display: 'none' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="var(--accent-success)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorFlow)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CashFlowChart;
