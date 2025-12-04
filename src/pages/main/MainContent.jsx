// import React from 'react';

// const MainContent = ({ data }) => {
//   if (!data) return null;

//   const StatsCards = () => {
//     const formatCurrency = (amount) => {
//       return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0
//       }).format(amount);
//     };

//     const formatPercentage = (value) => {
//       const sign = value >= 0 ? '+' : '';
//       return `${sign}${value.toFixed(1)}%`;
//     };

//     const getChangeColor = (value) => {
//       if (value > 0) return '#10b981';
//       if (value < 0) return '#ef4444';
//       return '#6b7280';
//     };

//     const cards = [
//       {
//         title: "Total Users",
//         value: data?.totals?.users?.value || 0,
//         change: data?.totals?.users?.percentage_change || 0,
//         icon: (
//           <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
//             <circle cx="9" cy="7" r="4"></circle>
//             <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
//             <path d="M16 3.13a4 4 0 010 7.75"></path>
//           </svg>
//         ),
//         color: "#3b82f6"
//       },
//       {
//         title: "Total Orders",
//         value: data?.totals?.orders?.value || 0,
//         change: data?.totals?.orders?.percentage_change || 0,
//         icon: (
//           <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
//             <path d="M3 6h18"></path>
//             <path d="M16 10a4 4 0 01-8 0"></path>
//           </svg>
//         ),
//         color: "#10b981"
//       },
//       {
//         title: "Units Sold",
//         value: data?.totals?.sales?.units_sold?.this_month || 0,
//         change: data?.totals?.sales?.units_sold?.percentage_change || 0,
//         icon: (
//           <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
//             <path d="M2 17l10 5 10-5"></path>
//             <path d="M2 12l10 5 10-5"></path>
//           </svg>
//         ),
//         color: "#8b5cf6"
//       },
//       {
//         title: "Revenue",
//         value: data?.totals?.revenue?.this_month || 0,
//         change: data?.totals?.revenue?.percentage_change || 0,
//         icon: (
//           <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M12 1v22"></path>
//             <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
//           </svg>
//         ),
//         color: "#f59e0b"
//       }
//     ];

