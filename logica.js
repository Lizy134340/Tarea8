let chartInstance = null;
let modelo = { m: 0, b: 0 };

function parseData(str) {
    return str.split(',').map(item => parseFloat(item.trim())).filter(val => !isNaN(val));
}

function calcularEstadisticas(arr) {
    const n = arr.length;
    const media = arr.reduce((a, b) => a + b, 0) / n;
    const varianza = arr.reduce((a, b) => a + Math.pow(b - media, 2), 0) / (n - 1 || 1);
    const desv = Math.sqrt(varianza);
    return { media, varianza, desv };
}

function calcularRegresion() {
    const xStr = document.getElementById('x-values').value;
    const yStr = document.getElementById('y-values').value;
    
    let x = parseData(xStr);
    let y = parseData(yStr);

    if (x.length !== y.length || x.length === 0) {
        alert("Los arreglos de X y Y deben tener la misma cantidad de números.");
        return;
    }

    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
    }

    // Pendiente (m) y la intersección (b)
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    modelo = { m, b };

    // Predicciones y Métricas
    let yPred = x.map(val => m * val + b);
    let errorCuadratico = 0;
    let errorAbsoluto = 0;
    let errorPorcentual = 0;

    for(let i=0; i<n; i++) {
        errorCuadratico += Math.pow(y[i] - yPred[i], 2);
        errorAbsoluto += Math.abs(y[i] - yPred[i]);
        if(y[i] !== 0) errorPorcentual += Math.abs((y[i] - yPred[i]) / y[i]);
    }

    const rmse = Math.sqrt(errorCuadratico / n);
    const mae = errorAbsoluto / n;
    const mape = (errorPorcentual / n) * 100;

    const estX = calcularEstadisticas(x);
    const estY = calcularEstadisticas(y);

    actualizarUI(rmse, mae, mape, estX, estY);
    graficar(x, y, yPred);
    generarProcedimiento(x, y, n, sumX, sumY, sumXY, sumX2, m, b, rmse, mae, mape);
}

function actualizarUI(rmse, mae, mape, estX, estY) {
    document.getElementById('rmse-val').textContent = rmse.toFixed(4);
    document.getElementById('mae-val').textContent = mae.toFixed(4);
    document.getElementById('mape-val').textContent = mape.toFixed(4);
    
    document.getElementById('media-x').textContent = estX.media.toFixed(2);
    document.getElementById('var-x').textContent = estX.varianza.toFixed(2);
    document.getElementById('desv-x').textContent = estX.desv.toFixed(2);

    document.getElementById('media-y').textContent = estY.media.toFixed(2);
    document.getElementById('var-y').textContent = estY.varianza.toFixed(2);
    document.getElementById('desv-y').textContent = estY.desv.toFixed(2);
}

function generarProcedimiento(x, y, n, sumX, sumY, sumXY, sumX2, m, b, rmse, mae, mape) {
    let texto = `1. Sumatorias:\n Σx = ${sumX}, Σy = ${sumY}, Σxy = ${sumXY}, Σx² = ${sumX2}, n = ${n}\n\n`;
    texto += `2. Ecuación de la recta (y = mx + b):\n m = (${n}(${sumXY}) - (${sumX})(${sumY})) / (${n}(${sumX2}) - (${sumX})²) = ${m.toFixed(4)}\n b = (${sumY} - (${m.toFixed(4)})(${sumX})) / ${n} = ${b.toFixed(4)}\n`;
    texto += `\n Modelo final: y = ${m.toFixed(4)}x + ${b.toFixed(4)}\n\n`;
    texto += `3. Métricas:\n RMSE = √(${Math.pow(rmse,2)*n} / ${n}) = ${rmse.toFixed(4)}\n MAE = ${mae.toFixed(4)}\n MAPE = ${mape.toFixed(4)}%`;
    
    document.getElementById('procedimiento-texto').textContent = texto;
}

function graficar(x, y, yPred) {
    const ctx = document.getElementById('regresionChart').getContext('2d');
    
    const datosDispersos = x.map((val, i) => ({ x: val, y: y[i] }));
    const datosLinea = x.map((val, i) => ({ x: val, y: yPred[i] }));

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Datos Reales',
                data: datosDispersos,
                backgroundColor: 'rgba(153, 0, 161, 1)'
            }, {
                label: 'Línea de Tendencia (Modelo)',
                data: datosLinea,
                type: 'line',
                borderColor: 'rgba(0, 0, 0, 0.5)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function estimarValor() {
    const xVal = parseFloat(document.getElementById('predict-x').value);
    if (isNaN(xVal)) return;

    const yVal = modelo.m * xVal + modelo.b;
    document.getElementById('prediction-result').innerHTML = `Para X = ${xVal}, <strong>Y estimada = ${yVal.toFixed(4)}</strong>`;

    if(chartInstance) {
        chartInstance.data.datasets.push({
            label: 'Predicción',
            data: [{x: xVal, y: yVal}],
            backgroundColor: 'red',
            pointRadius: 6
        });
        chartInstance.update();
    }
}

window.onload = calcularRegresion;