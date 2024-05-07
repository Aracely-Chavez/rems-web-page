// @ts-nocheck
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

const ContratoCard = ({ contrato, isChecked, onToggle }) => {
  const { id, razon_social, fecha_inicio } = contrato;

  const handleToggle = () => {
    onToggle(id);
  };

  return (
    <div className="border rounded-lg shadow-lg p-4 bg-white flex justify-between items-center">
        <div>
            <h3 className="text-xl font-semibold mb-2">{razon_social}</h3>
            <p className="text-gray-600">Fecha de inicio: {fecha_inicio}</p>
            {/* Otros datos del contrato */}
            {/* ... */}
        </div>
        <div className="ml-4">
            <label className="inline-flex items-center">
            <input
                type="checkbox"
                className="form-checkbox h-6 w-6 text-indigo-600"
                checked={isChecked}
                onChange={handleToggle}
            />
            <span className="ml-2 text-gray-700">Seleccionar</span>
            </label>
        </div>
        </div>
  );
};

const ContratosScreen = ( ) => {
  const [contratos, setContratos] = useState<[]>([]);
  const [selectedContratos, setSelectedContratos] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);


  useEffect(() => {
    //const url = 'http://164.68.101.193:5000/calcular_pagos';
    const url = 'http://127.0.0.1:5000/contratos';

    const fetchData = async () => {
      try {
        const requestOptions = {
          method: 'GET',
        };
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
          throw new Error('Error al obtener los datos');
        }
        const data = await response.json();
        setContratos(data);
        setCargando(false);
      } catch (error) {
        setError(error.message);
        setCargando(false);
      }
    };

    fetchData();

  }, []);

  const handleToggleContrato = (id) => {
    setSelectedContratos((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((selectedId) => selectedId !== id) : [...prevSelected, id]
    );
  };


  return (
    <main className="flex relative w-full justify-center font-montserrat mb-7">
      <img src="/HeaderBackground.svg" alt="bg" className="absolute w-[100%] xl:-top-24 min-h-[400px] -top-6 -z-10" />
      <div className="container px-8">
        <div className="flex h-[280px] sm:h-[330px] md:h-[360px] lg:h-[410px] 2xl:h-[520px]  justify-center items-center">
          <h1 className="font-bold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Fechas de pago</h1>
        </div>
            <div>
            <h1>Contratos</h1>
            <div className="contrato-container my-8">
                {contratos.map((contrato) => (
                <ContratoCard
                    key={contrato.id}
                    contrato={contrato}
                    isChecked={selectedContratos.includes(contrato.id)}
                    onToggle={handleToggleContrato}
                />
                ))}
            </div>
            <Link href={{ pathname: '/fechasPago', query: { contratos: selectedContratos.join(',') } }}
                className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Ir a Fechas de Pago
            </Link>
            </div>
        </div>
    </main>
  );
};

export default ContratosScreen;
