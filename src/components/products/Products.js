import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Products.css';

function Products() {
    const [productsList, setProductsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [readingPrevOrder, setReadingPrevOrder] = useState(true);
    const [draggedProductId, setdraggedProductId] = useState(null);
    const [orderedIds, setOrderedIds] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get stored order Ids if exist
    useEffect(() => {
        if (localStorage.getItem('orderedIds') != undefined) {
            const previousIdsOrder = JSON.parse(localStorage.getItem('orderedIds'));
            setOrderedIds(previousIdsOrder);
        }
        setReadingPrevOrder(false);
    }, []);

    // Get products list Then use stored order Ids to persist order
    useEffect(() => {
        const getProductsList = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://fakestoreapi.com/products');
                if (response.status != 200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let resultedProductList = [];
                if (orderedIds.length > 0) {
                    orderedIds.forEach(productId => {
                        const foundProduct = response.data.find(product => product.id == productId);
                        if (foundProduct) {
                            resultedProductList.push(foundProduct)
                        }

                    });
                }
                resultedProductList = resultedProductList.concat(response.data.filter(product => !orderedIds.includes(product.id)))
                setProductsList(resultedProductList);
            } catch (err) {
                throw new Error(err.message);
            } finally {
                setLoading(false); // End loading state
            }
        };
        if (!readingPrevOrder)
            getProductsList();
    }, [readingPrevOrder]); // Empty dependency array ensures this runs once

    // Handle drag start event
    const handleDragStart = (id) => {
        setdraggedProductId(id);
    };

    const handleDragOver = (event) => {
        event.preventDefault(); // Prevent the default behavior to allow dropping
    };
    // Handle drag drop event
    const handleDrop = (id) => {
        const draggedProductIndex = productsList.findIndex((product) => product.id === draggedProductId);
        const targetProductIndex = productsList.findIndex((product) => product.id === id);

        const reorderedProducts = [...productsList];
        const [draggedProduct] = reorderedProducts.splice(draggedProductIndex, 1);
        reorderedProducts.splice(targetProductIndex, 0, draggedProduct);

        setProductsList(reorderedProducts);
        localStorage.setItem('orderedIds', JSON.stringify(reorderedProducts.map(product => product.id)));
        setdraggedProductId(null);
    };

    const showProduct = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true)
    }

    const handleClick = () => {
        // just to get back to ordinary view when a user click one more time
        if (isModalOpen)
            setIsModalOpen(false);
    }

    return (
        <div onClick={handleClick}
            className="product-list">
            {productsList.map(product =>
                <div
                    key={product.id}
                    className='product-card'
                    draggable
                    onDragStart={() => handleDragStart(product.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(product.id)}
                    onClick={() => showProduct(product)}>
                    <img src={product.image} alt={product.title} className='product-image' />
                    <div className='product-title'>
                        <span>{product.title}</span>
                    </div>
                    <div className='product-price'>
                        <span> Price : {product.price} $</span>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <div className='modal'>
                    <div className='modal-box'>
                        <img src={selectedProduct.image} alt={selectedProduct.name} className='selected-product-image' />
                        <div className='selected-product-title'>
                            <span >{selectedProduct.title}</span>
                        </div>
                        <div className='selected-product-category'>
                            <span> Category : {selectedProduct.category}</span>
                        </div>
                        <div className='selected-product-rating'>
                            <span > Rating : {selectedProduct.rating.rate +
                                ' (' + selectedProduct.rating.count + ' users were rating this product!)'} </span>
                        </div>
                        <div className='selected-product-price'>
                            <span > Price : {selectedProduct.price} $</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;