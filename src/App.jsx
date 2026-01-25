import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MetricCard from './components/MetricCard';
import TransactionForm from './components/TransactionForm';
import CashFlowChart from './components/CashFlowChart';
import OccupancyChart from './components/OccupancyChart';
import InstallmentTracker from './components/InstallmentTracker';
import ConstructionProgressBar from './components/ConstructionProgressBar';
import PropertySwitcher from './components/PropertySwitcher';
import AddPropertyForm from './components/AddPropertyForm';
import GlobalDashboard from './components/GlobalDashboard';
import PropertyDetail from './components/PropertyDetail';
import AchievementPanel from './components/AchievementPanel';
import TransactionList from './components/TransactionList';
import NotificationDrawer from './components/NotificationDrawer';
import TermDictionary from './components/TermDictionary';
import OccupancyCalendar from './components/OccupancyCalendar';
import STRMetrics from './components/STRMetrics';
import ContractList from './components/ContractList';
import ReceiptScanner from './components/ReceiptScanner';
import LeaseScanner from './components/LeaseScanner';
import ScenarioPlanner from './components/ScenarioPlanner';
import MobileNav from './components/MobileNav';
import MobileAgenda from './components/MobileAgenda';
import MobileSmartTasks from './components/MobileSmartTasks';
import TaskForm from './components/TaskForm';
import Login from './components/Login';
import SignUp from './components/SignUp';
import MigrationHelper from './components/MigrationHelper';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useMobile } from './hooks/useMobile';
import { useProperties } from './hooks/useProperties';
import { useVendors } from './hooks/useVendors';
import { initialProperties } from './data/properties';
import Settings from './components/Settings';
import Toast from './components/Toast';
import SellPropertyModal from './components/SellPropertyModal';
import NavigationDrawer from './components/NavigationDrawer';
import DocumentVault from './components/DocumentVault';
import MasterCalendar from './components/MasterCalendar';
import { firestoreOperations } from './hooks/useFirestore';
import Breadcrumbs from './components/Breadcrumbs';
import ActionOverlay from './components/ActionOverlay';
import LegalHub from './components/LegalHub';
import TaxReport from './components/TaxReport';
import AdminDashboard from './components/AdminDashboard'; // [NEW]

