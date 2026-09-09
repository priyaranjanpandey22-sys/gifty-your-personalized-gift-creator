import { queryOptions } from "@tanstack/react-query";
import { adminListProducts, getProductBySlug, listProducts } from "./products.functions";

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const adminProductsQuery = queryOptions({
  queryKey: ["admin", "products"],
  queryFn: () => adminListProducts(),
});
