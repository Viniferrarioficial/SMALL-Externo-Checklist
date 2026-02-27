export type Role = 'ADMIN' | 'GESTOR' | 'VENDEDOR';
export type VisitType = 'PROSPECCAO' | 'NEGOCIACAO' | 'RELACIONAMENTO' | 'POS_VENDA';
export type VisitResult = 'ALCANCADO' | 'PARCIAL' | 'NAO_ALCANCADO';
export type ClientType = 'POSTO' | 'TRR_CONSUMIDOR' | 'FROTA' | 'OUTRO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean | number;
  phone?: string;
  avatar_url?: string;
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  region: string;
}

export interface Visit {
  id: string;
  user_id: string;
  client_id?: string;
  client_type: ClientType;
  date: string;
  type: VisitType;
  result: VisitResult;
  volume?: number;
  competitor?: string;
  summary: string;
  details?: Record<string, any>;
  user_name?: string;
  client_name?: string;
  region?: string;
  cnpj?: string;
  latitude?: number;
  longitude?: number;
}

export interface DashboardStats {
  totalVisits: number;
  uniqueClients: number;
  opportunities: number;
  visitsByPeriod: { label: string; value: number }[];
  topAssessores: { name: string; visits: number; percent: number }[];
  topRegions: { name: string; value: number; percent: number }[];
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'visit' | 'system';
}
