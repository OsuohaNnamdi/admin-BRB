import React, { createContext, useState, useContext, useEffect } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [selectedOrder, setSelectedOrder] = useState(() => {
    // Load from localStorage on initial render
    try {
      const saved = localStorage.getItem('selectedOrder');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading order from localStorage:', error);
      return null;
    }
  });
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Save to localStorage whenever selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      try {
        localStorage.setItem('selectedOrder', JSON.stringify(selectedOrder));
      } catch (error) {
        console.error('Error saving order to localStorage:', error);
      }
    } else {
      localStorage.removeItem('selectedOrder');
    }
  }, [selectedOrder]);

  const selectOrder = (order) => {
    setSelectedOrder(order);
  };

  const clearSelectedOrder = () => {
    setSelectedOrder(null);
  };

  const updateOrders = (newOrders) => {
    setOrders(newOrders);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const addOrder = (newOrder) => {
    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  const removeOrder = (orderId) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    if (selectedOrder && selectedOrder.id === orderId) {
      clearSelectedOrder();
    }
  };

  return (
    <OrderContext.Provider
      value={{
        selectedOrder,
        orders,
        loading,
        selectOrder,
        clearSelectedOrder,
        updateOrders,
        updateOrderStatus,
        addOrder,
        removeOrder,
        setLoading
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};