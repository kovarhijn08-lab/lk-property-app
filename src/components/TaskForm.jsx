import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import SideDrawer from './SideDrawer';
import { BellIcon, HomeIcon, InfoIcon } from './Icons';

const TaskForm = ({ isOpen, onClose, onAdd, properties }) => {
    const { t } = useLanguage();
    const [task, setTask] = useState({
        title: '',
        description: '',
        propertyId: properties[0]?.id || 'all',
        urgency: 'standard',
        type: 'maintenance'
    });
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!task.title) return;

        setIsSaving(true);
        try {
            await onAdd({
                ...task,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            onClose();
        } catch (error) {
            console.error('Failed to add task:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Новая задача"
            subtitle="Ручное создание тикета или напоминания"
        >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Название задачи
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="Напр: Течет кран в ванной"
                        value={task.title}
                        onChange={(e) => setTask({ ...task, title: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Описание
                    </label>
                    <textarea
                        placeholder="Детали проблемы..."
                        value={task.description}
                        onChange={(e) => setTask({ ...task, description: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.95rem',
                            minHeight: '100px',
                            resize: 'none'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Объект
                    </label>
                    <select
                        value={task.propertyId}
                        onChange={(e) => setTask({ ...task, propertyId: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.95rem'
                        }}
                    >
                        <option value="all">Общий (не привязан)</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Срочность
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { id: 'standard', label: 'Обычная', color: 'var(--accent-primary)' },
                            { id: 'high', label: 'Высокая', color: 'var(--accent-warning)' },
                            { id: 'critical', label: 'Критическая', color: 'var(--accent-danger)' }
                        ].map(level => (
                            <button
                                key={level.id}
                                type="button"
                                onClick={() => setTask({ ...task, urgency: level.id })}
                                style={{
                                    flex: 1,
                                    padding: '10px 4px',
                                    borderRadius: '10px',
                                    border: task.urgency === level.id ? `2px solid ${level.color}` : '1px solid var(--glass-border)',
                                    background: task.urgency === level.id ? `${level.color}15` : 'rgba(255,255,255,0.02)',
                                    color: task.urgency === level.id ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {level.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <button
                        type="submit"
                        disabled={isSaving || !task.title}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            background: 'var(--gradient-primary)',
                            border: 'none',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            opacity: isSaving || !task.title ? 0.5 : 1,
                            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        {isSaving ? 'Сохранение...' : 'Создать задачу'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            width: '100%',
                            marginTop: '12px',
                            padding: '12px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </SideDrawer>
    );
};

export default TaskForm;