//     return (
//       <div className="stats-grid">
//         {cards.map((stat, index) => (
//           <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
//             <div className="stat-icon-container" style={{ color: stat.color }}>
//               {stat.icon}
//             </div>
//             <div className="stat-content">
//               <h3 className="stat-value">{stat.title === 'Revenue' ? formatCurrency(stat.value) : stat.value}</h3>
//               <p className="stat-title">{stat.title}</p>
//               <div className="stat-change" style={{ color: getChangeColor(stat.change) }}>
//                 {formatPercentage(stat.change)} from last month
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const AnalyticsSection = () => {
//     const productMetrics = [
//       {
//         label: "Total Products",
//         value: data?.analysis?.products?.total_products || 0,
//         color: "#3b82f6",
//         icon: "📦"
//       },
//       {
//         label: "Active Products",
//         value: data?.analysis?.products?.active_products || 0,
//         color: "#10b981",
//         icon: "✅"
//       },
//       {
//         label: "Inactive Products",
//         value: data?.analysis?.products?.inactive_products || 0,
//         color: "#6b7280",
//         icon: "⏸️"
//       },
//       {
//         label: "Low Stock",
//         value: data?.analysis?.products?.low_stock || 0,
//         color: "#f59e0b",
//         icon: "⚠️"
//       }
//     ];

//     const orderMetrics = [
//       {
//         label: "Pending",
//         value: data?.analysis?.orders?.pending || 0,
//         color: "#f59e0b",
//         icon: "⏳"
//       },
//       {
//         label: "Completed",
//         value: data?.analysis?.orders?.completed || 0,
//         color: "#10b981",
//         icon: "✅"
//       },
//       {
//         label: "Cancelled",
//         value: data?.analysis?.orders?.cancelled || 0,
//         color: "#ef4444",
//         icon: "❌"
//       },
//       {
//         label: "Refunded",
//         value: data?.analysis?.orders?.refunded || 0,
//         color: "#8b5cf6",
//         icon: "↩️"
//       }
//     ];

//     return (
//       <div className="analytics-section">
//         <h3 className="analytics-title">Analytics Overview</h3>
//         <div className="analytics-grid">
//           <div className="analytics-card">
//             <div className="analytics-card-header">
//               <h4 className="analytics-card-title">Product Analytics</h4>
//               <span className="analytics-card-subtitle">Inventory Status</span>
//             </div>
//             <div className="analytics-card-metrics">
//               {productMetrics.map((metric, index) => (
//                 <div key={index} className="metric-item">
//                   <div 
//                     className="metric-item-icon" 
//                     style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
//                   >
//                     {metric.icon}
//                   </div>
//                   <div className="metric-item-content">
//                     <span className="metric-item-value">{metric.value}</span>
//                     <span className="metric-item-label">{metric.label}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="analytics-card">
//             <div className="analytics-card-header">
//               <h4 className="analytics-card-title">Order Analytics</h4>
//               <span className="analytics-card-subtitle">Order Status</span>
//             </div>
//             <div className="analytics-card-metrics">
//               {orderMetrics.map((metric, index) => (
//                 <div key={index} className="metric-item">
//                   <div 
//                     className="metric-item-icon" 
//                     style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
//                   >
//                     {metric.icon}
//                   </div>
//                   <div className="metric-item-content">
//                     <span className="metric-item-value">{metric.value}</span>
//                     <span className="metric-item-label">{metric.label}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const BestSellingProducts = () => {
//     const products = data?.best_selling_products || [];
    
//     if (products.length === 0) {
//       return (
//         <div className="empty-state">
//           <p>No sales data available</p>
//         </div>
//       );
//     }

//     const totalSold = products.reduce((sum, product) => sum + product.total_sold, 0);

//     return (
//       <div className="best-selling-section">
//         <div className="products-list">
//           {products.map((product, index) => {
//             const percentage = ((product.total_sold / totalSold) * 100).toFixed(1);
            
//             return (
//               <div key={product.product__id} className="product-item">
//                 <div className="product-item-header">
//                   <div className="product-item-rank">
//                     <span className="rank-badge">#{index + 1}</span>
//                     <div className="product-item-info">
//                       <h4 className="product-item-name">{product.product__name}</h4>
//                       <span className="product-item-sales">{product.total_sold} sold</span>
//                     </div>
//                   </div>
//                   <span className="product-item-percentage">{percentage}%</span>
//                 </div>
//                 <div className="product-item-progress">
//                   <div 
//                     className="product-item-progress-bar"
//                     style={{ width: `${percentage}%` }}
//                   ></div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   const RecentOrders = () => {
//     const orders = data?.recent?.orders || [];
    
//     const formatCurrency = (amount) => {
//       return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0
//       }).format(amount);
//     };

//     const formatDate = (dateString) => {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       });
//     };

//     const getStatusClass = (status) => {
//       switch (status?.toLowerCase()) {
//         case 'completed': return 'status-completed';
//         case 'processing': return 'status-processing';
//         case 'pending': return 'status-pending';
//         case 'cancelled': return 'status-cancelled';
//         case 'refunded': return 'status-refunded';
//         default: return 'status-pending';
//       }
//     };

//     const getStatusText = (status) => {
//       return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending';
//     };

//     const getTotalItems = (items) => {
//       return items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
//     };

//     if (orders.length === 0) {
//       return (
//         <div className="empty-state">
//           <p>No recent orders</p>
//         </div>
//       );
//     }

//     return (
//       <div className="table-container">
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>Date</th>
//               <th>Total</th>
//               <th>Items</th>
//               <th>Status</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order) => (
//               <tr key={order.id}>
//                 <td className="order-id">ORD-{order.id.toString().padStart(4, '0')}</td>
//                 <td>{formatDate(order.created_at)}</td>
//                 <td className="order-total">{formatCurrency(order.total)}</td>
//                 <td>{getTotalItems(order.items)} items</td>
//                 <td>
//                   <span className={`status-badge ${getStatusClass(order.status)}`}>
//                     {getStatusText(order.status)}
//                   </span>
//                 </td>
//                 <td>
//                   <button className="action-button view-button">
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   };

