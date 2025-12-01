import type { Schema, Struct } from '@strapi/strapi';

export interface VentasProductoEnCarrito extends Struct.ComponentSchema {
  collectionName: 'components_ventas_producto_en_carritos';
  info: {
    displayName: 'ProductoEnCarrito';
  };
  attributes: {
    cantidad: Schema.Attribute.Integer;
    d_grabado: Schema.Attribute.String;
    producto: Schema.Attribute.Relation<'oneToOne', 'api::producto.producto'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'ventas.producto-en-carrito': VentasProductoEnCarrito;
    }
  }
}
