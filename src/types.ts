export type Role = 'ADMIN' | 'GESTOR' | 'VENDEDOR';
export type VisitType = 'PROSPECCAO' | 'NEGOCIACAO' | 'RELACIONAMENTO' | 'POS_VENDA';
export type VisitResult = 'ALCANCADO' | 'PARCIAL' | 'NAO_ALCANCADO';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: number;
}

export interface Client {
  id: number;
  name: string;
  cnpj: string;
  region: string;
}

export interface Visit {
  id: number;
  user_id: number;
  client_id: number;
  date: string;
  type: VisitType;
  result: VisitResult;
  volume: number;
  competitor: string;
  summary: string;
  user_name?: string;
  client_name?: string;
  region?: string;
}

export interface DashboardStats {
  totalVisits: number;
  uniqueClients: number;
  opportunities: string;
  visitsByPeriod: { label: string; value: number }[];
}
