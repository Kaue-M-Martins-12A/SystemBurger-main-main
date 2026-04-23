const Admin = {
    salesChart: null,
    pieChart: null,

    init: async function() {
        this.fetchDashboard();
    },
    
    // --- DASHBOARD ---
    fetchDashboard: async function(range = 'week') {
        try {
            const res = await fetch(`/api/admin/dashboard?range=${range}`);
            const data = await res.json();
            
            // KPIs
            document.getElementById('kpi-vendas').textContent = `R$ ${data.kpis.vendas.toFixed(2).replace('.', ',')}`;
            document.getElementById('kpi-vendas-totais').textContent = `R$ ${data.kpis.vendas.toFixed(2).replace('.', ',')}`;
            document.getElementById('kpi-media').textContent = `R$ ${data.kpis.mediaPedidos.toFixed(2).replace('.', ',')}`;
            document.getElementById('kpi-clientes').textContent = data.kpis.clientesAtivos;
            document.getElementById('kpi-entregas').textContent = data.kpis.entregasAndamento;

            // 1. Gráfico de Vendas (Linha)
            this.renderSalesChart(data.charts.sales, range);
            
            // 2. Gráfico de Itens (Pizza)
            this.renderProductChart(data.charts.topProducts);

            // 3. Nichos / Líderes por Categoria
            this.renderNiches(data.charts.niches);

        } catch(e) {
            console.error('Error dashboard', e);
        }
    },

    renderSalesChart: function(sales, range) {
        const ctx = document.getElementById('salesChart').getContext('2d');
        
        if (this.salesChart) this.salesChart.destroy();

        // Se for semana, transformar labels em "Dia 1", "Dia 2" etc
        let labels = sales.map(s => s.label);
        if (range === 'week') {
            labels = sales.map((_, index) => `Dia ${index + 1}`);
        }
        const values = sales.map(s => s.value);

        this.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vendas (R$)',
                    data: values,
                    borderColor: '#E01A1A',
                    backgroundColor: 'rgba(224, 26, 26, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#E01A1A',
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { 
                        beginAtZero: true,
                        grid: { display: true, color: '#f0f0f0' },
                        ticks: { callback: (value) => 'R$ ' + value }
                    }, 
                    x: { grid: { display: false } } 
                }
            }
        });
    },

    renderProductChart: function(products) {
        const ctx = document.getElementById('pieChart').getContext('2d');
        
        if (this.pieChart) this.pieChart.destroy();

        const labels = products.map(p => p.name);
        const values = products.map(p => p.value);

        this.pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } 
                },
                cutout: '70%'
            }
        });
    },

    renderNiches: function(niches) {
        const grid = document.getElementById('niche-grid');
        if (!grid) return;
        
        const catMap = {
            'burgers': '🍔 Lanche',
            'acompanhamentos': '🍟 Acomp.',
            'bebidas': '🥤 Bebida',
            'sobremesas': '🍰 Sobremesa',
            'combos': '📦 Combo'
        };

        // Encontrar o líder absoluto para o topo
        const absoluteLeader = niches.reduce((prev, current) => (prev.total_sold > current.total_sold) ? prev : current, {total_sold: 0});

        let html = '';
        
        if (absoluteLeader.name) {
            html += `
                <div class="niche-card active-leader" style="background: linear-gradient(135deg, #E01A1A, #C01515); color: white;">
                    <span class="niche-category" style="color: rgba(255,255,255,0.7)">🏆 Top Geral</span>
                    <h4 class="niche-product">${absoluteLeader.name}</h4>
                    <p class="niche-count" style="color: white;">${absoluteLeader.total_sold} vendidos</p>
                </div>
            `;
        }

        html += niches.map(n => `
            <div class="niche-card">
                <span class="niche-category">${catMap[n.category] || n.category}</span>
                <h4 class="niche-product">${n.name}</h4>
                <p class="niche-count">${n.total_sold} vendidos</p>
            </div>
        `).join('');

        grid.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', () => Admin.init());
window.Admin = Admin;
