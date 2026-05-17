import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Typography, Alert } from "antd";
import { useTranslation } from "react-i18next";
import { useAppMessage } from "../../hooks/useAppMessage";
import { providerApi } from "../../api/modules/provider";
import type { ProviderInfo } from "../../api/types";

const { Link, Paragraph } = Typography;

const PROVIDER_DOC_URLS: Record<string, string> = {
  deepseek: "https://platform.deepseek.com/api_keys",
  openai: "https://platform.openai.com/api-keys",
  qwen: "https://bailian.console.aliyun.com/?apiKey=1",
  zhipu: "https://open.bigmodel.cn/usercenter/apikeys",
  moonshot: "https://platform.moonshot.cn/console/api-keys",
  openrouter: "https://openrouter.ai/keys",
};

const PREFERRED_ORDER = [
  "deepseek",
  "qwen",
  "zhipu",
  "moonshot",
  "openai",
  "openrouter",
];

interface OnboardingModalProps {
  open: boolean;
  providers: ProviderInfo[];
  onComplete: () => void;
}

export default function OnboardingModal({
  open,
  providers,
  onComplete,
}: OnboardingModalProps) {
  const { t } = useTranslation();
  const { message } = useAppMessage();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const eligible = providers
    .filter((p) => !p.is_local && p.require_api_key && p.models.length > 0)
    .sort((a, b) => {
      const ai = PREFERRED_ORDER.indexOf(a.id);
      const bi = PREFERRED_ORDER.indexOf(b.id);
      const av = ai === -1 ? PREFERRED_ORDER.length : ai;
      const bv = bi === -1 ? PREFERRED_ORDER.length : bi;
      return av - bv || a.name.localeCompare(b.name);
    });

  const [providerId, setProviderId] = useState<string>(
    eligible[0]?.id ?? "deepseek",
  );

  useEffect(() => {
    if (eligible.length > 0 && !eligible.find((p) => p.id === providerId)) {
      setProviderId(eligible[0].id);
    }
  }, [eligible, providerId]);

  const selected = eligible.find((p) => p.id === providerId);
  const docUrl = PROVIDER_DOC_URLS[providerId];

  useEffect(() => {
    if (selected) {
      form.setFieldsValue({
        model: selected.chat_model || selected.models[0]?.id,
      });
    }
  }, [providerId, selected, form]);

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const apiKey = String(values.api_key || "").trim();
      if (
        selected.api_key_prefix &&
        !apiKey.startsWith(selected.api_key_prefix)
      ) {
        message.error(
          t("onboarding.errorPrefix", {
            prefix: selected.api_key_prefix,
          }),
        );
        setSubmitting(false);
        return;
      }
      await providerApi.configureProvider(selected.id, { api_key: apiKey });
      await providerApi.setActiveLlm({
        provider_id: selected.id,
        model: values.model,
        scope: "global",
      });
      message.success(t("onboarding.success"));
      onComplete();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || t("onboarding.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t("onboarding.title")}
      okText={t("onboarding.submit")}
      cancelButtonProps={{ style: { display: "none" } }}
      closable={false}
      maskClosable={false}
      keyboard={false}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={520}
    >
      <Paragraph style={{ marginBottom: 16 }}>
        {t("onboarding.description")}
      </Paragraph>

      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item label={t("onboarding.provider")}>
          <Select
            value={providerId}
            onChange={setProviderId}
            options={eligible.map((p) => ({ value: p.id, label: p.name }))}
          />
        </Form.Item>

        <Form.Item
          label={t("onboarding.model")}
          name="model"
          rules={[{ required: true }]}
        >
          <Select
            options={(selected?.models ?? []).map((m) => ({
              value: m.id,
              label: m.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          label={t("onboarding.apiKey")}
          name="api_key"
          rules={[
            { required: true, message: t("onboarding.errorRequired") },
          ]}
        >
          <Input.Password
            placeholder={selected?.api_key_prefix || ""}
            autoComplete="off"
          />
        </Form.Item>

        {docUrl && (
          <Alert
            type="info"
            showIcon
            message={
              <span>
                {t("onboarding.howTo")}{" "}
                <Link href={docUrl} target="_blank" rel="noreferrer">
                  {docUrl}
                </Link>
              </span>
            }
          />
        )}
      </Form>
    </Modal>
  );
}
