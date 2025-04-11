// src/ResultsDisplay.js
import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Card, CardContent, Typography, Paper, TableContainer, Table, TableBody, TableRow, TableCell, Box, Divider, Stack, Grid,
    List, ListItem, ListItemText // <-- ADDED List, ListItem, ListItemText
} from '@mui/material';
// Import necessary icons
import SavingsIcon from '@mui/icons-material/Savings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
// REMOVED BarChartIcon as it wasn't used *within this file* (it's passed as a prop from App.js)
import DescriptionIcon from '@mui/icons-material/Description';
import PercentIcon from '@mui/icons-material/Percent';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

import { formatCurrency, formatPercent } from './utils';
import { AnimatedNumber } from './AnimatedNumber';

// --- Key Metrics Component ---
export const KeyMetrics = ({ results }) => {
    const theme = useTheme();
     if (!results) return null;
     const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
     const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />}
            >
                {/* Card 1 - Savings */}
                <Card elevation={2} sx={{ p: 2, textAlign: 'center', flex: 1 }} component={motion.div} variants={itemVariants}>
                    <SavingsIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
                    <Typography variant="h6" color="primary">
                        <AnimatedNumber value={results.taxSavings} formatter={formatCurrency} />
                    </Typography>
                    <Typography variant="body2" color="textSecondary">총 예상 절감 세액</Typography>
                </Card>
                {/* Card 2 - Deduction */}
                 <Card elevation={2} sx={{ p: 2, textAlign: 'center', flex: 1 }} component={motion.div} variants={itemVariants}>
                    <ShowChartIcon color="secondary" sx={{ fontSize: 36, mb: 1 }} />
                    <Typography variant="h6">
                        <AnimatedNumber value={results.effectiveDeduction} formatter={formatCurrency} />
                    </Typography>
                    <Typography variant="body2" color="textSecondary">적용 소득 공제액</Typography>
                    {results.limitApplied && (
                         <Typography variant="caption" color="warning.dark" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.5 }}>
                           <WarningAmberIcon sx={{fontSize: 'inherit', verticalAlign: 'bottom', mr: 0.5}}/> 소득 50% 한도 적용
                        </Typography>
                     )}
                </Card>
                {/* Card 3 - Savings Rate */}
                 <Card elevation={2} sx={{ p: 2, textAlign: 'center', flex: 1 }} component={motion.div} variants={itemVariants}>
                    <PercentIcon sx={{ fontSize: 36, mb: 1, color: theme.palette.info.main }} />
                    <Typography variant="h6">
                        <AnimatedNumber value={results.savingsPerInvestment} formatter={(val) => formatPercent(val, 1)} />
                    </Typography>
                    <Typography variant="body2" color="textSecondary">공제액 대비 절세율</Typography>
                </Card>
            </Stack>
        </motion.div>
    );
};

// --- Detailed Table Component ---
export const DetailedTable = ({ results }) => {
    const theme = useTheme();
    if (!results) return null;
     return (
        <Card elevation={2} sx={{ height: '100%' }}>
             <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'action.active' }} />
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
                                 <TableRow><TableCell sx={{ pl: 3 }}>↳ Tier 1 (≤3천만 @ 100%)</TableCell><TableCell align="right">{formatCurrency(results.breakdown.tier1)}</TableCell></TableRow>
                                 <TableRow><TableCell sx={{ pl: 3 }}>↳ Tier 2 (3-5천만 @ 70%)</TableCell><TableCell align="right">{formatCurrency(results.breakdown.tier2)}</TableCell></TableRow>
                                 <TableRow><TableCell sx={{ pl: 3 }}>↳ Tier 3 (&gt;5천만 @ 30%)</TableCell><TableCell align="right">{formatCurrency(results.breakdown.tier3)}</TableCell></TableRow>
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

