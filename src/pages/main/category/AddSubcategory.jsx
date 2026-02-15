import React, { useState } from 'react';
import '../../../styles/CategoryForm.css';
import Header from '../Header';
import Sidebar from '../Sidebar';
import SettingsPanel from '../../../component/SettingsPanel';
import CategoryForm from './CategoryForm';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../../context/alert/AlertContext';

const AddSubcategory = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { showSuccess } = useAlert();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSuccess = (data) => {
    showSuccess(
      'Subcategory created successfully!',
      'Success',
      { duration: 3000 }
    );
    navigate('/admin/categories');
  };

  const handleCancel = () => {
    navigate('/admin/categories');
  };

  return (
    <div className="__variable_9eb1a5 body">
      <div className="menu-style"></div>
      <div className="layout-width"></div>
      
      <div id="wrapper">
        <div id="page">
          <div className="layout-wrap">
            <Sidebar 
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              onClose={closeSidebar}
            />
            <div className="section-content-right">
              <Header
                onToggleSidebar={toggleSidebar}
                onSettingsClick={() => setSettingsOpen(true)} 
              />
              <CategoryForm 
                mode="subcategory"
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default AddSubcategory;