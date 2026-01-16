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
      reset({
        ...initialData,
        images: initialData.images?.join(', ') || '',
        sizes: initialData.sizes?.join(', ') || '',
        colors: initialData.colors?.join(', ') || '',
      });
    }
  }, [initialData, reset]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
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

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Product name is required' })}
            className="input-field"
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            type="text"
            {...register('brand')}
            className="input-field"
            placeholder="Enter brand name"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="input-field"
            disabled={loadingCategories}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
          <input
            type="number"
            step="0.01"
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' },
            })}
            className="input-field"
            placeholder="0.00"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
          <input
            type="number"
            {...register('stock', {
              required: 'Stock is required',
              min: { value: 0, message: 'Stock must be non-negative' },
            })}
            className="input-field"
            placeholder="0"
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sizes (comma-separated)
          </label>
          <input
            type="text"
            {...register('sizes')}
            className="input-field"
            placeholder="S, M, L, XL"
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: S, M, L, XL or 6, 7, 8, 9, 10
          </p>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Colors (comma-separated)
          </label>
          <input
            type="text"
            {...register('colors')}
            className="input-field"
            placeholder="Red, Blue, Green"
          />
          <p className="mt-1 text-xs text-gray-500">Example: Red, Blue, Green, Black</p>
        </div>

        {/* Images */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URLs (comma-separated)
          </label>
          <textarea
            {...register('images')}
            className="input-field"
            rows="3"
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter full image URLs separated by commas
          </p>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            className="input-field"
            rows="4"
            placeholder="Enter product description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
