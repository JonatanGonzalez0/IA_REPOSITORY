// polinomial.js

// URL pública de tu CSV en GitHub Pages
const CSV_URL =
  'https://jonatangonzalez0.github.io/IA_REPOSITORY/polinomial_regresion/IPC%202010-2023.csv';

import {
  PolynomialRegression,
  joinArrays as getJoin
} from 'https://luisespino.github.io/mlearnjs/mlearn.mjs';

// 1) Carga de Google Charts
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(runAnalysis);

async function runAnalysis() {
  try {
    // 2) Leer CSV
    const resp = await fetch(CSV_URL);
    if (!resp.ok) throw new Error(`Error al cargar CSV (${resp.status})`);
    const text = await resp.text();

    // 3) Parsear y agrupar por año → { years, ipcAvg }
    const { years, ipcAvg } = aggregateAnnual(parseCSV(text));

    // 4) Escalar X (0 = 2010, 1 = 2011, …)
    const base = years[0];
    const X = years.map(y => y - base);

    // 5) Ajuste lineal (grado 1)
    const PR = await PolynomialRegression();
    const model = new PR(1);
    model.fit(X, ipcAvg);

    // 6) Predicción sobre X escalado
    const yPred = model.predict(X).map(v => parseFloat(v.toFixed(2)));

    // 7) Métricas
    const mse = model.mse(ipcAvg, yPred).toFixed(2);
    const rawR2 = model.r2(ipcAvg, yPred);
    const r2    = Math.max(0, Math.min(1, 1 - rawR2)).toFixed(4);

    // 8) Preparar datos para Google Charts
    const join = await getJoin();
    const table = join(
      'Año',             years,
      'IPC real (anual)', ipcAvg,
      'IPC predicho',     yPred
    );

    // 9) Dibujar ComboChart
    const options = {
      title: 'IPC real vs Regresión Lineal Anual',
      hAxis: {
        title: 'Año',
        textStyle:      { color: '#cfd8dc' },
        titleTextStyle: { color: '#00e5ff' }
      },
      vAxis: {
        title: 'IPC (%)',
        textStyle:      { color: '#cfd8dc' },
        titleTextStyle: { color: '#00e5ff' },
        viewWindow:     { min: Math.min(...ipcAvg, ...yPred) - 5 }
      },
      backgroundColor: '#121212',
      seriesType:      'scatter',
      series:          { 1: { type: 'line', curveType: 'function' } },
      legend:          { textStyle: { color: '#cfd8dc' } },
      titleTextStyle:  { color: '#00e5ff', fontSize: 16 }
    };
    const chart = new google.visualization.ComboChart(
      document.getElementById('chart_div')
    );
    chart.draw(
      google.visualization.arrayToDataTable(table),
      options
    );

    // 10) Mostrar métricas
    document.getElementById('metrics').innerHTML = `
      <p><strong>MSE:</strong> ${mse}</p>
      <p><strong>R²:</strong> ${r2}</p>
    `;

    // 11) Construir e insertar la tabla resumen
    buildSummaryTable(years, ipcAvg, yPred);

  } catch (err) {
    console.error(err);
    document.getElementById('metrics').innerHTML = `
      <p style="color:#ff5252;">${err.message}</p>
    `;
  }
}

// parseCSV → [{year, ipc}, ...]
function parseCSV(text) {
  const lines = text.trim().split('\n');
  return lines.slice(1).map(line => {
    const [year, , ipcVal] = line.split(',');
    return { year: +year, ipc: +ipcVal };
  });
}

// Agrupa por año y promedia
function aggregateAnnual(data) {
  const sums = {}, counts = {};
  data.forEach(({ year, ipc }) => {
    sums[year]   = (sums[year] || 0) + ipc;
    counts[year] = (counts[year] || 0) + 1;
  });
  const years = Object.keys(sums).map(y => +y).sort((a,b) => a-b);
  const ipcAvg = years.map(y => sums[y] / counts[y]);
  return { years, ipcAvg };
}

// Crea la tabla y la inserta en #table_div
function buildSummaryTable(years, ipcAvg, yPred) {
  const rows = years.map((y,i) => `
    <tr>
      <td>${y}</td>
      <td>${ipcAvg[i].toFixed(2)}</td>
      <td>${yPred[i]}</td>
    </tr>
  `).join('');

  const html = `
    <table>
      <thead>
        <tr>
          <th>Año</th>
          <th>IPC real (anual)</th>
          <th>IPC predicho</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
  document.getElementById('table_div').innerHTML = html;
}
