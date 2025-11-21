import { z } from "zod";
import { UserLevel } from "./types";

// province schema
export const provinceSchema = z.object({
    name: z.string().min(2, "نام باید حداقل 2 کاراکتر باشد"),
    enName: z.string().min(2),
    abb: z.string().min(2).max(5),
});

export type ProvinceForm = z.infer<typeof provinceSchema>;


export const userSchema = z.object({
    first_name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    last_name: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
    phone: z.string().min(11, "شماره تلفن باید ۱۱ رقمی باشد").max(11, "شماره تلفن باید ۱۱ رقمی باشد"),
    gender: z.enum(["Male", "Female"]).refine(
        (val) => val === "Male" || val === "Female",
        "لطفاً جنسیت را انتخاب کنید"
    ),
    birth_date: z.string().min(1, "تاریخ تولد الزامی است"),
    personnel_code: z.string().min(1, "کد پرسنلی الزامی است"),
    email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
    provinceId: z.string().min(1, "انتخاب استان مورد نظر الزامی است"),
    cityId: z.string().min(1, "انتخاب شهر مورد نظر الزامی است"),
    orgId: z.string().min(1, "انتخاب سازمان الزامی است"),
    unitId: z.string().min(1, "انتخاب واحد الزامی است"),
    position: z.array(z.string()).min(1, "حداقل یک نقش باید انتخاب شود"),
});

export type UserForm = z.infer<typeof userSchema>;
export type UserType = UserForm & { _id: string };

// organ schema 
export const organizationSchema = z.object({
    name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    address: z.string().min(5, "آدرس باید حداقل ۵ کاراکتر باشد"),
    ownership: z.enum(["private", "government", "semi-private"])
        .refine(val => !!val, { message: "انتخاب نوع مالکیت الزامی است" }),
    type: z.enum(["service", "industrial", "trading", "technology", "financial", "healthcare"])
        .refine(val => !!val, { message: "انتخاب نوع سازمان الزامی است" }),
    longitude: z.string({ error: "طول جغرافیایی معتبر وارد کنید" }),
    latitude: z.string({ error: "عرض جغرافیایی معتبر وارد کنید" }),
    description: z.string().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
    provinceId: z.string().min(1, "انتخاب استان الزامی است"),
    cityId: z.string().min(1, "انتخاب شهر الزامی است"),
});

export type OrganizationForm = z.infer<typeof organizationSchema>;

// letter
export const letterSchema = z.object({
    number: z.string().min(1, "شماره نامه الزامی است"),
    subject: z.string().min(1, "موضوع نامه الزامی است"),
    recieversId: z.string().min(1, "انتخاب گیرنده الزامی است"),
    orgId: z.string().optional(),
    unitId: z.string().optional(),
    tags: z.string().optional(),
    leed: z.string().optional(),
    content: z.string().min(1, "محتوای نامه الزامی است"),
});

export type LetterFormType = z.infer<typeof letterSchema>;

// city
export const citySchema = z.object({
    name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    enName: z.string().min(2, "نام انگلیسی الزامی است"),
    abb: z.string().min(2).max(5, "مخفف باید ۲ تا ۵ کاراکتر باشد"),
    province: z.string().min(1, "انتخاب استان الزامی است"),
});

export type CityForm = z.infer<typeof citySchema>;

// unit
export const UnitSchema = z.object({
    name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    categories: z.optional((z.array(z.string()))),
    provinceId: z.string().min(1, "انتخاب استان الزامی است"),
    cityId: z.string().min(1, "انتخاب شهر الزامی است"),
    orgId: z.string().min(1, "انتخاب سازمان الزامی است"),
});

export type UnitForm = z.infer<typeof UnitSchema>;