// --- MODIFIED Bar Chart Component ---
export const BarChartCard = ({ title, icon, barChartData, barChartOptions, note }) => {
    const theme = useTheme();
     const hasData = barChartData?.datasets?.some(ds => ds.data?.some(d => d !== null && d !== undefined && d > 0));

    return (
        <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1, flexShrink: 0 }}>
                    {icon && React.cloneElement(icon, { sx: { mr: 1, color: 'primary.light' } })}
                    {title || 'Bar Chart'}
                </Typography>
                <Box sx={{ flexGrow: 1, position: 'relative', width: '100%', aspectRatio: '1 / 1', mb: note ? 1 : 0 }}>
                    {hasData ? (
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                            <Bar options={{ ...barChartOptions, maintainAspectRatio: false }} data={barChartData} />
                        </Box>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="textSecondary">결과 없음</Typography>
                        </Box>
                    )}
                </Box>
                {note && <Typography variant="caption" color="textSecondary" sx={{ mt: 'auto', textAlign: 'center', display: 'block', flexShrink: 0 }}>{note}</Typography>}
            </CardContent>
        </Card>
    );
};

// --- MODIFIED Pie Chart Component ---
export const PieChartCard = ({ pieChartOptions, pieChartData, note }) => {
    const theme = useTheme();
    const hasData = pieChartData?.datasets?.some(ds => ds.data?.some(d => d !== null && d !== undefined && d > 0));

    const title = "공제액 구성 (직접/엔젤 등)";
    const icon = <PieChartOutlineIcon />;

    return (
        <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1, flexShrink: 0 }}>
                    {icon && React.cloneElement(icon, { sx: { mr: 1, color: 'primary.light' } })}
                    {title}
                </Typography>
                <Box sx={{ flexGrow: 1, position: 'relative', width: '100%', aspectRatio: '1 / 1', mb: note ? 1 : 0 }}>
                    {hasData ? (
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                            <Pie options={{ ...pieChartOptions, maintainAspectRatio: false }} data={pieChartData} />
                        </Box>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="textSecondary">해당 없음</Typography>
                        </Box>
                    )}
                </Box>
                {note && <Typography variant="caption" color="textSecondary" sx={{ mt: 'auto', textAlign: 'center', display: 'block', flexShrink: 0 }}>{note}</Typography>}
            </CardContent>
        </Card>
    );
};

// --- Static Info Components ---

// Ritem vs Conventional VC Table Component
export const RitemVsConventionalTable = () => (
    <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
                리텍 파이낸스 vs. 일반 벤처 투자
            </Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small" aria-label="Investment comparison">
                    <TableBody>
                         <TableRow>
                            <TableCell sx={{fontWeight: 'bold'}}>Feature</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>일반 벤처 투자</TableCell>
                            <TableCell sx={{fontWeight: 'bold', color: 'primary.main'}}>리텍 파이낸스</TableCell>
                         </TableRow>
                         <TableRow>
                            <TableCell>투자 기간</TableCell>
                            <TableCell>3–7년 (유동적)</TableCell>
                            <TableCell>3년 (고정)</TableCell>
                         </TableRow>
                         <TableRow>
                             <TableCell>투자 형태</TableCell>
                             <TableCell>보통주, 전환상환우선주 등</TableCell>
                             <TableCell>전환사채(CB), 상환전환우선주(RCPS)</TableCell>
                         </TableRow>
                          <TableRow>
                             <TableCell>안정성</TableCell>
                             <TableCell>• 원금 손실 가능성 높음<br/>• 회수/상환 보장 안됨</TableCell>
                             <TableCell>• 고정 이율/수익률 제공<br/>• 구조화된 원금 안정성 추구</TableCell>
                         </TableRow>
                         <TableRow>
                             <TableCell>기대 수익</TableCell>
                             <TableCell>고수익 가능성 (불확실성 높음)</TableCell>
                             <TableCell>안정적, 예측 가능한 수익률 목표</TableCell>
                         </TableRow>
                          <TableRow>
                             <TableCell>주요 단점</TableCell>
                             <TableCell>• 장기적 불확실성<br/>• 회수 시점 예측 불가<br/>• 실패 시 원금 전액 손실 위험</TableCell>
                             <TableCell>• 위험 최소화 강조<br/>• 고정 기간 내 안정적 수익 추구</TableCell>
                         </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </CardContent>
    </Card>
);

