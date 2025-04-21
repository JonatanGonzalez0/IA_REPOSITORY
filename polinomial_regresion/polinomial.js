// URL pública de tu CSV en GitHub Pages
const CSV_URL = 'https://jonatangonzalez0.github.io/IA_REPOSITORY/polinomial_regresion/IPC%202010-2023.csv';

import { PolynomialRegression, joinArrays } from 'https://luisespino.github.io/mlearnjs/mlearn.mjs';

// 1) Carga de Google Charts
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(runAnalysis);

async function runAnalysis() {
  try {
    // 2) Leer y parsear el CSV
    const resp = await fetch(CSV_URL);
    if (!resp.ok) throw new Error(`Error al cargar CSV (${resp.status})`);
    const text = await resp.text();
    const { years, ipc } = parseCSV(text);

    // 3) Ajuste polinomial grado 3
    const PR = await PolynomialRegression();
    const model = new PR(3);
    model.fit(years, ipc);

    // 4) Predicción sobre los mismos años
    const yPred = model.predict(years).map(v => parseFloat(v.toFixed(2)));

    // 5) Calcular métricas
    const mse = model.mse(ipc, yPred).toFixed(2);
    const r2  = model.r2(ipc, yPred).toFixed(4);

    // 6) Preparar datos para Google Charts
    const table = joinArrays('Año', years, 'IPC real', ipc, 'IPC predicho', yPred);

    // 7) Dibujar ComboChart
    const options = {
      title: 'IPC real vs IPC ajustado (grado 3)',
      hAxis: { title: 'Año', textStyle: { color: '#cfd8dc' }, titleTextStyle: { color: '#00e5ff' } },
      vAxis: { title: 'IPC (%)', textStyle: { color: '#cfd8dc' }, titleTextStyle: { color: '#00e5ff' } },
      backgroundColor: '#121212',
      seriesType: 'scatter',
      series: { 1: { type: 'line', curveType: 'function' } },
      legend: { textStyle: { color: '#cfd8dc' } },
      titleTextStyle: { color: '#00e5ff', fontSize: 16 }
    };
    const chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(google.visualization.arrayToDataTable(table), options);

    // 8) Mostrar métricas en pantalla
    document.getElementById('metrics').innerHTML = `
      <p><strong>MSE:</strong> ${mse}</p>
      <p><strong>R²:</strong> ${r2}</p>
    `;
  } catch (err) {
    console.error(err);
    document.getElementById('metrics').innerHTML = `<p style="color:#ff5252;">${err.message}</p>`;
  }
}

// Función para parsear un CSV con cabecera "Year,IPC"
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const years = [], ipc = [];
  lines.slice(1).forEach(line => {
    const [a, b] = line.split(',');
    years.push(+a);
    ipc.push(+b);
  });
  return { years, ipc };
}
