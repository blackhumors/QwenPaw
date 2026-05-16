/**
 * 设置 API - 简化模式配置
 */
import { request } from "../request";

export interface SimplifiedModeStatus {
  simplified_mode: boolean;
  developer_mode: boolean;
}

/**
 * 获取简化模式状态
 */
export const getSimplifiedMode = (): Promise<SimplifiedModeStatus> => {
  return request<SimplifiedModeStatus>("/settings/simplified");
};

/**
 * 更新简化模式状态
 */
export const setSimplifiedMode = (
  simplified_mode?: boolean,
  developer_mode?: boolean,
): Promise<SimplifiedModeStatus> => {
  const body: Record<string, boolean> = {};
  if (simplified_mode !== undefined) {
    body.simplified_mode = simplified_mode;
  }
  if (developer_mode !== undefined) {
    body.developer_mode = developer_mode;
  }
  return request<SimplifiedModeStatus>("/settings/simplified", {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

/**
 * Settings API - 导出给 api 使用
 */
export const settingsApi = {
  getSimplifiedMode,
  setSimplifiedMode,
};