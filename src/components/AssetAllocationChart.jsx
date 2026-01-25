import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const COLORS = ['#D9FF00', '#6366F1', '#F59E0B', '#10B981']; // Cyber Lime, Electric Indigo, Orange, Emerald

const AssetAllocationChart = ({ data, size = 320 }) => {
    const { t } = useLanguage();
    const isMini = size < 120;
    const totalValue = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMini ? size * 0.35 : 75}
                        outerRadius={isMini ? size * 0.45 : 100}
                        paddingAngle={isMini ? 4 : 8}
                        dataKey="value"
                        stroke="none"
                        animationBegin={200}
                        animationDuration={1200}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                style={{ filter: isMini ? 'none' : `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}44)` }}
                            />
                        ))}
                    </Pie>
                    {!isMini && (
                        <>
                            <Tooltip
                                formatter={(value) => `$${value.toLocaleString()}`}
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                    padding: '12px'
                                }}
                                itemStyle={{ fontWeight: 700, fontSize: '0.9rem' }}
                            />
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginLeft: '4px' }}>{value}</span>}
                            />
                        </>
                    )}
                </PieChart>
            </ResponsiveContainer>

            {!isMini && (
                <div style={{
                    position: 'absolute',
                    top: '44%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('dashboard.totalValue')}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                        ${(totalValue / 1000).toFixed(0)}k
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetAllocationChart;
