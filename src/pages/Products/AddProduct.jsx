import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../../api';
import { toast } from 'react-toastify';
import ProductForm from '../../components/products/ProductForm';

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setIsLoading(true);
      await productsAPI.create(data);
      toast.success('Product created successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <button
          onClick={() => navigate('/products')}
          className="btn-secondary"
        >
          Back to Products
        </button>
      </div>

      <div className="card">
        <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AddProduct;
