/* =============================================
   SWIGGY ANALYST DASHBOARD — app.js
   Chart.js-powered analytics + interaction
   ============================================= */

// ===== GLOBAL CHART DEFAULTS =====
Chart.defaults.color = '#64748b';
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.display = true;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(20,24,32,0.95)';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.titleColor = '#f1f5f9';
Chart.defaults.plugins.tooltip.bodyColor = '#94a3b8';
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.04)';
Chart.defaults.scale.ticks.color = '#64748b';

const ORANGE = '#fc6011';
const ORANGE_LIGHT = 'rgba(252,96,17,0.15)';
const GREEN = '#22c55e';
const GREEN_LIGHT = 'rgba(34,197,94,0.12)';
const RED = '#ef4444';
const RED_LIGHT = 'rgba(239,68,68,0.12)';
const AMBER = '#f59e0b';
const BLUE = '#3b82f6';
const BLUE_LIGHT = 'rgba(59,130,246,0.12)';
const PURPLE = '#a855f7';

// ===== HELPER =====
function makeGradient(ctx, color, alpha1 = 0.4, alpha2 = 0.0) {
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0,2),16), gv = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
  g.addColorStop(0, `rgba(${r},${gv},${b},${alpha1})`);
  g.addColorStop(1, `rgba(${r},${gv},${b},${alpha2})`);
  return g;
}

function getCanvas(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  return el;
}

// ===== TAB SWITCHING =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    // init charts on demand
    initChartsForTab(btn.dataset.tab);
  });
});

// ===== SEGMENT TABS =====
let activeSegment = 'food';

document.querySelectorAll('.seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.seg-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('seg-' + btn.dataset.seg).classList.add('active');
    activeSegment = btn.dataset.seg;
    initSegmentCharts(activeSegment);
  });
});

// ===== CHART REGISTRY =====
const charts = {};

function safeChart(id, config) {
  const el = getCanvas(id);
  if (!el) return;
  if (charts[id]) { charts[id].destroy(); }
  charts[id] = new Chart(el, config);
}

function initChartsForTab(tab) {
  // No guard — always re-render so charts animate fresh on every tab visit
  if (tab === 'overview') initOverviewCharts();
  if (tab === 'segments') initSegmentCharts(activeSegment);
  if (tab === 'kpis') initKPICharts();
  if (tab === 'competitive') initCompetitiveCharts();
  if (tab === 'risks') initRisksCharts();
  if (tab === 'verdict') initVerdictCharts();
}

