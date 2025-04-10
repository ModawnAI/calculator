import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
// Import Bar and Pie charts
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement // Added ArcElement for Pie
} from 'chart.js';
import {
    Container, Grid, Card, CardContent, Typography, TextField, FormControl, InputLabel, Select, MenuItem,
    Slider, Box, TableContainer, Table, TableBody, TableRow, TableCell, Paper, List, ListItem, ListItemIcon, ListItemText, Alert, CssBaseline, ThemeProvider, createTheme, Divider // Added Divider
} from '@mui/material';
// Import existing icons...
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SavingsIcon from '@mui/icons-material/Savings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PercentIcon from '@mui/icons-material/Percent'; // Added for rates
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline'; // Added for pie chart section
import { motion } from 'framer-motion'; // Import motion
// --- Import Modular Results Components & Helpers ---
import { KeyMetrics, DetailedTable, BarChartCard, PieChartCard } from './ResultsDisplay';
import { formatCurrency, formatPercent } from './utils'; // Import helpers

// Register Chart.js components (including ArcElement)
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement); // Re-enable registration

// --- Updated Tax Brackets from Image (using Progressive Deduction) ---
// Structure: { limit: upper limit of bracket, rate: applicable rate, deduction: progressive deduction amount }
const TAX_BRACKETS = [
    { limit: 14000000, rate: 0.06, deduction: 0 },
    { limit: 50000000, rate: 0.15, deduction: 1260000 },
    { limit: 88000000, rate: 0.24, deduction: 5760000 },
    { limit: 150000000, rate: 0.35, deduction: 15440000 },
    { limit: 300000000, rate: 0.38, deduction: 19940000 },
    { limit: 500000000, rate: 0.40, deduction: 25940000 },
    { limit: 1000000000, rate: 0.42, deduction: 35940000 },
    { limit: Infinity, rate: 0.45, deduction: 65940000 },
];

// --- Tax Calculation Logic ---
// Updated estimateTax function using progressive deduction
const estimateTax = (taxBase) => {
    if (taxBase <= 0) return 0;

    for (const bracket of TAX_BRACKETS) {
        if (taxBase <= bracket.limit) {
            const calculatedTax = (taxBase * bracket.rate) - bracket.deduction;
            return Math.round(calculatedTax);
        }
    }
    // Should not be reached if Infinity is the last limit, but as a fallback:
    const lastBracket = TAX_BRACKETS[TAX_BRACKETS.length - 1];
    const calculatedTax = (taxBase * lastBracket.rate) - lastBracket.deduction;
    return Math.round(calculatedTax);
};

// Update getMarginalRate to use the new bracket limits/rates
const getMarginalRate = (taxBase) => {
    if (taxBase <= 0) return 0;
    for (const bracket of TAX_BRACKETS) {
        if (taxBase <= bracket.limit) {
            return bracket.rate;
        }
    }
    // Fallback for the highest bracket
    return TAX_BRACKETS[TAX_BRACKETS.length - 1].rate;
};

const calculateVentureDeduction = (investmentAmount, investmentType, comprehensiveIncome) => { /* ... same as before, returns { effectiveDeduction, limitApplied, breakdown } ... */
    let calculatedDeduction = 0; let tier1Ded = 0, tier2Ded = 0, tier3Ded = 0;
    if (investmentType === 'direct_angel_crowd') {
        const tier1Amount = Math.min(investmentAmount, 30000000); const tier2Amount = Math.max(0, Math.min(investmentAmount, 50000000) - 30000000); const tier3Amount = Math.max(0, investmentAmount - 50000000);
        tier1Ded = tier1Amount * 1.0; tier2Ded = tier2Amount * 0.7; tier3Ded = tier3Amount * 0.3; calculatedDeduction = tier1Ded + tier2Ded + tier3Ded;
    } else if (investmentType === 'vc_fund') { calculatedDeduction = investmentAmount * 0.10; tier1Ded = calculatedDeduction; }
    const incomeLimit = comprehensiveIncome * 0.5; const effectiveDeduction = Math.min(calculatedDeduction, incomeLimit);
    const limitAppliedMakingZero = calculatedDeduction > 0 && effectiveDeduction === 0 && incomeLimit === 0; const limitApplied = effectiveDeduction < calculatedDeduction || limitAppliedMakingZero;
    return { effectiveDeduction: Math.round(effectiveDeduction), limitApplied: limitApplied, breakdown: { tier1: Math.round(tier1Ded), tier2: Math.round(tier2Ded), tier3: Math.round(tier3Ded), totalCalculated: Math.round(calculatedDeduction) } };
};
// --- End Tax Logic ---

