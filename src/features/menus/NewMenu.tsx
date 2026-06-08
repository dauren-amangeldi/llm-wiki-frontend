import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../../stores/ui";
import { Icon } from "../../components/Icon";
import { apiFetch } from "../../api/client";
import { useToastStore } from "../../components/Toast";

export function NewMenu() {
  const { t } = useTranslation();
  const setOpenMenu = useUiStore((s) => s.setOpenMenu);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const toast = useToastStore.getState();
    toast.show(t("uploading"), "info");

    let ok = 0;
    let fail = 0;
    for (const file of Array.from(files)) {
      try {
        const form = new FormData();
        form.append("file", file);
        await apiFetch("/api/v1/uploads", { method: "POST", body: form });
        ok++;
      } catch {
        fail++;
      }
    }
    if (fail === 0) {
      toast.show(t("upload_success"), "success");
    } else if (ok > 0) {
      toast.show(`${ok} ${t("upload_success")}, ${fail} ${t("upload_error")}`, "error");
    } else {
      toast.show(t("upload_error"), "error");
    }
    setOpenMenu(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="dropdown-menu" style={{ minWidth: 250 }}>
      <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={handleUpload} />
      <button onClick={() => fileRef.current?.click()} className="dropdown-item">
        <span style={{ color: "var(--brand-cta)" }}><Icon name="upload" size={18} /></span>
        <div>
          <div style={{ fontWeight: 500 }}>{t("new_upload_title")}</div>
          <div className="dropdown-item-meta">{t("new_upload_copy")}</div>
        </div>
      </button>
    </div>
  );
}
