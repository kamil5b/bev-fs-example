/**
 * Product API Response Types
 */

import { Product, Progress } from '../entities/product.entity';

export namespace ProductResponse {
  export interface GetList {
    products: Product[];
  }

  export interface GetById {
    product: Product;
  }

  export interface Create {
    created: Product;
  }

  export interface Update {
    updated: Product;
  }

  export interface Delete {
    deleted: number;
  }
}

export namespace ProgressResponse {
  export interface GetList {
    progress: Progress[];
  }

  export interface GetById {
    progress: Progress;
  }

  export interface Create {
    created: Progress;
  }

  export interface Update {
    updated: Progress;
  }

  export interface Delete {
    deleted: number;
  }
}