// --- Theme ---
const theme = createTheme({
    palette: {
        primary: { main: '#0056b3' },
        secondary: { main: '#28a745' },
        background: { default: '#f4f7f6', paper: '#ffffff' },
        error: { main: '#d32f2f', light: '#ffcdd2' },
        success: { main: '#2e7d32', light: '#c8e6c9' },
        info: { main: '#0288d1', light: '#bbdefb'}
    },
    typography: {
        fontFamily: [
            'Pretendard', // Prioritize Pretendard
            '-apple-system', // System fonts as fallbacks
            'BlinkMacSystemFont',
            'system-ui',
            'Roboto',
            '"Noto Sans KR"', // Keep Noto Sans KR as a later fallback
            '"Helvetica Neue"',
            'Arial',
            'sans-serif'
        ].join(','),
        h4: { // Main Title
            fontWeight: 600,
            fontSize: '2.0rem', // Mobile base
            '@media (min-width:600px)': { fontSize: '2.4rem' }, // Tablet
            '@media (min-width:900px)': { fontSize: '2.8rem' }, // Desktop
        },
        h6: { // Card Titles / Key Metric Values
            fontWeight: 600,
            fontSize: '1.2rem',
            '@media (min-width:600px)': { fontSize: '1.3rem' },
            '@media (min-width:900px)': { fontSize: '1.4rem' },
        },
        subtitle1: { // Section Subtitles / Larger labels
            fontWeight: 600,
            fontSize: '1.0rem',
            '@media (min-width:600px)': { fontSize: '1.1rem' },
        },
        body1: { // Standard text, Table cells
            fontSize: '0.875rem',
            '@media (min-width:600px)': { fontSize: '0.95rem' },
        },
        body2: { // Secondary text / Captions / Key Metric Labels
            fontSize: '0.8rem',
            '@media (min-width:600px)': { fontSize: '0.875rem' },
        },
        caption: { // Smallest text
            fontSize: '0.7rem',
            '@media (min-width:600px)': { fontSize: '0.75rem' },
        }
    },
});

// --- Constants ---
const MAX_INCOME = 500000000;
const MAX_INVESTMENT = 200000000;

