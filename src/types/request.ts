export type RequestStatus = 'Approved' | 'Declined';

export interface RequestItem {
  id: string;
  name: string;
  requestedQuantity: number;
  unit: string;
  materialId?: number; 
  requestDate?: string;
  siteId?: number; 
  materialName?: string;
  materialDescription?: string;
  reasonForRequest? : string;
  requesterName?: string;
}

export interface Request {
  requestId: string;
  status: RequestStatus;
  items: RequestItem[];
}
