export type Inventory = {
    name: string;
    price: number;
    availableQuantity: number;
    total: number;
    date?: string;
    unit: string;
    id: string;
    materialId?: number;
    description: string;
    reason?: string;
    materialName?: string;
    reasonForRequest?: string;
    requestDate?: string;
    scopeOfMaterial?: string;
    nameError: boolean;
    dateError: boolean;
    vendorName: string;
    gstNumber: string;
    remark: string;
    invoiceDate: string;
    invoiceId: string;
    unitPrice: number;
    gst: number;
    misc: number;
    miscRemark: string;

    
  
  };