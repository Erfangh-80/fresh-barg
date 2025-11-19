import { UserProfile } from "@/components/pages";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  // const userCookie = (await cookies()).get("user");
  // const user = userCookie ? JSON.parse(userCookie.value) : null;
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  if (!userCookie?.value) redirect("/login");

  const user = JSON.parse(userCookie.value)
  if (!user) redirect("/login")

  return (
    <UserProfile
      province={user?.province.name!}
      city={user?.city.name!}
      organ={user?.org[0].name!}
      unit={user?.unit[0].name!}
      first_name={user?.first_name!}
      last_name={user?.last_name!}
      email={user?.email!}
      phone={user?.phone!}
      personnel_code={user?.personnel_code!}
      is_active={user?.is_active!}
      birth_date={user?.birth_date!}
      gender={user?.gender!}
    />
  );
};

export default Page;