//   const ProductsSection = () => {
//     const products = data?.recent?.products || [];
    
//     const formatCurrency = (amount) => {
//       return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0
//       }).format(amount);
//     };

//     const getStockStatus = (stock) => {
//       if (stock > 10) return { class: 'in-stock', color: '#10b981' };
//       if (stock > 0) return { class: 'low-stock', color: '#f59e0b' };
//       return { class: 'out-of-stock', color: '#ef4444' };
//     };

//     if (products.length === 0) {
//       return (
//         <div className="empty-state">
//           <p>No products available</p>
//         </div>
//       );
//     }

//     return (
//       <div className="products-grid">
//         {products.map((product) => {
//           const stockStatus = getStockStatus(product.stock);
          
//           return (
//             <div key={product.id} className="product-card">
//               <div className="product-card-image">
//                 <img 
//                   src={product.main_image_url} 
//                   alt={product.name}
//                   onError={(e) => {
//                     e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
//                   }}
//                 />
//               </div>
//               <div className="product-card-content">
//                 <div className="product-card-header">
//                   <h3 className="product-card-name">{product.name}</h3>
//                   <span className="product-card-price">{formatCurrency(product.price)}</span>
//                 </div>
                
//                 <div className="product-card-meta">
//                   <span className="product-card-category">
//                     {product.category?.name || 'Uncategorized'}
//                   </span>
//                   <span 
//                     className="product-card-stock"
//                     style={{ color: stockStatus.color }}
//                   >
//                     {stockStatus.class === 'in-stock' ? '✓' : '⚠'} {product.stock} in stock
//                   </span>
//                 </div>
                
//                 <div className="product-card-actions">
//                   <button className="btn btn-outline">Edit</button>
//                   <button className="btn btn-primary">View</button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div className="main-content">
//       <div className="main-content-wrap">
//         {/* Stats Overview */}
//         <div className="content-section">
//           <h2 className="section-title">Dashboard Overview</h2>
//           <StatsCards />
//         </div>

//         {/* Analytics Grid */}
//         <div className="content-section">
//           <AnalyticsSection />
//         </div>

//         {/* Recent Activity Grid */}
//         <div className="content-section">
//           <div className="grid-section">
//             <div className="section-header">
//               <h2 className="section-title">Recent Orders</h2>
//               <a href="/admin/orders" className="view-all-link">View All</a>
//             </div>
//             <RecentOrders />
//           </div>

//           <div className="grid-section">
//             <div className="section-header">
//               <h2 className="section-title">Best Selling Products</h2>
//               <a href="/admin/products" className="view-all-link">View All</a>
//             </div>
//             <BestSellingProducts />
//           </div>
//         </div>

//         {/* Products Section */}
//         <div className="content-section">
//           <div className="section-header">
//             <h2 className="section-title">Recent Products</h2>
//             <a href="/admin/products" className="view-all-link">View All</a>
//           </div>
//           <ProductsSection />
//         </div>
//       </div>

//       <style jsx>{`
//         .main-content {
//           flex: 1;
//           padding: 0;
//           background: #f8fafc;
//           min-height: calc(100vh - 80px);
//         }
        
//         .main-content-wrap {
//           max-width: 100%;
//           margin: 0;
//           padding: 1rem;
//         }
        
//         .content-section {
//           background: #ffffff;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
//           margin-bottom: 1.5rem;
//           padding: 1.5rem;
//           border: 1px solid #e5e7eb;
//           overflow: hidden;
//         }
        
