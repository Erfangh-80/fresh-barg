"use server";
import { http } from "@/services/Api";
import { DeepPartial, ReqType } from "@/types/declarations/selectInp";
import { cookies } from "next/headers";

export type LoginSet = ReqType["main"]["user"]["login"]["set"];
export type LoginGet = DeepPartial<ReqType["main"]["user"]["login"]["get"]>;

export const login = async (set: LoginSet, get: LoginGet) => {
  const cookieStore = await cookies();
  const response = await http.send({
    service: "main",
    model: "user",
    act: "login",
    details: {
      set,
      get,
    },
  });

  if (!response.success) {
    return { success: false, message: response.body.message };
  }

  cookieStore.set("token", response.body.token, {
    httpOnly: false,    // کلاینت بتونه بخونه
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
};
