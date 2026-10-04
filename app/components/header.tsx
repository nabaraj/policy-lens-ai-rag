import Image from "next/image";

export const Header = () => {
  return (
    <header className=" bg-linear-to-r/decreasing from-indigo-500 to-teal-400 shadow-sm relative">
      <div className="mx-auto px-10 text-white flex items-center">
        <Image src="/logo.png" width={50} height={50} alt="" />
        <span className="text-white">PolicyLense AI</span>
      </div>
    </header>
  );
};
