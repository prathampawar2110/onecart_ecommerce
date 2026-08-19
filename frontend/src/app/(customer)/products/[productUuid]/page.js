import ProductDetails from "./ProductDetails";

export default async function Page({ params }) {

    const { productUuid } = await params;

    return (
        <ProductDetails productUuid={productUuid} />
    );

}