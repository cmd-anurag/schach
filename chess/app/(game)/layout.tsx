import Navbar from "@/components/Navbar";


export default function GameLayout({children} : {children : React.ReactNode}) {
    return (
        <>
            <Navbar />
            {children}
        </>
    ); 
}