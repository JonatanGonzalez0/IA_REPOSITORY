// decision-tree.js

import {
  DecisionTreeClassifier,
  LabelEncoder,
  accuracyScore
} from 'https://luisespino.github.io/mlearnjs/mlearn.mjs';

// 1) Datos (Figura 18.3)
const raw = [
  ['Yes','No','No','Yes','Some','$$$','No','Yes','French','0-10','Yes'],
  ['Yes','No','No','Yes','Full','$','No','No','Thai','30-60','No'],
  ['No','Yes','No','Yes','Some','$','No','No','Burger','0-10','Yes'],
  ['Yes','No','Yes','No','Full','$','Yes','No','Thai','10-30','Yes'],
  ['Yes','No','Yes','No','Full','$$$','No','Yes','French','60','No'],
  ['No','Yes','No','Yes','Some','$$','Yes','Yes','Italian','0-10','Yes'],
  ['No','Yes','No','No','None','$','Yes','No','Burger','0-10','No'],
  ['No','No','No','Yes','Some','$$','Yes','Yes','Thai','0-10','Yes'],
  ['No','Yes','Yes','No','Full','$','Yes','No','Burger','60','No'],
  ['Yes','Yes','Yes','Yes','Full','$$$','No','Yes','Italian','10-30','No'],
  ['No','No','No','No','None','$','No','Yes','Thai','0-10','No'],
  ['Yes','Yes','Yes','Yes','Full','$','No','No','Burger','30-60','Yes'],
];
const attrs    = ['Alt','Bar','Fri','Hun','Pat','Price','Rain','Res','Type','Est'];
const labelCol = 'WillWait';

// 2) Transformar raw → objetos
const data = raw.map(r => {
  const obj = {};
  attrs.forEach((a,i) => obj[a] = r[i]);
  obj[labelCol] = r[r.length-1];
  return obj;
});

// 3) Mostrar la tabla completa
function showTable() {
  const container = document.getElementById('table-container');
  const table = document.createElement('table');
  const thead = table.createTHead();
  const hr = thead.insertRow();
  [...attrs, labelCol].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    hr.append(th);
  });
  const tb = table.createTBody();
  data.forEach(row => {
    const tr = tb.insertRow();
    [...attrs, labelCol].forEach(cn => {
      const td = tr.insertCell();
      td.textContent = row[cn];
    });
  });
  container.append(table);
}

// 4) Construir selector de hasta 3 variables
function buildSelector() {
  const sel = document.getElementById('var-selector');
  attrs.forEach(a => {
    const cb = document.createElement('input');
    cb.type    = 'checkbox';
    cb.id      = a;
    cb.value   = a;
    cb.checked = false;
    const lbl = document.createElement('label');
    lbl.htmlFor    = a;
    lbl.textContent = a;
    sel.append(cb, lbl);
  });
  // lógica de máximo 3 checks
  const boxes = sel.querySelectorAll('input[type="checkbox"]');
  boxes.forEach(box =>
    box.addEventListener('change', () => {
      const checked = sel.querySelectorAll('input:checked').length;
      if (checked >= 3) {
        boxes.forEach(b => { if (!b.checked) b.disabled = true; });
      } else {
        boxes.forEach(b => b.disabled = false);
      }
    })
  );
}

// 5) Generar todas las combinaciones de longitud k
function combinations(arr, k) {
  const res = [];
  function _comb(start, combo) {
    if (combo.length === k) {
      res.push(combo.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      _comb(i+1, combo);
      combo.pop();
    }
  }
  _comb(0, []);
  return res;
}

// 6) Calcular precisión para una combinación
async function computeAccuracy(chosen) {
  // codificar attrs
  const cols = {};
  for (const attr of chosen) {
    const Enc = await LabelEncoder();
    const encoder = new Enc();
    cols[attr] = encoder.fitTransform(data.map(r => r[attr]));
  }
  // codificar etiqueta
  const EncL = await LabelEncoder();
  const labEnc = new EncL();
  const yTrue  = labEnc.fitTransform(data.map(r => r[labelCol]));

  // montar features
  const features = data.map((_,i) =>
    chosen.map(attr => cols[attr][i])
  );

  // entrenar y predecir
  const DT = await DecisionTreeClassifier();
  const model = new DT();
  model.fit(features, yTrue);
  const yPredEnc = model.predict(features);

  const accFn = await accuracyScore();
  return accFn(yTrue, yPredEnc);
}

// 7) Calcular las mejores n combinaciones y mostrarlas
async function buildSuggestions(n=5) {
  const combos = combinations(attrs, 3);
  const results = [];
  for (const combo of combos) {
    const acc = await computeAccuracy(combo);
    results.push({ combo, acc });
  }
  results.sort((a,b) => b.acc - a.acc);
  const top = results.slice(0, n);

  const cont = document.getElementById('suggestions');
  cont.innerHTML = '<strong>Sugerencias (mejores combinaciones):</strong><br>';
  top.forEach(({combo, acc}) => {
    const btn = document.createElement('button');
    btn.textContent = `${combo.join(', ')} → ${(acc*100).toFixed(2)} %`;
    btn.onclick = () => {
      // desmarcar todos
      document.querySelectorAll('#var-selector input').forEach(cb => {
        cb.checked = false; cb.disabled = false;
      });
      // marcar estos 3
      combo.forEach(attr => {
        const cb = document.getElementById(attr);
        cb.checked = true;
      });
      // disparar lógica de habilitar/deshabilitar
      document.querySelector('#var-selector input').dispatchEvent(new Event('change'));
      evaluate();
    };
    cont.append(btn);
  });
}

// 8) Evaluación bajo demanda
async function evaluate() {
  const chosen = Array.from(
    document.querySelectorAll('#var-selector input:checked'),
    cb => cb.value
  );
  if (chosen.length !== 3) {
    alert('Debes seleccionar exactamente 3 variables');
    return;
  }

  // reusar computeAccuracy para obtener acc y luego árbol
  const acc = await computeAccuracy(chosen);

  // codificar y entrenar de nuevo para imprimir árbol y gain
  const cols = {};
  for (const attr of chosen) {
    const Enc = await LabelEncoder();
    const encoder = new Enc();
    cols[attr] = encoder.fitTransform(data.map(r => r[attr]));
  }
  const EncL = await LabelEncoder();
  const labEnc = new EncL();
  const yTrue  = labEnc.fitTransform(data.map(r => r[labelCol]));
  const features = data.map((_,i) =>
    chosen.map(attr => cols[attr][i])
  );
  const DT = await DecisionTreeClassifier();
  const model = new DT();
  model.fit(features, yTrue);

  // formatear gain
  let gainText = model.gain.toString().replace(/<br\s*\/?>/g,'\n');

  // mostrar
  document.getElementById('log').innerHTML = `
    <p>Variables: <strong>[${chosen.join(', ')}]</strong></p>
    <p>Precisión: <strong>${(acc*100).toFixed(2)} %</strong></p>
    <h3>Árbol descriptivo:</h3>
    <pre>${model.printTree(model.tree)}</pre>
    <h3>Gain track:</h3>
    <pre>${gainText}</pre>
  `;
}

// 9) Inicializar todo
buildSelector();
showTable();
document.getElementById('evaluate-btn').addEventListener('click', evaluate);
buildSuggestions(5);   // calcula y muestra las 5 mejores combos
