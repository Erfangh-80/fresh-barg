"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/mulecules";
import { Button, MyInput, SelectBox, CustomStyles, MyAsyncMultiSelect } from "@/components/atoms";
import AsyncSelect from "react-select/async";
import { createPosition } from "@/app/actions/position/create";
import { getOrgans } from "@/app/actions/organ/gets";
import { getUnits } from "@/app/actions/unit/gets";
import { getUsers } from "@/app/actions/user/getUsers";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import AsyncSelectBox from "@/components/atoms/MyAsyncSelect";

// --- 1. تعریف دقیق فیچرها با `as const` ---
const featureValues = [
  "create unit",
  "create chart",
  "read letters",
  "create letters",
  "reffer letters",
  "add staff",
  "add position to user",
  "read positions",
  "add position",
  "edit org",
  "edit unit",
] as const;

type Feature = (typeof featureValues)[number]; // دقیقاً یکی از این مقادیر

// --- 2. اسکیما با تایپ دقیق ---
const roleSchema = z.object({
  name: z.string().min(2, "نام نقش باید حداقل ۲ کاراکتر باشد"),
  unitId: z.string().min(1, "انتخاب واحد الزامی است"),
  orgId: z.string().min(1, "انتخاب سازمان الزامی است"),
  level: z.enum(["Ghost", "Orghead", "Unithead", "Staff"]),
  panel: z.enum(["darya", "johar", "nameh", "anbar", "bita"]),
  userId: z.string().optional(),
  features: z.array(z.enum(featureValues)).optional(), // دقیق و اختیاری
});

type RoleForm = z.infer<typeof roleSchema>;

// --- 3. دیتای نمایشی ---
const featuresData = [
  { _id: "create unit", name: "ایجاد واحد" },
  { _id: "create chart", name: "ایجاد چارت" },
  { _id: "read letters", name: "مشاهده نامه‌ها" },
  { _id: "create letters", name: "ایجاد نامه" },
  { _id: "reffer letters", name: "ارجاع نامه" },
  { _id: "add staff", name: "افزودن کارمند" },
  { _id: "add position to user", name: "افزودن نقش به کاربر" },
  { _id: "read positions", name: "مشاهده نقش‌ها" },
  { _id: "add position", name: "افزودن نقش" },
  { _id: "edit org", name: "ویرایش سازمان" },
  { _id: "edit unit", name: "ویرایش واحد" },
] as const;

type SelectOption = { value: Feature; label: string }; // value دقیقاً Feature

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  positionId: string;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  positionId,
}) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      unitId: "",
      orgId: "",
      level: "Staff",
      panel: "nameh",
      features: [],
    },
  });

  const loadOrgOptions = useCallback(async () => {
    try {
      const result = await getOrgans({
        set: { page: 1, limit: 20, positionId },
        get: { _id: 1, name: 1 },
      });
      return result.body?.map((org: { _id: string; name: string }) => ({
        value: org._id,
        label: org.name,
      })) || [];
    } catch (error) {
      return [];
    }
  }, []);

  const loadUserOptions = useCallback(async () => {
    try {
      const result = await getUsers({
        set: { page: 1, limit: 20 },
        get: { _id: 1, first_name: 1, last_name: 1 },
      });
      console.log(result);

      return result?.map((user: { _id: string; first_name: string, last_name: string }) => ({
        value: user._id,
        label: `${user.first_name} ${user.last_name}`,
      })) || [];
    } catch (error) {
      return [];
    }
  }, []);

  const loadUnits = useCallback(async (input: string) => {
    const orgId = watch("orgId")
    if (!orgId) return []

    try {
      const res = await getUnits({
        set: { page: 1, limit: 10, positionId, orgId },
        get: { _id: 1, name: 1 },
      });
      return (res.body || [])?.map((p: { _id: string; name: string }) => ({
        value: p._id,
        label: p.name,
      }));
    } catch {
      return [];
    }
  }, []);

  const loadFeatures = useCallback(
    (inputValue: string): Promise<SelectOption[]> => {
      return new Promise((resolve) => {
        const filtered = featuresData
          .filter((f) =>
            f.name.toLowerCase().includes(inputValue.toLowerCase()),
          )
          .map((f) => ({ value: f._id as Feature, label: f.name }));
        resolve(filtered);
      });
    },
    [],
  );

  const onSubmit = async (data: RoleForm) => {
    try {
      const res = await createPosition({
        set: {
          name: data.name,
          level: data.level,
          orgId: data.orgId,
          unitId: data.unitId,
          panel: data.panel,
          userId: data.userId,
          features: data.features || [],
          positionId,
        },
        get: { _id: 1, level: 1 },
      });

      if (res?.success) {
        toast.success("نقش با موفقیت ایجاد شد");
        router.refresh();
        handleClose();
      } else {
        toast.error(res?.message || "خطا در ایجاد نقش");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleOrganSelect = () => {
    setValue("unitId", "")
  }

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="ایجاد نقش جدید"
      className="max-w-4xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-h-[70vh] overflow-y-auto p-1"
      >
        <MyInput
          label="نام نقش"
          name="name"
          register={register}
          errMsg={errors.name?.message}
          placeholder="مثال: مدیر فناوری"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AsyncSelectBox
            name="orgId"
            label="انتخاب سازمان *"
            setValue={setValue}
            loadOptions={loadOrgOptions}
            defaultOptions
            placeholder="استان را انتخاب کنید"
            errMsg={errors.orgId?.message}
            onSelectChange={handleOrganSelect}
          />

          <AsyncSelectBox
            key={watch("orgId") || "no-organ"}
            name="unitId"
            label="انتخاب واحد *"
            setValue={setValue}
            defaultOptions
            loadOptions={loadUnits}
            placeholder=" واحد را انتخاب کنید"
            errMsg={errors.unitId?.message}
          />
        </div>

        <Controller
          name="level"
          control={control}
          render={({ field }) => (
            <SelectBox
              name="level"
              label="سطح دسترسی"
              options={[
                { _id: "Ghost", name: "سوپر ادمین" },
                { _id: "Orghead", name: "رئیس سازمان" },
                { _id: "Unithead", name: "رئیس واحد" },
                { _id: "Staff", name: "کارمند" },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <AsyncSelectBox
          label="کاربر (اختیاری)"
          name="userId"
          setValue={setValue}
          loadOptions={loadUserOptions}
          defaultOptions
          errMsg={errors.userId?.message}
        />
        <div>
          <MyAsyncMultiSelect
            label="ویژگی های کاربر"
            name="features"
            setValue={setValue}
            loadOptions={loadFeatures}
            defaultOptions
            errMsg={errors.features?.message}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Button
            type="button"
            onClick={handleClose}
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2"
          >
            لغو
          </Button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 disabled:opacity-70"
          >
            {isSubmitting ? "در حال ذخیره..." : "ذخیره نقش"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
