import { Button, Tooltip } from "antd";
import { SparkCode01Line, SparkCode01Fill } from "@agentscope-ai/icons";
import { useTranslation } from "react-i18next";
import { useDeveloperMode } from "../../contexts/DeveloperModeContext";
import styles from "./index.module.less";

export default function DeveloperModeToggle() {
  const { t } = useTranslation();
  const { developerMode, loaded, setDeveloperMode } = useDeveloperMode();

  const handleClick = () => {
    void setDeveloperMode(!developerMode);
  };

  return (
    <Tooltip
      title={
        developerMode
          ? t("developerMode.disable", "关闭开发者模式")
          : t("developerMode.enable", "开启开发者模式")
      }
    >
      <Button
        className={`${styles.toggleBtn} ${
          developerMode ? styles.toggleBtnActive : ""
        }`}
        type="text"
        disabled={!loaded}
        icon={developerMode ? <SparkCode01Fill /> : <SparkCode01Line />}
        onClick={handleClick}
      />
    </Tooltip>
  );
}