function App() {
    const [income, setIncome] = useState(100000000);
    const [investment, setInvestment] = useState(50000000);
    const [investmentType, setInvestmentType] = useState('direct_angel_crowd');
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    // --- Calculation Logic ---
    const performCalculation = useCallback((currentIncome, currentInvestment, currentType) => {
        setError('');
        if (isNaN(currentIncome) || isNaN(currentInvestment) || currentIncome < 0 || currentInvestment < 0) { setResults(null); return; }
        if (currentIncome === 0) {
            setError(currentInvestment > 0 ? '소득이 0원이면 공제 혜택을 받을 수 없습니다.' : '');
            setResults(null); return;
        }

        const { effectiveDeduction, limitApplied, breakdown } = calculateVentureDeduction(currentInvestment, currentType, currentIncome);
        const taxBaseBefore = currentIncome;
        const estimatedTaxBefore = estimateTax(taxBaseBefore);
        const taxBaseAfter = Math.max(0, currentIncome - effectiveDeduction);
        const estimatedTaxAfter = estimateTax(taxBaseAfter);
        const taxSavings = estimatedTaxBefore - estimatedTaxAfter;

        // Additional Details
        const marginalRate = getMarginalRate(taxBaseBefore);
        const effectiveRateBefore = currentIncome > 0 ? estimatedTaxBefore / currentIncome : 0;
        const effectiveRateAfter = currentIncome > 0 ? estimatedTaxAfter / currentIncome : 0;
        const savingsPerInvestment = currentInvestment > 0 ? taxSavings / currentInvestment : 0; // Simplified, could also use effectiveDeduction

        setResults({
            income: currentIncome, investment: currentInvestment, investmentType: currentType,
            effectiveDeduction, limitApplied, breakdown,
            estimatedTaxBefore, estimatedTaxAfter, taxSavings,
            // New details
            marginalRate, effectiveRateBefore, effectiveRateAfter, savingsPerInvestment
        });
    }, []);

    const debouncedCalculate = useMemo(() => debounce(performCalculation, 500), [performCalculation]);

    useEffect(() => {
        debouncedCalculate(income, investment, investmentType);
        return () => { debouncedCalculate.cancel(); };
    }, [income, investment, investmentType, debouncedCalculate]);

    // --- Event Handlers ---
    const handleNumericInputChange = (setter) => (event) => {
        const rawValue = event.target.value;
        // Remove KRW symbol and commas, then parse
        const numericString = rawValue.replace(/[^0-9]/g, '');
        const numberValue = Number(numericString) || 0;
        setter(Math.max(0, numberValue));
    };

    const handleSliderChange = (setter) => (event, newValue) => {
        setter(Math.max(0, Number(newValue) || 0));
    };

    const handleIncomeChange = handleNumericInputChange(setIncome);
    const handleIncomeSliderChange = handleSliderChange(setIncome);
    const handleInvestmentChange = handleNumericInputChange(setInvestment);
    const handleInvestmentSliderChange = handleSliderChange(setInvestment);

    const handleInvestmentTypeChange = (event) => { setInvestmentType(event.target.value); };

    // --- Chart Data ---
    const barChartData = useMemo(() => { /* ... same as before ... */
         if (!results || results.taxSavings === null) { return { labels: [], datasets: [] }; }
        return {
            labels: ['세금 비교 (Tax Comparison)'],
            datasets: [
                { label: '공제 전', data: [results.estimatedTaxBefore], backgroundColor: theme.palette.error.light, barPercentage: 0.6, categoryPercentage: 0.6 },
                { label: '공제 후', data: [results.estimatedTaxAfter], backgroundColor: theme.palette.success.light, barPercentage: 0.6, categoryPercentage: 0.6 },
                { label: '절감액', data: [results.taxSavings > 0 ? results.taxSavings : 0], backgroundColor: theme.palette.primary.light, barPercentage: 0.6, categoryPercentage: 0.6 },
            ],
        };
    }, [results]);

    const barChartOptions = useMemo(() => ({ /* ... same as before ... */
        responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', }, title: { display: true, text: '예상 소득세 비교', font: { size: 16 }, padding: { top: 10, bottom: 20 } }, tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}` } } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => formatCurrency(value, '') }, title: { display: true, text: '금액 (KRW)' } }, x: { ticks: { display: false } } }, animation: { duration: 500 }
    }), []);

    // New Pie Chart Data for Deduction Breakdown
    const pieChartData = useMemo(() => {
        if (!results || results.investmentType !== 'direct_angel_crowd' || results.breakdown.totalCalculated <= 0) {
            return null; // Only show for relevant type and if deduction exists
        }
        const { tier1, tier2, tier3 } = results.breakdown;
        const labels = [];
        const data = [];
        if (tier1 > 0) { labels.push('Tier 1 (≤30M @ 100%)'); data.push(tier1); }
        if (tier2 > 0) { labels.push('Tier 2 (30-50M @ 70%)'); data.push(tier2); }
        if (tier3 > 0) { labels.push('Tier 3 (>50M @ 30%)'); data.push(tier3); }

        if (data.length === 0) return null; // Handle case where breakdown parts are zero

        return {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    theme.palette.primary.light,
                    theme.palette.secondary.light,
                    theme.palette.info.light, // Use info color palette
                ],
                borderColor: [
                    theme.palette.primary.main,
                    theme.palette.secondary.main,
                    theme.palette.info.main,
                ],
                borderWidth: 1,
            }],
        };
    }, [results]);

    const pieChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', },
            title: { display: true, text: '계산된 공제액 구성', font: { size: 16 }, padding: { top: 10, bottom: 20 } },
            tooltip: { callbacks: { label: (context) => `${context.label}: ${formatCurrency(context.parsed)} (${(context.parsed / results?.breakdown.totalCalculated * 100).toFixed(1)}%)` } }
        },
         animation: { duration: 500 }
    }), [results?.breakdown.totalCalculated]); // Dependency needed if tooltip calculation uses it

    // --- JSX ---
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
                    <CalculateIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.2em' }} /> 
                    리텍파이낸스 절세 계산기
                </Typography>

                <Grid container spacing={4}>
                    {/* --- Input Section --- */}
                    <Grid item xs={12}> {/* Full width */}
                        <Card elevation={3} sx={{ height: '100%' }}>
                            <CardContent>
                                {/* ... Input fields and sliders same as before ... */}
                                <Typography variant="h6" gutterBottom>투자 정보 입력</Typography>
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        label="연간 종합소득금액"
                                        type="text"
                                        fullWidth
                                        value={formatCurrency(income, '')}
                                        onChange={handleIncomeChange}
                                        variant="outlined"
                                        InputProps={{ inputMode: 'numeric' }}
                                        sx={{ mb: 1 }}
                                    />
                                    <Slider value={typeof income === 'number' ? income : 0} onChange={handleIncomeSliderChange} aria-labelledby="income-slider" min={0} max={MAX_INCOME} step={1000000} valueLabelFormat={(value) => `${(value / 100000000).toFixed(1)}억`} valueLabelDisplay="auto" />
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        label="벤처 투자 금액"
                                        type="text"
                                        fullWidth
                                        value={formatCurrency(investment, '')}
                                        onChange={handleInvestmentChange}
                                        variant="outlined"
                                        InputProps={{ inputMode: 'numeric' }}
                                        sx={{ mb: 1 }}
                                    />
                                    <Slider value={typeof investment === 'number' ? investment : 0} onChange={handleInvestmentSliderChange} aria-labelledby="investment-slider" min={0} max={MAX_INVESTMENT} step={1000000} valueLabelFormat={(value) => formatCurrency(value)} valueLabelDisplay="auto" color="secondary" />
                                </Box>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="investment-type-label">투자 방식</InputLabel>
                                    <Select labelId="investment-type-label" value={investmentType} onChange={handleInvestmentTypeChange} label="투자 방식">
                                        <MenuItem value="direct_angel_crowd">직접/엔젤/크라우드펀딩</MenuItem>
                                        <MenuItem value="vc_fund">VC 펀드 출자</MenuItem>
                                    </Select>
                                </FormControl>
                                {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* --- Results Section (Modular) --- */}
                    {/* Placeholder for initial state message */} 
                    {!results && 
                        <Grid item xs={12}>
                            <Typography color="textSecondary" sx={{ textAlign: 'center', mt: 4, mb: 4 }}>투자 정보를 입력하면 결과가 표시됩니다.</Typography>
                        </Grid>
                    }

                    {/* Key Metrics Module */}
                    {results && (
                        <Grid item xs={12}>
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                               <KeyMetrics results={results} theme={theme} />
                           </motion.div>
                        </Grid>
                    )}

                     {/* Detailed Table Module */}
                     {results && (
                         <Grid item xs={12} md={6}> {/* Half width on medium+ */}
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                 <DetailedTable results={results} theme={theme} />
                             </motion.div>
                         </Grid>
                     )}

                    {/* Charts Modules Area */}
                     {results && (
                         <Grid item xs={12} md={6}> {/* Half width on medium+ */}
                             <Grid container spacing={3}>
                                 <Grid item xs={12}>
                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                                         <BarChartCard
                                             results={results}
                                             barChartOptions={barChartOptions}
                                             barChartData={barChartData}
                                         />
                                     </motion.div>
                                 </Grid>
                                 {pieChartData && (
                                     <Grid item xs={12}>
                                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                                             <PieChartCard
                                                 pieChartOptions={pieChartOptions}
                                                 pieChartData={pieChartData}
                                             />
                                         </motion.div>
                                     </Grid>
                                 )}
                             </Grid>
                         </Grid>
                     )}

                    {/* --- Notes Section --- */}
                    <Grid item xs={10}>
                        {/* ... Notes Card same as before ... */}
                        <Card elevation={2}>
                             <CardContent>
                                <Typography variant="h6" gutterBottom><InfoIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'info.main' }} /> 중요 참고사항</Typography>
                                <List dense sx={{ pt: 0 }}>
                                     <ListItem sx={{ py: 0.5 }}>
                                        <ListItemIcon><WarningAmberIcon color="warning" /></ListItemIcon>
                                        {/* Removed secondary prop */}
                                        <ListItemText primary="세금 계산은 추정치이며, 개인별 다른 소득/세액 공제는 반영되지 않았습니다." />
                                     </ListItem>
                                     <ListItem sx={{ py: 0.5 }}>
                                        <ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon>
                                        {/* Removed secondary prop */}
                                        <ListItemText primary="소득공제 혜택 유지를 위해 투자 후 최소 3년 이상 지분 보유가 필수입니다." />
                                     </ListItem>
                                     <ListItem sx={{ py: 0.5 }}>
                                        <ListItemIcon><AccountBalanceIcon color="action" /></ListItemIcon>
                                        {/* Removed secondary prop */}
                                        <ListItemText primary="공제 혜택은 납부할 소득세가 있는 경우에만 절세 효과가 발생합니다." />
                                     </ListItem>
                                     <ListItem sx={{ py: 0.5 }}>
                                        <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                                        {/* Removed secondary prop */}
                                        <ListItemText primary="현행 규정상 2025년 12월 31일까지 투자분에 적용됩니다 (연장 가능성 있음)." />
                                     </ListItem>
                                     <ListItem sx={{ py: 0.5 }}>
                                        <ListItemIcon><WarningAmberIcon color="warning" /></ListItemIcon>
                                        {/* Removed secondary prop */}
                                        <ListItemText primary="투자는 원금 손실 위험이 있으므로 세금 혜택 외 투자 자체의 가치를 신중히 고려하세요." />
                                     </ListItem>
                                </List>
                             </CardContent>
                         </Card>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default App;
// Trigger reload