//         .section-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 1.5rem;
//           flex-wrap: wrap;
//           gap: 0.5rem;
//         }
        
//         .section-title {
//           font-size: 1.25rem;
//           font-weight: 600;
//           color: #111827;
//           margin: 0;
//         }
        
//         .view-all-link {
//           color: #3b82f6;
//           text-decoration: none;
//           font-size: 0.875rem;
//           font-weight: 500;
//           transition: color 0.2s ease;
//           white-space: nowrap;
//         }
        
//         .view-all-link:hover {
//           color: #2563eb;
//           text-decoration: underline;
//         }
        
//         /* Stats Cards */
//         .stats-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
//           gap: 1.5rem;
//         }
        
//         .stat-card {
//           background: white;
//           border-left: 4px solid;
//           border-radius: 8px;
//           padding: 1.5rem;
//           display: flex;
//           align-items: flex-start;
//           gap: 1rem;
//           box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
//           transition: transform 0.2s ease, box-shadow 0.2s ease;
//         }
        
//         .stat-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//         }
        
//         .stat-icon-container {
//           padding: 0.75rem;
//           border-radius: 8px;
//           background: rgba(59, 130, 246, 0.1);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
        
//         .stat-icon {
//           width: 24px;
//           height: 24px;
//         }
        
//         .stat-content {
//           flex: 1;
//         }
        
//         .stat-value {
//           font-size: 1.5rem;
//           font-weight: 600;
//           color: #111827;
//           margin: 0 0 0.25rem 0;
//           line-height: 1.2;
//         }
        
//         .stat-title {
//           font-size: 0.875rem;
//           color: #6b7280;
//           margin: 0 0 0.5rem 0;
//         }
        
//         .stat-change {
//           font-size: 0.75rem;
//           font-weight: 500;
//         }
        
//         /* Analytics Section */
//         .analytics-section {
//           padding: 0.5rem 0;
//         }
        
//         .analytics-title {
//           font-size: 1.125rem;
//           font-weight: 600;
//           color: #111827;
//           margin-bottom: 1.5rem;
//         }
        
//         .analytics-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//           gap: 1.5rem;
//         }
        
//         .analytics-card {
//           background: #f9fafb;
//           border: 1px solid #e5e7eb;
//           border-radius: 8px;
//           padding: 1.5rem;
//         }
        
//         .analytics-card-header {
//           margin-bottom: 1.5rem;
//         }
        
//         .analytics-card-title {
//           font-size: 1.125rem;
//           font-weight: 600;
//           color: #111827;
//           margin: 0 0 0.25rem 0;
//         }
        
//         .analytics-card-subtitle {
//           font-size: 0.875rem;
//           color: #6b7280;
//         }
        
//         .analytics-card-metrics {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
//           gap: 1rem;
//         }
        
//         .metric-item {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 0.75rem;
//           background: white;
//           border: 1px solid #e5e7eb;
//           border-radius: 6px;
//         }
        
//         .metric-item-icon {
//           font-size: 1.25rem;
//           width: 40px;
//           height: 40px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border-radius: 6px;
//           flex-shrink: 0;
//         }
        
//         .metric-item-content {
//           display: flex;
//           flex-direction: column;
//         }
        
//         .metric-item-value {
//           font-size: 1.25rem;
//           font-weight: 600;
//           color: #111827;
//         }
        
//         .metric-item-label {
//           font-size: 0.875rem;
//           color: #6b7280;
//         }
        
//         /* Best Selling Products */
//         .best-selling-section {
//           padding: 0.5rem 0;
//         }
        
//         .products-list {
//           display: flex;
//           flex-direction: column;
//           gap: 1rem;
//         }
        
//         .product-item {
//           background: #f9fafb;
//           border: 1px solid #e5e7eb;
//           border-radius: 8px;
//           padding: 1rem;
//         }
        
