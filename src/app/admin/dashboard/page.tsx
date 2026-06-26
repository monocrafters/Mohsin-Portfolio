import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    redirect("/admin_login");
  }

  try {
    const session = await verifySessionToken(token);
    return <AdminDashboard username={session.username || "Admin"} />;
  } catch {
    redirect("/admin_login");
  }
}
