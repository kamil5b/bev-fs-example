/**
 * Product API Request Types
 */

export namespace ProductRequest {
  export interface GetList {}

  export interface GetById {
    id: string | number;
  }

  export interface Create {
    name: string;
    price: number;
  }

  export interface Update {
    name?: string;
    price?: number;
  }

  export interface Delete {
    id: string | number;
  }
}

export namespace ProgressRequest {
  export interface GetList {}

  export interface GetById {
    id: string | number;
  }

  export interface Create {
    productId: number;
    percentage: number;
    status?: 'pending' | 'in-progress' | 'completed' | 'failed';
    description?: string;
  }

  export interface Update {
    percentage?: number;
    status?: 'pending' | 'in-progress' | 'completed' | 'failed';
    description?: string;
  }

  export interface Delete {
    id: string | number;
  }
}

export namespace UserRequest {
  export interface GetList {}

  export interface GetById {
    id: string | number;
  }

  export interface Create {
    name: string;
    email: string;
  }

  export interface Update {
    name?: string;
    email?: string;
  }

  export interface Delete {
    id: string | number;
  }
}
