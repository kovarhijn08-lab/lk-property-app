import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, ReferenceArea } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const GlobalCashFlowChart = ({ data }) => {
    const { t } = useLanguage();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const [chartData, setChartData] = useState([]);
    const [annotations, setAnnotations] = useState([]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);

        // --- Forecasting & Analytics Logic ---
        if (data && data.length > 0) {
            // 1. Calculations for Forecast
            const avgIncome = data.reduce((sum, item) => sum + (item.income || 0), 0) / data.length;
            const avgExpenses = data.reduce((sum, item) => sum + (item.expenses || 0), 0) / data.length;

            // Extend with 2 projected months
            const lastMonthIndex = data.length - 1;
            const monthsShort = [
                t('months.jan'), t('months.feb'), t('months.mar'), t('months.apr'), t('months.may'), t('months.jun'),
                t('months.jul'), t('months.aug'), t('months.sep'), t('months.oct'), t('months.nov'), t('months.dec')
            ];

            // Try to match lastMonthName with keys
            const monthsKeys = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const lastMonthName = data[lastMonthIndex].name;
            const lastMonthKeyIdx = monthsKeys.indexOf(lastMonthName);
            const startIdx = (lastMonthKeyIdx !== -1 ? lastMonthKeyIdx + 1 : 0) % 12;

            const forecast = [
                { name: monthsShort[startIdx], income: avgIncome, expenses: avgExpenses, cashFlow: avgIncome - avgExpenses, isForecast: true },
                { name: monthsShort[(startIdx + 1) % 12], income: avgIncome * 1.05, expenses: avgExpenses * 0.95, cashFlow: (avgIncome * 1.05) - (avgExpenses * 0.95), isForecast: true }
            ];

            // Localize existing data month names if they match keys
            const localizedData = data.map(item => {
                const idx = monthsKeys.indexOf(item.name);
                return idx !== -1 ? { ...item, name: monthsShort[idx] } : item;
            });

            setChartData([...localizedData, ...forecast]);

            // 2. Identify Spikes (Annotations)
            const newAnnotations = [];
            localizedData.forEach((item, idx) => {
                if (item.expenses > avgExpenses * 1.5) {
                    newAnnotations.push({
                        index: idx,
                        name: item.name,
                        value: item.expenses,
                        label: t('charts.expenseSpike'),
                        type: 'danger'
                    });
                }
                if (item.income > avgIncome * 1.2) {
                    newAnnotations.push({
                        index: idx,
                        name: item.name,
                        value: item.income,
                        label: t('charts.highIncome'),
                        type: 'success'
                    });
                }
            });
            setAnnotations(newAnnotations);
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [data, t]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const isForecast = payload[0].payload.isForecast;
            return (
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{label}</span>
                        {isForecast && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 900, background: 'var(--accent-primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>{t('charts.projection')}</span>
                        )}
                    </div>
                    {payload.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'center', margin: '4px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }}></div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{entry.name}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>${entry.value?.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: isMobile ? 240 : 320, marginTop: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 10, bottom: 0, left: isMobile ? -20 : 10 }}
                >
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D9FF00" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#D9FF00" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                        dataKey="name"
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                    />
                    {!isMobile && (
                        <YAxis
                            stroke="var(--text-secondary)"
                            tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                            allowDecimals={false}
                            width={60}
                        />
                    )}
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

                    {!isMobile && (
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginLeft: '4px' }}>{value}</span>}
                        />
                    )}

                    {/* Area for Forecast Visual DISTINCTION */}
                    {chartData.some(d => d.isForecast) && (
                        <ReferenceArea
                            x1={chartData.find(d => d.isForecast)?.name}
                            x2={chartData[chartData.length - 1].name}
                            fill="rgba(255,255,255,0.02)"
                            strokeOpacity={0.3}
                        />
                    )}

                    <Bar dataKey="income" name={t('dashboard.income')} radius={[4, 4, 0, 0]} barSize={isMobile ? 12 : 16}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill="url(#incomeGradient)"
                                fillOpacity={entry.isForecast ? 0.2 : 1}
                                stroke={entry.isForecast ? '#D9FF00' : 'none'}
                                strokeDasharray={entry.isForecast ? '4 4' : '0'}
                            />
                        ))}
                    </Bar>
                    <Bar dataKey="expenses" name={t('dashboard.expenses')} radius={[4, 4, 0, 0]} barSize={isMobile ? 12 : 16}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill="url(#expenseGradient)"
                                fillOpacity={entry.isForecast ? 0.2 : 0.6}
                                stroke={entry.isForecast ? '#6366F1' : 'none'}
                                strokeDasharray={entry.isForecast ? '4 4' : '0'}
                            />
                        ))}
                    </Bar>

                    {/* Actual Cash Flow Line */}
                    <Line
                        type="monotone"
                        data={chartData.filter(d => !d.isForecast)}
                        dataKey="cashFlow"
                        name={t('dashboard.netCashFlow')}
                        stroke="#D9FF00"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#D9FF00', strokeWidth: 2, stroke: '#020617' }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        style={{ filter: 'drop-shadow(0 0 6px #D9FF00aa)' }}
                    />

                    {/* Forecast Cash Flow Line (Dashed) */}
                    <Line
                        type="monotone"
                        data={chartData.filter((d, i) => i >= chartData.findIndex(item => !item.isForecast) + data.length - 1)}
                        dataKey="cashFlow"
                        name={t('charts.projectedFlow')}
                        stroke="#D9FF00"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={false}
                        legendType="none"
                    />

                    {/* Annotations */}
                    {annotations.map((ann, i) => (
                        <ReferenceDot
                            key={i}
                            x={ann.name}
                            y={ann.value}
                            r={6}
                            fill={ann.type === 'danger' ? '#F43F5E' : '#10B981'}
                            stroke="white"
                            strokeWidth={2}
                        />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};


export default GlobalCashFlowChart;
