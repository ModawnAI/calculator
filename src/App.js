// src/App.js
// ... (imports, logic, constants, theme, handlers etc. remain the same as previous version) ...
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Container, Grid, Card, CardContent, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Slider, Box, Paper, List, ListItem, ListItemIcon, ListItemText, Alert, CssBaseline, ThemeProvider, createTheme, Divider, Stack, Tabs, Tab } from '@mui/material';
// icons...
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SavingsIcon from '@mui/icons-material/Savings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PercentIcon from '@mui/icons-material/Percent';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CompareIcon from '@mui/icons-material/Compare';
import ArticleIcon from '@mui/icons-material/Article';
import { motion } from 'framer-motion';

import { KeyMetrics, DetailedTable, BarChartCard, PieChartCard, RitemVsConventionalTable, TaxAdvantageComparison, VentureDeductionInfo } from './ResultsDisplay';
import { formatCurrency, formatPercent } from './utils';
import { AnimatedNumber } from './AnimatedNumber';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
const TAX_BRACKETS = [ { limit: 14000000, rate: 0.06, deduction: 0 }, { limit: 50000000, rate: 0.15, deduction: 1260000 }, { limit: 88000000, rate: 0.24, deduction: 5760000 }, { limit: 150000000, rate: 0.35, deduction: 15440000 }, { limit: 300000000, rate: 0.38, deduction: 19940000 }, { limit: 500000000, rate: 0.40, deduction: 25940000 }, { limit: 1000000000, rate: 0.42, deduction: 35940000 }, { limit: Infinity, rate: 0.45, deduction: 65940000 }, ];
const estimateTax = (taxBase) => { if (taxBase <= 0) return 0; for (const bracket of TAX_BRACKETS) { if (taxBase <= bracket.limit) { const calculatedTax = (taxBase * bracket.rate) - bracket.deduction; return Math.max(0, Math.round(calculatedTax)); } } const lastBracket = TAX_BRACKETS[TAX_BRACKETS.length - 1]; const calculatedTax = (taxBase * lastBracket.rate) - lastBracket.deduction; return Math.max(0, Math.round(calculatedTax)); };
const getMarginalRate = (taxBase) => { if (taxBase <= 0) return 0; for (const bracket of TAX_BRACKETS) { if (taxBase <= bracket.limit) { return bracket.rate; } } return TAX_BRACKETS[TAX_BRACKETS.length - 1].rate; };
const calculateVentureDeduction = (investmentAmount, investmentType, comprehensiveIncome) => { let calculatedDeduction = 0; let tier1Ded = 0, tier2Ded = 0, tier3Ded = 0; if (investmentType === 'direct_angel_crowd') { const tier1Amount = Math.min(investmentAmount, 30000000); const tier2Amount = Math.max(0, Math.min(investmentAmount, 50000000) - 30000000); const tier3Amount = Math.max(0, investmentAmount - 50000000); tier1Ded = tier1Amount * 1.0; tier2Ded = tier2Amount * 0.7; tier3Ded = tier3Amount * 0.3; calculatedDeduction = tier1Ded + tier2Ded + tier3Ded; } else if (investmentType === 'vc_fund') { calculatedDeduction = investmentAmount * 0.10; tier1Ded = calculatedDeduction; } const incomeLimit = comprehensiveIncome * 0.5; const effectiveDeduction = Math.min(calculatedDeduction, incomeLimit); const limitAppliedMakingZero = calculatedDeduction > 0 && effectiveDeduction === 0 && incomeLimit === 0; const limitApplied = effectiveDeduction < calculatedDeduction || limitAppliedMakingZero; return { effectiveDeduction: Math.round(effectiveDeduction), limitApplied: limitApplied, breakdown: { tier1: Math.round(tier1Ded), tier2: Math.round(tier2Ded), tier3: Math.round(tier3Ded), totalCalculated: Math.round(calculatedDeduction) } }; };
const theme = createTheme({ palette: { primary: { main: '#232669', light: '#585eaa' }, secondary: { main: '#0583F2', light: '#66b5f5' }, background: { default: '#f4f7f6', paper: '#ffffff' }, error: { main: '#d32f2f', light: '#ffcdd2' }, success: { main: '#2e7d32' }, info: { main: '#0583F2' }, warning: { main: '#ffa000', lighter: '#fff8e1', dark: '#c77700' }, text: { primary: '#212121', secondary: '#666D88' } }, typography: { fontFamily: [ 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', '"Noto Sans KR"', '"Helvetica Neue"', 'Arial', 'sans-serif' ].join(','), h4:{fontWeight:600,fontSize:'2.0rem','@media (min-width:600px)':{fontSize:'2.4rem'},'@media (min-width:900px)':{fontSize:'2.8rem'},}, h6:{fontWeight:600,fontSize:'1.2rem','@media (min-width:600px)':{fontSize:'1.3rem'},'@media (min-width:900px)':{fontSize:'1.4rem'},}, subtitle1:{fontWeight:600,fontSize:'1.0rem','@media (min-width:600px)':{fontSize:'1.1rem'},}, body1:{fontSize:'0.875rem','@media (min-width:600px)':{fontSize:'0.95rem'},}, body2:{fontSize:'0.8rem','@media (min-width:600px)':{fontSize:'0.875rem'},}, caption:{fontSize:'0.7rem','@media (min-width:600px)':{fontSize:'0.75rem'},} }, });
const MAX_INCOME = 500000000;
const MAX_INVESTMENT = 200000000;
const BANK_INTEREST_RATE = 0.038;
const EXAMPLE_INVESTMENT_AMOUNT = 50000000;
const EXAMPLE_INCOME_1 = 100000000;
const EXAMPLE_INCOME_2 = 200000000;
const calcSavingsForIncome = (inc, inv, type) => { const { effectiveDeduction: ed } = calculateVentureDeduction(inv, type, inc); const tbBefore = inc; const etBefore = estimateTax(tbBefore); const tbAfter = Math.max(0, tbBefore - ed); const etAfter = estimateTax(tbAfter); return Math.max(0, etBefore - etAfter); };


function App() {
    const [income, setIncome] = useState(100000000);
    const [investment, setInvestment] = useState(50000000);
    const [investmentType, setInvestmentType] = useState('direct_angel_crowd');
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [selectedInfoTab, setSelectedInfoTab] = useState(0);

    const performCalculation = useCallback((currentIncome, currentInvestment, currentType) => { /* ... calculation logic ... */ setError(''); if (isNaN(currentIncome) || isNaN(currentInvestment) || currentIncome < 0 || currentInvestment < 0) { setResults(null); return; } if (currentIncome === 0 && currentInvestment > 0) { setError('소득이 0원이면 공제 혜택을 받을 수 없습니다.'); setResults(null); return; } if (currentIncome === 0 && currentInvestment === 0) { setResults(null); return; } const { effectiveDeduction, limitApplied, breakdown } = calculateVentureDeduction(currentInvestment, currentType, currentIncome); const taxBaseBefore = currentIncome; const estimatedTaxBefore = estimateTax(taxBaseBefore); const taxBaseAfter = Math.max(0, taxBaseBefore - effectiveDeduction); const estimatedTaxAfter = estimateTax(taxBaseAfter); const taxSavings = Math.max(0, estimatedTaxBefore - estimatedTaxAfter); const marginalRate = getMarginalRate(taxBaseBefore); const effectiveRateBefore = taxBaseBefore > 0 ? estimatedTaxBefore / taxBaseBefore : 0; const effectiveRateAfter = taxBaseBefore > 0 ? estimatedTaxAfter / taxBaseBefore : 0; const savingsPerInvestment = effectiveDeduction > 0 ? taxSavings / effectiveDeduction : 0; const savingsRatioOfInvestment = currentInvestment > 0 ? taxSavings / currentInvestment : 0; const savingsFor100M = calcSavingsForIncome(EXAMPLE_INCOME_1, EXAMPLE_INVESTMENT_AMOUNT, currentType); const savingsFor200M = calcSavingsForIncome(EXAMPLE_INCOME_2, EXAMPLE_INVESTMENT_AMOUNT, currentType); setResults({ income: currentIncome, investment: currentInvestment, investmentType: currentType, effectiveDeduction, limitApplied, breakdown, estimatedTaxBefore, estimatedTaxAfter, taxSavings, marginalRate, effectiveRateBefore, effectiveRateAfter, savingsPerInvestment, savingsRatioOfInvestment, exampleSavings: { income100M: savingsFor100M, income200M: savingsFor200M } }); }, []);
    useEffect(() => { performCalculation(income, investment, investmentType); }, [income, investment, investmentType, performCalculation]);

    const handleNumericInputChange = (setter) => (event) => { /* ... */ const rawValue = event.target.value; const numericString = rawValue.replace(/[^0-9]/g, ''); const numberValue = Number(numericString) || 0; setter(Math.max(0, numberValue)); };
    const handleSliderChange = (setter) => (event, newValue) => { setter(Math.max(0, Number(newValue) || 0)); };
    const handleIncomeChange = handleNumericInputChange(setIncome);
    const handleIncomeSliderChange = handleSliderChange(setIncome);
    const handleInvestmentChange = handleNumericInputChange(setInvestment);
    const handleInvestmentSliderChange = handleSliderChange(setInvestment);
    const handleInvestmentTypeChange = (event) => { setInvestmentType(event.target.value); };
    const handleInfoTabChange = (event, newValue) => { setSelectedInfoTab(newValue); };

    // --- Chart Data Generation (hooks remain the same) ---
    const taxCompareBarData = useMemo(() => { /* ... */ if (!results || results.taxSavings === null) { return { labels: [], datasets: [] }; } const beforeTax = Math.max(0, results.estimatedTaxBefore); const afterTax = Math.max(0, results.estimatedTaxAfter); const savings = Math.max(0, results.taxSavings); if (beforeTax === 0 && afterTax === 0 && savings === 0 && results.income > 0) { return { labels: ['세금 비교'], datasets: [] }; } return { labels: ['세금 비교'], datasets: [ { label: '공제 전 세금', data: [beforeTax], backgroundColor: theme.palette.text.secondary, barPercentage: 0.6, categoryPercentage: 0.6 }, { label: '공제 후 세금', data: [afterTax], backgroundColor: theme.palette.secondary.main, barPercentage: 0.6, categoryPercentage: 0.6 }, { label: '예상 절감액', data: [savings], backgroundColor: theme.palette.primary.main, barPercentage: 0.6, categoryPercentage: 0.6 }, ], }; }, [results, theme]);
    const commonBarOptions = useMemo(() => ({ responsive: true, plugins: { legend: { position: 'bottom', }, title: { display: false }, tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}` } } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => formatCurrency(value, '') }, title: { display: false } }, x: { ticks: { display: false } } }, animation: { duration: 300 } }), []);
    const deductionPieData = useMemo(() => { /* ... */ if (!results || results.investmentType !== 'direct_angel_crowd' || results.breakdown.totalCalculated <= 0) { return null; } const { tier1, tier2, tier3 } = results.breakdown; const labels = []; const data = []; if (tier1 > 0) { labels.push('Tier 1 (≤3천만 @ 100%)'); data.push(tier1); } if (tier2 > 0) { labels.push('Tier 2 (3-5천만 @ 70%)'); data.push(tier2); } if (tier3 > 0) { labels.push('Tier 3 (>5천만 @ 30%)'); data.push(tier3); } if (data.length === 0) return null; return { labels: labels, datasets: [{ data: data, backgroundColor: [ theme.palette.primary.light, theme.palette.secondary.light, theme.palette.grey[400], ], borderColor: theme.palette.background.paper, borderWidth: 1, }], }; }, [results, theme]);
    const deductionPieOptions = useMemo(() => ({ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }, title: { display: false }, tooltip: { callbacks: { label: (context) => { const total = context.dataset.data.reduce((a, b) => a + b, 0); const percentage = total > 0 ? (context.parsed / total * 100).toFixed(1) : 0; return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`; } } } }, animation: { duration: 300 } }), []);
    const savingsVsBankData = useMemo(() => { /* ... */ if (!results || results.investment <= 0) return null; const estimatedBankInterest = results.investment * BANK_INTEREST_RATE * 3; return { labels: [`벤처투자 절세액`, '일반 예금 이자 (3년 참고)'], datasets: [{ label: '3년간 예상 혜택 비교', data: [ results.taxSavings, estimatedBankInterest ], backgroundColor: [ theme.palette.primary.main, theme.palette.grey[500] ], barPercentage: 0.5, categoryPercentage: 0.7 }] }; }, [results, theme]);
    const savingsVsBankOptions = useMemo(() => ({ responsive: true, indexAxis: 'y', plugins: { legend: { display: false }, title: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label === '일반 예금 이자 (3년 참고)' ? '예상 이자' : '예상 절세액'}: ${formatCurrency(context.parsed.x)}` } } }, scales: { x: { beginAtZero: true, ticks: { callback: (value) => formatCurrency(value, '') } }, y: { ticks: { font: { size: 10 } } } }, animation: { duration: 300 } }), []);
    const savingsByIncomeData = useMemo(() => { /* ... */ if (!results?.exampleSavings) return null; const userSavingsForExampleInvestment = calcSavingsForIncome(results.income, EXAMPLE_INVESTMENT_AMOUNT, results.investmentType); return { labels: [ `나의 소득`, `소득 1억`, `소득 2억` ], datasets: [{ label: `투자금 ${formatCurrency(EXAMPLE_INVESTMENT_AMOUNT, '')} 기준 예상 절세액`, data: [ userSavingsForExampleInvestment, results.exampleSavings.income100M, results.exampleSavings.income200M ], backgroundColor: [ theme.palette.primary.main, theme.palette.secondary.light, theme.palette.secondary.main ], barPercentage: 0.5, categoryPercentage: 0.7 }] }; }, [results, theme]);
    const savingsByIncomeOptions = useMemo(() => ({ responsive: true, plugins: { legend: { display: false }, title: { display: false }, tooltip: { callbacks: { label: (context) => `예상 절세액: ${formatCurrency(context.parsed.y)}` } } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => formatCurrency(value, '') } }, x: { ticks: { font: { size: 10 } } } }, animation: { duration: 300 } }), []);

    // --- JSX Structure ---
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {/* Title */}
                <Typography variant="h4" component="h1" gutterBottom align="center" color="primary.main" sx={{ mb: 4 }}>
                    <CalculateIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.2em', color: 'secondary.main' }} />
                    벤처투자 소득공제 절세 효과 계산기
                </Typography>

                {/* Main Grid Container */}
                <Grid container spacing={4} alignItems="stretch">

                    {/* Input Section */}
                    <Grid item xs={12} md={4}>
                        {/* Input Card remains the same */}
                         <Card elevation={3} sx={{ height: '100%' }}>
                             <CardContent> <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}> <ShowChartIcon sx={{ mr: 1 }} /> 투자 정보 입력 </Typography> <Box sx={{ mb: 3 }}> <TextField label="연간 종합소득금액" type="text" fullWidth value={formatCurrency(income, '₩')} onChange={handleIncomeChange} variant="outlined" InputProps={{ inputMode: 'numeric' }} sx={{ mb: 1 }} /> <Slider value={typeof income === 'number' ? income : 0} onChange={handleIncomeSliderChange} aria-labelledby="income-slider" min={0} max={MAX_INCOME} step={1000000} valueLabelFormat={(value) => `${(value / 100000000).toFixed(1)}억`} valueLabelDisplay="auto" /> </Box> <Box sx={{ mb: 3 }}> <TextField label="벤처 투자 금액" type="text" fullWidth value={formatCurrency(investment, '₩')} onChange={handleInvestmentChange} variant="outlined" InputProps={{ inputMode: 'numeric' }} sx={{ mb: 1 }} /> <Slider value={typeof investment === 'number' ? investment : 0} onChange={handleInvestmentSliderChange} aria-labelledby="investment-slider" min={0} max={MAX_INVESTMENT} step={1000000} valueLabelFormat={(value) => formatCurrency(value, '₩')} valueLabelDisplay="auto" color="secondary" /> </Box> <FormControl fullWidth variant="outlined"> <InputLabel id="investment-type-label">투자 방식</InputLabel> <Select labelId="investment-type-label" value={investmentType} onChange={handleInvestmentTypeChange} label="투자 방식"> <MenuItem value="direct_angel_crowd">개인투자조합/직접/엔젤/크라우드펀딩</MenuItem> <MenuItem value="vc_fund">VC 펀드 (벤처투자조합 등)</MenuItem> </Select> </FormControl> {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>} </CardContent>
                         </Card>
                    </Grid>

                    {/* Results Section (Right Column) */}
                    <Grid item xs={12} md={8}>
                         {/* Placeholder */}
                         {!results && !error && <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: 'transparent', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography color="textSecondary">투자 정보를 입력하면 예상 절세 효과를 확인할 수 있습니다.</Typography></Paper> }

                         {/* Results Content */}
                         {results && (
                            <Stack spacing={3}> {/* Use Stack for vertical arrangement of results sections */}
                                {/* Key Metrics */}
                                <KeyMetrics results={results} theme={theme} />

                                {/* Combined Table and Charts Grid */}
                                <Grid container spacing={3} alignItems="stretch">
                                    {/* Detailed Table */}
                                    <Grid item xs={12} lg={6}>
                                         <DetailedTable results={results} theme={theme} />
                                    </Grid>

                                    {/* Core Charts - Stacked Vertically */}
                                     <Grid item xs={12} lg={6}>
                                         <Stack spacing={3}>
                                             {/* Tax Before/After Bar Chart */}
                                             <BarChartCard
                                                 title="예상 세금 변화"
                                                 icon={<BarChartIcon />}
                                                 barChartData={taxCompareBarData}
                                                 barChartOptions={commonBarOptions}
                                             />
                                             {/* Deduction Breakdown Pie Chart */}
                                             {deductionPieData && (
                                                 <PieChartCard
                                                     pieChartData={deductionPieData}
                                                     pieChartOptions={deductionPieOptions}
                                                     // Note prop can be added if needed
                                                 />
                                             )}
                                         </Stack>
                                     </Grid>
                                </Grid>

                                {/* Dynamic Comparison Charts Grid - Now 2x1 or 1x2 */}
                                <Box> {/* Add a Box wrapper for the title */}
                                     <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
                                         <CompareIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                         참고 비교 정보
                                     </Typography>
                                     <Grid container spacing={3} alignItems="stretch">
                                          {/* Savings vs Bank Chart */}
                                         <Grid item xs={12} sm={6}> {/* Takes half width on small screens and up */}
                                             <BarChartCard
                                                 title="절세 효과 vs. 예금 이자 (3년 추정)"
                                                 icon={<CompareArrowsIcon />}
                                                 barChartData={savingsVsBankData}
                                                 barChartOptions={savingsVsBankOptions}
                                                 note="예금 이자는 연 3.8% 단순 계산 참고치"
                                             />
                                         </Grid>
                                          {/* Savings by Income Chart */}
                                         <Grid item xs={12} sm={6}> {/* Takes half width on small screens and up */}
                                             <BarChartCard
                                                 title={`투자금 ${formatCurrency(EXAMPLE_INVESTMENT_AMOUNT, '₩')} 기준 소득별 절세액`}
                                                 icon={<SavingsIcon />}
                                                 barChartData={savingsByIncomeData}
                                                 barChartOptions={savingsByIncomeOptions}
                                                 note="동일 투자금액 기준 소득 수준별 절세 효과 비교"
                                             />
                                         </Grid>
                                     </Grid>
                                 </Box>
                            </Stack> // End of main results Stack
                         )}
                    </Grid>

                    {/* Static Info Tabs Section */}
                    <Grid item xs={12}>
                        {/* ... Static Info Tabs Card remains the same ... */}
                        <Card elevation={2} sx={{ mt: 4 }}> <Box sx={{ borderBottom: 1, borderColor: 'divider' }}> <Tabs value={selectedInfoTab} onChange={handleInfoTabChange} aria-label="Static Information Tabs" variant="fullWidth"> <Tab label="모델 비교" icon={<CompareIcon />} iconPosition="start" id="info-tab-0" aria-controls="info-panel-0" /> <Tab label="절세 상품 비교" icon={<InfoOutlinedIcon />} iconPosition="start" id="info-tab-1" aria-controls="info-panel-1" /> <Tab label="공제 핵심 요건" icon={<ArticleIcon />} iconPosition="start" id="info-tab-2" aria-controls="info-panel-2" /> </Tabs> </Box> <Box role="tabpanel" hidden={selectedInfoTab !== 0} id="info-panel-0" aria-labelledby="info-tab-0" sx={{ p: { xs: 1, sm: 2 } }}> {selectedInfoTab === 0 && <RitemVsConventionalTable />} </Box> <Box role="tabpanel" hidden={selectedInfoTab !== 1} id="info-panel-1" aria-labelledby="info-tab-1" sx={{ p: { xs: 1, sm: 2 } }}> {selectedInfoTab === 1 && <TaxAdvantageComparison />} </Box> <Box role="tabpanel" hidden={selectedInfoTab !== 2} id="info-panel-2" aria-labelledby="info-tab-2" sx={{ p: { xs: 1, sm: 2 } }}> {selectedInfoTab === 2 && <VentureDeductionInfo />} </Box> </Card>
                    </Grid>

                    {/* Notes Section */}
                    <Grid item xs={12}>
                        {/* ... Notes Card remains the same ... */}
                        <Card elevation={2} sx={{ mt: 2, border: '2px solid', borderColor: 'error.light' }}> <CardContent> <Typography variant="h6" gutterBottom color="error.dark" sx={{ display: 'flex', alignItems: 'center' }}><WarningAmberIcon sx={{ mr: 1 }} /> 반드시 확인하세요: 중요 참고사항</Typography> <List dense sx={{ pt: 0 }}> <ListItem sx={{ py: 0.5, alignItems: 'flex-start' }}> <ListItemIcon sx={{mt: 0.5}}><WarningAmberIcon color="error" /></ListItemIcon> <ListItemText primary="계산기 모델 vs. 실제 규정 차이" secondary={ <> 본 계산 결과는 <strong>참고용 추정치</strong>입니다. 실제 소득공제는 **투자 후 보유 기간(3년~5년: 70%, 5년 이상: 100%)**이 중요하나, 계산기는 이를 반영하지 않고 투자 방식(직접/엔젤: 금액 구간별 100/70/30%, VC펀드: 10% 가정)에 따른 단순화된 모델을 사용합니다. <br/><strong>개인별 다른 공제 항목은 미반영</strong>되었으므로 실제 세금과 차이가 클 수 있습니다. </> } /> </ListItem> <Divider component="li" sx={{ my: 1 }}/> <ListItem sx={{ py: 0.5 }}><ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon><ListItemText primary="소득공제 혜택 유지를 위해 투자 후 최소 3년 이상 지분 보유가 필수입니다." /></ListItem> <ListItem sx={{ py: 0.5 }}><ListItemIcon><AccountBalanceIcon color="action" /></ListItemIcon><ListItemText primary="공제 혜택은 납부할 소득세(근로소득세, 종합소득세)가 있는 경우에만 절세 효과가 발생합니다." /></ListItem> <ListItem sx={{ py: 0.5 }}><ListItemIcon><InfoIcon color="info" /></ListItemIcon><ListItemText primary="현행 규정상 2025년 12월 31일까지 투자분에 적용됩니다 (조세특례제한법 확인, 연장 가능성 있음)." /></ListItem> <Divider component="li" sx={{ my: 1 }}/> <ListItem sx={{ py: 0.5 }}><ListItemIcon><WarningAmberIcon color="error" /></ListItemIcon><ListItemText primary="원금 손실 위험" secondary="벤처투자는 원금 손실 위험이 높은 투자입니다. 세금 혜택 외 투자 자체의 가치와 위험을 반드시 신중히 고려하세요."/></ListItem> </List> </CardContent> </Card>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default App;

// Make sure AnimatedNumber.js is defined or imported
// Make sure ResultsDisplay.js contains the correct component exports including static ones