import React, { useState, useEffect } from 'react';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponStatistics
} from '../api/couponApi';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minPurchase: 0,
    maxDiscount: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    isActive: true,
    description: ''
  });

  useEffect(() => {
    fetchCoupons();
    fetchStatistics();
  }, [searchTerm, statusFilter, typeFilter, sortBy]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        sort: sortBy
      };
      const response = await getAllCoupons(filters);
      setCoupons(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getCouponStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const couponData = {
        ...formData,
        value: parseFloat(formData.value),
        minPurchase: parseFloat(formData.minPurchase) || 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, couponData);
        setSuccess('Coupon updated successfully');
      } else {
        await createCoupon(couponData);
        setSuccess('Coupon created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchCoupons();
      fetchStatistics();
    } catch (err) {
      setError(err.message || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || '',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validTo: coupon.validTo ? new Date(coupon.validTo).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive,
      description: coupon.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await deleteCoupon(id);
      setSuccess('Coupon deleted successfully');
      fetchCoupons();
      fetchStatistics();
    } catch (err) {
      setError(err.message || 'Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleCouponStatus(id);
      setSuccess('Coupon status updated successfully');
      fetchCoupons();
      fetchStatistics();
    } catch (err) {
      setError(err.message || 'Failed to toggle coupon status');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minPurchase: 0,
      maxDiscount: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
      isActive: true,
      description: ''
    });
    setEditingCoupon(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const isExpired = (validTo) => {
    return new Date(validTo) < new Date();
  };

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#fef2f2',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#ec4899',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #fce7f3'
    },
    statLabel: {
      fontSize: '14px',
      color: '#9ca3af',
      marginBottom: '8px'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#ec4899'
    },
    toolbar: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #fce7f3'
    },
    toolbarRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center'
    },
    input: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #fce7f3',
      fontSize: '14px',
      outline: 'none',
      flex: '1',
      minWidth: '200px'
    },
    select: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #fce7f3',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: '#ec4899',
      color: 'white'
    },
    buttonSecondary: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: '1px solid #ec4899',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: 'white',
      color: '#ec4899'
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      border: '1px solid #fce7f3'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      padding: '16px',
      textAlign: 'left',
      backgroundColor: '#fce7f3',
      color: '#ec4899',
      fontWeight: '600',
      fontSize: '14px',
      borderBottom: '2px solid #fbcfe8'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #fce7f3',
      fontSize: '14px',
      color: '#374151'
    },
    badge: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-block'
    },
    badgeActive: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    badgeInactive: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    badgeExpired: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    actionButton: {
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      marginRight: '8px',
      transition: 'all 0.2s'
    },
    editButton: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    deleteButton: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    toggleButton: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
    },
    modalHeader: {
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '2px solid #fce7f3'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ec4899'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    formInput: {
      width: '100%',
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #fce7f3',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #fce7f3',
      fontSize: '14px',
      outline: 'none',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
      justifyContent: 'flex-end'
    },
    alert: {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '16px',
      fontSize: '14px'
    },
    alertSuccess: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    alertError: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#9ca3af'
    },
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    emptyStateText: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Coupon Management</h1>
        <p style={styles.subtitle}>Create and manage promotional coupons for your store</p>
      </div>

      {success && (
        <div style={{ ...styles.alert, ...styles.alertSuccess }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ ...styles.alert, ...styles.alertError }}>
          {error}
        </div>
      )}

      {statistics && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Coupons</div>
            <div style={styles.statValue}>{statistics.totalCoupons}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active Coupons</div>
            <div style={styles.statValue}>{statistics.activeCoupons}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Expired Coupons</div>
            <div style={styles.statValue}>{statistics.expiredCoupons}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Usage</div>
            <div style={styles.statValue}>{statistics.totalUsage}</div>
          </div>
        </div>
      )}

      <div style={styles.toolbar}>
        <div style={styles.toolbarRow}>
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.select}
          >
            <option value="createdAt">Sort by Date</option>
            <option value="code">Sort by Code</option>
            <option value="usedCount">Sort by Usage</option>
            <option value="validTo">Sort by Expiry</option>
          </select>
          <button
            onClick={handleAddNew}
            style={styles.button}
          >
            + New Coupon
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>⏳</div>
            <div style={styles.emptyStateText}>Loading coupons...</div>
          </div>
        ) : coupons.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>📋</div>
            <div style={styles.emptyStateText}>No coupons found</div>
            <p style={{ color: '#9ca3af' }}>Create your first coupon to get started</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Value</th>
                <th style={styles.th}>Usage</th>
                <th style={styles.th}>Valid Period</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td style={styles.td}>
                    <strong>{coupon.code}</strong>
                    {coupon.description && (
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                        {coupon.description}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: coupon.type === 'percentage' ? '#dbeafe' : '#fef3c7',
                      color: coupon.type === 'percentage' ? '#1e40af' : '#92400e'
                    }}>
                      {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                    {coupon.maxDiscount && (
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Max: ${coupon.maxDiscount}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '12px' }}>
                      <div>{new Date(coupon.validFrom).toLocaleDateString()}</div>
                      <div style={{ color: '#9ca3af' }}>to</div>
                      <div>{new Date(coupon.validTo).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(isExpired(coupon.validTo)
                        ? styles.badgeExpired
                        : coupon.isActive
                        ? styles.badgeActive
                        : styles.badgeInactive)
                    }}>
                      {isExpired(coupon.validTo) ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleEdit(coupon)}
                      style={{ ...styles.actionButton, ...styles.editButton }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(coupon._id)}
                      style={{ ...styles.actionButton, ...styles.toggleButton }}
                    >
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  style={styles.formInput}
                  placeholder="e.g., SAVE20"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  style={styles.formInput}
                >
                  <option value="percentage">Percentage Discount</option>
                  <option value="fixed">Fixed Amount Discount</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {formData.type === 'percentage' ? 'Percentage Value (%)' : 'Fixed Amount ($)'} *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
                  step="0.01"
                  style={styles.formInput}
                  placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Minimum Purchase Amount ($)</label>
                <input
                  type="number"
                  name="minPurchase"
                  value={formData.minPurchase}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  style={styles.formInput}
                  placeholder="0"
                />
              </div>

              {formData.type === 'percentage' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Maximum Discount Amount ($)</label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    style={styles.formInput}
                    placeholder="Leave empty for no limit"
                  />
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Valid From *</label>
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  required
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Valid To *</label>
                <input
                  type="date"
                  name="validTo"
                  value={formData.validTo}
                  onChange={handleInputChange}
                  required
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Usage Limit</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  min="0"
                  style={styles.formInput}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Optional description for internal use"
                />
              </div>

              <div style={styles.formGroup}>
                <div style={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                    id="isActive"
                  />
                  <label htmlFor="isActive" style={{ ...styles.label, marginBottom: 0 }}>
                    Active
                  </label>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={styles.buttonSecondary}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.button}>
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
