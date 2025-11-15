// components/SettingsPanel.js
import React, { useState } from 'react';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('theme-style');

  if (!isOpen) return null;

  return (
    <div className="offcanvas offcanvas-end show" tabIndex="-1" style={{ visibility: 'visible' }} aria-modal="true" role="dialog">
      <div className="offcanvas-header">
        <h6 id="offcanvasRightLabel">Setting</h6>
        <button type="button" className="btn-close text-reset" onClick={onClose}></button>
      </div>
      <div className="offcanvas-body">
        <div className="widget-tabs">
          <ul className="widget-menu-tab style-1">
            <li className={`item-title ${activeTab === 'theme-style' ? 'active' : ''}`}>
              <span className="inner" onClick={() => setActiveTab('theme-style')}>
                <div className="body-title">Theme Style</div>
              </span>
            </li>
            <li className={`item-title ${activeTab === 'theme-colors' ? 'active' : ''}`}>
              <span className="inner" onClick={() => setActiveTab('theme-colors')}>
                <div className="body-title">Theme Colors</div>
              </span>
            </li>
          </ul>
          
          <div className="widget-content-tab">
            {activeTab === 'theme-style' && (
              <div className="widget-content-inner active">
                <form className="form-theme-style">
                  {/* Theme style settings would go here */}
                  <fieldset className="theme-dark-light">
                    <div className="body-title mb-5">Theme color mode:</div>
                    {/* Settings content */}
                  </fieldset>
                  <div className="tf-button cursor-pointer w-full button-clear-select">Clear all</div>
                </form>
              </div>
            )}
            
            {activeTab === 'theme-colors' && (
              <div className="widget-content-inner">
                <form className="form-theme-color">
                  {/* Theme color settings would go here */}
                  <div className="tf-button cursor-pointer w-full button-clear-select">Clear all</div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;