//         .product-item-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 0.75rem;
//         }
        
//         .product-item-rank {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//         }
        
//         .rank-badge {
//           background: #3b82f6;
//           color: white;
//           width: 32px;
//           height: 32px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border-radius: 6px;
//           font-weight: 600;
//           font-size: 0.875rem;
//           flex-shrink: 0;
//         }
        
//         .product-item-info {
//           display: flex;
//           flex-direction: column;
//         }
        
//         .product-item-name {
//           font-size: 0.95rem;
//           font-weight: 500;
//           color: #111827;
//           margin: 0;
//           line-height: 1.4;
//         }
        
//         .product-item-sales {
//           font-size: 0.75rem;
//           color: #6b7280;
//         }
        
//         .product-item-percentage {
//           font-weight: 600;
//           color: #111827;
//         }
        
//         .product-item-progress {
//           height: 6px;
//           background: #e5e7eb;
//           border-radius: 3px;
//           overflow: hidden;
//         }
        
//         .product-item-progress-bar {
//           height: 100%;
//           background: linear-gradient(90deg, #3b82f6, #8b5cf6);
//           border-radius: 3px;
//           transition: width 0.3s ease;
//         }
        
//         /* Recent Orders Table */
//         .table-container {
//           overflow-x: auto;
//         }
        
//         .data-table {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: 0.875rem;
//         }
        
//         .data-table thead {
//           background: #f9fafb;
//           border-bottom: 2px solid #e5e7eb;
//         }
        
//         .data-table th {
//           padding: 0.75rem 1rem;
//           text-align: left;
//           font-weight: 600;
//           color: #374151;
//           white-space: nowrap;
//         }
        
//         .data-table td {
//           padding: 1rem;
//           border-bottom: 1px solid #e5e7eb;
//           vertical-align: middle;
//         }
        
//         .data-table tbody tr:hover {
//           background: #f9fafb;
//         }
        
//         .order-id {
//           font-family: 'SF Mono', Monaco, 'Andale Mono', monospace;
//           font-size: 0.75rem;
//           color: #6b7280;
//         }
        
//         .order-total {
//           font-weight: 600;
//           color: #059669;
//         }
        
//         .status-badge {
//           display: inline-block;
//           padding: 0.25rem 0.75rem;
//           border-radius: 9999px;
//           font-size: 0.75rem;
//           font-weight: 500;
//         }
        
//         .status-completed {
//           background: #d1fae5;
//           color: #065f46;
//         }
        
//         .status-processing {
//           background: #fef3c7;
//           color: #92400e;
//         }
        
//         .status-pending {
//           background: #e0f2fe;
//           color: #075985;
//         }
        
//         .status-cancelled {
//           background: #fee2e2;
//           color: #991b1b;
//         }
        
//         .status-refunded {
//           background: #f3e8ff;
//           color: #6b21a8;
//         }
        
//         .action-button {
//           padding: 0.375rem 0.75rem;
//           border-radius: 6px;
//           font-size: 0.75rem;
//           font-weight: 500;
//           cursor: pointer;
//           border: none;
//           transition: all 0.2s ease;
//         }
        
//         .view-button {
//           background: #3b82f6;
//           color: white;
//         }
        
//         .view-button:hover {
//           background: #2563eb;
//         }
        
//         /* Products Grid */
//         .products-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
//           gap: 1.5rem;
//         }
        
//         .product-card {
//           background: white;
//           border: 1px solid #e5e7eb;
//           border-radius: 8px;
//           overflow: hidden;
//           transition: box-shadow 0.2s ease;
//         }
        
//         .product-card:hover {
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//         }
        
//         .product-card-image {
//           height: 160px;
//           overflow: hidden;
//           background: #f9fafb;
//         }
        
//         .product-card-image img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           transition: transform 0.3s ease;
//         }
        
