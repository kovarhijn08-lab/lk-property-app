import React from 'react';

const LoginHub = ({ onSelectPath }) => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{
                maxWidth: '800px',
                width: '100%',
                padding: '40px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '10px',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 900
                }}>
                    Smart Pocket Ledger
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
                    Выберите ваш путь в системе управления недвижимостью
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                }}>
                    {/* Путь Владельца / УК */}
                    <div
                        onClick={() => onSelectPath('business')}
                        className="glass-panel hover-card"
                        style={{
                            padding: '32px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.03)'
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏢</div>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem' }}>Владелец / УК</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Управляйте своим портфелем, следите за финансами и общайтесь с арендаторами в одном месте.
                        </p>
                        <button className="btn-primary" style={{ marginTop: '20px', width: '100%' }}>
                            Начать управление
                        </button>
                    </div>

                    {/* Путь Жильца */}
                    <div
                        onClick={() => onSelectPath('tenant')}
                        className="glass-panel hover-card"
                        style={{
                            padding: '32px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.03)'
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔑</div>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem' }}>Жилец</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Оплачивайте аренду, подавайте заявки на ремонт и просматривайте документы своей квартиры.
                        </p>
                        <button className="btn-secondary" style={{ marginTop: '20px', width: '100%' }}>
                            Войти в кабинет
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '40px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Регистрация жильцов доступна только по приглашению от управляющего.
                </div>
            </div>
        </div>
    );
};

export default LoginHub;
