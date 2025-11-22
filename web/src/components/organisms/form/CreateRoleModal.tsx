"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/mulecules";
import { Button, MyInput, SelectBox, CustomStyles } from "@/components/atoms";
import AsyncSelect from "react-select/async";
import { createPosition } from "@/app/actions/position/create";
import { getOrgans } from "@/app/actions/organ/gets";
import { getUnits } from "@/app/actions/unit/gets";
import { getUsers } from "@/app/actions/user/getUsers";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";

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
  const [organs, setOrgans] = useState<{ _id: string; name: string }[]>([]);
  const [units, setUnits] = useState<{ _id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

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

  const extractArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    return res?.body || res?.data || [];
  };

  // Watch for orgId changes to update units
  const orgId = watch("orgId");

  // Function to load units based on selected organization
  const loadUnitsByOrg = useCallback(async (orgId: string) => {
    setLoading(true);
    try {
      const unitRes = await getUnits({
        get: { _id: 1, name: 1 },
        set: { page: 1, limit: 50, orgId, positionId },
      });
      setUnits(
        extractArray(unitRes).map((u: any) => ({
          _id: u._id || "",
          name: u.name || "بدون نام",
        })),
      );
    } catch (error) {
      toast.error("خطا در بارگذاری واحدها");
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    if (!isOpen) return;

    // Load organizations and users (units will be loaded based on selected org)
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orgRes, userRes] = await Promise.all([
          getOrgans({
            get: { _id: 1, name: 1 },
            set: { page: 1, limit: 50, positionId },
          }),
          getUsers({
            get: { _id: 1, first_name: 1, last_name: 1 },
            set: { page: 1, limit: 100 },
          }),
        ]);

        setOrgans(
          extractArray(orgRes).map((o: any) => ({
            _id: o._id || "",
            name: o.name || "بدون نام",
          })),
        );

        setUsers(
          extractArray(userRes).map((u: any) => ({
            _id: u._id || "",
            name:
              `${u.first_name || ""} ${u.last_name || ""}`.trim() || "بدون نام",
          })),
        );
      } catch (error) {
        toast.error("خطا در بارگذاری اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, positionId]);

  // Load units when orgId changes
  useEffect(() => {
    if (orgId) {
      loadUnitsByOrg(orgId);
    } else {
      // If no org is selected, clear the units
      setUnits([]);
      setValue("unitId", ""); // Also clear the selected unit
    }
  }, [orgId, loadUnitsByOrg, setValue]);

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
    console.log(data);
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
    setSelectedFeatures([]);
    setOrgans([]);
    setUnits([]);
    setUsers([]);
    onClose();
  };

  if (!isOpen) return null;

  // if (loading) {
  //   return (
  //     <Modal isOpen={isOpen} onClose={onClose} title="در حال بارگذاری...">
  //       <div className="flex justify-center items-center py-12">
  //         <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  //       </div>
  //     </Modal>
  //   );
  // }

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
          <Controller
            name="orgId"
            control={control}
            render={({ field }) => (
              <SelectBox
                name="orgId"
                label="سازمان"
                options={organs}
                value={field.value}
                onChange={field.onChange}
                errMsg={errors.orgId?.message}
                placeholder="انتخاب سازمان"
              />
            )}
          />
          <Controller
            name="unitId"
            control={control}
            render={({ field }) => (
              <SelectBox
                name="unitId"
                label="واحد"
                options={units}
                value={field.value}
                onChange={field.onChange}
                errMsg={errors.unitId?.message}
                placeholder="انتخاب واحد"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="panel"
            control={control}
            render={({ field }) => (
              <SelectBox
                name="panel"
                label="پنل"
                options={[
                  { _id: "darya", name: "دریا" },
                  { _id: "johar", name: "جوهر" },
                  { _id: "nameh", name: "نامه" },
                  { _id: "anbar", name: "انبار" },
                  { _id: "bita", name: "بیتا" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
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
        </div>

        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <SelectBox
              name="userId"
              label="کاربر (اختیاری)"
              options={users}
              value={field.value}
              onChange={field.onChange}
              placeholder="انتخاب کاربر (اختیاری)"
            />
          )}
        />

        {/* --- بخش اصلاح شده: features --- */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            دسترسی‌ها (اختیاری - چند انتخابی)
          </label>
          <Controller
            name="features"
            control={control}
            render={({ field }) => (
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                loadOptions={loadFeatures}
                placeholder="جستجو و انتخاب دسترسی‌ها..."
                styles={CustomStyles}
                value={selectedFeatures}
                onChange={(opts) => {
                  const options = opts as SelectOption[];
                  const values = options.map((o) => o.value); // values: Feature[]
                  setValue("features", values); // حالا تایپ دقیقاً مطابقت داره
                  setSelectedFeatures(options);
                  field.onChange(values);
                }}
                loadingMessage={() => "در حال جستجو..."}
                noOptionsMessage={() => "دسترسی‌ای یافت نشد"}
              />
            )}
          />
          {errors.features && (
            <p className="text-red-500 text-sm mt-1">
              {errors.features.message}
            </p>
          )}
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