// ===== OVERVIEW CHARTS =====
function initOverviewCharts() {
  const el = getCanvas('revenuePie');
  if (!el) return;
  safeChart('revenuePie', {
    type: 'doughnut',
    data: {
      labels: ['Food Delivery', 'Instamart (Q-Comm)', 'Dineout & OOH', 'Advertising', 'Memberships & Others'],
      datasets: [{
        data: [52, 32, 8, 5, 3],
        backgroundColor: [ORANGE, '#ff8c42', '#3b82f6', '#22c55e', '#a855f7'],
        borderColor: '#141820',
        borderWidth: 3,
        hoverBorderWidth: 1,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'right',
          labels: { padding: 14, font: { size: 11 }, boxWidth: 12, boxHeight: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ~${ctx.parsed}% of revenue`
          }
        }
      }
    }
  });
}

// ===== SEGMENT CHARTS =====
function initSegmentCharts(seg) {
  const fyLabels = ['FY22', 'FY23', 'FY24', 'FY25'];
  if (seg === 'food') { initFoodCharts(fyLabels); return; }
  if (seg === 'instamart') { initInstamartCharts(fyLabels); return; }
  if (seg === 'dineout') { initDineoutCharts(); return; }
  if (seg === 'bolt') { initBoltCharts(); return; }
}

function initFoodCharts(fyLabels) {

  // Food: Orders
  safeChart('foodOrders', {
    type: 'bar',
    data: {
      labels: fyLabels,
      datasets: [{
        label: 'Total Orders (million)',
        data: [454.1, 516.9, 577.4, 628.9],
        backgroundColor: ctx => {
          const g = makeGradient(ctx.chart.ctx, '#fc6011', 0.9, 0.5);
          return g;
        },
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => v + 'M' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Food: GOV
  safeChart('foodGOV', {
    type: 'line',
    data: {
      labels: fyLabels,
      datasets: [{
        label: 'GOV (₹ Crore)',
        data: [18479, 21517, 24717, 28783],
        borderColor: ORANGE,
        backgroundColor: ctx => makeGradient(ctx.chart.ctx, '#fc6011', 0.25, 0.0),
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: ORANGE,
        pointHoverRadius: 8,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'K' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Food: AOV
  safeChart('foodAOV', {
    type: 'bar',
    data: {
      labels: fyLabels,
      datasets: [{
        label: 'Avg Order Value (₹)',
        data: [407, 416, 428, 458],
        backgroundColor: [ORANGE_LIGHT, ORANGE_LIGHT, ORANGE_LIGHT, ORANGE],
        borderColor: ORANGE,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '₹' + v }, min: 380 },
        x: { grid: { display: false } }
      }
    }
  });

  // Food: Contribution Margin
  safeChart('foodContrib', {
    type: 'bar',
    data: {
      labels: fyLabels,
      datasets: [{
        label: 'Contribution Margin %',
        data: [1.6, 2.9, 5.7, 7.1],
        backgroundColor: [GREEN_LIGHT, GREEN_LIGHT, GREEN_LIGHT, GREEN],
        borderColor: GREEN,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => v + '%' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Food: EBITDA
  safeChart('foodEBITDA', {
    type: 'bar',
    data: {
      labels: fyLabels,
      datasets: [{
        label: 'Adj. EBITDA Margin %',
        data: [-7.6, -4.8, -0.2, 2.0],
        backgroundColor: (ctx) => ctx.raw >= 0 ? GREEN : RED_LIGHT,
        borderColor: (ctx) => ctx.raw >= 0 ? GREEN : RED,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { callback: v => v + '%' },
          min: -10, max: 4
        },
        x: { grid: { display: false } }
      }
    }
  });
}

function initInstamartCharts(fyLabels) {

  // Instamart: Orders
  safeChart('instaOrders', {
    type: 'bar',
    data: {
      labels: fyLabels,
      datasets: [{
        label: 'Total Orders (million)',
        data: [41.7, 128.5, 175.5, 285.5],
        backgroundColor: ctx => makeGradient(ctx.chart.ctx, '#3b82f6', 0.9, 0.5),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => v + 'M' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Instamart: GOV
  safeChart('instaGOV', {
    type: 'line',
    data: {
      labels: fyLabels,
      datasets: [
        {
          label: 'GOV (₹ Crore)',
          data: [1643, 5118, 8069, 14683],
          borderColor: BLUE,
          backgroundColor: ctx => makeGradient(ctx.chart.ctx, '#3b82f6', 0.2, 0.0),
          fill: true, tension: 0.4,
          pointRadius: 5, pointBackgroundColor: BLUE,
          borderWidth: 2.5, yAxisID: 'y'
        },
        {
          label: 'Gross Revenue (₹ Crore)',
          data: [124, 547, 1088, 2252],
          borderColor: ORANGE,
          backgroundColor: 'transparent',
          fill: false, tension: 0.4,
          pointRadius: 5, pointBackgroundColor: ORANGE,
          borderWidth: 2, yAxisID: 'y1', borderDash: [4,3]
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 12 } } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'K' }, position: 'left' },
        y1: { grid: { display: false }, ticks: { callback: v => '₹' + v }, position: 'right' },
        x: { grid: { display: false } }
      }
    }
  });

  // Instamart: AOV
  safeChart('instaAOV', {
    type: 'line',
    data: {
      labels: fyLabels,
      datasets: [{
        label: 'AOV (₹)',
        data: [394, 398, 460, 514],
        borderColor: BLUE,
        backgroundColor: BLUE_LIGHT,
        fill: true, tension: 0.4,
        pointRadius: 5, pointBackgroundColor: BLUE,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '₹' + v }, min: 370 },
        x: { grid: { display: false } }
      }
    }
  });

  // Instamart: Dark Stores
  safeChart('instaDarkStores', {
    type: 'bar',
    data: {
      labels: fyLabels,
      datasets: [{
        label: 'Active Dark Stores',
        data: [301, 421, 523, 1021],
        backgroundColor: ctx => ctx.raw > 700 ? BLUE : BLUE_LIGHT,
        borderColor: BLUE,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Instamart: EBITDA
  safeChart('instaEBITDA', {
    type: 'bar',
    data: {
      labels: fyLabels,
      datasets: [{
        label: 'Adj. EBITDA Margin %',
        data: [-53.7, -39.6, -16.2, -14.3],
        backgroundColor: ctx => ctx.raw >= 0 ? GREEN : RED_LIGHT,
        borderColor: ctx => ctx.raw >= 0 ? GREEN : RED,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { callback: v => v + '%' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

function initDineoutCharts() {

  // Dineout Revenue Sources (donut)
  safeChart('dineoutRevenue', {
    type: 'doughnut',
    data: {
      labels: ['Restaurant Commissions', 'Marketing & Promo Fees', 'In-App Advertising', 'Payment & Merchant Revenue'],
      datasets: [{
        data: [40, 25, 20, 15],
        backgroundColor: [ORANGE, BLUE, GREEN, PURPLE],
        borderColor: '#141820',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 }, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ~${ctx.parsed}%` } }
      }
    }
  });
}