function App() {
  // Firebase authentication (replacing mock localStorage auth)
  const { currentUser, isAuthenticated, loading: authLoading, login, signup, logout } = useFirebaseAuth();
  const isMobile = useMobile();
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Properties from Firestore (replacing localStorage)
  const { properties, loading: propertiesLoading, addProperty: addPropertyToFirestore, updateProperty: updatePropertyInFirestore, deleteProperty: deletePropertyFromFirestore } = useProperties(currentUser?.id);
  const { vendors, addVendor, deleteVendor } = useVendors(currentUser?.id);

  const [selectedPropertyId, setSelectedPropertyId] = useState('all');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [showPropertyDetail, setShowPropertyDetail] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showScenarioPlanner, setShowScenarioPlanner] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false); // [NEW]

  const [showSettings, setShowSettings] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showLeaseScanner, setShowLeaseScanner] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState('dashboard'); // 'dashboard', 'agenda', 'chats', 'notifications', 'portfolio'
  const [toast, setToast] = useState(null);
  const [migrationConflict, setMigrationConflict] = useState(null); // { localData }
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [manualTasks, setManualTasks] = useState([]);
  const [snoozedTasks, setSnoozedTasks] = useState(() => {
    const saved = localStorage.getItem('pocketLedger_snoozed');
    return saved ? JSON.parse(saved) : {};
  });
  const [taskHistory, setTaskHistory] = useState(() => {
    const saved = localStorage.getItem('pocketLedger_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pocketLedger_settings');
    return saved ? JSON.parse(saved) : { warningPeriod: 30 };
  });
  const [prefilledTransactionData, setPrefilledTransactionData] = useState(null);

  // Sync states to localStorage (for MVP persistence as requested in roadmap/directives)
  useEffect(() => {
    localStorage.setItem('pocketLedger_snoozed', JSON.stringify(snoozedTasks));
  }, [snoozedTasks]);

  useEffect(() => {
    localStorage.setItem('pocketLedger_history', JSON.stringify(taskHistory));
  }, [taskHistory]);

  useEffect(() => {
    localStorage.setItem('pocketLedger_settings', JSON.stringify(settings));
  }, [settings]);

  // Silent Migration handlers
  const handleMigrationComplete = (count, wasActive) => {
    if (wasActive && count > 0) {
      setToast({ message: `Synced ${count} properties to cloud ✨`, type: 'success' });
    }
  };

  const handleMigrationError = (type, data) => {
    if (type === 'conflict') {
      setMigrationConflict(data);
    } else {
      setToast({ message: `Sync error: ${data}`, type: 'error' });
    }
  };

  const resolveConflict = async (choice) => {
    if (choice === 'merge' && migrationConflict) {
      for (const prop of migrationConflict) {
        await firestoreOperations.setDocument('properties', prop.id, {
          ...prop,
          userId: currentUser.id,
          syncStatus: 'synced',
          mergedAt: new Date().toISOString()
        });
      }
      setToast({ message: 'Data merged successfully', type: 'success' });
    } else if (choice === 'cloud') {
      setToast({ message: 'Using cloud data', type: 'info' });
    }

    localStorage.setItem('pocketLedger_migrated', 'resolved');
    setMigrationConflict(null);
  };

  const handleSellProperty = async (soldPropertyData) => {
    await updatePropertyInFirestore(soldPropertyData.id, soldPropertyData);
    setToast({ message: `Property sold successfully! Profit: $${soldPropertyData.netProceeds?.toLocaleString()}`, type: 'success' });
    setSelectedPropertyId('all'); // Return to dashboard
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <SignUp onSignup={signup} onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onLogin={login} onSwitchToSignup={() => setAuthView('signup')} />;
  }

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  // CRUD Operations
  const addProperty = async (newProp) => {
    await addPropertyToFirestore(newProp);
    setSelectedPropertyId(newProp.id);
    setShowAddPropertyForm(false);
  };

  const addTransaction = async (tx) => {
    const targetPropertyId = tx.propertyId || selectedPropertyId;
    const targetProperty = properties.find(p => p.id === targetPropertyId);
    if (!targetProperty) return;

    let newTransactions = [tx];

    // STR: Auto-calculate Commission
    if (targetProperty.type === 'str' && tx.category === 'Rent' && targetProperty.commissionRate > 0) {
      const commissionAmount = (tx.amount * parseFloat(targetProperty.commissionRate)) / 100;
      newTransactions.push({
        id: Date.now() + 1,
        amount: commissionAmount,
        category: 'Commission',
        expenseType: 'opex',
        description: `Commission for ${tx.description || 'Rent'}`,
        date: tx.date
      });
    }

    const updatedTransactions = [...(targetProperty.transactions || []), ...newTransactions];

    // Use the updateProperty hook wrapper instead of direct firestoreOperations
    await updatePropertyInFirestore(targetPropertyId, {
      ...targetProperty,
      transactions: updatedTransactions
    });

    setToast({ message: `Успешно! Записано ${newTransactions.length} поз. ✨`, type: 'success' });
    setShowTransactionForm(false);
    setPrefilledTransactionData(null);
  };

  const handleSmartAction = (actionType, data, taskId) => {
    // Log to history if it's a completion action
    if (taskId && (actionType === 'addTransaction')) {
      const taskTitle = data.category === 'Rent' ? 'Сбор аренды' : 'Оплата этапа';
      const prop = properties.find(p => p.id === (data.propertyId || selectedPropertyId));
      setTaskHistory(prev => [{
        id: Date.now(),
        taskId,
        action: taskTitle,
        date: new Date().toISOString(),
        propertyName: prop?.name || 'Unknown'
      }, ...prev].slice(0, 50)); // Keep last 50
    }

    switch (actionType) {
      case 'addTransaction':
        if (data.propertyId) setSelectedPropertyId(data.propertyId);
        setPrefilledTransactionData(data);
        setShowTransactionForm(true);
        break;
      case 'viewProperty':
        setSelectedPropertyId(data);
        setActiveMobileView('dashboard');
        break;
      case 'viewLegal':
        setActiveMobileView('legal');
        setSelectedPropertyId('all');
        break;
      case 'createTask':
        setShowTaskForm(true);
        break;
      case 'snooze':
        const snoozeUntil = new Date();
        snoozeUntil.setDate(snoozeUntil.getDate() + 3); // Snooze for 3 days
        setSnoozedTasks(prev => ({
          ...prev,
          [data]: snoozeUntil.toISOString()
        }));
        setToast({ message: 'Задача отложена на 3 дня ⏳', type: 'info' });
        break;
      default:
        break;
    }
  };

  const handleAddTask = async (taskData) => {
    const newTask = { ...taskData, id: `manual-${Date.now()}` };
    setManualTasks(prev => [newTask, ...prev]);
    setToast({ message: 'Задача успешно создана! ✨', type: 'success' });
  };

  const updateProperty = async (idOrProp, maybeProp) => {
    if (typeof idOrProp === 'string') {
      await updatePropertyInFirestore(idOrProp, maybeProp);
    } else {
      await updatePropertyInFirestore(idOrProp.id, idOrProp);
    }
    setToast({ message: 'Изменения успешно сохранены! ✨', type: 'success' });
  };

  const deleteProperty = async (propId) => {
    await deletePropertyFromFirestore(propId);
    setSelectedPropertyId('all');
  };



  const handleScanComplete = (data) => {
    setPrefilledTransactionData(data);
    setShowScanner(false);
    setShowTransactionForm(true);
  };

  const updateTransaction = async (updatedTx) => {
    if (!selectedProperty) return;
    const updatedTransactions = selectedProperty.transactions.map(t => t.id === updatedTx.id ? updatedTx : t);
    await updatePropertyInFirestore(selectedPropertyId, {
      ...selectedProperty,
      transactions: updatedTransactions
    });
  };

  const deleteTransaction = async (txId) => {
    if (!selectedProperty) return;
    const updatedTransactions = selectedProperty.transactions.filter(t => t.id !== txId);
    await updatePropertyInFirestore(selectedPropertyId, {
      ...selectedProperty,
      transactions: updatedTransactions
    });
  };

  // Contract CRUD
  const addContract = async (newContract) => {
    if (!selectedProperty) return;
    const updatedContracts = [...(selectedProperty.contracts || []), newContract];
    await updatePropertyInFirestore(selectedPropertyId, {
      ...selectedProperty,
      contracts: updatedContracts
    });
  };

  const deleteContract = async (contractId) => {
    if (!selectedProperty) return;
    const updatedContracts = (selectedProperty.contracts || []).filter(c => c.id !== contractId);
    await updatePropertyInFirestore(selectedPropertyId, {
      ...selectedProperty,
      contracts: updatedContracts
    });
  };

  const handleLeaseScanComplete = async (data) => {
    if (!selectedProperty) return;
    const newContract = {
      id: Date.now().toString(),
      ...data,
      depositAmount: data.deposit || 0
    };
    await addContract(newContract);
    setShowLeaseScanner(false);
    setToast({ message: 'Договор отсканирован и добавлен в Юридический Хаб!', type: 'success' });
  };

  const handleSignContract = async (contractId, signatureData) => {
    if (!selectedProperty) return;
    const updatedContracts = (selectedProperty.contracts || []).map(c =>
      c.id === contractId ? { ...c, signature: signatureData, status: 'signed' } : c
    );
    await updatePropertyInFirestore(selectedPropertyId, {
      ...selectedProperty,
      contracts: updatedContracts
    });
    setToast({ message: 'Договор успешно подписан!', type: 'success' });
  };

  // Metrics Calculation
  const getPropertyMetrics = (prop) => {
    if (!prop || !prop.transactions) return { income: 0, expenses: 0, cashFlow: 0 };
    const income = prop.transactions.filter(t => t.category === 'Rent').reduce((acc, t) => acc + t.amount, 0);
    const expenses = prop.transactions.filter(t => t.category !== 'Rent').reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, cashFlow: income - expenses };
  };

  // Calculate notification count
  const getNotificationCount = () => {
    let count = 0;
    const today = new Date();
    const currentDay = today.getDate();

    properties.forEach(prop => {
      // Rent due
      if ((prop.type === 'rental' || prop.type === 'commercial') && currentDay >= 1 && currentDay <= 7) {
        count++;
      }
      // Upcoming payments
      if (prop.type === 'construction' && prop.installments?.find(i => i.status === 'due')) {
        count++;
      }
      // Vacancies
      if ((prop.type === 'rental' || prop.type === 'commercial') && prop.occupancy && prop.occupancy.occupied < prop.occupancy.total) {
        count++;
      }
      // Expiring contracts
      if (prop.contracts) {
        const thirtyDaysOut = new Date();
        thirtyDaysOut.setDate(today.getDate() + 30);
        prop.contracts.forEach(contract => {
          const end = new Date(contract.endDate);
          if (end > today && end <= thirtyDaysOut) {
            count++;
          }
        });
      }
    });
    return count;
  };

  const cashFlowData = [
    { name: 'Jan', amount: 1500 },
    { name: 'Feb', amount: 1000 },
    { name: 'Mar', amount: 1500 },
    { name: 'Apr', amount: 1200 },
  ];

  // Dynamic View Rendering
  const renderPropertyView = () => {
    if (selectedPropertyId === 'all') {
      if (activeMobileView === 'legal') {
        return (
          <LegalHub
            properties={properties}
            onAddContract={async (propId, contract) => {
              const targetProp = properties.find(p => p.id === propId) || properties[0];
              if (targetProp) {
                const updatedContracts = [...(targetProp.contracts || []), contract];
                await updatePropertyInFirestore(targetProp.id, { ...targetProp, contracts: updatedContracts });
              }
            }}
            onDeleteContract={async (contractId) => {
              const targetProp = properties.find(p => (p.contracts || []).some(c => c.id === contractId));
              if (targetProp) {
                const updatedContracts = (targetProp.contracts || []).filter(c => c.id !== contractId);
                await updatePropertyInFirestore(targetProp.id, { ...targetProp, contracts: updatedContracts });
              }
            }}
            onSignContract={handleSignContract}
            onScanRequest={() => setShowLeaseScanner(true)}
          />
        );
      }
      if (activeMobileView === 'reports') {
        return <TaxReport properties={properties} onClose={() => setActiveMobileView('dashboard')} />;
      }
      if (isMobile && activeMobileView === 'notifications') {
        return <MobileSmartTasks
          properties={properties}
          manualTasks={manualTasks}
          onAction={handleSmartAction}
          snoozedTasks={snoozedTasks}
          warningPeriod={settings.warningPeriod}
          history={taskHistory}
        />;
      }
      if (isMobile && activeMobileView === 'agenda') {
        return <MobileAgenda properties={properties} />;
      }
      return <GlobalDashboard
        properties={properties}
        onPropertyClick={(id) => { setSelectedPropertyId(id); }}
        onViewReports={() => setActiveMobileView('reports')}
        onUpdateProperty={updateProperty}
        onAddProperty={addProperty}
        warningPeriod={settings.warningPeriod}
      />;
    }

    if (!selectedProperty) return <p>Property not found.</p>;

    // If under construction, show progress at the top
    const constructionView = selectedProperty.isUnderConstruction && (
      <section style={{ marginBottom: '20px' }}>
        <ConstructionProgressBar progress={selectedProperty.progress || 0} statusMessage={selectedProperty.statusMessage} />
        {selectedProperty.installments?.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <InstallmentTracker installments={selectedProperty.installments} />
          </div>
        )}
      </section>
    );

    // SHORT-TERM RENTAL (STR) VIEW
    if (selectedProperty.type === 'str') {
      return (
        <>
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedProperty.name} ({selectedProperty.type.toUpperCase()})</h2>
              <button onClick={() => setShowPropertyDetail(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.9rem' }}>⚙️ Manage</button>
            </div>
          </section>
          {constructionView}
          <section>
            <STRMetrics bookings={selectedProperty.bookings || []} daysInMonth={31} />
          </section>

          <section>
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>🏨 Recent Bookings</h3>
                <button
                  onClick={() => setShowPropertyDetail(true)}
                  className="tag"
                  style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: '12px' }}
                >
                  + Add Booking
                </button>
              </div>

              {(selectedProperty.bookings || []).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>No upcoming bookings</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedProperty.bookings || []).slice(0, 3).map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                      <span>{b.guestName}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{b.checkIn} - {b.checkOut}</span>
                    </div>
                  ))}
                  {(selectedProperty.bookings || []).length > 3 && (
                    <button onClick={() => setShowPropertyDetail(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '4px' }}>
                      Show all {(selectedProperty.bookings || []).length} bookings
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          <section>
            <OccupancyCalendar bookings={selectedProperty.bookings || []} />
          </section>
          <section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>🧹 STR Operations</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Open Cleanings:</span>
                  <span style={{ fontWeight: 700, color: (selectedProperty.cleanings || []).filter(c => c.status !== 'completed').length > 0 ? '#F59E0B' : 'white' }}>
                    {(selectedProperty.cleanings || []).filter(c => c.status !== 'completed').length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '8px' }}>
                  <span>Pending Deposits:</span>
                  <span style={{ fontWeight: 700, color: (selectedProperty.bookings || []).filter(b => b.securityDeposit > 0 && b.depositStatus !== 'returned').length > 0 ? '#F59E0B' : 'white' }}>
                    {(selectedProperty.bookings || []).filter(b => b.securityDeposit > 0 && b.depositStatus !== 'returned').length}
                  </span>
                </div>
                <button onClick={() => setShowPropertyDetail(true)} style={{ width: '100%', padding: '6px', marginTop: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>Manage Tasks</button>
              </div>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>Property Value</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Market Value:</span>
                  <span style={{ fontWeight: 700 }}>${selectedProperty.marketValue?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span>Equity:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>${(selectedProperty.marketValue - selectedProperty.purchasePrice).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </section>
        </>
      );
    }

    // RENTAL / COMMERCIAL VIEW
    const { income, expenses, cashFlow } = getPropertyMetrics(selectedProperty);
    return (
      <>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedProperty.name} ({selectedProperty.type.toUpperCase()})</h2>
            <button onClick={() => setShowPropertyDetail(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.9rem' }}>⚙️ Manage</button>
          </div>
          {constructionView}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>${income.toLocaleString()}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--accent-success)' }}>Gross Revenue</div>
              </div>
              <div style={{ width: '80px', height: '80px' }}>
                <OccupancyChart occupied={selectedProperty.occupancy?.occupied || 0} total={selectedProperty.occupancy?.total || 1} />
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {selectedProperty.address}
              {selectedProperty.leaseType && <span style={{ marginLeft: '8px', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{selectedProperty.leaseType}</span>}
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>Financial Health</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <MetricCard title="Cash Flow" value={cashFlow} unit="$" status={cashFlow > 0 ? 'positive' : 'negative'} infoText="Net profit after expenses." chart={<CashFlowChart data={cashFlowData} />} />
            <MetricCard title="Cap Rate" value="6.5" unit="%" status="warning" infoText="Capitalization Rate." />
            <MetricCard title="Expenses" value={expenses} unit="$" status="neutral" infoText="Total expenses." />
            <MetricCard title="Equity" value={`${((selectedProperty.marketValue - selectedProperty.purchasePrice) / 1000).toFixed(0)}k`} unit="$" status="neutral" infoText="Market Value - Loan Balance." />
          </div>
        </section>

        <section>
          <TransactionList
            transactions={selectedProperty.transactions || []}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
          />
        </section>

        <section>
          <ContractList
            contracts={selectedProperty.contracts || []}
            onAdd={addContract}
            onDelete={deleteContract}
            onScanRequest={() => setShowLeaseScanner(true)}
            onSignContract={handleSignContract}
          />
        </section>

        <button onClick={() => setShowScanner(true)} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>📸</span> Scan Receipt
        </button>
        <button
          onClick={() => setShowScenarioPlanner(true)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          📉 Strategy & Scenario Planning
        </button>
      </>
    );
  };

  return (
    <Layout
      user={currentUser}
      onLogout={logout}
      onOpenSettings={() => setShowSettings(true)}
      onOpenDrawer={() => setIsDrawerOpen(true)}
      onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      notificationCount={getNotificationCount()}
    >
      {isAuthenticated && !propertiesLoading && (
        <MigrationHelper
          userId={currentUser.id}
          propertiesInCloudCount={properties.length}
          onComplete={handleMigrationComplete}
          onError={handleMigrationError}
        />
      )}

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onSelectProperty={(id) => setSelectedPropertyId(id)}
        onOpenSettings={() => setShowSettings(true)}
        onAddProperty={() => setShowAddPropertyForm(true)}
        onOpenCalendar={() => setShowCalendar(true)}
        user={currentUser}
        onLogout={logout}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        properties={properties}
        onAction={handleSmartAction}
        snoozedTasks={snoozedTasks}
        warningPeriod={settings.warningPeriod}
      />

      {migrationConflict && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ maxWidth: '400px', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '16px' }}>Sync Conflict</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              We found unsynced properties on this device. What would you like to do?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => resolveConflict('merge')} className="btn-primary" style={{ padding: '12px' }}>Merge into Cloud</button>
              <button onClick={() => resolveConflict('cloud')} style={{ padding: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Use Cloud Only</button>
            </div>
          </div>
        </div>
      )}

      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => setShowTaskForm(false)}
          onAdd={handleAddTask}
          properties={properties}
        />
      )}

      {isActionMenuOpen && (
        <ActionOverlay
          isOpen={isActionMenuOpen}
          onClose={() => setIsActionMenuOpen(false)}
          onAddTransaction={() => { setIsActionMenuOpen(false); setShowTransactionForm(true); }}
          onAddProperty={() => { setIsActionMenuOpen(false); setShowAddPropertyForm(true); }}
          onUploadReceipt={() => { setIsActionMenuOpen(false); setShowScanner(true); }}
          onScanLease={() => { setIsActionMenuOpen(false); setShowLeaseScanner(true); }}
          onAction={handleSmartAction}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showSettings && (
        <Settings
          user={currentUser}
          vendors={vendors}
          onAddVendor={addVendor}
          onDeleteVendor={deleteVendor}
          properties={properties}
          onClose={() => setShowSettings(false)}
          onLogout={logout}
          onOpenAdmin={() => { setShowSettings(false); setShowAdminDashboard(true); }} // [NEW]
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
          onUpdateSettings={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
        />
      )}

      <PropertySwitcher properties={properties} selectedId={selectedPropertyId} onSelect={setSelectedPropertyId} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <Breadcrumbs
          paths={selectedPropertyId !== 'all' && selectedProperty ? [{ label: selectedProperty.name, id: selectedProperty.id }] : []}
          onNavigate={(id) => setSelectedPropertyId(id)}
        />
      </div>

      {/* Removed NotificationPanel from here - now in NotificationDrawer */}
      {renderPropertyView()}

      {/* Modals */}
      {showScanner && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <button onClick={() => setShowScanner(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            <ReceiptScanner onScanComplete={handleScanComplete} />
          </div>
        </div>
      )}
      {showCalendar && (
        <MasterCalendar
          properties={properties}
          onClose={() => setShowCalendar(false)}
        />
      )}
      {showScenarioPlanner && selectedProperty && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <ScenarioPlanner property={selectedProperty} onClose={() => setShowScenarioPlanner(false)} />
        </div>
      )}
      {showTransactionForm && selectedProperty && (
        <TransactionForm
          vendors={vendors}
          onSubmit={addTransaction}
          onClose={() => { setShowTransactionForm(false); setPrefilledTransactionData(null); }}
          initialData={prefilledTransactionData}
        />
      )}
      {showAddPropertyForm && (
        <AddPropertyForm onSubmit={addProperty} onClose={() => setShowAddPropertyForm(false)} />
      )}
      {showPropertyDetail && selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onUpdate={updateProperty}
          onDelete={deleteProperty}
          onSell={() => { setShowPropertyDetail(false); setShowSellModal(true); }}
          onClose={() => setShowPropertyDetail(false)}
          vendors={vendors}
          onAddVendor={addVendor}
          onDeleteVendor={deleteVendor}
        />
      )}
      {showSellModal && selectedProperty && (
        <SellPropertyModal
          property={selectedProperty}
          onClose={() => setShowSellModal(false)}
          onSell={handleSellProperty}
        />
      )}
      {showLeaseScanner && (
        <LeaseScanner
          onScanComplete={handleLeaseScanComplete}
          onClose={() => setShowLeaseScanner(false)}
        />
      )}
      {isAuthenticated && isMobile && (
        <MobileNav
          activeView={activeMobileView}
          onViewChange={(v) => {
            setActiveMobileView(v);
            if (v === 'portfolio') {
              setSelectedPropertyId('all');
            }
          }}
          onActionClick={() => setIsActionMenuOpen(true)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          notificationCount={getNotificationCount()}
        />
      )}
      <TermDictionary isOpen={showDictionary} onClose={() => setShowDictionary(false)} />

      {/* Action Overlay */}
      <ActionOverlay
        isOpen={isActionMenuOpen}
        onClose={() => setIsActionMenuOpen(false)}
        onAddTransaction={() => setShowTransactionForm(true)}
        onAddProperty={() => setShowAddPropertyForm(true)}
        onUploadReceipt={() => setShowScanner(true)}
        onScanLease={() => setShowLeaseScanner(true)}
      />
      {/* Admin Dashboard */}
      {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} />}
    </Layout>
  );
}

export default App;
