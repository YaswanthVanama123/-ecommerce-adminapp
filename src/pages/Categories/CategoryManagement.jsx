import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../../api';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChevronRight, faPlus, faEdit, faTrash, faSpinner, faCheck, faSearch, faBox, faTag, faFolderOpen, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!Array.isArray(categories)) {
      setFilteredCategories([]);
      return;
    }

    const filtered = categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();

      // Handle different response structures
      let categoriesData = [];
      if (response.data?.data?.categories) {
        categoriesData = response.data.data.categories;
      } else if (response.data?.categories) {
        categoriesData = response.data.categories;
      } else if (Array.isArray(response.data?.data)) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }

      // Ensure it's an array
      if (!Array.isArray(categoriesData)) {
        console.warn('Categories data is not an array:', categoriesData);
        categoriesData = [];
      }

      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    reset({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoriesAPI.delete(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, data);
        toast.success('Category updated successfully');
      } else {
        await categoriesAPI.create(data);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
      reset();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        transition: 'opacity 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          {/* FontAwesome Spinner Icon */}
          <i className="fas fa-spinner fa-spin" style={{
            fontSize: '3.5rem',
            color: 'white',
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))'
          }}></i>

          {/* Loading Text with Animation */}
          <div style={{
            textAlign: 'center'
          }}>
            <p style={{
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: '600',
              letterSpacing: '0.025em',
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>Loading Categories</p>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.938rem',
              fontWeight: '400',
              margin: 0,
              letterSpacing: '0.01em'
            }}>Please wait while we fetch your data...</p>
          </div>

          {/* Progress Dots */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-management-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div className="category-content" style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" style={{
          marginBottom: '1.5rem',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <ol style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            fontSize: '0.938rem',
            fontWeight: '500'
          }}>
            <li>
              <a
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <FontAwesomeIcon icon={faHome} style={{ fontSize: '1rem' }} />
                <span>Home</span>
              </a>
            </li>
            <li>
              <FontAwesomeIcon
                icon={faChevronRight}
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.75rem'
                }}
              />
            </li>
            <li>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                Categories
              </span>
            </li>
          </ol>
        </nav>

        {/* Professional Header */}
        <div className="header-card" style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div className="header-content" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <h1 className="page-title" style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em'
              }}>Category Management</h1>
              <p className="page-subtitle" style={{
                color: '#6b7280',
                fontSize: '1rem',
                fontWeight: '400'
              }}>
                Organize and manage your product categories
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="add-button"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add New Category
            </button>
          </div>

          {/* Stats Section */}
          <div className="stats-section" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#667eea',
                marginBottom: '0.25rem'
              }}>
                {searchTerm ? filteredCategories.length : categories.length}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {searchTerm ? 'Filtered Categories' : 'Total Categories'}
              </div>
            </div>
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#764ba2',
                marginBottom: '0.25rem'
              }}>
                {categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Total Products
              </div>
            </div>
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#10b981',
                marginBottom: '0.25rem'
              }}>
                {categories.filter(cat => (cat.productCount || 0) > 0).length}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Active Categories
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon
              icon={faSearch}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                pointerEvents: 'none',
                fontSize: '1.125rem'
              }}
            />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: '#f9fafb',
                color: '#1f2937',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {searchTerm && (
            <div style={{
              marginTop: '1rem',
              fontSize: '0.9375rem',
              color: '#64748b',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: '#667eea' }} />
              <span>
                Showing <strong>{filteredCategories.length}</strong> of <strong>{categories.length}</strong> {filteredCategories.length === 1 ? 'category' : 'categories'}
              </span>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="empty-state" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '64px 24px',
            textAlign: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
            animation: 'fadeInScale 0.5s ease-out'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              marginBottom: '24px',
              animation: 'scaleIn 0.6s ease-out 0.2s backwards'
            }}>
              <FontAwesomeIcon icon={faFolderOpen} style={{
                fontSize: '40px',
                color: '#94a3b8'
              }} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 12px 0',
              letterSpacing: '-0.025em'
            }}>{searchTerm ? 'No categories found' : 'No categories yet'}</h3>
            <p style={{
              color: '#64748b',
              fontSize: '15px',
              margin: '0 0 32px 0',
              lineHeight: '1.5'
            }}>{searchTerm
                ? `No categories match your search "${searchTerm}"`
                : 'Get started by creating your first category'
              }</p>
            {!searchTerm && (
              <button
                onClick={handleAdd}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add Your First Category
              </button>
            )}
          </div>
        ) : (
          <div className="categories-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredCategories.map((category, index) => (
              <div
                key={category._id}
                className="category-card"
                style={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Decorative gradient bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                }}></div>

                {/* Category Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <div style={{
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.75rem',
                    lineHeight: '1.3'
                  }}>{category.name}</h3>

                  {category.description && (
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.9375rem',
                      lineHeight: '1.6',
                      marginBottom: '1rem'
                    }}>{category.description}</p>
                  )}

                  {/* Product Count Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#667eea'
                  }}>
                    <FontAwesomeIcon icon={faTag} />
                    {category.productCount || 0} Products
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons" style={{
                  display: 'flex',
                  gap: '0.75rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    onClick={() => handleEdit(category)}
                    style={{
                      flex: 1,
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.813rem',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      minHeight: '44px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    style={{
                      flex: 1,
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.813rem',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      minHeight: '44px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div
            className="modal-overlay"
            style={{
              position: 'fixed',
              inset: '0',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: '1000',
              padding: '1rem',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="modal-content"
              style={{
                background: 'white',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '540px',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
                animation: 'slideUp 0.3s ease-out',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2rem',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative circles */}
                <div style={{
                  position: 'absolute',
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  top: '-50px',
                  right: '-50px'
                }}></div>
                <div style={{
                  position: 'absolute',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  bottom: '-30px',
                  left: '-30px'
                }}></div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '1.75rem',
                      fontWeight: '700',
                      color: 'white',
                      marginBottom: '0.25rem'
                    }}>
                      {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </h2>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9375rem'
                    }}>
                      {editingCategory ? 'Update category details below' : 'Fill in the details to create a new category'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      fontWeight: '300'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'rotate(0deg)';
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit(onSubmit)} style={{
                padding: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.75rem'
                }}>
                  {/* Category Name Input */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.75rem'
                    }}>
                      Category Name
                      <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Category name is required' })}
                      placeholder="e.g., Electronics, Fashion, Home & Garden"
                      style={{
                        width: '100%',
                        padding: '1rem 1.25rem',
                        border: errors.name ? '2px solid #ef4444' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: '#f9fafb',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        if (!errors.name) {
                          e.target.style.borderColor = '#e5e7eb';
                        }
                        e.target.style.background = '#f9fafb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {errors.name && (
                      <p style={{
                        marginTop: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <span>⚠️</span>
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Description Textarea */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.75rem'
                    }}>
                      Description
                      <span style={{
                        color: '#9ca3af',
                        fontWeight: '400',
                        fontSize: '0.875rem',
                        marginLeft: '0.5rem'
                      }}>(Optional)</span>
                    </label>
                    <textarea
                      {...register('description')}
                      rows="4"
                      placeholder="Describe what products belong in this category..."
                      style={{
                        width: '100%',
                        padding: '1rem 1.25rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        resize: 'vertical',
                        background: '#f9fafb',
                        fontFamily: 'inherit',
                        lineHeight: '1.6'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.background = '#f9fafb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    paddingTop: '1rem'
                  }}>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSubmitting}
                      style={{
                        flex: 1,
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        opacity: isSubmitting ? 0.5 : 1,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.background = '#e5e7eb')}
                      onMouseOut={(e) => !isSubmitting && (e.currentTarget.style.background = '#f3f4f6')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        flex: 1,
                        background: isSubmitting
                          ? '#9ca3af'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        boxShadow: isSubmitting
                          ? 'none'
                          : '0 8px 20px rgba(102, 126, 234, 0.4)',
                        transform: 'translateY(0)'
                      }}
                      onMouseOver={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.5)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                        }
                      }}
                    >
                      {isSubmitting
                        ? <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</>
                        : editingCategory
                        ? <><FontAwesomeIcon icon={faCheck} /> Update Category</>
                        : <><FontAwesomeIcon icon={faPlus} /> Create Category</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Custom scrollbar for modal */
        div::-webkit-scrollbar {
          width: 8px;
        }

        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5568d3 0%, #6a4190 100%);
        }

        /* Tablet Breakpoint */
        @media (max-width: 1024px) {
          .category-management-container {
            padding: 1.5rem !important;
          }

          .header-card {
            padding: 2rem !important;
          }

          .page-title {
            font-size: 2rem !important;
          }

          .categories-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
          }

          .stats-section {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
          }
        }

        /* Mobile Breakpoint */
        @media (max-width: 768px) {
          .category-management-container {
            padding: 1rem !important;
          }

          .category-content {
            padding: 0 !important;
          }

          /* Breadcrumb Mobile Styles */
          .breadcrumb-nav {
            margin-bottom: 1rem !important;
          }

          .breadcrumb-nav ol {
            font-size: 0.813rem !important;
          }

          .breadcrumb-nav li a,
          .breadcrumb-nav li span {
            padding: 0.375rem 0.625rem !important;
            font-size: 0.813rem !important;
          }

          .breadcrumb-nav li a span {
            display: none !important;
          }

          .breadcrumb-nav li:last-child span {
            display: inline !important;
          }

          .header-card {
            padding: 1.5rem !important;
            border-radius: 16px !important;
            margin-bottom: 1.5rem !important;
          }

          .header-content {
            gap: 1rem !important;
          }

          .page-title {
            font-size: 1.75rem !important;
          }

          .page-subtitle {
            font-size: 0.9375rem !important;
          }

          .add-button {
            width: 100%;
            justify-content: center !important;
            padding: 0.875rem 1.5rem !important;
            font-size: 0.9375rem !important;
          }

          .stats-section {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
            margin-top: 1.5rem !important;
            padding-top: 1.5rem !important;
          }

          .categories-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }

          .category-card {
            padding: 1.5rem !important;
          }

          .category-card h3 {
            font-size: 1.25rem !important;
          }

          .action-buttons {
            flex-direction: column !important;
            gap: 0.625rem !important;
          }

          .action-buttons button {
            width: 100% !important;
            justify-content: center !important;
          }

          .empty-state {
            padding: 3rem 1.5rem !important;
            border-radius: 16px !important;
          }

          .empty-state h3 {
            font-size: 1.25rem !important;
          }

          .empty-state p {
            font-size: 0.9375rem !important;
          }

          .modal-overlay {
            padding: 0.5rem !important;
          }

          .modal-content {
            border-radius: 20px !important;
            max-height: 95vh !important;
          }

          .modal-content > div:first-child {
            padding: 1.5rem !important;
            border-top-left-radius: 20px !important;
            border-top-right-radius: 20px !important;
          }

          .modal-content > div:first-child h2 {
            font-size: 1.5rem !important;
          }

          .modal-content form {
            padding: 1.5rem !important;
          }

          .modal-content input,
          .modal-content textarea {
            font-size: 0.9375rem !important;
            padding: 0.875rem 1rem !important;
          }

          .modal-content button {
            padding: 0.875rem 1.25rem !important;
            font-size: 0.9375rem !important;
          }
        }

        /* Small Mobile Breakpoint */
        @media (max-width: 480px) {
          .category-management-container {
            padding: 0.75rem !important;
          }

          /* Breadcrumb Small Mobile Styles */
          .breadcrumb-nav {
            margin-bottom: 0.75rem !important;
          }

          .breadcrumb-nav ol {
            font-size: 0.75rem !important;
            gap: 0.375rem !important;
          }

          .breadcrumb-nav li a,
          .breadcrumb-nav li span {
            padding: 0.313rem 0.5rem !important;
            font-size: 0.75rem !important;
          }

          .header-card {
            padding: 1.25rem !important;
          }

          .page-title {
            font-size: 1.5rem !important;
          }

          .page-subtitle {
            font-size: 0.875rem !important;
          }

          .add-button {
            padding: 0.75rem 1.25rem !important;
            font-size: 0.875rem !important;
          }

          .add-button span {
            font-size: 1.125rem !important;
          }

          .stats-section {
            gap: 0.875rem !important;
          }

          .stats-section > div > div:first-child {
            font-size: 1.75rem !important;
          }

          .stats-section > div > div:last-child {
            font-size: 0.813rem !important;
          }

          .categories-grid {
            gap: 1rem !important;
          }

          .category-card {
            padding: 1.25rem !important;
          }

          .category-card > div:first-child {
            width: 50px !important;
            height: 50px !important;
            font-size: 1.5rem !important;
            margin-bottom: 1.25rem !important;
          }

          .category-card h3 {
            font-size: 1.125rem !important;
          }

          .category-card p {
            font-size: 0.875rem !important;
          }

          .action-buttons button {
            padding: 0.625rem 0.875rem !important;
            font-size: 0.813rem !important;
          }

          .empty-state {
            padding: 2.5rem 1rem !important;
          }

          .empty-state > div:first-child {
            font-size: 3rem !important;
          }

          .empty-state h3 {
            font-size: 1.125rem !important;
          }

          .modal-content > div:first-child h2 {
            font-size: 1.25rem !important;
          }

          .modal-content > div:first-child p {
            font-size: 0.875rem !important;
          }

          .modal-content form {
            padding: 1.25rem !important;
          }

          .modal-content label {
            font-size: 0.875rem !important;
          }

          .modal-content input,
          .modal-content textarea {
            font-size: 0.875rem !important;
            padding: 0.75rem 0.875rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryManagement;
