import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faChevronRight, faPlus, faEdit, faTrash, faSpinner,
  faSearch, faFilter, faSort, faToggleOn, faToggleOff,
  faImage, faCalendar, faPercentage, faStar, faEye, faLock
} from '@fortawesome/free-solid-svg-icons';
import BannerForm from '../../components/banners/BannerForm';
import { bannersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const BannerManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBanners, setFilteredBanners] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  // Role-based access control - Only superadmin can access banner management
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      toast.error('Access Denied: Only superadmin can manage banners');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!Array.isArray(banners)) {
      setFilteredBanners([]);
      return;
    }

    let filtered = banners.filter(
      (banner) =>
        (banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterType === 'all' || banner.type === filterType) &&
        (filterPosition === 'all' || banner.position === filterPosition)
    );

    // Sort banners
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        return (a.priority || 0) - (b.priority || 0);
      } else if (sortBy === 'created') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    setFilteredBanners(filtered);
  }, [searchTerm, banners, filterType, filterPosition, sortBy]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannersAPI.getAll();

      let bannersData = [];
      if (response.data?.data?.banners) {
        bannersData = response.data.data.banners;
      } else if (response.data?.banners) {
        bannersData = response.data.banners;
      } else if (Array.isArray(response.data?.data)) {
        bannersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        bannersData = response.data;
      }

      if (!Array.isArray(bannersData)) {
        console.warn('Banners data is not an array:', bannersData);
        bannersData = [];
      }

      setBanners(bannersData);
      setFilteredBanners(bannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      await bannersAPI.delete(id);
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error(error.response?.data?.message || 'Failed to delete banner');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await bannersAPI.update(banner._id, { isActive: !banner.isActive });
      toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Handle image upload if new image is selected
      let imageUrl = editingBanner?.image || '';
      if (data.imageFile) {
        const formData = new FormData();
        formData.append('image', data.imageFile);
        const uploadResponse = await bannersAPI.uploadImage(formData);
        imageUrl = uploadResponse.data?.url || uploadResponse.data?.data?.url || data.imagePreview;
      } else if (data.imagePreview && !editingBanner) {
        imageUrl = data.imagePreview;
      }

      const bannerData = {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        buttonText: data.buttonText,
        buttonLink: data.buttonLink,
        type: data.type,
        position: data.position,
        discountPercentage: Number(data.discountPercentage) || 0,
        validFrom: data.validFrom,
        validTo: data.validTo,
        priority: Number(data.priority) || 1,
        isActive: data.isActive,
        image: imageUrl,
        categoryFilters: Array.isArray(data.categoryFilters) ? data.categoryFilters : [],
        productFilters: Array.isArray(data.productFilters) ? data.productFilters : [],
      };

      if (editingBanner) {
        await bannersAPI.update(editingBanner._id, bannerData);
        toast.success('Banner updated successfully');
      } else {
        await bannersAPI.create(bannerData);
        toast.success('Banner created successfully');
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error(error.response?.data?.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bannerTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'flash-sale', label: 'Flash Sale' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'new-arrival', label: 'New Arrival' },
    { value: 'clearance', label: 'Clearance' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'featured', label: 'Featured' },
  ];

  const positions = [
    { value: 'all', label: 'All Positions' },
    { value: 'hero', label: 'Hero' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'grid', label: 'Grid' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'popup', label: 'Popup' },
  ];

  // Show access denied message if user is not superadmin
  if (user && user.role !== 'superadmin') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <FontAwesomeIcon icon={faLock} style={{
            fontSize: '4rem',
            color: '#ef4444',
            marginBottom: '1.5rem'
          }} />
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Access Denied
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '1.125rem',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            You do not have permission to access Banner Management. This feature is only available to superadmin users.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
            }}
          >
            <FontAwesomeIcon icon={faHome} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{
          fontSize: '3.5rem',
          color: 'white',
          marginBottom: '1.5rem'
        }} />
        <p style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>Loading Banners...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Breadcrumb Navigation */}
        <nav style={{
          marginBottom: '1.5rem'
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
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'none',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </button>
            </li>
            <li>
              <FontAwesomeIcon icon={faChevronRight} style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem'
              }} />
            </li>
            <li>
              <span style={{
                color: 'white',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontWeight: '600'
              }}>
                Banners
              </span>
            </li>
          </ol>
        </nav>

        {/* Header Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                Banner Management
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '1rem'
              }}>
                Create and manage promotional banners and offers
              </p>
            </div>
            <button
              onClick={handleAdd}
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
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add New Banner
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#667eea'
              }}>
                {banners.length}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Total Banners
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#10b981'
              }}>
                {banners.filter(b => b.isActive).length}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Active Banners
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#f59e0b'
              }}>
                {banners.filter(b => !b.isActive).length}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Inactive Banners
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '1rem',
            alignItems: 'end'
          }}>
            {/* Search */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                <FontAwesomeIcon icon={faSearch} style={{ marginRight: '0.5rem' }} />
                Search
              </label>
              <input
                type="text"
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Type Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                <FontAwesomeIcon icon={faFilter} style={{ marginRight: '0.5rem' }} />
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              >
                {bannerTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Position Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                <FontAwesomeIcon icon={faFilter} style={{ marginRight: '0.5rem' }} />
                Position
              </label>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              >
                {positions.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                <FontAwesomeIcon icon={faSort} style={{ marginRight: '0.5rem' }} />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              >
                <option value="priority">Priority</option>
                <option value="created">Recently Created</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          {searchTerm && (
            <div style={{
              marginTop: '1rem',
              fontSize: '0.875rem',
              color: '#64748b',
              fontWeight: '600'
            }}>
              Showing {filteredBanners.length} of {banners.length} banners
            </div>
          )}
        </div>

        {/* Banners Grid */}
        {filteredBanners.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '64px 24px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <FontAwesomeIcon icon={faImage} style={{
              fontSize: '4rem',
              color: '#94a3b8',
              marginBottom: '1rem'
            }} />
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '0.5rem'
            }}>
              {searchTerm ? 'No banners found' : 'No banners yet'}
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '1rem',
              marginBottom: '2rem'
            }}>
              {searchTerm
                ? `No banners match your search "${searchTerm}"`
                : 'Get started by creating your first banner'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleAdd}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
                Create Your First Banner
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredBanners.map((banner) => (
              <div
                key={banner._id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Banner Image */}
                <div style={{
                  position: 'relative',
                  height: '200px',
                  backgroundColor: '#f3f4f6'
                }}>
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt={banner.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FontAwesomeIcon icon={faImage} style={{
                        fontSize: '3rem',
                        color: '#9ca3af'
                      }} />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => handleToggleActive(banner)}
                      style={{
                        background: banner.isActive ? '#10b981' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FontAwesomeIcon icon={banner.isActive ? faToggleOn : faToggleOff} />
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Priority Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FontAwesomeIcon icon={faStar} />
                    Priority: {banner.priority || 1}
                  </div>
                </div>

                {/* Banner Content */}
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                  }}>
                    {banner.title}
                  </h3>

                  {banner.subtitle && (
                    <p style={{
                      fontSize: '0.9375rem',
                      color: '#667eea',
                      fontWeight: '600',
                      marginBottom: '0.75rem'
                    }}>
                      {banner.subtitle}
                    </p>
                  )}

                  {banner.description && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      marginBottom: '1rem'
                    }}>
                      {banner.description.length > 100
                        ? `${banner.description.substring(0, 100)}...`
                        : banner.description
                      }
                    </p>
                  )}

                  {/* Badges */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      background: '#eff6ff',
                      color: '#1e40af',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {banner.type?.replace('-', ' ').toUpperCase()}
                    </span>
                    <span style={{
                      background: '#f0fdf4',
                      color: '#15803d',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {banner.position?.toUpperCase()}
                    </span>
                    {banner.discountPercentage > 0 && (
                      <span style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <FontAwesomeIcon icon={faPercentage} />
                        {banner.discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  {/* Validity Period */}
                  {(banner.validFrom || banner.validTo) && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FontAwesomeIcon icon={faCalendar} />
                      {banner.validFrom && new Date(banner.validFrom).toLocaleDateString()}
                      {banner.validFrom && banner.validTo && ' - '}
                      {banner.validTo && new Date(banner.validTo).toLocaleDateString()}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <button
                      onClick={() => handleEdit(banner)}
                      style={{
                        flex: 1,
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      style={{
                        flex: 1,
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div
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
              overflowY: 'auto'
            }}
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '900px',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
                maxHeight: '90vh',
                overflow: 'auto',
                margin: '2rem 0'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2rem',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '1.75rem',
                      fontWeight: '700',
                      color: 'white',
                      marginBottom: '0.25rem'
                    }}>
                      {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                    </h2>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9375rem'
                    }}>
                      {editingBanner ? 'Update banner details below' : 'Fill in the details to create a new banner'}
                    </p>
                  </div>
                  <button
                    onClick={() => !isSubmitting && setIsModalOpen(false)}
                    disabled={isSubmitting}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '2rem' }}>
                <BannerForm
                  banner={editingBanner}
                  onSubmit={onSubmit}
                  onCancel={() => setIsModalOpen(false)}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManagement;
