import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage, faSpinner, faCheck, faTimes, faCalendar,
  faPercentage, faArrowUpRightFromSquare, faStar, faToggleOn
} from '@fortawesome/free-solid-svg-icons';
import { categoriesAPI, productsAPI } from '../../api';

const BannerForm = ({ banner, onSubmit, onCancel, isSubmitting }) => {
  const [imagePreview, setImagePreview] = useState(banner?.image || '');
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: banner || {
      title: '',
      subtitle: '',
      description: '',
      buttonText: '',
      buttonLink: '',
      type: 'flash-sale',
      position: 'hero',
      discountPercentage: 0,
      validFrom: '',
      validTo: '',
      priority: 1,
      isActive: true,
      categoryFilters: [],
      productFilters: [],
    }
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [categoriesRes, productsRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll()
      ]);

      let categoriesData = categoriesRes.data?.data || categoriesRes.data || [];
      if (categoriesData.categories) categoriesData = categoriesData.categories;

      let productsData = productsRes.data?.data || productsRes.data || [];
      if (productsData.products) productsData = productsData.products;

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      imageFile,
      imagePreview,
    };
    onSubmit(formData);
  };

  const bannerTypes = [
    { value: 'flash-sale', label: 'Flash Sale' },
    { value: 'seasonal', label: 'Seasonal Offer' },
    { value: 'new-arrival', label: 'New Arrival' },
    { value: 'clearance', label: 'Clearance' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'featured', label: 'Featured' },
  ];

  const positions = [
    { value: 'hero', label: 'Hero Banner' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'grid', label: 'Grid Banner' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'popup', label: 'Popup' },
  ];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      {/* Image Upload Section */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.9375rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.75rem'
        }}>
          Banner Image
          <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
        </label>

        {imagePreview ? (
          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid #e5e7eb',
            marginBottom: '1rem'
          }}>
            <img
              src={imagePreview}
              alt="Banner preview"
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover'
              }}
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview('');
                setImageFile(null);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
              Remove
            </button>
          </div>
        ) : (
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            border: '2px dashed #d1d5db',
            borderRadius: '12px',
            backgroundColor: '#f9fafb',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}>
            <FontAwesomeIcon icon={faImage} style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '1rem' }} />
            <span style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
              Click to upload banner image
            </span>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              PNG, JPG up to 5MB
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {/* Title & Subtitle Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Title
            <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
          </label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            placeholder="e.g., Summer Sale"
            style={{
              width: '100%',
              padding: '1rem',
              border: errors.title ? '2px solid #ef4444' : '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              if (!errors.title) e.target.style.borderColor = '#667eea';
            }}
            onBlur={(e) => {
              if (!errors.title) e.target.style.borderColor = '#e5e7eb';
            }}
          />
          {errors.title && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#ef4444' }}>
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Subtitle
          </label>
          <input
            type="text"
            {...register('subtitle')}
            placeholder="e.g., Up to 50% Off"
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.9375rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.75rem'
        }}>
          Description
        </label>
        <textarea
          {...register('description')}
          rows="3"
          placeholder="Describe the offer or promotion..."
          style={{
            width: '100%',
            padding: '1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      {/* Button Text & Link Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Button Text
          </label>
          <input
            type="text"
            {...register('buttonText')}
            placeholder="e.g., Shop Now"
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Button Link
          </label>
          <input
            type="text"
            {...register('buttonLink')}
            placeholder="e.g., /products/sale"
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>

      {/* Type & Position Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Banner Type
            <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
          </label>
          <select
            {...register('type', { required: 'Type is required' })}
            style={{
              width: '100%',
              padding: '1rem',
              border: errors.type ? '2px solid #ef4444' : '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
            onFocus={(e) => {
              if (!errors.type) e.target.style.borderColor = '#667eea';
            }}
            onBlur={(e) => {
              if (!errors.type) e.target.style.borderColor = '#e5e7eb';
            }}
          >
            {bannerTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Position
            <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
          </label>
          <select
            {...register('position', { required: 'Position is required' })}
            style={{
              width: '100%',
              padding: '1rem',
              border: errors.position ? '2px solid #ef4444' : '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
            onFocus={(e) => {
              if (!errors.position) e.target.style.borderColor = '#667eea';
            }}
            onBlur={(e) => {
              if (!errors.position) e.target.style.borderColor = '#e5e7eb';
            }}
          >
            {positions.map(pos => (
              <option key={pos.value} value={pos.value}>{pos.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Discount & Priority Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            <FontAwesomeIcon icon={faPercentage} style={{ marginRight: '0.5rem' }} />
            Discount Percentage
          </label>
          <input
            type="number"
            {...register('discountPercentage', { min: 0, max: 100 })}
            placeholder="0"
            min="0"
            max="100"
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            <FontAwesomeIcon icon={faStar} style={{ marginRight: '0.5rem' }} />
            Priority
          </label>
          <input
            type="number"
            {...register('priority', { min: 1 })}
            placeholder="1"
            min="1"
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>

      {/* Date Range Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '0.5rem' }} />
            Valid From
          </label>
          <input
            type="datetime-local"
            {...register('validFrom')}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '0.5rem' }} />
            Valid To
          </label>
          <input
            type="datetime-local"
            {...register('validTo')}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>

      {/* Active Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <input
          type="checkbox"
          {...register('isActive')}
          id="isActive"
          style={{
            width: '20px',
            height: '20px',
            cursor: 'pointer'
          }}
        />
        <label htmlFor="isActive" style={{
          fontSize: '0.9375rem',
          fontWeight: '600',
          color: '#374151',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <FontAwesomeIcon icon={faToggleOn} style={{ marginRight: '0.5rem', color: '#667eea' }} />
          Active Banner
        </label>
      </div>

      {/* Optional Filters */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '1rem'
        }}>
          Optional Filters
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.5rem'
            }}>
              Category Filters
            </label>
            <select
              {...register('categoryFilters')}
              multiple
              disabled={loadingOptions}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                minHeight: '100px'
              }}
            >
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '0.5rem'
            }}>
              Product Filters
            </label>
            <select
              {...register('productFilters')}
              multiple
              disabled={loadingOptions}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                minHeight: '100px'
              }}
            >
              {products.map(prod => (
                <option key={prod._id} value={prod._id}>{prod.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        paddingTop: '1rem',
        borderTop: '2px solid #e5e7eb'
      }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          style={{
            flex: 1,
            background: '#f3f4f6',
            color: '#374151',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            opacity: isSubmitting ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.background = '#e5e7eb')}
          onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.background = '#f3f4f6')}
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
            borderRadius: '8px',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            boxShadow: isSubmitting
              ? 'none'
              : '0 4px 12px rgba(102, 126, 234, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }
          }}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              Saving...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} />
              {banner ? 'Update Banner' : 'Create Banner'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default BannerForm;
