"use client";
import {  useState , useEffect } from "react";
import { getProducts } from "@/services/productService.js"
import ProductCard from "../ProductCard/ProductCard"

export default function ProductGrid () {

    const [ products , setProducts ] = useState([]);

    const [ loading , setLoading ] = useState(true)

    useEffect( ()=> {
        async function fetchProducts() {
            try {
                const data = await getProducts();

                console.log("Product Details" , data);

                data.forEach((pro) => {
                    
                    console.log("Product Key:", pro._id);
                });

                setProducts(data)
            }
            catch (error) {
                console.log(error);
            }
            finally{
                setLoading(false);
            }
        }
        fetchProducts();
    }, []
    )

    if (loading) {
        return(
            <h2 className="text-center text-xl">
                Loading Products
            </h2>
        );
    }

    return (
        
        <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">

            {/* name above product section */}
            <h2 className="text-xl sm:text-2xl md:text-3xl text-black font-bold mb-4 sm:mb-5 md md:mb-6">
                Featured Products
            </h2>

            <div className="grid grid-cols-1
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4 
            gap-4 sm:gap-5 md:gap-6 shadow-amber-50 text-black text-center">

                { products.map( (pro) => (
                    <ProductCard 
                        key={pro.product_uuid || pro._id}
                        product={pro} 
                        />
                ))

                }
            </div>


        </section>
    )
}