import React from "react";
import Link from "next/link";

export function Navbar() {
  return (
    <>
      <div className="w-full h-20 bg-blue-asset sticky top-0 z-20">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <ul className="hidden md:flex text-white">
              <li>
                <Link href="/">
                  <p className="py-7 px-4 hover:bg-blue-950">Crear Calendario</p>
                </Link>
              </li>
              <li>
                <Link href="/contratos">
                  <p className="py-7 px-4 hover:bg-blue-950">Ver Contratos</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;