// Venture vs Other Tax Advantages Info Component
export const TaxAdvantageComparison = () => (
     <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent>
             <Typography variant="h6" gutterBottom color="primary">
                 벤처투자 소득공제 vs. 다른 절세 상품
             </Typography>
            <Typography variant="body1" paragraph>
                한국에는 다양한 절세 금융상품이 있습니다:
            </Typography>
             <List dense>
                 <ListItem>
                     <ListItemText primary="ISA (개인종합자산관리계좌):" secondary="연간 납입 한도 내에서 발생한 이자/배당 소득에 비과세 또는 분리과세 혜택 제공."/>
                 </ListItem>
                 <ListItem>
                     <ListItemText primary="IRP/연금저축:" secondary="연간 납입액에 대해 세액공제 혜택(최대 약 1800만원 한도 내), 연금 수령 시 저율 과세. 중도 인출 시 불이익."/>
                 </ListItem>
             </List>
            <Divider sx={{ my: 1 }} />
             <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                 **벤처투자 소득공제 (개인투자조합 등):**
             </Typography>
              <List dense>
                 <ListItem>
                     <ListItemText primary="특징:" secondary="투자금액 자체를 종합소득금액에서 직접 공제."/>
                 </ListItem>
                  <ListItem>
                     <ListItemText primary="강점:" secondary="다른 상품 대비 공제 한도 및 공제율(요건 충족 시 최대 100%)이 매우 높아, 소득이 높은 경우 절세 효과가 월등히 클 수 있습니다."/>
                 </ListItem>
                  <ListItem>
                     <ListItemText primary="고려사항:" secondary="투자 위험성이 높고, 최소 3년 이상 의무 보유 기간 등 요건 충족이 필요합니다."/>
                 </ListItem>
             </List>
             <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                 결론: ISA, 연금 상품은 안정적인 절세 및 노후 대비에 중요하며, 벤처투자 소득공제는 고위험/고가능성 투자와 강력한 소득 공제를 동시에 추구하는 투자자에게 매력적일 수 있습니다.
             </Typography>
        </CardContent>
    </Card>
);

// Venture Deduction Rules Explanation Component
export const VentureDeductionInfo = () => (
    <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
                벤처투자 소득공제 핵심 요건 (실제 규정)
            </Typography>
            <Typography variant="body1" paragraph>
                벤처투자 소득공제의 실제 공제율은 **투자 기간**에 따라 달라집니다. 이 계산기는 **보유 기간을 입력받지 않아** 아래의 실제 규정을 직접 반영하지 못하며, 투자 방식(직접/엔젤 vs VC펀드)과 금액 구간에 따른 **단순화된 예상치**를 제공합니다.
            </Typography>
             <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'warning.lighter', borderLeft: '5px solid', borderColor: 'warning.main' }}>
                 <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>실제 공제율 (보유 기간 기준):</Typography>
                 <List dense>
                     <ListItem>
                         <ListItemText primary="✅ 3년 이상 ~ 5년 미만 보유:" secondary="투자금액의 **70%** 소득공제"/>
                     </ListItem>
                     <ListItem>
                         <ListItemText primary="✅ 5년 이상 보유:" secondary="투자금액의 **100%** 소득공제"/>
                     </ListItem>
                 </List>
                 <Typography variant="body2" sx={{mt: 1}}>
                     *참고: 투자 방식(개인투자조합, 벤처기업 직접 투자 등)에 따라 세부 조건 및 한도가 다를 수 있으며, 공제는 종합소득금액의 50% 한도 내에서 적용됩니다. (조세특례제한법 제16조 확인 필요)
                 </Typography>
             </Paper>
             <Typography variant="body1" paragraph sx={{mt: 2}}>
                따라서, 본 계산기의 결과는 **참고용**으로만 활용하시고, 최대 공제 혜택을 위해서는 **최소 3년 이상, 가급적 5년 이상** 장기 투자를 유지하는 것이 중요합니다.
             </Typography>
        </CardContent>
    </Card>
);