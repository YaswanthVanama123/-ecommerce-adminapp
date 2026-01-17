import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { categoriesAPI } from '../../api';
import { toast } from 'react-toastify';

const ProductForm = ({ onSubmit, initialData, isLoading }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData || {
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      stock: '',
      images: '',
      sizes: '',
      colors: '',
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      // Helper function to convert array of objects or strings to comma-separated string
      const arrayToString = (arr) => {
        if (!arr || !Array.isArray(arr)) return '';
        return arr.map(item => {
          if (typeof item === 'object' && item !== null) {
            return item.name || item.label || item.value || JSON.stringify(item);
          }
          return String(item);
        }).join(', ');
      };

      reset({
        ...initialData,
        images: arrayToString(initialData.images),
        sizes: arrayToString(initialData.sizes),
        colors: arrayToString(initialData.colors),
      });
    }
  }, [initialData, reset]);

  const fetchCategories = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleFormSubmit = (data) => {
    // Convert comma-separated strings to arrays
    const formattedData = {
      ...data,
      price: parseFloat(data.price),
      stock: parseInt(data.stock, 10),
      images: data.images ? data.images.split(',').map((img) => img.trim()) : [],
      sizes: data.sizes ? data.sizes.split(',').map((size) => size.trim()) : [],
      colors: data.colors ? data.colors.split(',').map((color) => color.trim()) : [],
    };

    onSubmit(formattedData);
  };

  // Styles
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 20px 0',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const sectionIconStyle = {
    width: '24px',
    height: '24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  };

  const fieldContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const labelContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    letterSpacing: '0.3px',
  };

  const requiredBadgeStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '2px 8px',
    borderRadius: '6px',
  };

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#1f2937',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: '#ffffff',
    fontFamily: 'inherit',
  };

  const inputErrorStyle = {
    ...inputStyle,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%236B7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    paddingRight: '40px',
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: '100px',
    lineHeight: '1.6',
  };

  const errorMessageStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#dc2626',
    fontWeight: '500',
    marginTop: '4px',
  };

  const helpTextStyle = {
    fontSize: '13px',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: '4px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    paddingTop: '24px',
    borderTop: '2px solid #e5e7eb',
    marginTop: '8px',
  };

  const submitButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.3), 0 2px 4px -1px rgba(102, 126, 234, 0.2)',
    minWidth: '180px',
  };

  const submitButtonDisabledStyle = {
    ...submitButtonStyle,
    background: '#9ca3af',
    cursor: 'not-allowed',
    boxShadow: 'none',
    opacity: '0.6',
  };

  const fullWidthStyle = {
    gridColumn: '1 / -1',
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={formStyle}>
      {/* Basic Information Section */}
      <div>
        <h2 style={sectionTitleStyle}>
          <span style={sectionIconStyle}>1</span>
          Basic Information
        </h2>
        <div style={gridStyle}>
          {/* Product Name */}
          <div style={fieldContainerStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Product Name</label>
              <span style={requiredBadgeStyle}>Required</span>
            </div>
            <div style={inputWrapperStyle}>
              <input
                type="text"
                {...register('name', { required: 'Product name is required' })}
                style={errors.name ? inputErrorStyle : inputStyle}
                placeholder="Enter product name"
                onFocus={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            </div>
            {errors.name && (
              <div style={errorMessageStyle}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4a1 1 0 012 0v4a1 1 0 01-2 0V4zm1 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                {errors.name.message}
              </div>
            )}
          </div>

          {/* Brand */}
          <div style={fieldContainerStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Brand</label>
            </div>
            <div style={inputWrapperStyle}>
              <input
                type="text"
                {...register('brand')}
                style={inputStyle}
                placeholder="Enter brand name"
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Category */}
          <div style={fieldContainerStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Category</label>
              <span style={requiredBadgeStyle}>Required</span>
            </div>
            <div style={inputWrapperStyle}>
              <select
                {...register('category', { required: 'Category is required' })}
                style={errors.category ? { ...selectStyle, ...inputErrorStyle } : selectStyle}
                disabled={loadingCategories}
                onFocus={(e) => {
                  if (!errors.category) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.category) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <div style={errorMessageStyle}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4a1 1 0 012 0v4a1 1 0 01-2 0V4zm1 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                {errors.category.message}
              </div>
            )}
          </div>

          {/* Description - Full Width */}
          <div style={{ ...fieldContainerStyle, ...fullWidthStyle }}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Description</label>
              <span style={requiredBadgeStyle}>Required</span>
            </div>
            <textarea
              {...register('description', { required: 'Description is required' })}
              style={errors.description ? { ...textareaStyle, ...inputErrorStyle } : textareaStyle}
              placeholder="Enter detailed product description"
              onFocus={(e) => {
                if (!errors.description) {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!errors.description) {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {errors.description && (
              <div style={errorMessageStyle}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4a1 1 0 012 0v4a1 1 0 01-2 0V4zm1 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                {errors.description.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & Inventory Section */}
      <div>
        <h2 style={sectionTitleStyle}>
          <span style={sectionIconStyle}>2</span>
          Pricing & Inventory
        </h2>
        <div style={gridStyle}>
          {/* Price */}
          <div style={fieldContainerStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Price</label>
              <span style={requiredBadgeStyle}>Required</span>
            </div>
            <div style={inputWrapperStyle}>
              <input
                type="number"
                step="0.01"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' },
                })}
                style={errors.price ? inputErrorStyle : inputStyle}
                placeholder="0.00"
                onFocus={(e) => {
                  if (!errors.price) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.price) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            </div>
            {errors.price && (
              <div style={errorMessageStyle}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4a1 1 0 012 0v4a1 1 0 01-2 0V4zm1 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                {errors.price.message}
              </div>
            )}
          </div>

          {/* Stock */}
          <div style={fieldContainerStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Stock Quantity</label>
              <span style={requiredBadgeStyle}>Required</span>
            </div>
            <div style={inputWrapperStyle}>
              <input
                type="number"
                {...register('stock', {
                  required: 'Stock is required',
                  min: { value: 0, message: 'Stock must be non-negative' },
                })}
                style={errors.stock ? inputErrorStyle : inputStyle}
                placeholder="0"
                onFocus={(e) => {
                  if (!errors.stock) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.stock) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            </div>
            {errors.stock && (
              <div style={errorMessageStyle}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4a1 1 0 012 0v4a1 1 0 01-2 0V4zm1 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                {errors.stock.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Variants Section */}
      <div>
        <h2 style={sectionTitleStyle}>
          <span style={sectionIconStyle}>3</span>
          Product Variants
        </h2>
        <div style={gridStyle}>
          {/* Sizes */}
          <div style={fieldContainerStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Available Sizes</label>
            </div>
            <div style={inputWrapperStyle}>
              <input
                type="text"
                {...register('sizes')}
                style={inputStyle}
                placeholder="S, M, L, XL"
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <p style={helpTextStyle}>Example: S, M, L, XL or 6, 7, 8, 9, 10</p>
          </div>

          {/* Colors */}
          <div style={fieldContainerStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Available Colors</label>
            </div>
            <div style={inputWrapperStyle}>
              <input
                type="text"
                {...register('colors')}
                style={inputStyle}
                placeholder="Red, Blue, Green"
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <p style={helpTextStyle}>Example: Red, Blue, Green, Black</p>
          </div>
        </div>
      </div>

      {/* Media Section */}
      <div>
        <h2 style={sectionTitleStyle}>
          <span style={sectionIconStyle}>4</span>
          Product Media
        </h2>
        <div style={gridStyle}>
          {/* Images - Full Width */}
          <div style={{ ...fieldContainerStyle, ...fullWidthStyle }}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Image URLs</label>
            </div>
            <textarea
              {...register('images')}
              style={textareaStyle}
              rows="3"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={helpTextStyle}>Enter full image URLs separated by commas</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={buttonContainerStyle}>
        <button
          type="submit"
          disabled={isLoading}
          style={isLoading ? submitButtonDisabledStyle : submitButtonStyle}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 15px -3px rgba(102, 126, 234, 0.4), 0 4px 6px -2px rgba(102, 126, 234, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(102, 126, 234, 0.3), 0 2px 4px -1px rgba(102, 126, 234, 0.2)';
            }
          }}
        >
          {isLoading ? (
            <>
              <svg
                style={{ animation: 'spin 1s linear infinite' }}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <style>
                  {`@keyframes spin { to { transform: rotate(360deg); } }`}
                </style>
                <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="4" strokeLinecap="round" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L13 8.586V5h3a2 2 0 012 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2h3v3.586L9.707 7.293zM11 3a1 1 0 112 0v2h-2V3z" />
                <path d="M4 9a2 2 0 00-2 2v5a2 2 0 002 2h8a2 2 0 002-2H4V9z" />
              </svg>
              {initialData ? 'Update Product' : 'Create Product'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
