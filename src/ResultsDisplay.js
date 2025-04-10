// src/ResultsDisplay.js
import React, { useEffect, useRef } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    // Note: Grid removed from KeyMetrics imports, Stack added
    Card, CardContent, Typography, Paper, TableContainer, Table, TableBody, TableRow, TableCell, Box, Divider, Stack, Grid
} from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import PercentIcon from '@mui/icons-material/Percent';
import { motion, animate } from 'framer-motion';

import { formatCurrency, formatPercent } from './utils'; // Import helpers

// Helper component to animate numbers
const AnimatedNumber = ({ value, formatter }) => {
    const ref = useRef(null);
    const previousValueRef = useRef(value); // Store previous value

    useEffect(() => {
        const node = ref.current;
        const previousValue = previousValueRef.current;

        const controls = animate(previousValue, value, {
            duration: 0.5, // Animation duration
            onUpdate(latest) {
                if (node) {
                    node.textContent = formatter(latest);
                }
            }
        });
        
        // Update previous value for next render
        previousValueRef.current = value;

        // Cleanup animation on unmount or before next effect
        return () => controls.stop(); 
        
    }, [value, formatter]); // Rerun effect if value or formatter changes

    // Initial render with formatted value
    return <span ref={ref}>{formatter(value)}</span>;
};

// --- Key Metrics Component (Using Stack) ---
export const KeyMetrics = ({ results, theme }) => {
    if (!results) return null;

    // Animation variants for the container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 } // Stagger children appearance
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4} component={motion.div} variants={itemVariants}>
                    <Card elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                        <SavingsIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
                        <Typography variant="h6" color="primary">
                            <AnimatedNumber value={results.taxSavings} formatter={formatCurrency} />
                        </Typography>
                        <Typography variant="body2" color="textSecondary">총 예상 절감 세액</Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4} component={motion.div} variants={itemVariants}>
                    <Card elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                        <ShowChartIcon color="secondary" sx={{ fontSize: 36, mb: 1 }} />
                        <Typography variant="h6">
                            <AnimatedNumber value={results.effectiveDeduction} formatter={formatCurrency} />
                        </Typography>
                        <Typography variant="body2" color="textSecondary">적용 소득 공제액</Typography>
                        {results.limitApplied && <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>(소득 50% 한도 적용됨)</Typography>}
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4} component={motion.div} variants={itemVariants}>
                    <Card elevation={2} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                        <AttachMoneyIcon sx={{ fontSize: 36, mb: 1, color: theme.palette.info.main }} />
                        <Typography variant="h6">
                            <AnimatedNumber value={results.savingsPerInvestment} formatter={formatPercent} />
                        </Typography>
                        <Typography variant="body2" color="textSecondary">투자 대비 절세율</Typography>
                    </Card>
                </Grid>
            </Grid>
        </motion.div>
    );
};

// --- Detailed Table Component ---
export const DetailedTable = ({ results, theme }) => {
    if (!results) return null;
    // Note: Added Grid container/item here if this component needs its own internal grid layout
    // Or keep as Card if it's meant to be placed directly in the App.js grid
     return (
        <Card elevation={2} sx={{ height: '100%' }}>
             <CardContent>
                <Typography variant="h6" gutterBottom>
                    <DescriptionIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'action.active' }} />
                    세부 결과
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small" sx={{ width: '100%' }}>
                        <TableBody>
                            <TableRow><TableCell><PercentIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />소득세 한계세율</TableCell><TableCell align="right">{formatPercent(results.marginalRate)}</TableCell></TableRow>
                            <TableRow><TableCell>유효세율 (공제 전)</TableCell><TableCell align="right">{formatPercent(results.effectiveRateBefore)}</TableCell></TableRow>
                            <TableRow><TableCell>유효세율 (공제 후)</TableCell><TableCell align="right">{formatPercent(results.effectiveRateAfter)}</TableCell></TableRow>
                            <TableRow><TableCell>공제 전 예상 세금</TableCell><TableCell align="right">{formatCurrency(results.estimatedTaxBefore)}</TableCell></TableRow>
                            <TableRow><TableCell>공제 후 예상 세금</TableCell><TableCell align="right">{formatCurrency(results.estimatedTaxAfter)}</TableCell></TableRow>
                            <TableRow sx={{ backgroundColor: theme.palette.action.hover }}><TableCell colSpan={2} sx={{ fontWeight: 'bold', color: 'text.secondary', py: 0.5 }}>소득공제 계산</TableCell></TableRow>
                            <TableRow><TableCell>• 계산된 공제액</TableCell><TableCell align="right">{formatCurrency(results.breakdown.totalCalculated)}</TableCell></TableRow>
                            {results.investmentType === 'direct_angel_crowd' && (<>
                                <TableRow><TableCell sx={{ pl: 3 }}>↳ Tier 1 (≤30M @ 100%)</TableCell><TableCell align="right">{formatCurrency(results.breakdown.tier1)}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ pl: 3 }}>↳ Tier 2 (30-50M @ 70%)</TableCell><TableCell align="right">{formatCurrency(results.breakdown.tier2)}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ pl: 3 }}>↳ Tier 3 (&gt;50M @ 30%)</TableCell><TableCell align="right">{formatCurrency(results.breakdown.tier3)}</TableCell></TableRow>
                            </>)}
                            {results.investmentType === 'vc_fund' && (<TableRow><TableCell sx={{ pl: 3 }}>↳ Investment @ 10%</TableCell><TableCell align="right">{formatCurrency(results.breakdown.tier1)}</TableCell></TableRow>)}
                            <TableRow sx={{ '& td': { borderBottom: 'none' } }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>= 최종 적용 공제액</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                    {formatCurrency(results.effectiveDeduction)}
                                    {results.limitApplied && <Typography component="span" variant="caption" color="warning.main" sx={{ ml: 0.5 }}>(한도 적용)</Typography>}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

// --- Bar Chart Component ---
export const BarChartCard = ({ results, barChartOptions, barChartData }) => {
     if (!results) return null;
     // Using Card structure consistent with DetailedTable
     return (
        <Card elevation={2} sx={{ height: '100%' }}>
             <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                     <BarChartIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'action.active' }} />
                     세금 비교
                 </Typography>
                <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 250 }}>
                    {(results.estimatedTaxBefore > 0 || results.estimatedTaxAfter > 0) ? (
                        <Bar options={barChartOptions} data={barChartData} />
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%" position="absolute" top={0} left={0} right={0} bottom={0} >
                             <Typography color="textSecondary">결과 없음</Typography>
                         </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
     );
};

// --- Pie Chart Component ---
export const PieChartCard = ({ pieChartOptions, pieChartData }) => {
    if (!pieChartData) return null;
    // Using Card structure consistent with DetailedTable
    return (
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                 <Typography variant="h6" gutterBottom>
                     <PieChartOutlineIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'action.active' }} />
                     공제액 구성
                 </Typography>
                 <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 250 }}>
                    <Pie options={pieChartOptions} data={pieChartData} />
                 </Box>
            </CardContent>
        </Card>
    );
};