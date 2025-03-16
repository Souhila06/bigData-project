import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface QueryState {
  query: string;
  page: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

export interface QueryContextType {
  queryState: QueryState;
  resp: ApiResponse | undefined;
  isLoading: boolean;
  updateQuery: (newState: Partial<QueryState>) => Promise<void>;
}

export type ApiResponse = {
  data: APIData[];
  metadata: Metadata;
  stats: Stats;
  status: string;
};

export type QueryParams = {
  [key: string]: any;
};

export interface Stats {
  current_page: number;
  page_size: number;
  query_time: number;
  total_pages: number;
  total_rows: number;
}

export interface Metadata {
  columns_requested: string[];
  execution_timestamp: string;
  original_query: string;
  parsed_sql: string;
}

export interface APIData {
  activityID: number;
  ankle_acc_6_x: number;
  ankle_acc_6_y: number;
  ankle_acc_6_z: number;
  ankle_acc_16_x: number;
  ankle_acc_16_y: number;
  ankle_acc_16_z: number;
  ankle_gyro_x: number;
  ankle_gyro_y: number;
  ankle_gyro_z: number;
  ankle_mag_x: number;
  ankle_mag_y: number;
  ankle_mag_z: number;
  ankle_orient_w: number;
  ankle_orient_x: number;
  ankle_orient_y: number;
  ankle_orient_z: number;
  ankle_temp: number;
  chest_acc_6_x: number;
  chest_acc_6_y: number;
  chest_acc_6_z: number;
  chest_acc_16_x: number;
  chest_acc_16_y: number;
  chest_acc_16_z: number;
  chest_gyro_x: number;
  chest_gyro_y: number;
  chest_gyro_z: number;
  chest_mag_x: number;
  chest_mag_y: number;
  chest_mag_z: number;
  chest_orient_w: number;
  chest_orient_x: number;
  chest_orient_y: number;
  chest_orient_z: number;
  chest_temp: number;
  hand_acc_6_x: number;
  hand_acc_6_y: number;
  hand_acc_6_z: number;
  hand_acc_16_x: number;
  hand_acc_16_y: number;
  hand_acc_16_z: number;
  hand_gyro_x: number;
  hand_gyro_y: number;
  hand_gyro_z: number;
  hand_mag_x: number;
  hand_mag_y: number;
  hand_mag_z: number;
  hand_orient_w: number;
  hand_orient_x: number;
  hand_orient_y: number;
  hand_orient_z: number;
  hand_temp: number;
  heart_rate: number;
  subject_id: number;
  timestamp: number;
}
