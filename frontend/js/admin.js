/**
 * Admin Dashboard - Only handles Dashboard Analytics/Charts
 */

const Admin = {
    chartLoaded: false,

    init: async function() {
        this.fetchDashboard();
    },
    
    // --- DASHBOARD ---
    fetchDashboard: async function() {
        try {
            const res = await fetch('/api/admin/dashboard');
            const data = await res.json();
            
            document.getElementById('kpi-vendas').textContent = `R$ ${data.vendas.toFixed(2).replace('.', ',')}`;
            document.getElementById('kpi-vendas-totais').textContent = `R$ ${data.vendas.toFixed(2).replace('.', ',')}`;
            document.getElementById('kpi-media').textContent = `R$ ${data.mediaPedidos.toFixed(2).replace('.', ',')}`;
            document.getElementById('kpi-clientes').textContent = data.clientesAtivos;
            document.getElementById('kpi-entregas').textContent = data.entregasAndamento;

            // Render chart if not present
            if(!this.chartLoaded) {
                const ctx = document.getElementById('salesChart').getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                        datasets: [{
                            label: 'Vendas (R$)',
                            data: [data.vendas*0.2, data.vendas*0.5, data.vendas*0.8, data.vendas],
                            borderColor: '#333',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { display: false }, x: { grid: { display: false } } }
                    }
                });
                this.chartLoaded = true;
            }
        } catch(e) {
            console.error('Error dashboard', e);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Admin.init());
window.Admin = Admin;
