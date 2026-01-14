import Image from "next/image"
import logo from '@/public/logo.png';

export default function Logo() {
  return (
    <Image src={logo} alt="logo" priority width={100} height={100} />
  )
}