function initBoltCharts() {

  // Bolt strategic role
  safeChart('boltRole', {
    type: 'radar',
    data: {
      labels: ['User Retention', 'New Use Cases', 'Revenue / Order', 'Market Share', 'Safety Record', 'City Coverage'],
      datasets: [{
        label: 'Bolt (10-min)',
        data: [85, 90, 75, 70, 95, 80],
        borderColor: ORANGE,
        backgroundColor: 'rgba(252,96,17,0.1)',
        borderWidth: 2,
        pointBackgroundColor: ORANGE,
        pointRadius: 4
      }, {
        label: 'Standard Food Delivery',
        data: [70, 60, 78, 65, 90, 90],
        borderColor: BLUE,
        backgroundColor: 'rgba(59,130,246,0.07)',
        borderWidth: 2,
        pointBackgroundColor: BLUE,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        r: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { display: false },
          pointLabels: { color: '#94a3b8', font: { size: 11 } },
          min: 0, max: 100
        }
      },
      plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 12 } } }
    }
  });
}

// ===== KPI CHARTS =====
function initKPICharts() {
  const qLabels = ['Q2FY25', 'Q3FY25', 'Q4FY25', 'Q1FY26', 'Q2FY26'];

  safeChart('mtuChart', {
    type: 'line',
    data: {
      labels: qLabels,
      datasets: [{
        label: 'MTU (millions)',
        data: [14.7, 14.9, 15.1, 16.3, 17.2],
        borderColor: ORANGE,
        backgroundColor: ctx => makeGradient(ctx.chart.ctx, '#fc6011', 0.3, 0.0),
        fill: true, tension: 0.4,
        pointRadius: 6, pointBackgroundColor: ORANGE,
        pointHoverRadius: 9, borderWidth: 2.5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y}M users` } }
      },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => v + 'M' }, min: 13 },
        x: { grid: { display: false } }
      }
    }
  });

  safeChart('govCombined', {
    type: 'bar',
    data: {
      labels: qLabels,
      datasets: [
        {
          label: 'Food GOV',
          data: [7191, 7436, 7347, 8086, 8542],
          backgroundColor: ORANGE_LIGHT,
          borderColor: ORANGE,
          borderWidth: 1.5,
          borderRadius: 4,
          stack: 'gov'
        },
        {
          label: 'Instamart GOV',
          data: [2800, 3100, 3400, 3700, 4100],
          backgroundColor: BLUE_LIGHT,
          borderColor: BLUE,
          borderWidth: 1.5,
          borderRadius: 4,
          stack: 'gov'
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 12 } } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '₹' + (v/1000).toFixed(1) + 'K Cr' }, stacked: true },
        x: { grid: { display: false }, stacked: true }
      }
    }
  });

  safeChart('instaAOVTrend', {
    type: 'line',
    data: {
      labels: ['Q4FY25', 'Q1FY26', 'Q2FY26'],
      datasets: [{
        label: 'Instamart AOV (₹)',
        data: [527, 612, 697],
        borderColor: BLUE,
        backgroundColor: BLUE_LIGHT,
        fill: true, tension: 0.4,
        pointRadius: 6, pointBackgroundColor: BLUE,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '₹' + v }, min: 480 },
        x: { grid: { display: false } }
      }
    }
  });

  safeChart('darkStoresTrend', {
    type: 'bar',
    data: {
      labels: qLabels,
      datasets: [{
        label: 'Active Dark Stores',
        data: [609, 705, 1021, 1062, 1102],
        backgroundColor: ctx => {
          const g = makeGradient(ctx.chart.ctx, '#3b82f6', 0.9, 0.5);
          return g;
        },
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, min: 500 },
        x: { grid: { display: false } }
      }
    }
  });

  safeChart('instaContribTrend', {
    type: 'line',
    data: {
      labels: qLabels,
      datasets: [{
        label: 'Contribution Margin % (GOV)',
        data: [-1.9, -4.6, -5.6, -4.6, -2.6],
        borderColor: AMBER,
        backgroundColor: 'rgba(245,158,11,0.08)',
        fill: true, tension: 0.4,
        pointRadius: 6, pointBackgroundColor: AMBER,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        annotation: {}
      },
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { callback: v => v + '%' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

// ===== COMPETITIVE CHARTS =====
function initCompetitiveCharts() {
  safeChart('foodMarket', {
    type: 'doughnut',
    data: {
      labels: ['Zomato', 'Swiggy', 'Others'],
      datasets: [{
        data: [55, 40, 5],
        backgroundColor: [GREEN, ORANGE, '#334155'],
        borderColor: '#141820',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 14, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ~${ctx.parsed}% market share` } }
      }
    }
  });

  safeChart('qcommMarket', {
    type: 'doughnut',
    data: {
      labels: ['Blinkit (Zomato)', 'Swiggy Instamart', 'Zepto', 'Others'],
      datasets: [{
        data: [39, 37, 20, 4],
        backgroundColor: [GREEN, ORANGE, BLUE, '#334155'],
        borderColor: '#141820',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ~${ctx.parsed}%` } }
      }
    }
  });
}

// ===== RISKS & OPPS CHARTS =====
function initRisksCharts() {
  safeChart('riskRadar', {
    type: 'radar',
    data: {
      labels: ['Competition Intensity', 'Profitability Risk', 'Regulatory Risk', 'Execution Risk', 'Consumer Shift Risk', 'Capital Adequacy'],
      datasets: [{
        label: 'Risk Score (higher = riskier)',
        data: [90, 80, 55, 70, 60, 50],
        borderColor: RED,
        backgroundColor: 'rgba(239,68,68,0.08)',
        borderWidth: 2,
        pointBackgroundColor: RED,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        r: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { display: false },
          pointLabels: { color: '#94a3b8', font: { size: 11 } },
          min: 0, max: 100
        }
      },
      plugins: { legend: { display: false } }
    }
  });

  safeChart('oppBar', {
    type: 'bar',
    data: {
      labels: ['Q-Comm 2024', 'Q-Comm 2026E', 'Q-Comm 2028E (Low)', 'Q-Comm 2028E (High)'],
      datasets: [{
        label: 'Market Size (USD Billion)',
        data: [5, 10, 27, 50],
        backgroundColor: [ORANGE_LIGHT, 'rgba(252,96,17,0.4)', 'rgba(252,96,17,0.7)', ORANGE],
        borderColor: ORANGE,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` USD ${ctx.parsed.x}B` } }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '$' + v + 'B' } },
        y: { grid: { display: false } }
      }
    }
  });
}

// ===== VERDICT CHARTS =====
function initVerdictCharts() {
  // Score gauge (doughnut trick)
  const scoreEl = getCanvas('scoreGauge');
  if (scoreEl) {
    const score = 6.8;
    safeChart('scoreGauge', {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [score, 10 - score],
          backgroundColor: [ORANGE, 'rgba(255,255,255,0.05)'],
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '78%',
        rotation: -90,
        circumference: 180,
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
  }

  // Path to profitability
  const fyAll = ['FY22', 'FY23', 'FY24', 'FY25', 'FY26E', 'FY27E'];
  safeChart('profitPath', {
    type: 'line',
    data: {
      labels: fyAll,
      datasets: [
        {
          label: 'Food Delivery Adj. EBITDA %',
          data: [-7.6, -4.8, -0.2, 2.0, 4.0, 5.5],
          borderColor: ORANGE,
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: ctx => ctx.dataIndex >= 4 ? 'transparent' : ORANGE,
          pointBorderColor: ctx => ctx.dataIndex >= 4 ? ORANGE : ORANGE,
          pointBorderWidth: ctx => ctx.dataIndex >= 4 ? 2 : 0,
          pointStyle: ctx => ctx.dataIndex >= 4 ? 'triangle' : 'circle',
          borderWidth: 2.5,
          borderDash: ctx => [], // solid
          segment: { borderDash: ctx => ctx.p1DataIndex >= 4 ? [5,4] : [] }
        },
        {
          label: 'Instamart Adj. EBITDA %',
          data: [-53.7, -39.6, -16.2, -14.3, -8.0, -2.0],
          borderColor: BLUE,
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: ctx => ctx.dataIndex >= 4 ? 'transparent' : BLUE,
          pointBorderColor: BLUE,
          pointBorderWidth: ctx => ctx.dataIndex >= 4 ? 2 : 0,
          borderWidth: 2.5,
          segment: { borderDash: ctx => ctx.p1DataIndex >= 4 ? [5,4] : [] }
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, padding: 16 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y}%` } }
      },
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { callback: v => v + '%' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

// ===== INIT ON LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  // Init overview charts immediately
  initChartsForTab('overview');

  // Hover effects on cards
  document.querySelectorAll('.kpi-card, .stat-pill, .eco-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'translateY(-2px)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
});