//         .product-card:hover .product-card-image img {
//           transform: scale(1.05);
//         }
        
//         .product-card-content {
//           padding: 1.25rem;
//         }
        
//         .product-card-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: flex-start;
//           margin-bottom: 0.75rem;
//           gap: 0.5rem;
//         }
        
//         .product-card-name {
//           font-size: 1rem;
//           font-weight: 600;
//           color: #111827;
//           margin: 0;
//           flex: 1;
//           line-height: 1.4;
//         }
        
//         .product-card-price {
//           font-weight: 600;
//           color: #059669;
//           font-size: 0.875rem;
//           white-space: nowrap;
//         }
        
//         .product-card-meta {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 1rem;
//           font-size: 0.75rem;
//         }
        
//         .product-card-category {
//           color: #6b7280;
//           background: #f3f4f6;
//           padding: 0.25rem 0.5rem;
//           border-radius: 4px;
//         }
        
//         .product-card-stock {
//           font-weight: 500;
//           display: flex;
//           align-items: center;
//           gap: 0.25rem;
//         }
        
//         .product-card-actions {
//           display: flex;
//           gap: 0.5rem;
//         }
        
//         .btn {
//           padding: 0.5rem 0.75rem;
//           border-radius: 6px;
//           font-size: 0.75rem;
//           font-weight: 500;
//           cursor: pointer;
//           border: none;
//           transition: all 0.2s ease;
//           flex: 1;
//         }
        
//         .btn-outline {
//           background: white;
//           border: 1px solid #d1d5db;
//           color: #374151;
//         }
        
//         .btn-outline:hover {
//           background: #f9fafb;
//           border-color: #9ca3af;
//         }
        
//         .btn-primary {
//           background: #3b82f6;
//           color: white;
//         }
        
//         .btn-primary:hover {
//           background: #2563eb;
//         }
        
//         .empty-state {
//           text-align: center;
//           padding: 3rem;
//           color: #6b7280;
//           background: #f9fafb;
//           border-radius: 8px;
//           border: 1px dashed #d1d5db;
//         }
        
//         /* Grid Section */
//         .grid-section {
//           margin-bottom: 1.5rem;
//         }
        
//         .grid-section:last-child {
//           margin-bottom: 0;
//         }
        
//         /* Responsive Styles */
//         @media (max-width: 1024px) {
//           .analytics-grid {
//             grid-template-columns: 1fr;
//           }
          
//           .products-grid {
//             grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
//           }
//         }
        
//         @media (max-width: 768px) {
//           .main-content-wrap {
//             padding: 0.5rem;
//           }
          
//           .content-section {
//             padding: 1rem;
//             margin-bottom: 1rem;
//             border-radius: 8px;
//           }
          
//           .section-header {
//             flex-direction: column;
//             align-items: flex-start;
//             gap: 0.5rem;
//             margin-bottom: 1rem;
//           }
          
//           .section-title {
//             font-size: 1.125rem;
//           }
          
//           .view-all-link {
//             align-self: flex-end;
//           }
          
//           .stats-grid {
//             grid-template-columns: 1fr;
//             gap: 1rem;
//           }
          
//           .products-grid {
//             grid-template-columns: 1fr;
//           }
          
//           .data-table {
//             font-size: 0.75rem;
//           }
          
//           .data-table th,
//           .data-table td {
//             padding: 0.75rem 0.5rem;
//           }
//         }
        
//         @media (max-width: 480px) {
//           .main-content-wrap {
//             padding: 0.25rem;
//           }
          
//           .content-section {
//             padding: 0.75rem;
//             border-radius: 6px;
//             margin-bottom: 0.75rem;
//           }
          
//           .section-title {
//             font-size: 1rem;
//           }
          
//           .product-card {
//             margin: 0 -0.75rem;
//             border-radius: 0;
//             border-left: none;
//             border-right: none;
//           }
          
//           .product-card:first-child {
//             border-top: none;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default MainContent;