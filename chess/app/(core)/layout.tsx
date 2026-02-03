import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({children} : {children : React.ReactNode}) {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

  if (!session) {
    // console.log('this runs');
    redirect("/login");
  }
    return (
        <>
            <Navbar />
            {children}
        </>
    ); 
}