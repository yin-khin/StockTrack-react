// src/pages/setup/SystemSetup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import axios from '../../api/axios';

const SystemSetup = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/setup/status');
      setStatus(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check setup status');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setInitializing(true);
      setError('');
      setSuccess('');
      
      const response = await axios.post('/api/setup/init');
      
      setSuccess(response.data.message || 'System initialized successfully!');
      setTimeout(() => {
        checkStatus();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize system');
    } finally {
      setInitializing(false);
    }
  };

  const handleEnsureUserRole = async () => {
    try {
      setInitializing(true);
      setError('');
      setSuccess('');
      
      const response = await axios.post('/api/setup/ensure-user-role');
      
      setSuccess(response.data.message || 'USER role created successfully!');
      setTimeout(() => {
        checkStatus();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create USER role');
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              System Setup
            </h1>
            <p className="text-gray-600">
              Initialize roles and permissions for the Inventory Management System
            </p>
          </div>

          {/* Status Card */}
          {status && (
            <div className={`mb-6 p-6 rounded-lg border-2 ${
              status.initialized 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start">
                {status.initialized ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    status.initialized ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {status.initialized ? 'System Initialized' : 'System Not Initialized'}
                  </h3>
                  <p className={`text-sm ${
                    status.initialized ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {status.message}
                  </p>
                  {status.initialized && (
                    <div className="mt-3 text-sm text-green-700">
                      <p>Roles: {status.roleCount}</p>
                      <p>Permissions: {status.permissionCount}</p>
                      <p>USER Role: {status.userRoleExists ? '✓ Exists' : '✗ Missing'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            {!status?.initialized ? (
              <>
                <button
                  onClick={handleInitialize}
                  disabled={initializing}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {initializing ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Settings className="h-5 w-5 mr-2" />
                      Initialize System (Create All Roles & Permissions)
                    </>
                  )}
                </button>

                <button
                  onClick={handleEnsureUserRole}
                  disabled={initializing}
                  className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {initializing ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Quick Fix: Create USER Role Only'
                  )}
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">System is already initialized.</p>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                >
                  Go to Registration
                </button>
              </div>
            )}

            <button
              onClick={checkStatus}
              disabled={loading || initializing}
              className="w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Refresh Status
            </button>
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What does initialization do?</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Creates 6 roles: ADMIN, MANAGER, INVENTORY, SALE, CASHIER, USER</li>
              <li>Creates all permissions for each module</li>
              <li>Assigns permissions to each role based on their access level</li>
              <li>Sets up the complete role-based access control system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSetup;
