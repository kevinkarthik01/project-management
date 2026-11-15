import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Wallet,
    Receipt,
    ShoppingBag,
    PieChart,
    BarChart3,
    Plus,
    Pencil,
    Trash2,
    Search,
    Calendar,
    Paperclip,
    Loader2,
    X,
    FileText,
    User,
    Info,
    Image as ImageIcon
} from 'lucide-react';
import financeApi from '../api/financeApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProjectModuleNav from '../components/ProjectModuleNav.jsx';
import {
    AttachmentField,
    AttachmentPreviewModal,
    isImageAttachment
} from '../components/AttachmentField.jsx';
import { formatINR, formatCompactINR, formatDateIN } from '../utils/currency.js';

const DEFAULT_EXPENSE_CATEGORIES = [
    'Feeds',
    'Infrastructure',
    'Medical',
    'Labour / Manpower',
    'Transportation',
    'Maintenance',
    'Utilities',
    'Miscellaneous'
];

const CATEGORY_COLORS = [
    '#2563EB',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#EF4444',
    '#64748B',
    '#14B8A6',
    '#D97706'
];

export default function ProjectExpenseTracker() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [project, setProject] = useState(null);
    const [summary, setSummary] = useState(null);
    const [investments, setInvestments] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [sales, setSales] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState(DEFAULT_EXPENSE_CATEGORIES);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // Active section tab below dashboard: 'investments' | 'expenses' | 'sales' | 'summary'
    const [activeTab, setActiveTab] = useState('expenses');

    // Expense Filters
    const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');
    const [expenseStartDate, setExpenseStartDate] = useState('');
    const [expenseEndDate, setExpenseEndDate] = useState('');
    const [expenseSearch, setExpenseSearch] = useState('');

    // Investment & Sales Search
    const [investmentSearch, setInvestmentSearch] = useState('');
    const [salesSearch, setSalesSearch] = useState('');

    // Modal state: null | 'investment' | 'expense' | 'sale'
    const [modalType, setModalType] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState(null);

    // Investment Form State
    const [invTitle, setInvTitle] = useState('');
    const [invAmount, setInvAmount] = useState('');
    const [invDate, setInvDate] = useState('');
    const [invBy, setInvBy] = useState('');
    const [invDesc, setInvDesc] = useState('');
    const [invAttachmentUrl, setInvAttachmentUrl] = useState('');
    const [invAttachmentName, setInvAttachmentName] = useState('');

    // Expense Form State
    const [expTitle, setExpTitle] = useState('');
    const [expAmount, setExpAmount] = useState('');
    const [expCategory, setExpCategory] = useState('Feeds');
    const [customCategoryInput, setCustomCategoryInput] = useState('');
    const [isAddingCustomCat, setIsAddingCustomCat] = useState(false);
    const [expDate, setExpDate] = useState('');
    const [expPaidBy, setExpPaidBy] = useState('');
    const [expDesc, setExpDesc] = useState('');
    const [expAttachmentUrl, setExpAttachmentUrl] = useState('');
    const [expAttachmentName, setExpAttachmentName] = useState('');

    // Sale Form State
    const [saleProduct, setSaleProduct] = useState('');
    const [saleQuantity, setSaleQuantity] = useState('');
    const [saleUnitPrice, setSaleUnitPrice] = useState('');
    const [saleDate, setSaleDate] = useState('');
    const [saleCustomer, setSaleCustomer] = useState('');
    const [saleDesc, setSaleDesc] = useState('');
    const [saleAttachmentUrl, setSaleAttachmentUrl] = useState('');
    const [saleAttachmentName, setSaleAttachmentName] = useState('');

    const todayISO = () => new Date().toISOString().split('T')[0];

    const loadFinanceData = async () => {
        try {
            setIsLoading(true);
            setErrorMsg('');
            const res = await financeApi.getOverview(projectId);
            setProject(res.project || null);
            setSummary(res.summary || null);
            setInvestments(res.investments || []);
            setExpenses(res.expenses || []);
            setSales(res.sales || []);
            if (Array.isArray(res.expenseCategories) && res.expenseCategories.length > 0) {
                setExpenseCategories(res.expenseCategories);
            }
        } catch (err) {
            setErrorMsg(err.message || 'Failed to load financial data for this project.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFinanceData();
    }, [projectId]);

    const canModifyEntry = (entry) => {
        if (!currentUser) return false;
        if (currentUser.role === 'admin') return true;
        const currentUserId = (currentUser._id || currentUser.id)?.toString();
        const projectCreatorId = (project?.createdBy?._id || project?.createdBy)?.toString();
        if (projectCreatorId && projectCreatorId === currentUserId) return true;
        const authorId = (entry.createdBy?._id || entry.createdBy)?.toString();
        return authorId === currentUserId;
    };

    // ==========================================
    // MODAL OPEN HANDLERS
    // ==========================================
    const openInvestmentModal = (record = null) => {
        setEditingRecord(record);
        if (record) {
            setInvTitle(record.title || '');
            setInvAmount(String(record.amount ?? ''));
            setInvDate(
                record.investmentDate
                    ? new Date(record.investmentDate).toISOString().split('T')[0]
                    : todayISO()
            );
            setInvBy(record.investedBy || '');
            setInvDesc(record.description || '');
            setInvAttachmentUrl(record.attachmentUrl || '');
            setInvAttachmentName(record.attachmentName || '');
        } else {
            setInvTitle('');
            setInvAmount('');
            setInvDate(todayISO());
            setInvBy(currentUser?.name || '');
            setInvDesc('');
            setInvAttachmentUrl('');
            setInvAttachmentName('');
        }
        setModalType('investment');
    };

    const openExpenseModal = (record = null) => {
        setEditingRecord(record);
        setIsAddingCustomCat(false);
        setCustomCategoryInput('');
        if (record) {
            setExpTitle(record.title || '');
            setExpAmount(String(record.amount ?? ''));
            setExpCategory(record.category || 'Feeds');
            setExpDate(
                record.expenseDate
                    ? new Date(record.expenseDate).toISOString().split('T')[0]
                    : todayISO()
            );
            setExpPaidBy(record.paidBy || '');
            setExpDesc(record.description || '');
            setExpAttachmentUrl(record.attachmentUrl || '');
            setExpAttachmentName(record.attachmentName || '');
        } else {
            setExpTitle('');
            setExpAmount('');
            setExpCategory(expenseCategories[0] || 'Feeds');
            setExpDate(todayISO());
            setExpPaidBy(currentUser?.name || '');
            setExpDesc('');
            setExpAttachmentUrl('');
            setExpAttachmentName('');
        }
        setModalType('expense');
    };

    const openSaleModal = (record = null) => {
        setEditingRecord(record);
        if (record) {
            setSaleProduct(record.productName || '');
            setSaleQuantity(String(record.quantity ?? ''));
            setSaleUnitPrice(String(record.unitPrice ?? ''));
            setSaleDate(
                record.saleDate
                    ? new Date(record.saleDate).toISOString().split('T')[0]
                    : todayISO()
            );
            setSaleCustomer(record.customerName || '');
            setSaleDesc(record.description || '');
            setSaleAttachmentUrl(record.attachmentUrl || '');
            setSaleAttachmentName(record.attachmentName || '');
        } else {
            setSaleProduct('');
            setSaleQuantity('');
            setSaleUnitPrice('');
            setSaleDate(todayISO());
            setSaleCustomer('');
            setSaleDesc('');
            setSaleAttachmentUrl('');
            setSaleAttachmentName('');
        }
        setModalType('sale');
    };

    const closeModal = () => {
        setModalType(null);
        setEditingRecord(null);
        setIsAddingCustomCat(false);
    };

    // ==========================================
    // SUBMIT HANDLERS
    // ==========================================
    const handleSaveInvestment = async (e) => {
        e.preventDefault();
        const numAmount = Number(invAmount);
        if (!invTitle.trim() || isNaN(numAmount) || numAmount <= 0 || !invBy.trim()) {
            alert('Please provide a valid title, positive amount (₹), and investor name.');
            return;
        }
        try {
            setIsSubmitting(true);
            const payload = {
                title: invTitle.trim(),
                amount: numAmount,
                investmentDate: invDate || todayISO(),
                investedBy: invBy.trim(),
                description: invDesc.trim(),
                attachmentUrl: invAttachmentUrl,
                attachmentName: invAttachmentName
            };
            if (editingRecord) {
                await financeApi.updateInvestment(projectId, editingRecord._id, payload);
            } else {
                await financeApi.createInvestment(projectId, payload);
            }
            closeModal();
            await loadFinanceData();
        } catch (err) {
            alert(err.message || 'Failed to save investment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteInvestment = async (record) => {
        if (!window.confirm(`Delete investment "${record.title}" (${formatINR(record.amount)})?`)) {
            return;
        }
        try {
            await financeApi.deleteInvestment(projectId, record._id);
            await loadFinanceData();
        } catch (err) {
            alert(err.message || 'Failed to delete investment');
        }
    };

    const handleSaveExpense = async (e) => {
        e.preventDefault();
        const numAmount = Number(expAmount);
        const resolvedCategory = isAddingCustomCat ? customCategoryInput.trim() : expCategory;

        if (!expTitle.trim() || isNaN(numAmount) || numAmount <= 0 || !resolvedCategory || !expPaidBy.trim()) {
            alert('Please provide a valid expense title, positive amount (₹), category, and paid by.');
            return;
        }
        try {
            setIsSubmitting(true);
            const payload = {
                title: expTitle.trim(),
                amount: numAmount,
                category: resolvedCategory,
                expenseDate: expDate || todayISO(),
                paidBy: expPaidBy.trim(),
                description: expDesc.trim(),
                attachmentUrl: expAttachmentUrl,
                attachmentName: expAttachmentName
            };
            if (editingRecord) {
                await financeApi.updateExpense(projectId, editingRecord._id, payload);
            } else {
                await financeApi.createExpense(projectId, payload);
            }
            closeModal();
            await loadFinanceData();
        } catch (err) {
            alert(err.message || 'Failed to save expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpense = async (record) => {
        if (!window.confirm(`Delete expense "${record.title}" (${formatINR(record.amount)})?`)) {
            return;
        }
        try {
            await financeApi.deleteExpense(projectId, record._id);
            await loadFinanceData();
        } catch (err) {
            alert(err.message || 'Failed to delete expense');
        }
    };

    const computedSaleTotal = useMemo(() => {
        const q = Number(saleQuantity);
        const p = Number(saleUnitPrice);
        if (isNaN(q) || isNaN(p) || q < 0 || p < 0) return 0;
        return Number((q * p).toFixed(2));
    }, [saleQuantity, saleUnitPrice]);

    const handleSaveSale = async (e) => {
        e.preventDefault();
        const qty = Number(saleQuantity);
        const price = Number(saleUnitPrice);
        if (!saleProduct.trim() || isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
            alert('Please enter a valid product name, positive quantity, and unit price (₹).');
            return;
        }
        try {
            setIsSubmitting(true);
            const payload = {
                productName: saleProduct.trim(),
                quantity: qty,
                unitPrice: price,
                saleDate: saleDate || todayISO(),
                customerName: saleCustomer.trim(),
                description: saleDesc.trim(),
                attachmentUrl: saleAttachmentUrl,
                attachmentName: saleAttachmentName
            };
            if (editingRecord) {
                await financeApi.updateSale(projectId, editingRecord._id, payload);
            } else {
                await financeApi.createSale(projectId, payload);
            }
            closeModal();
            await loadFinanceData();
        } catch (err) {
            alert(err.message || 'Failed to save sale record');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSale = async (record) => {
        if (
            !window.confirm(
                `Delete sale "${record.productName}" (${formatINR(record.totalAmount)})?`
            )
        ) {
            return;
        }
        try {
            await financeApi.deleteSale(projectId, record._id);
            await loadFinanceData();
        } catch (err) {
            alert(err.message || 'Failed to delete sale');
        }
    };

    // Render attachment cell button with thumbnail or icon
    const renderAttachmentButton = (title, url, name) => {
        if (!url) return <span className="td-muted">—</span>;
        const isImg = isImageAttachment(url, name);
        return (
            <button
                type="button"
                className="receipt-view-btn"
                onClick={() =>
                    setPreviewAttachment({
                        title,
                        url,
                        name: name || 'Receipt Attachment'
                    })
                }
                title="Click to preview or download attachment"
            >
                {isImg ? (
                    <img
                        src={url}
                        alt={name || 'Receipt'}
                        className="receipt-mini-thumb"
                    />
                ) : (
                    <Paperclip size={12} />
                )}
                <span className="receipt-btn-text">{name || 'View Receipt'}</span>
            </button>
        );
    };

    // ==========================================
    // FILTERED LISTS FOR TABS
    // ==========================================
    const filteredExpenses = useMemo(() => {
        return expenses.filter((exp) => {
            if (expenseCategoryFilter !== 'all' && exp.category !== expenseCategoryFilter) {
                return false;
            }
            if (expenseStartDate) {
                const start = new Date(expenseStartDate);
                start.setHours(0, 0, 0, 0);
                if (new Date(exp.expenseDate || exp.createdAt) < start) return false;
            }
            if (expenseEndDate) {
                const end = new Date(expenseEndDate);
                end.setHours(23, 59, 59, 999);
                if (new Date(exp.expenseDate || exp.createdAt) > end) return false;
            }
            if (expenseSearch.trim()) {
                const q = expenseSearch.toLowerCase();
                const match =
                    exp.title?.toLowerCase().includes(q) ||
                    exp.category?.toLowerCase().includes(q) ||
                    exp.paidBy?.toLowerCase().includes(q) ||
                    exp.description?.toLowerCase().includes(q) ||
                    exp.attachmentName?.toLowerCase().includes(q);
                if (!match) return false;
            }
            return true;
        });
    }, [expenses, expenseCategoryFilter, expenseStartDate, expenseEndDate, expenseSearch]);

    const filteredExpensesSum = useMemo(
        () => filteredExpenses.reduce((acc, item) => acc + (Number(item.amount) || 0), 0),
        [filteredExpenses]
    );

    const filteredInvestments = useMemo(() => {
        if (!investmentSearch.trim()) return investments;
        const q = investmentSearch.toLowerCase();
        return investments.filter(
            (inv) =>
                inv.title?.toLowerCase().includes(q) ||
                inv.investedBy?.toLowerCase().includes(q) ||
                inv.description?.toLowerCase().includes(q) ||
                inv.attachmentName?.toLowerCase().includes(q)
        );
    }, [investments, investmentSearch]);

    const filteredSales = useMemo(() => {
        if (!salesSearch.trim()) return sales;
        const q = salesSearch.toLowerCase();
        return sales.filter(
            (s) =>
                s.productName?.toLowerCase().includes(q) ||
                s.customerName?.toLowerCase().includes(q) ||
                s.description?.toLowerCase().includes(q)
        );
    }, [sales, salesSearch]);

    // Extract metrics safely
    const totalInvestment = summary?.totalInvestment || 0;
    const totalExpenses = summary?.totalExpenses || 0;
    const totalSalesRevenue = summary?.totalSalesRevenue || 0;
    const netProfitLoss = summary?.netProfitLoss ?? (totalSalesRevenue - totalExpenses);
    const investmentRecovery = summary?.investmentRecovery ?? (totalSalesRevenue - totalInvestment);
    const remainingUnrecoveredInvestment =
        summary?.remainingUnrecoveredInvestment ?? Math.max(0, totalInvestment - totalSalesRevenue);
    const investmentRecoveryPercent = summary?.investmentRecoveryPercent || 0;
    const cashPosition = summary?.cashPosition ?? (totalInvestment + totalSalesRevenue - totalExpenses);
    const hasSales = Boolean(summary?.hasSales);

    const expenseByCategory = summary?.charts?.expenseByCategory || [];
    const investmentByDate = summary?.charts?.investmentByDate || [];
    const monthlyTrends = summary?.charts?.monthlyTrends || [];

    // ==========================================
    // CHART HELPERS (SVG Donut, Bar, Line Charts)
    // ==========================================
    const renderCategoryDonutChart = () => {
        if (expenseByCategory.length === 0 || totalExpenses <= 0) {
            return (
                <div className="chart-empty-box">
                    <PieChart size={28} color="#94A3B8" />
                    <p>No expenses recorded yet. Add an expense to view category breakdown.</p>
                </div>
            );
        }

        const radius = 52;
        const circumference = 2 * Math.PI * radius;
        let cumulativePercent = 0;

        return (
            <div className="finance-donut-layout">
                <div className="finance-donut-svg-box">
                    <svg width="160" height="160" viewBox="0 0 140 140">
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="transparent"
                            stroke="#F1F5F9"
                            strokeWidth="16"
                        />
                        {expenseByCategory.map((item, idx) => {
                            const pct = item.amount / totalExpenses;
                            const arcLength = pct * circumference;
                            const dashOffset = -cumulativePercent * circumference;
                            cumulativePercent += pct;
                            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

                            return (
                                <circle
                                    key={item.category}
                                    cx="70"
                                    cy="70"
                                    r={radius}
                                    fill="transparent"
                                    stroke={color}
                                    strokeWidth="16"
                                    strokeDasharray={`${arcLength} ${circumference}`}
                                    strokeDashoffset={dashOffset}
                                    transform="rotate(-90 70 70)"
                                >
                                    <title>{`${item.category}: ${formatINR(item.amount)} (${item.percentage}%)`}</title>
                                </circle>
                            );
                        })}
                        <text
                            x="70"
                            y="66"
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill="#64748B"
                        >
                            Total Spent
                        </text>
                        <text
                            x="70"
                            y="82"
                            textAnchor="middle"
                            fontSize="12.5"
                            fontWeight="800"
                            fill="#0F172A"
                        >
                            {formatCompactINR(totalExpenses)}
                        </text>
                    </svg>
                </div>

                <div className="finance-donut-legend">
                    {expenseByCategory.map((item, idx) => {
                        const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                        return (
                            <div key={item.category} className="finance-legend-row">
                                <div className="finance-legend-left">
                                    <span
                                        className="finance-legend-dot"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="finance-legend-cat" title={item.category}>
                                        {item.category}
                                    </span>
                                </div>
                                <div className="finance-legend-right">
                                    <span className="finance-legend-amt">{formatINR(item.amount)}</span>
                                    <span className="finance-legend-pct">{item.percentage}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderComparisonBarChart = () => {
        const maxVal = Math.max(totalInvestment, totalExpenses, totalSalesRevenue, 1);
        const bars = [
            {
                label: 'Total Investment',
                value: totalInvestment,
                color: '#6366F1',
                sub: `${investments.length} entries`
            },
            {
                label: 'Total Expenses',
                value: totalExpenses,
                color: '#F59E0B',
                sub: `${expenses.length} entries`
            },
            {
                label: 'Sales Revenue',
                value: totalSalesRevenue,
                color: '#10B981',
                sub: `${sales.length} sales`
            }
        ];

        return (
            <div className="comparison-bars-container">
                {bars.map((bar) => {
                    const widthPct =
                        bar.value > 0 ? Math.max(6, Math.round((bar.value / maxVal) * 100)) : 0;
                    return (
                        <div key={bar.label} className="comparison-bar-item">
                            <div className="comparison-bar-header">
                                <div>
                                    <span className="comparison-bar-label">{bar.label}</span>
                                    <span className="comparison-bar-sub">({bar.sub})</span>
                                </div>
                                <span className="comparison-bar-value" style={{ color: bar.color }}>
                                    {formatINR(bar.value)}
                                </span>
                            </div>
                            <div className="comparison-bar-track">
                                <div
                                    className="comparison-bar-fill"
                                    style={{
                                        width: `${widthPct}%`,
                                        backgroundColor: bar.color
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}

                <div className="comparison-profit-footer">
                    <div className="profit-mini-box">
                        <span className="profit-mini-label">Operating Profit / Loss</span>
                        <span
                            className="profit-mini-val"
                            style={{
                                color:
                                    !hasSales && totalExpenses === 0
                                        ? '#64748B'
                                        : netProfitLoss >= 0 && hasSales
                                        ? '#059669'
                                        : '#DC2626'
                            }}
                        >
                            {formatINR(netProfitLoss)}
                        </span>
                    </div>
                    <div className="profit-mini-box">
                        <span className="profit-mini-label">Available Cash Position</span>
                        <span
                            className="profit-mini-val"
                            style={{ color: cashPosition >= 0 ? '#2563EB' : '#DC2626' }}
                        >
                            {formatINR(cashPosition)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderMonthlyLineChart = (fieldKey, strokeColor, fillColor, emptyText) => {
        const hasData = monthlyTrends.some((m) => (m[fieldKey] || 0) > 0);
        if (!hasData) {
            return (
                <div className="chart-empty-box" style={{ minHeight: '170px' }}>
                    <TrendingUp size={24} color="#94A3B8" />
                    <p>{emptyText}</p>
                </div>
            );
        }

        const dataPoints =
            monthlyTrends.length === 1
                ? [
                      { label: 'Start', [fieldKey]: 0 },
                      monthlyTrends[0]
                  ]
                : monthlyTrends;

        const maxVal = Math.max(...dataPoints.map((d) => d[fieldKey] || 0), 1);
        const svgWidth = 460;
        const svgHeight = 165;
        const padLeft = 48;
        const padRight = 24;
        const padTop = 20;
        const padBottom = 32;
        const chartW = svgWidth - padLeft - padRight;
        const chartH = svgHeight - padTop - padBottom;

        const coords = dataPoints.map((pt, idx) => {
            const x =
                padLeft +
                (dataPoints.length > 1 ? (idx / (dataPoints.length - 1)) * chartW : chartW / 2);
            const val = pt[fieldKey] || 0;
            const y = padTop + chartH - (val / maxVal) * chartH;
            return { x, y, val, label: pt.label };
        });

        const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
        const areaPoints = `${coords[0].x},${padTop + chartH} ${polylinePoints} ${
            coords[coords.length - 1].x
        },${padTop + chartH}`;

        return (
            <div className="line-chart-wrapper">
                <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="finance-line-svg"
                    preserveAspectRatio="none"
                >
                    {[0, 0.5, 1].map((ratio, idx) => {
                        const y = padTop + chartH - ratio * chartH;
                        const axisVal = maxVal * ratio;
                        return (
                            <g key={idx}>
                                <line
                                    x1={padLeft}
                                    y1={y}
                                    x2={svgWidth - padRight}
                                    y2={y}
                                    stroke="#F1F5F9"
                                    strokeWidth="1"
                                />
                                <text
                                    x={padLeft - 6}
                                    y={y + 4}
                                    textAnchor="end"
                                    fontSize="9.5"
                                    fill="#94A3B8"
                                    fontWeight="600"
                                >
                                    {formatCompactINR(axisVal)}
                                </text>
                            </g>
                        );
                    })}

                    <polygon points={areaPoints} fill={fillColor} opacity="0.18" />

                    <polyline
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylinePoints}
                    />

                    {coords.map((c, idx) => (
                        <g key={idx}>
                            <circle
                                cx={c.x}
                                cy={c.y}
                                r="4"
                                fill="#FFFFFF"
                                stroke={strokeColor}
                                strokeWidth="2.5"
                            >
                                <title>{`${c.label}: ${formatINR(c.val)}`}</title>
                            </circle>
                            <text
                                x={c.x}
                                y={svgHeight - 10}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#64748B"
                                fontWeight="600"
                            >
                                {c.label}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="project-module-page">
                <ProjectModuleNav
                    project={project}
                    projectId={projectId}
                    activeModule="expenses"
                />
                <div className="module-loading-state">
                    <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 10px' }} />
                    <p>Loading project financial dashboard...</p>
                </div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="project-module-page">
                <ProjectModuleNav
                    project={project}
                    projectId={projectId}
                    activeModule="expenses"
                />
                <div className="tasks-empty-state" style={{ color: '#DC2626' }}>
                    <p>{errorMsg}</p>
                    <button
                        type="button"
                        className="btn-secondary"
                        style={{ marginTop: '12px' }}
                        onClick={() => navigate('/projects')}
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="project-module-page">
            {/* Top Project Breadcrumb & Module Switcher */}
            <ProjectModuleNav
                project={project}
                projectId={projectId}
                activeModule="expenses"
            />

            {/* Hero Header with Quick Action Buttons */}
            <div className="module-hero-header">
                <div className="module-hero-left">
                    <div className="module-hero-icon finance-icon-box">
                        <IndianRupee size={22} />
                    </div>
                    <div>
                        <div className="module-title-row">
                            <h1 className="module-main-title">Expense Tracker & Financials</h1>
                            {project?.title && (
                                <span className="module-project-badge">{project.title}</span>
                            )}
                        </div>
                        <p className="module-subtitle">
                            Monitor capital investments, categorized expenses with receipt attachments, sales revenue, and actual profitability in Indian Rupees (₹).
                        </p>
                    </div>
                </div>

                <div className="finance-quick-actions">
                    <button
                        type="button"
                        className="btn-finance-action inv-btn"
                        onClick={() => openInvestmentModal()}
                    >
                        <Plus size={15} />
                        <span>Add Investment</span>
                    </button>
                    <button
                        type="button"
                        className="btn-finance-action exp-btn"
                        onClick={() => openExpenseModal()}
                    >
                        <Plus size={15} />
                        <span>Record Expense</span>
                    </button>
                    <button
                        type="button"
                        className="btn-finance-action sale-btn"
                        onClick={() => openSaleModal()}
                    >
                        <Plus size={15} />
                        <span>Record Sale</span>
                    </button>
                </div>
            </div>

            {/* =========================================================
                5 FINANCIAL SUMMARY CARDS (Indian Rupees ₹)
               ========================================================= */}
            <section className="finance-summary-cards-grid" aria-label="Financial Overview">
                <div className="finance-kpi-card">
                    <div className="kpi-top-row">
                        <span className="kpi-title">Total Investment</span>
                        <div className="kpi-icon-badge indigo">
                            <Wallet size={17} />
                        </div>
                    </div>
                    <div className="kpi-amount">{formatINR(totalInvestment)}</div>
                    <div className="kpi-footer-meta">
                        <span>{investments.length} investment entries recorded</span>
                    </div>
                </div>

                <div className="finance-kpi-card">
                    <div className="kpi-top-row">
                        <span className="kpi-title">Total Expenses</span>
                        <div className="kpi-icon-badge amber">
                            <Receipt size={17} />
                        </div>
                    </div>
                    <div className="kpi-amount">{formatINR(totalExpenses)}</div>
                    <div className="kpi-footer-meta">
                        <span>Across {expenseByCategory.length} expense categories</span>
                    </div>
                </div>

                <div className="finance-kpi-card">
                    <div className="kpi-top-row">
                        <span className="kpi-title">Total Sales Revenue</span>
                        <div className="kpi-icon-badge emerald">
                            <ShoppingBag size={17} />
                        </div>
                    </div>
                    <div className="kpi-amount">{formatINR(totalSalesRevenue)}</div>
                    <div className="kpi-footer-meta">
                        {hasSales ? (
                            <span style={{ color: '#059669', fontWeight: 600 }}>
                                {sales.length} completed sale{sales.length === 1 ? '' : 's'}
                            </span>
                        ) : (
                            <span style={{ color: '#94A3B8' }}>
                                Zero sales recorded yet (Gross Revenue)
                            </span>
                        )}
                    </div>
                </div>

                <div
                    className={`finance-kpi-card ${
                        !hasSales
                            ? 'kpi-pending-border'
                            : netProfitLoss >= 0
                            ? 'kpi-profit-border'
                            : 'kpi-loss-border'
                    }`}
                >
                    <div className="kpi-top-row">
                        <span className="kpi-title">Net Operating Profit / Loss</span>
                        <div
                            className={`kpi-icon-badge ${
                                hasSales && netProfitLoss >= 0 ? 'emerald' : 'red'
                            }`}
                        >
                            {hasSales && netProfitLoss >= 0 ? (
                                <TrendingUp size={17} />
                            ) : (
                                <TrendingDown size={17} />
                            )}
                        </div>
                    </div>
                    <div
                        className="kpi-amount"
                        style={{
                            color: !hasSales
                                ? totalExpenses > 0
                                    ? '#DC2626'
                                    : '#475569'
                                : netProfitLoss >= 0
                                ? '#059669'
                                : '#DC2626'
                        }}
                    >
                        {formatINR(netProfitLoss)}
                    </div>
                    <div className="kpi-footer-meta">
                        {!hasSales ? (
                            <span style={{ color: '#D97706', fontWeight: 600 }}>
                                {totalExpenses > 0
                                    ? 'No sales yet • Negative operating position'
                                    : 'Pending sales & expense activity'}
                            </span>
                        ) : (
                            <span>Sales Revenue − Operating Expenses</span>
                        )}
                    </div>
                </div>

                <div className="finance-kpi-card">
                    <div className="kpi-top-row">
                        <span className="kpi-title">Investment Recovery</span>
                        <div
                            className={`kpi-icon-badge ${
                                investmentRecovery >= 0 && totalInvestment > 0 ? 'emerald' : 'blue'
                            }`}
                        >
                            <BarChart3 size={17} />
                        </div>
                    </div>
                    <div
                        className="kpi-amount"
                        style={{
                            color:
                                totalInvestment === 0
                                    ? '#475569'
                                    : investmentRecovery >= 0
                                    ? '#059669'
                                    : '#D97706'
                        }}
                    >
                        {formatINR(investmentRecovery)}
                    </div>
                    <div className="kpi-footer-meta">
                        <span>
                            Unrecovered: <strong>{formatINR(remainingUnrecoveredInvestment)}</strong> ({investmentRecoveryPercent}% recovered)
                        </span>
                    </div>
                </div>
            </section>

            {/* =========================================================
                VISUAL ANALYTICS DASHBOARD (4 CHARTS)
               ========================================================= */}
            <section className="finance-charts-grid">
                <div className="finance-chart-panel">
                    <div className="chart-panel-header">
                        <div>
                            <h3 className="chart-panel-title">Expense Breakdown by Category</h3>
                            <p className="chart-panel-subtitle">
                                Distribution of project expenses across categories
                            </p>
                        </div>
                    </div>
                    {renderCategoryDonutChart()}
                </div>

                <div className="finance-chart-panel">
                    <div className="chart-panel-header">
                        <div>
                            <h3 className="chart-panel-title">
                                Investment vs Expenses vs Sales
                            </h3>
                            <p className="chart-panel-subtitle">
                                Capital inflow, operating costs, revenue, and cash position
                            </p>
                        </div>
                    </div>
                    {renderComparisonBarChart()}
                </div>

                <div className="finance-chart-panel">
                    <div className="chart-panel-header">
                        <div>
                            <h3 className="chart-panel-title">Monthly Expense Trends</h3>
                            <p className="chart-panel-subtitle">
                                Month-over-month operating expenditure trajectory
                            </p>
                        </div>
                        <span className="chart-legend-pill amber">Expenses (₹)</span>
                    </div>
                    {renderMonthlyLineChart(
                        'expenses',
                        '#F59E0B',
                        '#F59E0B',
                        'Record expenses across dates to visualize monthly spending trends.'
                    )}
                </div>

                <div className="finance-chart-panel">
                    <div className="chart-panel-header">
                        <div>
                            <h3 className="chart-panel-title">Monthly Sales Revenue Trends</h3>
                            <p className="chart-panel-subtitle">
                                Month-over-month completed sales revenue trajectory
                            </p>
                        </div>
                        <span className="chart-legend-pill emerald">Sales Revenue (₹)</span>
                    </div>
                    {renderMonthlyLineChart(
                        'sales',
                        '#10B981',
                        '#10B981',
                        'Record project sales to visualize monthly revenue trends.'
                    )}
                </div>
            </section>

            {/* =========================================================
                TABS FOR INVESTMENTS, EXPENSES, SALES & FINANCIAL SUMMARY
               ========================================================= */}
            <div className="finance-tabs-bar" role="tablist">
                {[
                    {
                        id: 'investments',
                        label: `Investments (${investments.length})`,
                        icon: Wallet
                    },
                    {
                        id: 'expenses',
                        label: `Expenses (${expenses.length})`,
                        icon: Receipt
                    },
                    {
                        id: 'sales',
                        label: `Sales (${sales.length})`,
                        icon: ShoppingBag
                    },
                    {
                        id: 'summary',
                        label: 'Financial Summary',
                        icon: FileText
                    }
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            className={`finance-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={15} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* =========================================================
                TAB 1: INVESTMENTS SECTION
               ========================================================= */}
            {activeTab === 'investments' && (
                <section className="finance-tab-panel">
                    <div className="finance-section-toolbar">
                        <div>
                            <h2 className="finance-section-title">
                                Investment History & Capital Breakdown
                            </h2>
                            <p className="finance-section-subtitle">
                                Total Capital Invested: <strong>{formatINR(totalInvestment)}</strong> across {investments.length} entries
                            </p>
                        </div>

                        <div className="finance-toolbar-right">
                            <div className="tasks-search-box finance-search-input-box">
                                <Search size={14} className="tasks-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search investments..."
                                    className="tasks-search-input"
                                    value={investmentSearch}
                                    onChange={(e) => setInvestmentSearch(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn-primary-pill"
                                style={{ backgroundColor: '#4F46E5' }}
                                onClick={() => openInvestmentModal()}
                            >
                                <Plus size={15} />
                                <span>Add Investment</span>
                            </button>
                        </div>
                    </div>

                    {investmentByDate.length > 0 && (
                        <div className="investment-date-breakdown-strip">
                            <span className="strip-title">Breakdown by Date:</span>
                            <div className="strip-chips">
                                {investmentByDate.map((item) => (
                                    <div key={item.date} className="date-breakdown-chip">
                                        <Calendar size={12} color="#4F46E5" />
                                        <span>{formatDateIN(item.date)}:</span>
                                        <strong>{formatINR(item.amount)}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredInvestments.length === 0 ? (
                        <div className="module-empty-state">
                            <div className="empty-state-icon-circle">
                                <Wallet size={24} color="#4F46E5" />
                            </div>
                            <h3>No Investments Recorded</h3>
                            <p>
                                Record capital contributions and initial investments made into this project with optional receipts.
                            </p>
                            <button
                                type="button"
                                className="btn-primary-pill"
                                style={{ backgroundColor: '#4F46E5', marginTop: '12px' }}
                                onClick={() => openInvestmentModal()}
                            >
                                <Plus size={15} />
                                <span>Record First Investment</span>
                            </button>
                        </div>
                    ) : (
                        <div className="finance-table-wrapper">
                            <table className="finance-data-table responsive-mobile-table">
                                <thead>
                                    <tr>
                                        <th>Investment Title</th>
                                        <th>Invested By</th>
                                        <th>Date</th>
                                        <th>Description / Notes</th>
                                        <th>Receipt / Attachment</th>
                                        <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvestments.map((inv) => {
                                        const canEdit = canModifyEntry(inv);
                                        return (
                                            <tr key={inv._id}>
                                                <td data-label="Investment Title" className="td-primary">
                                                    {inv.title}
                                                </td>
                                                <td data-label="Invested By">
                                                    <span className="person-pill">
                                                        <User size={12} />
                                                        <span>{inv.investedBy}</span>
                                                    </span>
                                                </td>
                                                <td data-label="Date">
                                                    {formatDateIN(inv.investmentDate)}
                                                </td>
                                                <td data-label="Description" className="td-muted">
                                                    {inv.description || '—'}
                                                </td>
                                                <td data-label="Attachment">
                                                    {renderAttachmentButton(
                                                        inv.title,
                                                        inv.attachmentUrl,
                                                        inv.attachmentName
                                                    )}
                                                </td>
                                                <td
                                                    data-label="Amount (₹)"
                                                    style={{
                                                        textAlign: 'right',
                                                        fontWeight: 700,
                                                        color: '#4F46E5'
                                                    }}
                                                >
                                                    {formatINR(inv.amount)}
                                                </td>
                                                <td data-label="Actions" style={{ textAlign: 'right' }}>
                                                    {canEdit && (
                                                        <div className="table-row-actions">
                                                            <button
                                                                type="button"
                                                                className="insight-icon-btn"
                                                                onClick={() =>
                                                                    openInvestmentModal(inv)
                                                                }
                                                                title="Edit Investment"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="insight-icon-btn delete"
                                                                onClick={() =>
                                                                    handleDeleteInvestment(inv)
                                                                }
                                                                title="Delete Investment"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {/* =========================================================
                TAB 2: EXPENSES SECTION
               ========================================================= */}
            {activeTab === 'expenses' && (
                <section className="finance-tab-panel">
                    <div className="finance-section-toolbar">
                        <div>
                            <h2 className="finance-section-title">Project Expense Ledger</h2>
                            <p className="finance-section-subtitle">
                                Showing {filteredExpenses.length} of {expenses.length} expenses • Filtered Total:{' '}
                                <strong>{formatINR(filteredExpensesSum)}</strong>
                            </p>
                        </div>

                        <button
                            type="button"
                            className="btn-primary-pill"
                            style={{ backgroundColor: '#D97706' }}
                            onClick={() => openExpenseModal()}
                        >
                            <Plus size={15} />
                            <span>Record Expense</span>
                        </button>
                    </div>

                    {/* Expense Filter Bar: Category, Date Range, Search */}
                    <div className="expense-filters-grid">
                        <div className="filter-control-item">
                            <label>Category</label>
                            <select
                                className="form-select"
                                value={expenseCategoryFilter}
                                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {expenseCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-control-item">
                            <label>From Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={expenseStartDate}
                                onChange={(e) => setExpenseStartDate(e.target.value)}
                            />
                        </div>

                        <div className="filter-control-item">
                            <label>To Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={expenseEndDate}
                                onChange={(e) => setExpenseEndDate(e.target.value)}
                            />
                        </div>

                        <div className="filter-control-item search-col">
                            <label>Search Expenses</label>
                            <div className="tasks-search-box">
                                <Search size={14} className="tasks-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search title, paid by, notes..."
                                    className="tasks-search-input"
                                    value={expenseSearch}
                                    onChange={(e) => setExpenseSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {(expenseCategoryFilter !== 'all' ||
                            expenseStartDate ||
                            expenseEndDate ||
                            expenseSearch) && (
                            <div className="filter-control-item" style={{ alignSelf: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setExpenseCategoryFilter('all');
                                        setExpenseStartDate('');
                                        setExpenseEndDate('');
                                        setExpenseSearch('');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {filteredExpenses.length === 0 ? (
                        <div className="module-empty-state">
                            <div className="empty-state-icon-circle">
                                <Receipt size={24} color="#D97706" />
                            </div>
                            <h3>
                                {expenses.length === 0
                                    ? 'No Expenses Recorded Yet'
                                    : 'No Expenses Match Your Filter Criteria'}
                            </h3>
                            <p>
                                {expenses.length === 0
                                    ? 'Track project expenses across Feeds, Infrastructure, Medical, Labour, Transportation, Maintenance, Utilities, and attach bill receipts.'
                                    : 'Try adjusting the category filter, date range, or search keyword.'}
                            </p>
                            {expenses.length === 0 && (
                                <button
                                    type="button"
                                    className="btn-primary-pill"
                                    style={{ backgroundColor: '#D97706', marginTop: '12px' }}
                                    onClick={() => openExpenseModal()}
                                >
                                    <Plus size={15} />
                                    <span>Record First Expense</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="finance-table-wrapper">
                            <table className="finance-data-table responsive-mobile-table">
                                <thead>
                                    <tr>
                                        <th>Expense Title</th>
                                        <th>Category</th>
                                        <th>Date</th>
                                        <th>Paid By</th>
                                        <th>Description</th>
                                        <th>Receipt / Attachment</th>
                                        <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.map((exp) => {
                                        const canEdit = canModifyEntry(exp);
                                        return (
                                            <tr key={exp._id}>
                                                <td data-label="Expense Title" className="td-primary">
                                                    {exp.title}
                                                </td>
                                                <td data-label="Category">
                                                    <span className="expense-cat-badge">
                                                        {exp.category}
                                                    </span>
                                                </td>
                                                <td data-label="Date">
                                                    {formatDateIN(exp.expenseDate)}
                                                </td>
                                                <td data-label="Paid By">
                                                    <span className="person-pill">
                                                        <User size={12} />
                                                        <span>{exp.paidBy}</span>
                                                    </span>
                                                </td>
                                                <td data-label="Description" className="td-muted">
                                                    {exp.description || '—'}
                                                </td>
                                                <td data-label="Receipt">
                                                    {renderAttachmentButton(
                                                        exp.title,
                                                        exp.attachmentUrl,
                                                        exp.attachmentName
                                                    )}
                                                </td>
                                                <td
                                                    data-label="Amount (₹)"
                                                    style={{
                                                        textAlign: 'right',
                                                        fontWeight: 700,
                                                        color: '#B45309'
                                                    }}
                                                >
                                                    {formatINR(exp.amount)}
                                                </td>
                                                <td data-label="Actions" style={{ textAlign: 'right' }}>
                                                    {canEdit && (
                                                        <div className="table-row-actions">
                                                            <button
                                                                type="button"
                                                                className="insight-icon-btn"
                                                                onClick={() => openExpenseModal(exp)}
                                                                title="Edit Expense"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="insight-icon-btn delete"
                                                                onClick={() =>
                                                                    handleDeleteExpense(exp)
                                                                }
                                                                title="Delete Expense"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {/* =========================================================
                TAB 3: SALES & REVENUE SECTION
               ========================================================= */}
            {activeTab === 'sales' && (
                <section className="finance-tab-panel">
                    <div className="finance-section-toolbar">
                        <div>
                            <h2 className="finance-section-title">Sales & Revenue History</h2>
                            <p className="finance-section-subtitle">
                                Total Completed Sales Revenue:{' '}
                                <strong style={{ color: '#059669' }}>
                                    {formatINR(totalSalesRevenue)}
                                </strong>{' '}
                                across {sales.length} transactions
                            </p>
                        </div>

                        <div className="finance-toolbar-right">
                            <div className="tasks-search-box finance-search-input-box">
                                <Search size={14} className="tasks-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search product, buyer..."
                                    className="tasks-search-input"
                                    value={salesSearch}
                                    onChange={(e) => setSalesSearch(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn-primary-pill"
                                style={{ backgroundColor: '#059669' }}
                                onClick={() => openSaleModal()}
                            >
                                <Plus size={15} />
                                <span>Record Sale</span>
                            </button>
                        </div>
                    </div>

                    {filteredSales.length === 0 ? (
                        <div className="module-empty-state">
                            <div className="empty-state-icon-circle">
                                <ShoppingBag size={24} color="#059669" />
                            </div>
                            <h3>No Sales Recorded Yet</h3>
                            <p>
                                Record project sales with quantity and unit price (₹) to automatically calculate total sale revenue and net profitability.
                            </p>
                            <button
                                type="button"
                                className="btn-primary-pill"
                                style={{ backgroundColor: '#059669', marginTop: '12px' }}
                                onClick={() => openSaleModal()}
                            >
                                <Plus size={15} />
                                <span>Record First Sale</span>
                            </button>
                        </div>
                    ) : (
                        <div className="finance-table-wrapper">
                            <table className="finance-data-table responsive-mobile-table">
                                <thead>
                                    <tr>
                                        <th>Product / Item Sold</th>
                                        <th>Sale Date</th>
                                        <th>Customer / Buyer</th>
                                        <th style={{ textAlign: 'right' }}>Quantity</th>
                                        <th style={{ textAlign: 'right' }}>Unit Price (₹)</th>
                                        <th style={{ textAlign: 'right' }}>Total Sale Amount (₹)</th>
                                        <th>Invoice / Notes</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSales.map((sale) => {
                                        const canEdit = canModifyEntry(sale);
                                        return (
                                            <tr key={sale._id}>
                                                <td data-label="Product Sold" className="td-primary">
                                                    {sale.productName}
                                                </td>
                                                <td data-label="Sale Date">
                                                    {formatDateIN(sale.saleDate)}
                                                </td>
                                                <td data-label="Customer / Buyer">
                                                    {sale.customerName || 'Walk-in / General'}
                                                </td>
                                                <td
                                                    data-label="Quantity"
                                                    style={{ textAlign: 'right', fontWeight: 600 }}
                                                >
                                                    {sale.quantity}
                                                </td>
                                                <td
                                                    data-label="Unit Price (₹)"
                                                    style={{ textAlign: 'right' }}
                                                >
                                                    {formatINR(sale.unitPrice)}
                                                </td>
                                                <td
                                                    data-label="Total Sale (₹)"
                                                    style={{
                                                        textAlign: 'right',
                                                        fontWeight: 700,
                                                        color: '#059669'
                                                    }}
                                                >
                                                    {formatINR(sale.totalAmount)}
                                                </td>
                                                <td data-label="Invoice / Notes" className="td-muted">
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {sale.description && <span>{sale.description}</span>}
                                                        {sale.attachmentUrl &&
                                                            renderAttachmentButton(
                                                                sale.productName,
                                                                sale.attachmentUrl,
                                                                sale.attachmentName
                                                            )}
                                                        {!sale.description && !sale.attachmentUrl && '—'}
                                                    </div>
                                                </td>
                                                <td data-label="Actions" style={{ textAlign: 'right' }}>
                                                    {canEdit && (
                                                        <div className="table-row-actions">
                                                            <button
                                                                type="button"
                                                                className="insight-icon-btn"
                                                                onClick={() => openSaleModal(sale)}
                                                                title="Edit Sale"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="insight-icon-btn delete"
                                                                onClick={() =>
                                                                    handleDeleteSale(sale)
                                                                }
                                                                title="Delete Sale"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {/* =========================================================
                TAB 4: COMPLETE FINANCIAL SUMMARY & RECONCILIATION
               ========================================================= */}
            {activeTab === 'summary' && (
                <section className="finance-tab-panel">
                    <div className="finance-section-toolbar">
                        <div>
                            <h2 className="finance-section-title">
                                Comprehensive Financial Statement
                            </h2>
                            <p className="finance-section-subtitle">
                                Clear separation of capital investments, operating expenses, sales revenue, and cash flow
                            </p>
                        </div>
                    </div>

                    <div className="financial-statement-grid">
                        <div className="financial-statement-card">
                            <h3 className="statement-card-heading">
                                1. Operating Profitability & Cash Flow
                            </h3>

                            <div className="statement-rows">
                                <div className="statement-row">
                                    <div>
                                        <span className="row-title">Total Sales Revenue (A)</span>
                                        <span className="row-formula">
                                            Sum of all completed sales ({sales.length} records)
                                        </span>
                                    </div>
                                    <span className="row-amount positive">
                                        {formatINR(totalSalesRevenue)}
                                    </span>
                                </div>

                                <div className="statement-row">
                                    <div>
                                        <span className="row-title">Total Operating Expenses (B)</span>
                                        <span className="row-formula">
                                            Sum of all recorded expenses ({expenses.length} records)
                                        </span>
                                    </div>
                                    <span className="row-amount warning">
                                        {formatINR(totalExpenses)}
                                    </span>
                                </div>

                                <div className="statement-row highlight-row">
                                    <div>
                                        <span className="row-title">
                                            Net Operating Profit / Loss (A − B)
                                        </span>
                                        <span className="row-formula">
                                            Sales Revenue minus Operating Expenses (Excludes capital investment)
                                        </span>
                                    </div>
                                    <span
                                        className={`row-amount ${
                                            hasSales && netProfitLoss >= 0 ? 'positive' : 'negative'
                                        }`}
                                    >
                                        {formatINR(netProfitLoss)}
                                    </span>
                                </div>

                                <div className="statement-row">
                                    <div>
                                        <span className="row-title">Total Capital Investment (C)</span>
                                        <span className="row-formula">
                                            Sum of all investment entries ({investments.length} records)
                                        </span>
                                    </div>
                                    <span className="row-amount indigo">
                                        {formatINR(totalInvestment)}
                                    </span>
                                </div>

                                <div className="statement-row">
                                    <div>
                                        <span className="row-title">
                                            Investment Recovery Position (A − C)
                                        </span>
                                        <span className="row-formula">
                                            Total Sales Revenue minus Total Investment
                                        </span>
                                    </div>
                                    <span
                                        className={`row-amount ${
                                            investmentRecovery >= 0 && totalInvestment > 0
                                                ? 'positive'
                                                : 'warning'
                                        }`}
                                    >
                                        {formatINR(investmentRecovery)}
                                    </span>
                                </div>

                                <div className="statement-row">
                                    <div>
                                        <span className="row-title">
                                            Remaining Unrecovered Investment
                                        </span>
                                        <span className="row-formula">
                                            Capital yet to be recovered from sales revenue ({investmentRecoveryPercent}% recovered)
                                        </span>
                                    </div>
                                    <span className="row-amount">
                                        {formatINR(remainingUnrecoveredInvestment)}
                                    </span>
                                </div>

                                <div className="statement-row highlight-row">
                                    <div>
                                        <span className="row-title">
                                            Net Cash Position (C + A − B)
                                        </span>
                                        <span className="row-formula">
                                            Total Investment + Total Sales Revenue − Total Expenses
                                        </span>
                                    </div>
                                    <span
                                        className={`row-amount ${
                                            cashPosition >= 0 ? 'indigo' : 'negative'
                                        }`}
                                    >
                                        {formatINR(cashPosition)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="financial-statement-card">
                            <h3 className="statement-card-heading">
                                2. Category-Wise Expense Summary
                            </h3>

                            {expenseByCategory.length === 0 ? (
                                <p style={{ fontSize: '13px', color: '#64748B', padding: '12px 0' }}>
                                    No expenses recorded yet.
                                </p>
                            ) : (
                                <div className="category-summary-list">
                                    {expenseByCategory.map((item, idx) => (
                                        <div key={item.category} className="cat-summary-item">
                                            <div className="cat-summary-top">
                                                <span className="cat-name">
                                                    <span
                                                        className="cat-dot"
                                                        style={{
                                                            backgroundColor:
                                                                CATEGORY_COLORS[
                                                                    idx % CATEGORY_COLORS.length
                                                                ]
                                                        }}
                                                    />
                                                    {item.category}
                                                </span>
                                                <span className="cat-val">
                                                    {formatINR(item.amount)} ({item.percentage}%)
                                                </span>
                                            </div>
                                            <div className="cat-bar-track">
                                                <div
                                                    className="cat-bar-fill"
                                                    style={{
                                                        width: `${item.percentage}%`,
                                                        backgroundColor:
                                                            CATEGORY_COLORS[
                                                                idx % CATEGORY_COLORS.length
                                                            ]
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="accounting-note-box">
                                <Info size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong>Financial Accounting Principle</strong>
                                    <p>
                                        Investments, operating expenses, and sales revenue are maintained as separate financial ledgers. Capital investments are not added to operating expenses when calculating Net Operating Profit/Loss to prevent double-counting project costs.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* =========================================================
                MODAL 1: ADD / EDIT INVESTMENT
               ========================================================= */}
            {modalType === 'investment' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: '550px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingRecord ? 'Edit Investment Entry' : 'Record Project Investment'}
                            </h3>
                            <button
                                type="button"
                                className="btn-more-options"
                                onClick={closeModal}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveInvestment}
                            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                        >
                            <div className="form-group">
                                <label className="form-label">Investment Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Initial Seed Capital / Phase 1 Shed Funding"
                                    value={invTitle}
                                    onChange={(e) => setInvTitle(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="responsive-form-two-col">
                                <div className="form-group">
                                    <label className="form-label">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="form-input"
                                        placeholder="e.g. 125000"
                                        value={invAmount}
                                        onChange={(e) => setInvAmount(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Investment Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={invDate}
                                        onChange={(e) => setInvDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Invested By *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Partner / Founder Name"
                                    value={invBy}
                                    onChange={(e) => setInvBy(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description / Notes</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="Add payment reference, bank transfer details, or notes..."
                                    value={invDesc}
                                    onChange={(e) => setInvDesc(e.target.value)}
                                />
                            </div>

                            <AttachmentField
                                label="Investment Receipt / Proof (Photo, PDF, or Link)"
                                attachmentUrl={invAttachmentUrl}
                                attachmentName={invAttachmentName}
                                onChange={({ url, name }) => {
                                    setInvAttachmentUrl(url);
                                    setInvAttachmentName(name);
                                }}
                            />

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary-pill"
                                    style={{ backgroundColor: '#4F46E5' }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingRecord
                                        ? 'Update Investment'
                                        : 'Save Investment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL 2: ADD / EDIT EXPENSE
               ========================================================= */}
            {modalType === 'expense' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: '560px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingRecord ? 'Edit Project Expense' : 'Record Project Expense'}
                            </h3>
                            <button
                                type="button"
                                className="btn-more-options"
                                onClick={closeModal}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveExpense}
                            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                        >
                            <div className="form-group">
                                <label className="form-label">Expense Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Starter Feed Batch #4 / Shed Wiring & Lighting"
                                    value={expTitle}
                                    onChange={(e) => setExpTitle(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="responsive-form-two-col">
                                <div className="form-group">
                                    <label className="form-label">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="form-input"
                                        placeholder="e.g. 18500"
                                        value={expAmount}
                                        onChange={(e) => setExpAmount(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <label className="form-label">Category *</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingCustomCat(!isAddingCustomCat)}
                                            style={{
                                                fontSize: '11px',
                                                color: '#2563EB',
                                                fontWeight: 600
                                            }}
                                        >
                                            {isAddingCustomCat
                                                ? 'Choose Predefined'
                                                : '+ Custom Category'}
                                        </button>
                                    </div>
                                    {isAddingCustomCat ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter custom category name..."
                                            value={customCategoryInput}
                                            onChange={(e) => setCustomCategoryInput(e.target.value)}
                                            required
                                        />
                                    ) : (
                                        <select
                                            className="form-select"
                                            value={expCategory}
                                            onChange={(e) => setExpCategory(e.target.value)}
                                        >
                                            {expenseCategories.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="responsive-form-two-col">
                                <div className="form-group">
                                    <label className="form-label">Expense Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={expDate}
                                        onChange={(e) => setExpDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Paid By *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Site Supervisor / Account"
                                        value={expPaidBy}
                                        onChange={(e) => setExpPaidBy(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description / Notes</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="Vendor details, bill number, or breakdown..."
                                    value={expDesc}
                                    onChange={(e) => setExpDesc(e.target.value)}
                                />
                            </div>

                            <AttachmentField
                                label="Expense Bill / Receipt Attachment (Photo, PDF, or Link)"
                                attachmentUrl={expAttachmentUrl}
                                attachmentName={expAttachmentName}
                                onChange={({ url, name }) => {
                                    setExpAttachmentUrl(url);
                                    setExpAttachmentName(name);
                                }}
                            />

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary-pill"
                                    style={{ backgroundColor: '#D97706' }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingRecord
                                        ? 'Update Expense'
                                        : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL 3: ADD / EDIT SALE
               ========================================================= */}
            {modalType === 'sale' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: '550px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingRecord ? 'Edit Sale Entry' : 'Record Project Sale'}
                            </h3>
                            <button
                                type="button"
                                className="btn-more-options"
                                onClick={closeModal}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveSale}
                            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                        >
                            <div className="form-group">
                                <label className="form-label">Product / Item Sold *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Batch #1 Harvest / Graded Output / Service Unit"
                                    value={saleProduct}
                                    onChange={(e) => setSaleProduct(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="responsive-form-two-col">
                                <div className="form-group">
                                    <label className="form-label">Quantity *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0.01"
                                        className="form-input"
                                        placeholder="e.g. 250"
                                        value={saleQuantity}
                                        onChange={(e) => setSaleQuantity(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Sale Price Per Unit (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-input"
                                        placeholder="e.g. 180"
                                        value={saleUnitPrice}
                                        onChange={(e) => setSaleUnitPrice(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auto-total-banner">
                                <div>
                                    <span className="auto-total-label">
                                        Calculated Total Sale Amount (Quantity × Unit Price)
                                    </span>
                                    <span className="auto-total-sub">
                                        {Number(saleQuantity) || 0} × {formatINR(saleUnitPrice || 0)}
                                    </span>
                                </div>
                                <span className="auto-total-value">
                                    {formatINR(computedSaleTotal)}
                                </span>
                            </div>

                            <div className="responsive-form-two-col">
                                <div className="form-group">
                                    <label className="form-label">Sale Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={saleDate}
                                        onChange={(e) => setSaleDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Customer / Buyer Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Metro Traders / Wholesale Buyer"
                                        value={saleCustomer}
                                        onChange={(e) => setSaleCustomer(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description / Notes</label>
                                <textarea
                                    className="form-textarea"
                                    rows={2}
                                    placeholder="Invoice number, payment mode, or delivery remarks..."
                                    value={saleDesc}
                                    onChange={(e) => setSaleDesc(e.target.value)}
                                />
                            </div>

                            <AttachmentField
                                label="Sale Invoice / Receipt Attachment (Optional)"
                                attachmentUrl={saleAttachmentUrl}
                                attachmentName={saleAttachmentName}
                                onChange={({ url, name }) => {
                                    setSaleAttachmentUrl(url);
                                    setSaleAttachmentName(name);
                                }}
                            />

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary-pill"
                                    style={{ backgroundColor: '#059669' }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingRecord
                                        ? 'Update Sale'
                                        : 'Record Sale'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================
                MODAL 4: RECEIPT / ATTACHMENT PREVIEW
               ========================================================= */}
            <AttachmentPreviewModal
                attachment={previewAttachment}
                onClose={() => setPreviewAttachment(null)}
            />
        </div>
    );
}
